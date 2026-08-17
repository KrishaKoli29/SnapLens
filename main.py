import torch
import torch.nn as nn
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI(title="SnapSight AI Microservice")

# --- 1. DEFINE THE DATA STRUCTURE ---
# This exactly matches the JSON coming from Lens Studio
class FrameData(BaseModel):
    timestamp: float
    ear: float
    pitch: float
    yaw: float
    roll: float

class BatchPayload(BaseModel):
    batch_id: int
    size: int
    telemetry: List[FrameData]

# --- 2. BUILD THE PYTORCH LSTM MODEL ---
class EngagementLSTM(nn.Module):
    def __init__(self):
        super(EngagementLSTM, self).__init__()
        # We have 4 inputs per frame: EAR, Pitch, Yaw, Roll
        self.lstm = nn.LSTM(input_size=4, hidden_size=16, batch_first=True)
        self.fc = nn.Linear(16, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # x shape: (batch_size, sequence_length, features) -> (1, 30, 4)
        out, (hidden_state, cell_state) = self.lstm(x)
        
        # We only care about the network's conclusion at the very end of the 1-second batch
        last_hidden = hidden_state[-1] 
        final_prediction = self.fc(last_hidden)
        
        return self.sigmoid(final_prediction)

# Initialize the model (In production, you would load pre-trained weights here)
model = EngagementLSTM()
model.eval() # Set model to evaluation (inference) mode

# --- 3. CREATE THE API ENDPOINT ---
@app.post("/predict")
async def predict_engagement(payload: BatchPayload):
    try:
        # Extract the 4 features from the 30 frames into a 2D array
        sequence = [
            [frame.ear, frame.pitch, frame.yaw, frame.roll] 
            for frame in payload.telemetry
        ]
        
        # Convert the array into a PyTorch Tensor
        # Shape becomes [1 (batch), 30 (sequence length), 4 (features)]
        tensor_data = torch.tensor([sequence], dtype=torch.float32)
        
        # Run the data through the AI model
        with torch.no_grad():
            prediction = model(tensor_data)
            
        # Convert the raw tensor output into a clean percentage score
        score = float(prediction[0][0]) * 100
        
        print(f"Batch {payload.batch_id} processed. Engagement Score: {round(score, 2)}%")
        
        return {
            "status": "success", 
            "batch_id": payload.batch_id,
            "ai_engagement_score": round(score, 2)
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- 4. RUN SERVER SCRIPT ---
if __name__ == "__main__":
    print("Starting PyTorch AI Microservice on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)