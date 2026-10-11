"""
operating_rules.py

Business rules used by the AI dataset generator.

These rules are NOT the ML model.

They simulate real hospital operations so the dataset
contains realistic scenarios.
"""

OPERATING_RULES = {

    "Pharmacy": {
        "working_hours": (8, 20),
        "working_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "closed_on_holidays": True,
        "maintenance_hours": [],
        "night_shift": False,
        "common_invalid_reason": "outside_operating_hours"
    },

    "OPD": {
        "working_hours": (9, 17),
        "working_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "closed_on_holidays": True,
        "maintenance_hours": [],
        "night_shift": False,
        "common_invalid_reason": "outside_operating_hours"
    },

    "Laboratory": {
        "working_hours": (7, 19),
        "working_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "closed_on_holidays": False,
        "maintenance_hours": [(14,15)],
        "night_shift": False,
        "common_invalid_reason": "during_maintenance"
    },

    "Radiology": {
        "working_hours": (8,18),
        "working_days": ["Mon","Tue","Wed","Thu","Fri","Sat"],
        "closed_on_holidays": False,
        "maintenance_hours":[(13,14)],
        "night_shift": False,
        "common_invalid_reason":"during_maintenance"
    },

    "Emergency": {
        "working_hours": (0,24),
        "working_days":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        "closed_on_holidays":False,
        "maintenance_hours":[],
        "night_shift":True,
        "common_invalid_reason":None
    },

    "ICU": {
        "working_hours": (0,24),
        "working_days":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        "closed_on_holidays":False,
        "maintenance_hours":[],
        "night_shift":True,
        "common_invalid_reason":None
    },

    "Housekeeping": {
        "working_hours": (0,24),
        "working_days":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        "closed_on_holidays":False,
        "maintenance_hours":[],
        "night_shift":True,
        "common_invalid_reason":None
    },

    "Billing": {
        "working_hours": (9,18),
        "working_days":["Mon","Tue","Wed","Thu","Fri","Sat"],
        "closed_on_holidays":True,
        "maintenance_hours":[],
        "night_shift":False,
        "common_invalid_reason":"outside_operating_hours"
    },

    "Reception": {
        "working_hours": (8,20),
        "working_days":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        "closed_on_holidays":False,
        "maintenance_hours":[],
        "night_shift":True,
        "common_invalid_reason":None
    },

    "Cafeteria": {
        "working_hours": (7,22),
        "working_days":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        "closed_on_holidays":False,
        "maintenance_hours":[],
        "night_shift":False,
        "common_invalid_reason":"outside_operating_hours"
    }

}