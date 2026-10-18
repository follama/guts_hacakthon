# FitSketch

A swipe-based clothes shopping app that only lets you buy what you can remember.

One-page layout with one card at a time. A card has a photo of the item, its name and its price. At the top of the page is a basket button; the basket is a list of everything that passed the draw check, each name linking to the shop page where you can buy it.

1. **Swipe**: right sends an item to a hidden pending queue, left discards it.
2. **Draw**: after 3 swipes, swiping freezes and you get 60s to sketch a pending item from memory. The page says "3 swipes ago you liked a jacket. Draw it to keep it." and gives 6 colours and a Clear button to draw with.
3. **Judge**: AI compares the drawing against the actual photo and confirms the item drawn is correct. It must take into account that the sketch was drawn from memory in 60 seconds, and be generous about roughness and skill. If the test passes the item is saved; if it fails the item vanishes.

Two actions only: swipe and draw.

## Status

Playable end to end, with real judging by Gemini.

You need a Gemini API key. It is free and needs no card: go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with a Google account and click **Create API key**. Then put it in `backend/.env`:

```
GEMINI_API_KEY=...
```

Restart the backend after adding it. Without a key the game still runs, but every drawing comes back "Judge unavailable, so you keep it" and nothing is ever rejected.

Free-tier limits are generous enough for this: one drawing round is one request, and a round takes 60 seconds, so you cannot realistically hit the per-minute cap while playing.

The judge is `backend/app/scoring.py`. It sends the product photo and the sketch to `gemini-2.5-flash`, which returns a 0 to 100 score and a one-line reason; 45 or more passes. The brief tells it the drawing was done from memory in 60 seconds with six colours and no eraser, and to reward the right garment, the right colour and distinctive features while ignoring drawing skill. Tune the bands in `SYSTEM` if it judges too hard or too softly; every score and reason is printed to the backend console. Set `GEMINI_MODEL` in `.env` to use a different model.

If the judge cannot run, for any reason, the player keeps the item. A flaky connection should never cost someone a card mid-demo.

## Adding clothing items

Items live in the backend so the judge can read the original photo.

1. Put the photos in `backend/catalogue/images/`. JPEG, PNG, WebP and AVIF all work, so a photo saved straight off a shop site is fine. Portrait, roughly 3:4, looks best; the card crops to that shape. The browser shows the original file, while the judge gets a JPEG copy shrunk to 800px, so big photos cost nothing at judging time.
2. Describe each one in `backend/catalogue/items.json`:

```json
[
  {
    "id": "item-01",
    "name": "Red Puffer Jacket",
    "type": "jacket",
    "price": 89.99,
    "image": "item-01.jpg",
    "url": "https://shop.example.com/red-puffer-jacket"
  }
]
```

| Field   | Shown where                                                                      |
| ------- | -------------------------------------------------------------------------------- |
| `id`    | Nowhere. Must be unique.                                                           |
| `name`  | On the card, and in the basket as the link text.                                   |
| `type`  | In the draw prompt: "you liked a **jacket**". Keep it to one lowercase word.         |
| `price` | On the card and in the basket total. A number, no `£`.                             |
| `image` | Filename inside `backend/catalogue/images/`.                                        |
| `url`   | Where the basket name links to. Optional; without it the name is plain text.        |
| `gender` | Setup filter: `"male"`, `"female"` or `"unisex"`. Optional.                        |
| `styles` | Setup filter: any of `"casual"`, `"sportswear"`, `"party"`, `"pyjamas"`, e.g. `["casual", "party"]`. Optional. |

After the welcome page, players swipe through setup cards: male (left) or female (right), then like or skip each style. The deck then shows only matching items. Items without a tag show for everyone, and a choice that matches nothing is ignored rather than leaving an empty deck, so picking "male" with an all-women's catalogue still shows every item.

`items.json` is re-read on every request, so you can add items while the server is running: just reload the page. An item whose image file is missing is skipped and logged, so a typo costs you one card rather than the whole deck.

The four items in the repo are placeholders. Replace the images and edit the text.

## Structure

```
backend/
  catalogue/items.json   The clothing items
  catalogue/images/      Their photos
  app/main.py            FastAPI app, CORS, routes
  app/catalogue.py       Loads items.json, skips missing photos
  app/models.py          Request/response schemas
  app/scoring.py         AI judging (stubbed)
frontend/
  src/App.jsx            Game state machine
  src/lib/api.js         fetch wrappers for the API
  src/lib/gameRules.js   Swipes before a draw, draw time, colours
  src/components/        SwipeDeck, DrawCanvas, JudgeResult, Basket
```

## Run locally

Backend (port 8000):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

On Windows, if `python` opens the Microsoft Store instead of running, Python isn't on your PATH. Use the full path to your interpreter (for Anaconda, `C:\Users\<you>\anaconda3\python.exe -m venv .venv`), or install Python from python.org with "Add Python to PATH" ticked.

Frontend (port 5173, proxies `/api` to the backend):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and swipe. To try it on your phone on the same network, run `npm run dev -- --host` and open the Network URL it prints.

## Deploy

The frontend and backend deploy separately.

**Backend** (Render, Railway, Fly, etc.)

- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env: `CORS_ORIGINS=https://your-frontend-domain`
- The catalogue images ship with the repo, so they deploy with the backend.

**Frontend** (Vercel, Netlify, etc.)

- Root directory: `frontend`
- Build: `npm run build`, output dir `dist`
- Env: `VITE_API_URL=https://your-backend-domain` (no trailing slash; it's baked in at build time, so redeploy after changing it)

Check `https://your-backend-domain/api/health` returns `{"status":"ok"}` and `https://your-backend-domain/api/items` lists your items, then load the frontend.
