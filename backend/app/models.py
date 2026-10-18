from pydantic import BaseModel, Field


class Item(BaseModel):
    id: str
    name: str
    # Short noun used in the draw prompt, e.g. "jacket", "dress", "trainers"
    type: str
    price: float
    image_url: str
    # Shop page the basket links to; optional
    url: str | None = None
    # Setup filters: "male", "female" or "unisex", and any of casual,
    # sportswear, party, pyjamas. Untagged items show for everyone.
    gender: str | None = None
    styles: list[str] = []


class ScoreRequest(BaseModel):
    item_id: str
    # Canvas export as a data URL, e.g. "data:image/png;base64,...."
    drawing: str


class ScoreResponse(BaseModel):
    item_id: str
    score: int = Field(ge=0, le=100)
    reason: str
    passed: bool
    # False when the judge could not run and the item was kept by default
    judged: bool
