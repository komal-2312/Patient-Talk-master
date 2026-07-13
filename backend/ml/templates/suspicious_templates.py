"""
Templates that represent complaints requiring verification.

These complaints are NOT obviously fake.
They should be reviewed by the hospital administrator.
"""

SUSPICIOUS_TEMPLATES = [

# ---------------- STAFF ----------------

{
"id":"SUS001",
"category":"Staff Behaviour",
"department":"Ward",
"severity":"High",
"template":"The nurse never attended my patient during the entire shift."
},

{
"id":"SUS002",
"category":"Staff Behaviour",
"department":"OPD",
"severity":"Medium",
"template":"The doctor left before examining all patients."
},

{
"id":"SUS003",
"category":"Staff Behaviour",
"department":"Reception",
"severity":"Medium",
"template":"The receptionist refused to register my appointment."
},

# ---------------- BILLING ----------------

{
"id":"SUS004",
"category":"Billing",
"department":"Billing",
"severity":"High",
"template":"I believe I was charged twice for the same treatment."
},

{
"id":"SUS005",
"category":"Billing",
"department":"Billing",
"severity":"Medium",
"template":"The final bill appears much higher than expected."
},

# ---------------- MEDICINE ----------------

{
"id":"SUS006",
"category":"Medicine",
"department":"Pharmacy",
"severity":"High",
"template":"The pharmacist gave me a different medicine than prescribed."
},

{
"id":"SUS007",
"category":"Medicine",
"department":"Pharmacy",
"severity":"High",
"template":"The medicine packet looked already opened."
},

# ---------------- MEDICAL ----------------

{
"id":"SUS008",
"category":"Medical Service",
"department":"Ward",
"severity":"Critical",
"template":"The prescribed treatment was not given to the patient."
},

{
"id":"SUS009",
"category":"Medical Service",
"department":"Emergency",
"severity":"Critical",
"template":"No doctor attended the patient during the emergency."
},

# ---------------- WAITING ----------------

{
"id":"SUS010",
"category":"Waiting Time",
"department":"OPD",
"severity":"Medium",
"template":"Patients with later token numbers were called before me."
},

{
"id":"SUS011",
"category":"Waiting Time",
"department":"Radiology",
"severity":"Medium",
"template":"My scan appointment was skipped without explanation."
},

# ---------------- EQUIPMENT ----------------

{
"id":"SUS012",
"category":"Equipment",
"department":"ICU",
"severity":"Critical",
"template":"The patient monitor stopped working for several minutes."
},

{
"id":"SUS013",
"category":"Equipment",
"department":"Radiology",
"severity":"High",
"template":"The MRI machine repeatedly stopped during the scan."
},

# ---------------- ADMINISTRATION ----------------

{
"id":"SUS014",
"category":"Administration",
"department":"Reception",
"severity":"Medium",
"template":"My discharge papers were delayed without any explanation."
},

{
"id":"SUS015",
"category":"Administration",
"department":"Reception",
"severity":"Low",
"template":"Hospital staff misplaced my medical records."
}

]