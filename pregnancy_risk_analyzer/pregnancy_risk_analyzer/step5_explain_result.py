def explain_result(hcg_value, risk_level, reasons):
    explanation = []

    # Explain HCG
    if hcg_value is not None:
        explanation.append(
            f"Your Beta-HCG level is {hcg_value} mIU/mL, which helps assess early pregnancy status."
        )
    else:
        explanation.append(
            "Beta-HCG value could not be reliably extracted from the report."
        )

    # Explain risk level
    if risk_level == "Low":
        explanation.append(
            "This result falls under a LOW RISK category, meaning the value is within expected limits."
        )

    elif risk_level == "Medium":
        explanation.append(
            "This result falls under a MEDIUM RISK category. This does not indicate a problem, "
            "but follow-up testing and medical consultation are recommended."
        )

    else:
        explanation.append(
            "This result falls under a HIGH RISK category. Immediate medical consultation is advised."
        )

    # Explain reasons
    explanation.append("Key factors influencing this assessment:")
    for reason in reasons:
        explanation.append(f"- {reason}")

    return explanation



