import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
import joblib
import os
import string
import random
from datetime import datetime, timedelta

def preprocess_text(text):
    text = str(text).lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text

def random_date(start, end):
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

# 1. Load the Kaggle dataset
csv_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
if not os.path.exists(csv_path):
    print(f"Error: {csv_path} not found.")
    exit(1)

df = pd.read_csv(csv_path)

# 2. Rename columns to match our expected schema and drop unnecessary ones
print("Original columns:", df.columns.tolist())
if 'transaction_text' in df.columns:
    df.rename(columns={'transaction_text': 'description'}, inplace=True)

# Keep only necessary columns
columns_to_keep = ['description', 'category']
df = df[[col for col in columns_to_keep if col in df.columns]].copy()

# 3. Add mock 'amount' and 'date'
start_date = datetime(2023, 1, 1)
end_date = datetime(2024, 1, 1)

df['amount'] = [round(random.uniform(5.0, 1500.0), 2) for _ in range(len(df))]
df['date'] = [random_date(start_date, end_date).strftime('%Y-%m-%d %H:%M:%S') for _ in range(len(df))]

print("Adding synthetic amounts and dates...")
# Save the enhanced dataset locally just in case
cleaned_path = os.path.join(os.path.dirname(__file__), 'dataset_augmented.csv')
df.to_csv(cleaned_path, index=False)
print(f"Augmented dataset saved to {cleaned_path}")

# 4. Train the model
df['processed_desc'] = df['description'].apply(preprocess_text)

# Build pipeline TF-IDF -> Logistic Regression
pipeline = make_pipeline(
    TfidfVectorizer(),
    LogisticRegression(max_iter=1000)
)

print("Training Logistic Regression model on the new dataset...")
pipeline.fit(df['processed_desc'], df['category'])

# 5. Save the trained model output
model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
joblib.dump(pipeline, model_path)
print(f"Model successfully saved to {model_path}")
