"""
Templates representing invalid, fake, spam or meaningless complaints.

These are used to train the ML model to identify
complaints that should be automatically rejected.
"""

SPAM_TEMPLATES = [

# ---------------- GIBBERISH ----------------

{
"id":"SPM001",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"asdfghjkl"
},

{
"id":"SPM002",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"qwertyuiop"
},

{
"id":"SPM003",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"..........."
},

{
"id":"SPM004",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"123456789"
},

{
"id":"SPM005",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"test test test"
},

# ---------------- VERY SHORT ----------------

{
"id":"SPM006",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Bad"
},

{
"id":"SPM007",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Worst"
},

{
"id":"SPM008",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Poor"
},

# ---------------- WRONG DEPARTMENT ----------------

{
"id":"SPM009",
"category":"Medicine",
"department":"Parking",
"severity":"Low",
"template":"The pharmacist refused to give medicine in the parking area."
},

{
"id":"SPM010",
"category":"Billing",
"department":"ICU",
"severity":"Low",
"template":"The ICU charged me for parking."
},

# ---------------- OPERATING HOURS ----------------

{
"id":"SPM011",
"category":"Medicine",
"department":"Pharmacy",
"severity":"Low",
"template":"The pharmacy was closed at 11:30 PM."
},

{
"id":"SPM012",
"category":"Billing",
"department":"Billing",
"severity":"Low",
"template":"Billing counter was closed at midnight."
},

{
"id":"SPM013",
"category":"OPD",
"department":"OPD",
"severity":"Low",
"template":"Doctor consultation was unavailable at 2:00 AM."
},

# ---------------- IMPOSSIBLE ----------------

{
"id":"SPM014",
"category":"Equipment",
"department":"Radiology",
"severity":"Low",
"template":"The MRI machine was flying in the room."
},

{
"id":"SPM015",
"category":"Medical Service",
"department":"Ward",
"severity":"Low",
"template":"The doctor treated me before I arrived."
},

# ---------------- DUPLICATE STYLE ----------------

{
"id":"SPM016",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Complaint repeated multiple times."
},

{
"id":"SPM017",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Same issue same issue same issue."
},

# ---------------- EMPTY / RANDOM ----------------

{
"id":"SPM018",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":".....?????"
},

{
"id":"SPM019",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"xxxxxxxxxxxx"
},

{
"id":"SPM020",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"No complaint."
}

]