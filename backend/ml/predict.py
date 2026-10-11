import sys
import joblib

model = joblib.load("complaint_classifier.pkl")

complaint = sys.argv[1]

prediction = model.predict([complaint])[0]

probabilities = model.predict_proba([complaint])[0]

labels = {
    0: "Genuine",
    1: "Suspicious",
    2: "Spam"
}

confidence = round(max(probabilities) * 100, 2)

print({
    "prediction": labels[prediction],
    "confidence": confidence
})