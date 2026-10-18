"""Drawing-vs-photo judging with Gemini.

The judge sees the original product photo and the player's sketch, and returns
a 0-100 similarity score. If it cannot run for any reason, `JudgeUnavailable`
is raised and the caller lets the player keep the item rather than punishing
them for bad wifi or a missing key.
"""

import base64
import io
import json
import os
from dataclasses import dataclass
from pathlib import Path

from google import genai
from google.genai import types
from PIL import Image

# Tried in order. The free tier returns 503 under load, so a slower second
MODELS = [
    m.strip()
    for m in os.getenv("GEMINI_MODELS", "gemini-3.5-flash-lite,gemini-3.5-flash").split(",")
    if m.strip()
]

# Photos are re-encoded to JPEG before sending: shop sites serve AVIF, which
# the vision API does not accept. Shrinking them also keeps judging fast.
MAX_PHOTO_EDGE = 800

SYSTEM = """You are judging a drawing game.

The player was shown a photo of a clothing item, then had to draw it from
memory in 60 seconds, with a finger or a mouse, using six flat colours, one
brush size and no eraser.

Score 0-100 for how well the drawing captures that specific item.

Be generous. Reward:
- the right kind of garment, so a jacket that reads as a jacket
- roughly the right colour
- distinctive features: a hood, a collar, stripes, a print, sleeve length,
  pleats, the overall silhouette

Ignore completely:
- drawing skill, wobbly lines, wrong proportions, no shading, no texture
- any detail nobody could capture in 60 seconds from memory

Bands:
  0-20   nothing recognisable, or plainly a different kind of garment
  21-44  vaguely clothing-shaped, but the wrong garment type or wrong colour
  45-69  recognisably this item: right garment type and roughly right colour
  70-89  clearly this item, with at least one distinctive feature right
  90-100 unmistakably this item

Keep `reason` to one short sentence."""

SCHEMA = {
    "type": "object",
    "properties": {
        "score": {"type": "integer"},
        "reason": {"type": "string"},
    },
    "required": ["score", "reason"],
}


class JudgeUnavailable(Exception):
    """The judge could not run. The player keeps the item."""


@dataclass
class ScoreResult:
    score: int
    reason: str


def _photo_part(path: Path) -> types.Part:
    buffer = io.BytesIO()
    try:
        with Image.open(path) as photo:
            photo = photo.convert("RGB")
            photo.thumbnail((MAX_PHOTO_EDGE, MAX_PHOTO_EDGE))
            photo.save(buffer, format="JPEG", quality=85)
    except OSError as err:
        raise JudgeUnavailable(f"could not read {path.name}: {err}") from err
    return types.Part.from_bytes(data=buffer.getvalue(), mime_type="image/jpeg")


def _drawing_part(data_url: str) -> types.Part:
    if "," not in data_url:
        raise JudgeUnavailable("drawing was not a data URL")
    raw = base64.b64decode(data_url.split(",", 1)[1])
    return types.Part.from_bytes(data=raw, mime_type="image/png")


def _ask(client: genai.Client, model: str, contents: list) -> ScoreResult:
    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM,
            response_mime_type="application/json",
            response_schema=SCHEMA,
            max_output_tokens=500,
        ),
    )
    if not response.text:
        raise ValueError("empty reply")
    data = json.loads(response.text)
    return ScoreResult(score=int(data["score"]), reason=str(data["reason"]))


def score_drawing(drawing_data_url: str, item_image: Path | None) -> ScoreResult:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise JudgeUnavailable("GEMINI_API_KEY is not set in backend/.env")
    if item_image is None or not item_image.is_file():
        raise JudgeUnavailable("item photo not found")

    contents = [
        "The real item:",
        _photo_part(item_image),
        "The player's drawing of it, from memory:",
        _drawing_part(drawing_data_url),
        "Score the drawing.",
    ]

    client = genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=30_000))
    failures = []
    for model in MODELS:
        try:
            return _ask(client, model, contents)
        except Exception as err:
            failures.append(f"{model}: {str(err).splitlines()[0][:120]}")
            print(f"[judge] {model} failed, trying next: {failures[-1]}")

    raise JudgeUnavailable(" | ".join(failures) or "no models configured")
