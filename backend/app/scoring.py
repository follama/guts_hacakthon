"""Drawing-vs-photo judging.

Currently a stub that returns a random score so the game loop can be played
end to end. Replace `score_drawing` with a real vision AI call.
"""

import random
from dataclasses import dataclass
from pathlib import Path

PLACEHOLDER_ROASTS = [
    "Bold of you to call that a jacket.",
    "Picasso would be confused, and he invented confused.",
    "Your memory has the attention span of a fast-fashion trend.",
    "Honestly? Close enough to be worrying.",
]


@dataclass
class ScoreResult:
    score: int
    roast: str


def score_drawing(drawing_data_url: str, item_image: Path | None) -> ScoreResult:
    # TODO: send both images to Claude, ask for a 0-100 similarity score and a
    # one-line roast, then parse the response.
    return ScoreResult(score=random.randint(0, 100), roast=random.choice(PLACEHOLDER_ROASTS))
