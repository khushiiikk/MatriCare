import pdfplumber

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            print(f"\n--- PAGE {i+1} ---\n")
            print(page_text)
            text += page_text + "\n"
    return text


if __name__ == "__main__":
    pdf_path = "sample1.pdf"   # rename your HCG PDF to this
    extract_text_from_pdf(pdf_path)
