"""
departments.py

Master configuration for all hospital departments.

Every department contains:

- Working hours
- QR locations
- Complaint categories
- Staff shifts
- Maintenance schedule

Used by:
1. Dataset Generator
2. ML Feature Engineering
3. Explainable AI
"""

DEPARTMENTS = {

    "Pharmacy": {
        "open_hour": 8,
        "close_hour": 20,
        "working_days": ["Mon","Tue","Wed","Thu","Fri","Sat"],
        "qr_locations": [
            "Medicine Counter",
            "Prescription Desk",
            "Waiting Queue"
        ],
        "categories": [
            "Medicine",
            "Staff Behaviour",
            "Waiting Time"
        ]
    },

    "OPD": {
        "open_hour": 9,
        "close_hour": 17,
        "working_days": ["Mon","Tue","Wed","Thu","Fri","Sat"],
        "qr_locations": [
            "Doctor Cabin",
            "Waiting Area",
            "Registration Desk"
        ],
        "categories": [
            "Medical Service",
            "Waiting Time",
            "Staff Behaviour"
        ]
    },

    "Emergency": {
        "open_hour": 0,
        "close_hour": 24,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "Emergency Room",
            "Trauma Unit",
            "Triage Desk"
        ],
        "categories": [
            "Medical Service",
            "Equipment",
            "Safety"
        ]
    },

    "Radiology": {
        "open_hour": 8,
        "close_hour": 18,
        "working_days": ["Mon","Tue","Wed","Thu","Fri","Sat"],
        "qr_locations": [
            "MRI Room",
            "CT Scan",
            "X-Ray Room"
        ],
        "categories": [
            "Equipment",
            "Waiting Time",
            "Staff Behaviour"
        ]
    },

    "Laboratory": {
        "open_hour": 7,
        "close_hour": 19,
        "working_days": ["Mon","Tue","Wed","Thu","Fri","Sat"],
        "qr_locations": [
            "Blood Collection",
            "Sample Counter",
            "Lab Reception"
        ],
        "categories": [
            "Medical Service",
            "Equipment",
            "Waiting Time"
        ]
    },

    "Billing": {
        "open_hour": 9,
        "close_hour": 18,
        "working_days": ["Mon","Tue","Wed","Thu","Fri","Sat"],
        "qr_locations": [
            "Billing Counter",
            "Insurance Desk"
        ],
        "categories": [
            "Billing",
            "Staff Behaviour"
        ]
    },

    "Housekeeping": {
        "open_hour": 0,
        "close_hour": 24,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "Washroom",
            "Ward",
            "Corridor"
        ],
        "categories": [
            "Cleanliness",
            "Safety"
        ]
    },

    "ICU": {
        "open_hour": 0,
        "close_hour": 24,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "ICU Entrance",
            "ICU Waiting Area"
        ],
        "categories": [
            "Medical Service",
            "Equipment",
            "Safety"
        ]
    },

    "Ward": {
        "open_hour": 0,
        "close_hour": 24,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "General Ward",
            "Private Ward",
            "Nursing Station"
        ],
        "categories": [
            "Cleanliness",
            "Medical Service",
            "Staff Behaviour"
        ]
    },

    "Reception": {
        "open_hour": 8,
        "close_hour": 20,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "Reception Desk",
            "Information Counter"
        ],
        "categories": [
            "Administration",
            "Staff Behaviour"
        ]
    },

    "Cafeteria": {
        "open_hour": 7,
        "close_hour": 22,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "Food Counter",
            "Dining Area"
        ],
        "categories": [
            "Food",
            "Cleanliness"
        ]
    },

    "Parking": {
        "open_hour": 0,
        "close_hour": 24,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "Parking Gate",
            "Parking Basement"
        ],
        "categories": [
            "Parking",
            "Safety"
        ]
    },

    "Security": {
        "open_hour": 0,
        "close_hour": 24,
        "working_days": [
            "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
        ],
        "qr_locations": [
            "Main Gate",
            "Emergency Gate"
        ],
        "categories": [
            "Safety",
            "Administration"
        ]
    }

}