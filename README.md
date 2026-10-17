# FitSketch

A swipe-based clothes shopping app that only lets you buy what you can remember.
One-page layout with one card at a time. A card has a photo of thing, description and price.
At the top of the page we have a basket icon (basket is a list of all items that passed the draw check with links to buy them)
1. **Swipe**: right sends an item to a hidden pending queue, left discards it.
2. **Draw**: after 3 swipes, swiping freezes and you get 60s to sketch a pending item from memory. The page says: '3 swipes ago you liked a jacket, draw it to keep it' and gives 3 colours to draw with.
3. **Judge**: AI compares the drawing against actual photo and confirm the item drawn is correct. LLM must count that the sketch was drawn from memory in 60 seconds, and be generous about roughness and skill. If the test pass item is saved, if faild item vanishes 

## Status

This is a scaffold. Working so far:

- `GET /api/health` and a stubbed `POST /api/score` (random score + placeholder roast)
- A frontend that pings the backend on load and sends a canvas drawing to `/api/score`

Not built yet: clothing cards/swipe deck, pending queue, draw trigger wiring, colour tools, countdown, real vision AI scoring, end screen maths.

## Structure

```
backend/
  app/main.py        FastAPI app, CORS, routes
  app/models.py      Request/response schemas
  app/scoring.py     Vision AI judging (stubbed)
frontend/
  src/App.jsx                  Screen switching + backend check
  src/lib/api.js               fetch wrappers for the API
  src/lib/gameRules.js         Timings and pass threshold
  src/hooks/useDrawTrigger.js  Random swipe/timer trigger for drawing rounds
  src/components/              SwipeDeck (placeholder), DrawCanvas, JudgeResult, EndScreen
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

Frontend (port 5173, proxies `/api` to the backend):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The header should say `Backend: ok`. On the **draw** tab, scribble and submit to test the score round trip.

## Deploy

The frontend and backend deploy separately.

**Backend** (Render, Railway, Fly, etc.)
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env: `CORS_ORIGINS=https://your-frontend-domain`

**Frontend** (Vercel, Netlify, etc.)
- Root directory: `frontend`
- Build: `npm run build`, output dir `dist`
- Env: `VITE_API_URL=https://your-backend-domain` (no trailing slash; it's baked in at build time, so redeploy after changing it)

Check `https://your-backend-domain/api/health` returns `{"status":"ok"}`, then load the frontend and confirm the header says `Backend: ok`.
