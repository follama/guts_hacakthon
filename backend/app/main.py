import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import ScoreRequest, ScoreResponse
from .scoring import score_drawing

load_dotenv()

PASS_THRESHOLD = 45

app = FastAPI(title="FitSketch API")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/score", response_model=ScoreResponse)
def score(req: ScoreRequest):
    result = score_drawing(req.drawing, req.item_image_url)
    return ScoreResponse(
        item_id=req.item_id,
        score=result.score,
        roast=result.roast,
        passed=result.score >= PASS_THRESHOLD,
    )
