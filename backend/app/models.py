from pydantic import BaseModel, Field


class ScoreRequest(BaseModel):
    item_id: str
    item_image_url: str
    # Canvas export as a data URL, e.g. "data:image/png;base64,...."
    drawing: str


class ScoreResponse(BaseModel):
    item_id: str
    score: int = Field(ge=0, le=100)
    roast: str
    passed: bool
