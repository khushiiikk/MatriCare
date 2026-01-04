import matplotlib.pyplot as plt
import os

def generate_risk_bar(score):
    os.makedirs("static", exist_ok=True)

    plt.figure(figsize=(6, 1.2))

    # Background bar
    plt.barh([0], [10], color="#e0e0e0")

    # Risk bar
    if score <= 3:
        color = "green"
    elif score <= 6:
        color = "orange"
    else:
        color = "red"

    plt.barh([0], [score], color=color)

    plt.xlim(0, 10)
    plt.yticks([])
    plt.xlabel("Low        Medium        High")

    plt.tight_layout()
    plt.savefig("static/risk_bar.png")
    plt.close()
