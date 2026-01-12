from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
import uvicorn
from typing import List, Optional

# Initialize FastAPI app
app = FastAPI(title="MatriCare ML Backend", version="1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model for validation
class PredictionRequest(BaseModel):
    features: List[float]

# Path to the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")

# Load model logic
model = None
if os.path.exists(MODEL_PATH):
    try:
        # Try joblib first
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded successfully using joblib.")
    except Exception as e:
        print(f"⚠️ Error loading model with joblib: {e}")
        print("Attempting fallback to pickle...")
        try:
            import pickle
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print("✅ Model loaded successfully using pickle.")
        except Exception as e2:
            print(f"❌ Pickle fallback also failed: {e2}")
            print("The model file might be corrupted or incompatible.")
else:
    print(f"❌ Model file not found at {MODEL_PATH}")

@app.get("/")
def home():
    """Health check endpoint."""
    return {
        "message": "MatriCare ML Backend is Running (FastAPI)", 
        "endpoints": ["/predict"],
        "status": "active"
    }

@app.post("/predict")
def predict(request: PredictionRequest):
    """
    Predict health risk based on input features.
    Expects JSON body: { "features": [val1, val2, ...] }
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server")
    
    try:
        features_list = request.features
        # Reshape for sklearn
        features = np.array(features_list).reshape(1, -1)
        
        # Log for debugging
        print(f"\n--- NEW PREDICTION REQUEST ---")
        print(f"Features: {features_list}")

        # Get prediction
        prediction = model.predict(features)
        pred_val = int(prediction[0])
        print(f"DEBUG: RAW PREDICTION = {pred_val}")
        
        # Get probability if available
        probability = None
        if hasattr(model, "predict_proba"):
            prob_array = model.predict_proba(features)
            probability = prob_array.tolist()
            # Handle binary classification case specifically for cleaner output
            if len(probability) == 1:
                probability = probability[0]
            print(f"DEBUG: PROBABILITIES = {probability}")
            
        return {
            "prediction": pred_val,
            "probability": probability,
            "status": "success"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    # Use uvicorn run for local development
    uvicorn.run(app, host="0.0.0.0", port=5000)
