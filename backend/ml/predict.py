import sys
import joblib
import os
import string

def preprocess_text(text):
    text = str(text).lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Other")
        sys.exit(0)
        
    description = sys.argv[1]
    
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
        pipeline = joblib.load(model_path)
        
        processed_desc = preprocess_text(description)
        # Check if empty
        if not processed_desc.strip():
             print("Other")
             sys.exit(0)
             
        prediction = pipeline.predict([processed_desc])[0]
        print(prediction)
    except Exception as e:
        # Fallback in case of error
        print("Other")
