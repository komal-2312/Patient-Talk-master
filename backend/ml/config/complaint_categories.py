"""
complaint_categories.py

Master complaint category configuration.

Used by:
1. Dataset Generator
2. AI Feature Engineering
3. Explainable AI
4. Analytics Dashboard
"""

COMPLAINT_CATEGORIES = {

    "Cleanliness": {
        "severity": ["Low", "Medium"],
        "departments": ["Housekeeping", "Ward", "Washroom", "Cafeteria"],
        "typical_rating": [1, 2, 3],
        "sentiment": "Negative",
        "image_probability": 0.85,
        "keywords": [
            "dirty",
            "unclean",
            "smell",
            "garbage",
            "dust",
            "overflowing bin",
            "stains",
            "washroom"
        ]
    },

    "Medical Service": {
        "severity": ["Medium", "High", "Critical"],
        "departments": ["OPD", "Emergency", "ICU", "Ward"],
        "typical_rating": [1,2,3],
        "sentiment": "Negative",
        "image_probability": 0.10,
        "keywords": [
            "doctor",
            "treatment",
            "delay",
            "consultation",
            "patient",
            "care",
            "medical"
        ]
    },

    "Medicine": {
        "severity": ["Medium", "High"],
        "departments": ["Pharmacy", "Medical Store"],
        "typical_rating": [1,2,3],
        "sentiment": "Negative",
        "image_probability": 0.30,
        "keywords": [
            "medicine",
            "drug",
            "tablet",
            "prescription",
            "stock",
            "expired",
            "pharmacist"
        ]
    },

    "Billing": {
        "severity": ["Medium"],
        "departments": ["Billing"],
        "typical_rating": [1,2,3],
        "sentiment": "Negative",
        "image_probability": 0.60,
        "keywords": [
            "bill",
            "payment",
            "charge",
            "refund",
            "invoice",
            "insurance"
        ]
    },

    "Staff Behaviour": {
        "severity": ["Medium", "High"],
        "departments": [
            "Reception",
            "OPD",
            "Ward",
            "Billing",
            "Pharmacy"
        ],
        "typical_rating": [1,2],
        "sentiment": "Negative",
        "image_probability": 0.05,
        "keywords": [
            "rude",
            "behaviour",
            "ignored",
            "impolite",
            "respect",
            "staff"
        ]
    },

    "Waiting Time": {
        "severity": ["Low", "Medium"],
        "departments": [
            "OPD",
            "Laboratory",
            "Radiology",
            "Billing",
            "Pharmacy"
        ],
        "typical_rating": [2,3],
        "sentiment": "Negative",
        "image_probability": 0.02,
        "keywords": [
            "waiting",
            "queue",
            "delay",
            "late",
            "hours",
            "token"
        ]
    },

    "Infrastructure": {
        "severity": ["Medium", "High"],
        "departments": [
            "Ward",
            "Parking",
            "Lift",
            "Reception"
        ],
        "typical_rating": [1,2,3],
        "sentiment": "Negative",
        "image_probability": 0.90,
        "keywords": [
            "broken",
            "damage",
            "fan",
            "ac",
            "chair",
            "window",
            "door"
        ]
    },

    "Equipment": {
        "severity": ["High", "Critical"],
        "departments": [
            "ICU",
            "Emergency",
            "Radiology",
            "Laboratory"
        ],
        "typical_rating": [1,2],
        "sentiment": "Negative",
        "image_probability": 0.40,
        "keywords": [
            "machine",
            "monitor",
            "scanner",
            "equipment",
            "device",
            "oxygen"
        ]
    },

    "Food": {
        "severity": ["Low", "Medium"],
        "departments": ["Cafeteria"],
        "typical_rating": [1,2,3],
        "sentiment": "Negative",
        "image_probability": 0.75,
        "keywords": [
            "food",
            "meal",
            "canteen",
            "taste",
            "cold",
            "quality"
        ]
    },

    "Safety": {
        "severity": ["High", "Critical"],
        "departments": [
            "Security",
            "Emergency",
            "Parking",
            "Ward"
        ],
        "typical_rating": [1],
        "sentiment": "Negative",
        "image_probability": 0.70,
        "keywords": [
            "unsafe",
            "slippery",
            "security",
            "fire",
            "accident",
            "hazard"
        ]
    },

    "Administration": {
        "severity": ["Low", "Medium"],
        "departments": [
            "Reception",
            "Registration",
            "Discharge Desk"
        ],
        "typical_rating": [2,3],
        "sentiment": "Neutral",
        "image_probability": 0.05,
        "keywords": [
            "documents",
            "registration",
            "approval",
            "paperwork",
            "delay"
        ]
    },

    "Parking": {
        "severity": ["Low"],
        "departments": ["Parking"],
        "typical_rating": [2,3],
        "sentiment": "Neutral",
        "image_probability": 0.50,
        "keywords": [
            "parking",
            "vehicle",
            "car",
            "bike",
            "space"
        ]
    },

    "Accessibility": {
        "severity": ["Medium"],
        "departments": [
            "Ward",
            "Reception",
            "Parking"
        ],
        "typical_rating": [2],
        "sentiment": "Negative",
        "image_probability": 0.80,
        "keywords": [
            "wheelchair",
            "ramp",
            "disabled",
            "lift",
            "access"
        ]
    }

}