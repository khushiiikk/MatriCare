from flask import Flask, render_template, request
import os
from main import run_pipeline

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        pdf = request.files["report"]
        pdf_path = os.path.join(UPLOAD_FOLDER, pdf.filename)
        pdf.save(pdf_path)

        result = run_pipeline(pdf_path)

        return render_template(
            "result.html",
            hcg=result["hcg"],
            level=result["risk_level"],
            explanation=result["explanation"],
            advice=result["advice"],
            image=result["image"]
        )

    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
