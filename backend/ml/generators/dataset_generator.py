import os
import csv
import random
import sys
from datetime import datetime, timedelta

# -----------------------------
# Fix Python Imports
# -----------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(CURRENT_DIR)

sys.path.append(ML_DIR)

from config.hospitals import HOSPITALS
from config.departments import DEPARTMENTS
from config.operating_rules import OPERATING_RULES

from templates.genuine_templates import GENUINE_TEMPLATES
from templates.suspicious_templates import SUSPICIOUS_TEMPLATES
from templates.spam_templates import SPAM_TEMPLATES

from utils.placeholders import (
    LOCATIONS,
    DURATIONS,
    TIME_REFERENCES,
    MEDICINES
)

# -----------------------------
# Helper Functions
# -----------------------------

def fill_template(template):

    complaint = template

    complaint = complaint.replace(
        "{location}",
        random.choice(LOCATIONS)
    )

    complaint = complaint.replace(
        "{duration}",
        random.choice(DURATIONS)
    )

    complaint = complaint.replace(
        "{time_reference}",
        random.choice(TIME_REFERENCES)
    )

    complaint = complaint.replace(
        "{medicine}",
        random.choice(MEDICINES)
    )

    return complaint


def random_datetime():

    start = datetime(2025, 1, 1)
    end = datetime(2026, 12, 31)

    difference = end - start

    random_days = random.randint(0, difference.days)

    date = start + timedelta(days=random_days)

    hour = random.randint(0, 23)
    minute = random.randint(0, 59)

    return date.replace(hour=hour, minute=minute)


def generate_row(template, label):

    hospital = random.choice(HOSPITALS)

    department = template["department"]

    rules = OPERATING_RULES.get(department, None)

    complaint_datetime = random_datetime()

    if rules:

        open_hour = rules["working_hours"][0]
        close_hour = rules["working_hours"][1]

        within_hours = (
            open_hour <= complaint_datetime.hour < close_hour
        ) if close_hour != 24 else True

    else:

        open_hour = 0
        close_hour = 24
        within_hours = True

    return {

        "complaintId":
        f"CMP{random.randint(100000,999999)}",

        "hospital":
        hospital["name"],

        "city":
        hospital["city"],

        "department":
        department,

        "category":
        template["category"],

        "complaintText":
        fill_template(template["template"]),

        "severity":
        template["severity"],

        "date":
        complaint_datetime.strftime("%Y-%m-%d"),

        "time":
        complaint_datetime.strftime("%H:%M"),

        "departmentOpenHour":
        open_hour,

        "departmentCloseHour":
        close_hour,

        "withinOperatingHours":
        within_hours,

        "label":
        label

    }


# -----------------------------
# Generate Dataset
# -----------------------------

rows = []

print("Generating Genuine Complaints...")

for _ in range(6000):

    rows.append(
        generate_row(
            random.choice(GENUINE_TEMPLATES),
            "Genuine"
        )
    )

print("Generating Suspicious Complaints...")

for _ in range(2500):

    rows.append(
        generate_row(
            random.choice(SUSPICIOUS_TEMPLATES),
            "Suspicious"
        )
    )

print("Generating Spam Complaints...")

for _ in range(1500):

    rows.append(
        generate_row(
            random.choice(SPAM_TEMPLATES),
            "Spam"
        )
    )

random.shuffle(rows)

# -----------------------------
# Save CSV
# -----------------------------

dataset_path = os.path.join(
    ML_DIR,
    "datasets",
    "complaints_dataset_v1.csv"
)

with open(dataset_path, "w", newline="", encoding="utf-8") as csvfile:

    writer = csv.DictWriter(
        csvfile,
        fieldnames=rows[0].keys()
    )

    writer.writeheader()

    writer.writerows(rows)

print("----------------------------------")
print("Dataset Generated Successfully")
print(f"Rows : {len(rows)}")
print(f"Saved To : {dataset_path}")
print("----------------------------------")