import pdfplumber



def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def detect_clinical_warnings(text):
    text = text.lower()
    warnings_found = []

    warning_keywords = [
        "ectopic",
        "abnormal",
        "slow",
        "trophoblastic",
        "molar pregnancy",
        "spontaneous abortion",
        "false negative"
    ]

    for keyword in warning_keywords:
        if keyword in text:
            warnings_found.append(keyword)

    return warnings_found


if __name__ == "__main__":
    from step1_pdf_extract import extract_text_from_pdf

    pdf_path = "sample1.pdf"
    text = extract_text_from_pdf(pdf_path)

    warnings = detect_clinical_warnings(text)

    print("Detected Clinical Warnings:")
    for w in warnings:
        print(f"- {w}")
