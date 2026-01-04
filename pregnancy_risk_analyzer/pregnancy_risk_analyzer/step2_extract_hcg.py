import pdfplumber
import re

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_hcg_value(text):
    match = re.search(r'(\d+\.?\d*)\s*mIU\/mL', text)
    if match:
        return float(match.group(1))
    return None


if __name__ == "__main__":
    pdf_path = "sample2.pdf"
    text = extract_text_from_pdf(pdf_path)

    hcg_value = extract_hcg_value(text)

    print("Extracted HCG value:", hcg_value)
