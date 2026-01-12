from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) # Explicitly allow all origins for debugging

# Path to the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "MatriCare ML Backend is Running", "endpoints": ["/predict"]})

# Load model
model = None
if os.path.exists(MODEL_PATH):
    try:
        # joblib is generally better for sklearn models than pickle
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully using joblib.")
        if hasattr(model, "feature_names_in_"):
            print("Model expects the following features:")
            for i, name in enumerate(model.feature_names_in_):
                print(f"  {i+1}. {name}")
        if hasattr(model, "n_features_in_"):
            print(f"Total expected features: {model.n_features_in_}")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Attempting fallback to pickle...")
        try:
            import pickle
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print("Model loaded successfully using pickle.")
            if hasattr(model, "feature_names_in_"):
                print("Model expects the following features:")
                for i, name in enumerate(model.feature_names_in_):
                    print(f"  {i+1}. {name}")
        except Exception as e2:
            print(f"Pickle fallback also failed: {e2}")
else:
    print(f"Model file not found at {MODEL_PATH}. Please ensure it is placed in the backend folder.")

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded on server"}), 500
    
    try:
        data = request.json
        features_list = data["features"]
        features = np.array(features_list).reshape(1, -1)
        
        # Log for debugging
        print("\n--- NEW PREDICTION REQUEST ---")
        if hasattr(model, "feature_names_in_"):
            for name, val in zip(model.feature_names_in_, features_list):
                print(f"DEBUG: {name} = {val}")
        
        if hasattr(model, "classes_"):
            print(f"DEBUG: Model Classes: {model.classes_}")

        # Get prediction
        prediction = model.predict(features)
        pred_val = int(prediction[0])
        print(f"DEBUG: RAW PREDICTION = {pred_val}")
        
        # Get probability if model supports it
        probability = None
        if hasattr(model, "predict_proba"):
            probability = model.predict_proba(features).tolist()
            print(f"DEBUG: PROBABILITIES = {probability}")
            
        return jsonify({
            "prediction": pred_val,
            "probability": probability,
            "status": "success"
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    # Run on Port 5000 by default
    app.run(host="0.0.0.0", port=5000, debug=True)
