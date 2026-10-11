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

{
"id":"SUS016",
"category":"Staff Behaviour",
"department":"Ward",
"severity":"High",
"template":"The nurse did not attend to my patient despite repeated requests."
},

{
"id":"SUS017",
"category":"Staff Behaviour",
"department":"OPD",
"severity":"High",
"template":"The doctor left the consultation area before seeing my patient."
},

{
"id":"SUS018",
"category":"Staff Behaviour",
"department":"Reception",
"severity":"Medium",
"template":"The receptionist refused to process my appointment registration."
},

{
"id":"SUS019",
"category":"Staff Behaviour",
"department":"Ward",
"severity":"High",
"template":"My patient did not receive the required attention from the nursing staff."
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

{
"id":"SUS020",
"category":"Billing",
"department":"Billing",
"severity":"High",
"template":"The same treatment appears to have been included twice in my bill."
},

{
"id":"SUS021",
"category":"Billing",
"department":"Billing",
"severity":"Medium",
"template":"I noticed an unexpected charge on the final hospital bill."
},

{
"id":"SUS022",
"category":"Billing",
"department":"Billing",
"severity":"Medium",
"template":"The amount charged on my bill does not match what I expected."
},

{
"id":"SUS023",
"category":"Billing",
"department":"Billing",
"severity":"High",
"template":"I was charged for a service that I do not believe was provided."
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

{
"id":"SUS024",
"category":"Medicine",
"department":"Pharmacy",
"severity":"High",
"template":"The medicine provided by the pharmacy was different from the prescription."
},

{
"id":"SUS025",
"category":"Medicine",
"department":"Pharmacy",
"severity":"High",
"template":"The packet containing my medicine appeared to have been opened before."
},

{
"id":"SUS026",
"category":"Medicine",
"department":"Pharmacy",
"severity":"Medium",
"template":"I received a medicine that does not appear to match the doctor's prescription."
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

{
"id":"SUS027",
"category":"Medical Service",
"department":"Ward",
"severity":"Critical",
"template":"The treatment prescribed by the doctor was not provided to the patient."
},

{
"id":"SUS028",
"category":"Medical Service",
"department":"Emergency",
"severity":"Critical",
"template":"The patient did not receive medical attention during the emergency."
},

{
"id":"SUS029",
"category":"Medical Service",
"department":"Ward",
"severity":"High",
"template":"The required treatment was delayed even though it had been prescribed."
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

{
"id":"SUS030",
"category":"Waiting Time",
"department":"OPD",
"severity":"Medium",
"template":"Patients who arrived after me were called for consultation first."
},

{
"id":"SUS031",
"category":"Waiting Time",
"department":"Radiology",
"severity":"Medium",
"template":"My scheduled scan was not performed and I was not given an explanation."
},

{
"id":"SUS032",
"category":"Waiting Time",
"department":"OPD",
"severity":"Medium",
"template":"My token was skipped even though patients with later numbers were called."
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

{
"id":"SUS033",
"category":"Equipment",
"department":"ICU",
"severity":"Critical",
"template":"The monitoring equipment stopped functioning while the patient was being monitored."
},

{
"id":"SUS034",
"category":"Equipment",
"department":"Radiology",
"severity":"High",
"template":"The MRI equipment stopped multiple times during my scan."
},

{
"id":"SUS035",
"category":"Equipment",
"department":"ICU",
"severity":"High",
"template":"The patient monitor was not functioning properly for several minutes."
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
},

{
"id":"SUS036",
"category":"Administration",
"department":"Reception",
"severity":"Medium",
"template":"There was an unexplained delay in receiving my discharge documents."
},

{
"id":"SUS037",
"category":"Administration",
"department":"Reception",
"severity":"Medium",
"template":"My medical records could not be located by the hospital staff."
},

{
"id":"SUS038",
"category":"Administration",
"department":"Reception",
"severity":"Medium",
"template":"The hospital was unable to find my medical records when I requested them."
}

]