"""
constants.py

Central place for all reusable constants.

This avoids hardcoding strings throughout the project.

Used by:
- Dataset Generator
- Model Training
- Prediction Service
- Analytics Dashboard
"""
# AI Labels


AI_LABELS = [
    "Genuine",
    "Suspicious",
    "Spam"
]


# Complaint Severity


SEVERITY_LEVELS = [
    "Low",
    "Medium",
    "High",
    "Critical"
]

# Sentiment


SENTIMENTS = [
    "Positive",
    "Neutral",
    "Negative"
]


# Days


DAYS = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
]


# Staff Shifts


STAFF_SHIFTS = {

    "Morning": {
        "start": 8,
        "end": 14
    },

    "Evening": {
        "start": 14,
        "end": 20
    },

    "Night": {
        "start": 20,
        "end": 8
    }

}

# Image Attachment Probability


IMAGE_PROBABILITY = {
    "High": 0.85,
    "Medium": 0.50,
    "Low": 0.15
}


# Duplicate Complaint Threshold


MAX_DUPLICATE_COUNT = 10

# Dataset Defaults

DEFAULT_HOSPITAL_COUNT = 15

DEFAULT_DATASET_SIZE = 100000