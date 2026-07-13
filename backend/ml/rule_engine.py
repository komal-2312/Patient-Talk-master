import re

from config.operating_rules import OPERATING_RULES


def extract_hour(text):

    match = re.search(
        r'(\d{1,2})(?::\d{2})?\s*(AM|PM|am|pm)',
        text
    )

    if not match:
        return None

    hour = int(match.group(1))
    meridian = match.group(2).upper()

    if meridian == "PM" and hour != 12:
        hour += 12

    if meridian == "AM" and hour == 12:
        hour = 0

    return hour


def detect_department(text):

    text_lower = text.lower()

    for department in OPERATING_RULES.keys():

        if department.lower() in text_lower:
            return department

    return None


def evaluate_rules(complaint):

    department = detect_department(complaint)

    if not department:
        return None

    hour = extract_hour(complaint)

    if hour is None:
        return None

    rules = OPERATING_RULES[department]

    open_hour, close_hour = rules["working_hours"]

    if close_hour == 24:
        return None

    if open_hour <= hour < close_hour:

        if "closed" in complaint.lower():

            return {
                "prediction": "Suspicious",
                "confidence": 100,
                "reason": f"{department} should be open at this time"
            }

    else:

        if "closed" in complaint.lower():

            return {
                "prediction": "Spam",
                "confidence": 100,
                "reason": f"{department} is normally closed at this time"
            }

    return None