import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .catalogue import IMAGES_DIR, image_path, load_items
from .models import Item, ScoreRequest, ScoreResponse
from .scoring import JudgeUnavailable, score_drawing

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

IMAGES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/images", StaticFiles(directory=IMAGES_DIR), name="images")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/items", response_model=list[Item])
def items():
    return load_items()


@app.post("/api/score", response_model=ScoreResponse)
def score(req: ScoreRequest):
    try:
        result = score_drawing(req.drawing, image_path(req.item_id))
    except JudgeUnavailable as err:
        # Never punish the player for our outage: keep the item.
        print(f"[judge] unavailable: {err}")
        return ScoreResponse(item_id=req.item_id, score=0, reason="", passed=True, judged=False)

    score = max(0, min(100, result.score))
    print(f"[judge] {req.item_id}: {score} - {result.reason}")
    return ScoreResponse(
        item_id=req.item_id,
        score=score,
        reason=result.reason,
        passed=score >= PASS_THRESHOLD,
        judged=True,
    )
