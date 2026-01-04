def calculate_risk_score(hcg_value, warnings):
    score = 0
    reasons = []

    # ---- HCG-based scoring ----
    if hcg_value is None:
        score += 4
        reasons.append("HCG value not detected")

    elif hcg_value < 5:
        score += 4
        reasons.append("HCG below pregnancy threshold")

    elif 5 <= hcg_value <= 25:
        score += 2
        reasons.append("Very early or borderline pregnancy")

    elif 25 < hcg_value <= 100:
        score += 1
        reasons.append("Early pregnancy range")

    elif hcg_value > 100000:
        score += 3
        reasons.append("Extremely high HCG level")

    # ---- Warning-based scoring ----
    if warnings:
        score += 3
        reasons.append("Clinical warning terms detected")

    # ---- Risk level mapping ----
    if score <= 2:
        risk_level = "Low"
    elif score <= 5:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return score, risk_level, reasons



