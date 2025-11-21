import os
import uuid
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv

from PIL import Image
import numpy as np

from ultralytics import YOLO
import google.generativeai as genai

from fastapi.middleware.cors import CORSMiddleware
from .auth_routes import router as auth_router
from .auth import get_current_user
from .database import User


UPLOAD_DIR = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "uploads"))
STATIC_DIR = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "static"))
ANNOTATED_DIR = os.path.join(STATIC_DIR, "annotated")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ANNOTATED_DIR, exist_ok=True)

load_dotenv()

app = FastAPI(title="YOLO Inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")

try:
    model = YOLO(MODEL_PATH)
except Exception as e:

    model = None
    print(f"[WARN] Failed to load YOLO model at '{MODEL_PATH}': {e}")

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(GEMINI_MODEL_NAME)
    except Exception as e:
        gemini_model = None
        print(f"[WARN] Failed to initialize Gemini model '{GEMINI_MODEL_NAME}': {e}")
else:
    gemini_model = None
    print("[WARN] GEMINI_API_KEY not set. Q&A endpoint will be disabled.")





def results_to_detections(results) -> List[Dict[str, Any]]:
    """
    Convert ultralytics detection result -> list of {class_name, bbox, confidence}
    bbox is [x1, y1, x2, y2] in pixel coordinates
    """
    detections = []

    boxes = getattr(results, "boxes", None)
    if boxes is None:
        return detections

    names = results.names if hasattr(results, "names") else model.names

    for i in range(len(boxes)):
        try:
            xyxy = boxes.xyxy[i].cpu().numpy().tolist()
            conf = float(boxes.conf[i].cpu().numpy().item())
            cls_idx = int(boxes.cls[i].cpu().numpy().item())
            cls_name = names.get(cls_idx, str(cls_idx)) if isinstance(
                names, dict) else names[cls_idx]
            detections.append({
                "class_name": cls_name,
                "bbox": [float(x) for x in xyxy],
                "confidence": conf
            })
        except Exception as e:

            print("Error parsing box:", e)
            continue
    return detections


class DetectionPayload(BaseModel):
    class_name: str = Field(..., description="Detected object label")
    bbox: List[float] = Field(
        default_factory=list,
        description="Bounding box [x1, y1, x2, y2] in pixels"
    )
    confidence: float = Field(..., ge=0.0, le=1.0)

    @validator("bbox")
    def validate_bbox(cls, value: List[float]):
        if len(value) != 4:
            raise ValueError("bbox must contain exactly 4 values.")
        return value


class QAHistoryEntry(BaseModel):
    role: str
    message: str


class QARequest(BaseModel):
    question: str
    detections: List[DetectionPayload]
    history: Optional[List[QAHistoryEntry]] = None


def build_detection_context(detections: List[DetectionPayload]) -> str:
    if not detections:
        return "No objects were detected in the most recent analysis."

    lines = []
    for idx, det in enumerate(detections, 1):
        bbox_str = ", ".join(f"{coord:.0f}" for coord in det.bbox)
        lines.append(
            f"{idx}. {det.class_name} | bbox=({bbox_str}) | confidence={det.confidence:.2%}"
        )
    return "\n".join(lines)


def build_history_context(history: Optional[List[QAHistoryEntry]]) -> str:
    if not history:
        return ""
    transcript = []
    for entry in history[-5:]:  # limit to last 5 turns
        role = "User" if entry.role.lower() == "user" else "AI"
        transcript.append(f"{role}: {entry.message.strip()}")
    return "\n".join(transcript)


@app.post("/api/images/upload")
async def upload_and_detect(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Receives an image file via multipart/form-data, runs YOLO inference,
    saves annotated image under static/annotated and returns structured detections.
    """
    if model is None:
        raise HTTPException(
            status_code=500, detail="YOLO model not loaded on server.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Uploaded file is not an image.")

    uid = str(uuid.uuid4())
    filename = f"{uid}_{file.filename.replace(' ', '_')}"
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as f:
        contents = await file.read()
        f.write(contents)

    try:

        res = model(save_path, imgsz=640, conf=0.25)[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Model inference failed: {e}")

    detections = results_to_detections(res)

    try:
        annotated_np = res.plot()

        if annotated_np.dtype != np.uint8:
            annotated_np = (255 * np.clip(annotated_np, 0, 1)).astype(np.uint8)
        annotated_image = Image.fromarray(annotated_np)
        annotated_filename = f"{uid}_annotated.png"
        annotated_path = os.path.join(ANNOTATED_DIR, annotated_filename)
        annotated_image.save(annotated_path, format="PNG")
    except Exception as e:
        print("Failed to create annotated image:", e)
        annotated_filename = None

    original_url = f"/static/uploads/{filename}"
    annotated_url = f"/static/annotated/{annotated_filename}" if annotated_filename else None

    try:
        static_uploads_dir = os.path.join(STATIC_DIR, "uploads")
        os.makedirs(static_uploads_dir, exist_ok=True)
        import shutil
        shutil.copy(save_path, os.path.join(static_uploads_dir, filename))
        original_url = f"/static/uploads/{filename}"
    except Exception:
        # if copy fails, original_url might not be accessible — still return annotated_url at minimum
        pass

    return JSONResponse({
        "image_id": uid,
        "original_url": original_url,
        "annotated_url": annotated_url,
        "detections": detections
    })


@app.post("/api/results/qa")
async def ask_about_results(
    payload: QARequest,
    current_user: User = Depends(get_current_user)
):
    if gemini_model is None:
        raise HTTPException(
            status_code=500,
            detail="Gemini model is not configured on the server."
        )

    if not payload.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    detection_context = build_detection_context(payload.detections)
    history_context = build_history_context(payload.history)
    system_prompt = (
        "You are an assistant that answers questions about the provided object "
        "detection results. Only rely on the supplied detections. "
        "If the answer cannot be derived, reply that the information is not available."
    )

    composed_prompt = (
        f"{system_prompt}\n\n"
        f"Detections:\n{detection_context}\n\n"
        f"Previous conversation (if any):\n{history_context or 'None'}\n\n"
        f"User question: {payload.question.strip()}\n\n"
        "Provide a concise, user-friendly answer."
    )

    try:
        response = gemini_model.generate_content(composed_prompt)
        answer = (response.text or "").strip()
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API request failed: {e}"
        )

    if not answer:
        answer = "I could not generate a response for that question."

    return {"answer": answer}
