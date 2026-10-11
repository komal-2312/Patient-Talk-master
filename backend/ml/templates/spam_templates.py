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

{
"id":"SPM021",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"aaaaaaa bbbbbbb ccccccc"
},

{
"id":"SPM022",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"qazwsxedc"
},

{
"id":"SPM023",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"random random random"
},

{
"id":"SPM024",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"%%%%%%%%%%%%"
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

{
"id":"SPM025",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Terrible"
},

{
"id":"SPM026",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Useless"
},

{
"id":"SPM027",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Very bad"
},

{
"id":"SPM028",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Not good"
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

{
"id":"SPM029",
"category":"Medicine",
"department":"Parking",
"severity":"Low",
"template":"I went to the parking area to collect my medicine from the pharmacist."
},

{
"id":"SPM030",
"category":"Billing",
"department":"Parking",
"severity":"Low",
"template":"The parking staff handled my hospital billing."
},

{
"id":"SPM031",
"category":"Radiology",
"department":"Cafeteria",
"severity":"Low",
"template":"The cafeteria refused to perform my MRI scan."
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

{
"id":"SPM032",
"category":"Medicine",
"department":"Pharmacy",
"severity":"Low",
"template":"The pharmacy was closed at 1:00 AM."
},

{
"id":"SPM033",
"category":"Billing",
"department":"Billing",
"severity":"Low",
"template":"I tried to visit the billing counter at 12:30 AM but it was closed."
},

{
"id":"SPM034",
"category":"OPD",
"department":"OPD",
"severity":"Low",
"template":"The outpatient department was closed at 3:00 AM."
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

{
"id":"SPM035",
"category":"Equipment",
"department":"Radiology",
"severity":"Low",
"template":"The MRI machine disappeared and started moving through the hospital."
},

{
"id":"SPM036",
"category":"Medical Service",
"department":"Ward",
"severity":"Low",
"template":"The doctor completed my treatment before I entered the hospital."
},

{
"id":"SPM037",
"category":"Medical Service",
"department":"Ward",
"severity":"Low",
"template":"I was discharged before I was admitted."
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

{
"id":"SPM038",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"This complaint is repeated again and again and again."
},

{
"id":"SPM039",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Same complaint repeated without any additional information."
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
},

{
"id":"SPM040",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"Nothing to say."
},

{
"id":"SPM041",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"........ ?????? ........"
},

{
"id":"SPM042",
"category":"Spam",
"department":"Unknown",
"severity":"Low",
"template":"No issue no issue no issue."
}

]