def generate_advice(risk_level):
    if risk_level == "Low":
        return [
            "Pregnancy indicators appear within expected limits.",
            "Continue routine antenatal care.",
            "Consult a healthcare professional for confirmation and follow-up."
        ]

    if risk_level == "Medium":
        return [
            "Repeat the Beta-HCG test after 48 hours to assess progression.",
            "Monitor for symptoms such as pain or bleeding.",
            "Consult a doctor for clinical correlation."
        ]

    if risk_level == "High":
        return [
            "Immediate medical consultation is strongly recommended.",
            "Further diagnostic tests may be required.",
            "Do not delay professional evaluation."
        ]

    return ["Unable to generate advice due to unknown risk level."]



