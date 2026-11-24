import os
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

SMALL_THRESHOLD = 1.0
MEDIUM_THRESHOLD = 4.0

app = FastAPI(title="Pothole Detection API")

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent / "models" / "best.pt"
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"YOLO model weights not found at {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))


def classify_pothole_size(area_percentage: float) -> dict:
    """Classify pothole size and severity by bounding-box area share."""
    if area_percentage < SMALL_THRESHOLD:
        return {
            "size": "small",
            "severity": "low",
            "color": "#16A34A",
        }
    if area_percentage < MEDIUM_THRESHOLD:
        return {
            "size": "medium",
            "severity": "moderate",
            "color": "#F59E0B",
        }
    return {
        "size": "large",
        "severity": "high",
        "color": "#DC2626",
    }


@app.get("/")
def home():
    return {"message": "Pothole Detection API is running"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image")

    contents = await file.read()
    image_array = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    height, width = image.shape[:2]
    image_area = width * height

    results = model.predict(
        source=image,
        imgsz=416,
        conf=0.30,
        device="cpu",
        half=False,
        verbose=False,
    )

    result = results[0]
    detections = []

    if result.boxes is not None:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().tolist()
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            box_width = max(0.0, x2 - x1)
            box_height = max(0.0, y2 - y1)
            box_area = box_width * box_height

            area_percentage = (box_area / image_area) * 100 if image_area > 0 else 0.0
            classification = classify_pothole_size(area_percentage)

            detections.append(
                {
                    "class_id": class_id,
                    "class_name": model.names[class_id],
                    "confidence": round(confidence, 4),
                    "box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2),
                    },
                    "size": classification["size"],
                    "severity": classification["severity"],
                    "color": classification["color"],
                    "area_percentage": round(area_percentage, 2),
                }
            )

    return {
        "image_width": width,
        "image_height": height,
        "total_detections": len(detections),
        "detections": detections,
    }