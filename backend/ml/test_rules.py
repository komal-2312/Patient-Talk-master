from rule_engine import evaluate_rules

tests = [

    "The pharmacy was closed at 10 AM",

    "The pharmacy was closed at 11 PM",

    "The billing counter was closed at 11 AM",

    "The billing counter was closed at 10 PM",

    "The ICU was closed at 3 AM"
]

for t in tests:

    print("\nComplaint:")
    print(t)

    print("Result:")
    print(evaluate_rules(t))