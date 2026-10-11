import sys
import joblib
import json
from rule_engine import evaluate_rules


model = joblib.load(
    "complaint_classifier.pkl"
)


labels = {
    0: "Genuine",
    1: "Suspicious",
    2: "Spam"
}


def analyze(complaint):

    rule_result = evaluate_rules(complaint)

    if rule_result:

        return rule_result

    prediction = model.predict(
        [complaint]
    )[0]

    probabilities = model.predict_proba(
        [complaint]
    )[0]

    confidence = round(
        float(max(probabilities) * 100),
        2
    )

    return {

        "prediction":
        labels[prediction],

        "confidence":
        confidence,

        "reason":
        "ML Classification"

    }


if __name__ == "__main__":

    complaint = sys.argv[1]

    result = analyze(
        complaint
    )

    print(json.dumps(result))