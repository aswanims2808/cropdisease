from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from predict import predict_disease # Member 3's existing code

# 1. Initialize the API
app = FastAPI(title="SecuCrop AI Bridge")

# 2. Allow the React frontend to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Create the endpoint that receives the image
@app.post("/analyze")
async def analyze_leaf(file: UploadFile = File(...)):
    # Temporarily save the uploaded image from the web app
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Send it to Member 3's prediction function
    disease, confidence, treatment = predict_disease(temp_file_path)
    
    # Return the clean results to the web app as JSON
    return {
        "disease": disease,
        "confidence": round(confidence * 100, 2),
        "treatment": treatment
    }

# 4. Start the server
if __name__ == "__main__":
    print("Starting AI Bridge on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)