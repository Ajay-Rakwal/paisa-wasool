"""
Flask Prediction Microservice for PAI$A WA$OOL
Loads the ML model once at startup and serves predictions via HTTP.
Also supports retraining from user-corrected data.
"""
import os
import string
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'model.joblib')
DATASET_PATH = os.path.join(MODEL_DIR, 'dataset.csv')
AUGMENTED_PATH = os.path.join(MODEL_DIR, 'dataset_augmented.csv')

# Global model reference — loaded once at startup
pipeline = None

def preprocess_text(text):
    text = str(text).lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text

def load_model():
    """Load the trained model into memory."""
    global pipeline
    try:
        pipeline = joblib.load(MODEL_PATH)
        print(f"[ML Server] Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"[ML Server] Error loading model: {e}")
        pipeline = None

@app.route('/predict', methods=['POST'])
def predict():
    """Predict category for a transaction description."""
    global pipeline
    if pipeline is None:
        return jsonify({'category': 'Other', 'error': 'Model not loaded'}), 200

    data = request.get_json()
    description = data.get('description', '')

    if not description or not description.strip():
        return jsonify({'category': 'Other'})

    try:
        processed = preprocess_text(description)
        if not processed.strip():
            return jsonify({'category': 'Other'})

        prediction = pipeline.predict([processed])[0]
        return jsonify({'category': prediction})
    except Exception as e:
        print(f"[ML Server] Prediction error: {e}")
        return jsonify({'category': 'Other'})

@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Retrain the model with user-corrected data merged into the original dataset.
    Expects JSON: { "corrections": [{ "description": "...", "category": "..." }, ...] }
    """
    global pipeline

    data = request.get_json()
    corrections = data.get('corrections', [])

    if not corrections:
        return jsonify({'success': False, 'message': 'No correction data provided'}), 400

    try:
        # Load original dataset
        if os.path.exists(DATASET_PATH):
            original_df = pd.read_csv(DATASET_PATH)
            if 'transaction_text' in original_df.columns:
                original_df.rename(columns={'transaction_text': 'description'}, inplace=True)
            original_df = original_df[['description', 'category']].copy()
        else:
            original_df = pd.DataFrame(columns=['description', 'category'])

        # Create dataframe from corrections
        corrections_df = pd.DataFrame(corrections)
        corrections_df = corrections_df[['description', 'category']].copy()

        # 1. Permanently append to the original dataset (1x)
        # Rename description to transaction_text to match original dataset.csv schema
        save_df = corrections_df.copy()
        save_df.rename(columns={'description': 'transaction_text'}, inplace=True)
        
        # Append to dataset.csv permanently
        if os.path.exists(DATASET_PATH):
            save_df.to_csv(DATASET_PATH, mode='a', header=False, index=False)
        else:
            save_df.to_csv(DATASET_PATH, index=False)

        # 2. Weight corrections for training (10x)
        weighted_corrections = pd.concat([corrections_df] * 10, ignore_index=True)

        # Merge: original + weighted corrections for memory training
        merged_df = pd.concat([original_df, weighted_corrections], ignore_index=True)

        # Preprocess
        merged_df['processed_desc'] = merged_df['description'].apply(preprocess_text)

        # Remove empty rows
        merged_df = merged_df[merged_df['processed_desc'].str.strip().astype(bool)]

        if len(merged_df) < 10:
            return jsonify({'success': False, 'message': 'Not enough data to retrain (need at least 10 samples)'}), 400

        # Train new model
        new_pipeline = make_pipeline(
            TfidfVectorizer(),
            LogisticRegression(max_iter=1000)
        )
        new_pipeline.fit(merged_df['processed_desc'], merged_df['category'])

        # Cross-validation accuracy (if enough data)
        accuracy = 0.0
        if len(merged_df) >= 20:
            scores = cross_val_score(new_pipeline, merged_df['processed_desc'], merged_df['category'], cv=min(5, len(merged_df)))
            accuracy = float(scores.mean())

        # Save model
        joblib.dump(new_pipeline, MODEL_PATH)

        # Reload in memory
        pipeline = new_pipeline

        # Optional: Save the fully merged augmented dataset for debugging
        merged_df[['description', 'category']].to_csv(AUGMENTED_PATH, index=False)

        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'accuracy': round(accuracy * 100, 2),
            'total_samples': len(merged_df),
            'corrections_added': len(corrections_df)
        })

    except Exception as e:
        print(f"[ML Server] Retrain error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'model_loaded': pipeline is not None
    })

if __name__ == '__main__':
    load_model()
    print("[ML Server] Starting prediction server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False)
