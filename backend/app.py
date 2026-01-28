from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
import uvicorn
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configure Gemini API
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in .env file. Chatbot will not work.")

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

class ChatRequest(BaseModel):
    message: str
    language: str = "en"

class TranslationRequest(BaseModel):
    text: str
    target_lang: str

# Path to the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")

# Load model logic
model = None
if os.path.exists(MODEL_PATH):
    try:
        # Try joblib first
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully using joblib.")
    except Exception as e:
        print(f"Error loading model with joblib: {e}")
        print("Attempting fallback to pickle...")
        try:
            import pickle
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print("Model loaded successfully using pickle.")
        except Exception as e2:
            print(f" Pickle fallback also failed: {e2}")
            print("The model file might be corrupted or incompatible.")
else:
    print(f" Model file not found at {MODEL_PATH}")

@app.get("/")
def home():
    """Health check endpoint."""
    return {
        "message": "MatriCare ML Backend is Running (FastAPI)", 
        "endpoints": ["/predict", "/chat", "/translate"],
        "status": "active"
    }

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    """
    Translate text using Google Gemini.
    """
    if not GENAI_API_KEY:
        raise HTTPException(status_code=500, detail="Server Error: API Key not configured")

    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"Translate the following text to {request.target_lang}. Return ONLY the translated text, no explanation: {request.text}"
        response = model.generate_content(prompt)
        return {"translated_text": response.text}
    except Exception as e:
        print(f"Translation Error: {e}")
        raise HTTPException(status_code=500, detail="Translation failed")

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint using Google Gemini.
    Expects: { "message": "hello", "language": "en" }
    """
    if not GENAI_API_KEY:
        raise HTTPException(status_code=500, detail="Server Error: API Key not configured")

    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # System prompt to set context
        system_prompt = f"""
        You are Matri, a compassionate and knowledgeable maternal health assistant for rural India.
        You provide safe, approved medical advice for pregnant women.
        
        Guidelines:
        1. Answer in the requested language ({request.language}).
        2. Keep answers concise (max 3-4 sentences).
        3. Be encouraging and supportive.
        4. If it's a medical emergency, tell them to visit a doctor immediately.
        
        User Query: {request.message}
        """

        response = model.generate_content(system_prompt)
        return {"response": response.text}

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI response")

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
