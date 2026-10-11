import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

from xgboost import XGBClassifier

# Load dataset

df = pd.read_csv("datasets/complaints_dataset_v1.csv")

# Features

X = df["complaintText"]

# Labels

label_mapping = {
    "Genuine": 0,
    "Suspicious": 1,
    "Spam": 2
}

y = df["label"].map(label_mapping)

# Split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Pipeline

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            stop_words="english"
        )
    ),
    (
        "classifier",
        XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
    )
])

# Train

print("Training Model...")

model.fit(X_train, y_train)

# Evaluate

predictions = model.predict(X_test)

print(
    classification_report(
        y_test,
        predictions
    )
)

# Save model

joblib.dump(
    model,
    "complaint_classifier.pkl"
)

print("Model Saved Successfully")