from step1_pdf_extract import extract_text_from_pdf
from step2_extract_hcg import extract_hcg_value
from step3_detect_warnings import detect_clinical_warnings
from step4_risk_scoring import calculate_risk_score
from step5_explain_result import explain_result
from step6_advice_engine import generate_advice
from step7_visualization import generate_risk_bar


def run_pipeline(pdf_path):
    # Step 1: PDF → text
    text = extract_text_from_pdf(pdf_path)

    # Step 2: extract HCG
    hcg = extract_hcg_value(text)

    # Step 3: detect warnings
    warnings = detect_clinical_warnings(text)

    # Step 4: risk scoring
    score, level, reasons = calculate_risk_score(hcg, warnings)

    # Step 5: explanation
    explanation = explain_result(hcg, level, reasons)

    # Step 6: advice
    advice = generate_advice(level)

    # Step 7: visualization
    image_path = generate_risk_bar(score)

    return {
        "hcg": hcg,
        "risk_level": level,
        "risk_score": score,
        "explanation": explanation,
        "advice": advice,
        "image": image_path
    }


# Optional test
#if __name__ == "__main__":
 #   result = run_pipeline("sample.pdf")
  #  print(result)
