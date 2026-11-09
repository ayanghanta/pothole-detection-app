
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ultralytics import YOLO
import numpy as np
import cv2

from pathlib import Path

app = FastAPI(title="Pothole Detection API")

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model once when the server starts
MODEL_PATH = Path(__file__).parent / "models" / "best.pt"

model = YOLO(str(MODEL_PATH))


@app.get("/")
def home():
    return {
        "message": "Pothole Detection API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image"
        )

    contents = await file.read()

    image_array = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image"
        )

    height, width = image.shape[:2]


    # Run YOLO detection
    # results = model.predict(
    #     source=image,
    #     imgsz=640,
    #     conf=0.25,
    #     device="cpu",
    #     verbose=False
    # )

    results = model.predict( source=image,
    imgsz=416,
    conf=0.30,
    device="cpu",
    half=False,
    verbose=False )

    result = results[0]

    detections = []

    if result.boxes is not None:

        for box in result.boxes:

            x1, y1, x2, y2 = box.xyxy[0].cpu().tolist()

            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            detections.append({
                "class_id": class_id,
                "class_name": model.names[class_id],
                "confidence": round(confidence, 4),
                "box": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                }
            })

    return {
        "image_width": width,
        "image_height": height,
        "total_detections": len(detections),
        "detections": detections
    }
