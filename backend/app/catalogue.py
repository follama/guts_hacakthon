"""Loads the clothing catalogue from disk.

`catalogue/items.json` lists the items; the photos sit in `catalogue/images/`.
Items whose photo is missing are skipped, so you can add entries and images
incrementally without the deck breaking.
"""

import json
from pathlib import Path

from .models import Item

CATALOGUE_DIR = Path(__file__).resolve().parent.parent / "catalogue"
IMAGES_DIR = CATALOGUE_DIR / "images"
ITEMS_FILE = CATALOGUE_DIR / "items.json"


def load_items() -> list[Item]:
    if not ITEMS_FILE.is_file():
        return []

    items = []
    for entry in json.loads(ITEMS_FILE.read_text(encoding="utf-8")):
        if not (IMAGES_DIR / entry["image"]).is_file():
            print(f"[catalogue] skipping {entry['id']}: {entry['image']} not in catalogue/images/")
            continue
        items.append(
            Item(
                id=entry["id"],
                name=entry["name"],
                type=entry["type"],
                price=entry["price"],
                image_url=f"/api/images/{entry['image']}",
                url=entry.get("url"),
            )
        )
    return items


def image_path(item_id: str) -> Path | None:
    """Local path to an item's photo, for the vision AI judge."""
    for item in load_items():
        if item.id == item_id:
            return IMAGES_DIR / Path(item.image_url).name
    return None
