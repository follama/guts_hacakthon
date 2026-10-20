# FitSketch

**Live demo: [fitsketch.netlify.app](https://fitsketch.netlify.app/)** (live until 07.11.2026)

A fashion app that tests whether you actually like something — or just swiped right by habit. You can only keep an item if you can draw it from memory.

---

## What it is

FitSketch combines a Tinder-style clothing swiper with a Pictionary-style memory challenge. Every few swipes, the game freezes and asks you to sketch an item you liked — from memory, in 60 seconds. An AI judge compares your drawing against the original photo. Draw it well enough and it goes in your basket. Fail and it's gone.

There's also a **FitSlash** mini-game accessible from your basket — a Fruit Ninja-style mode where clothing items fly up the screen and you slash them for points.

**Features**
- Swipe right to save an item to a pending queue, left to skip
- Personalised deck based on gender and style preferences set at the start
- 60-second timed drawing challenge with a continuous colour slider
- AI drawing judge powered by Gemini Vision — scores 0–100, passes at 45+
- Basket showing everything you earned, with swipe-left to remove and swipe-right to shop
- FitSlash mini-game: slash flying clothing emojis for a high score

---

## User flow

1. **Welcome** — landing screen, tap to start
2. **Setup** — swipe through two preference cards: gender and style
3. **Swipe** — swipe right to like, left to skip; swipe down on the header to view basket
4. **Draw** — every 3 swipes, sketch the item you liked from memory in 60 seconds
5. **Judge** — AI scores your drawing; pass = item added to basket, fail = item lost
6. **Basket** — view your earned items; swipe left on an item to remove it, swipe right to open the shop link; swipe up to play FitSlash
7. **FitSlash** — slash flying clothes for 30 seconds; swipe right on the end screen to replay, swipe down on the header to return to basket

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | FastAPI, Python 3.11+ |
| AI judge | Google Gemini Vision (`gemini-2.5-flash`) |
| Styling | Plain CSS with custom properties |
| Deployment | Railway (backend), Netlify (frontend) |

---

## How to run locally

**1. Backend** (runs on port 8000)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then add your GEMINI_API_KEY
uvicorn app.main:app --reload
```

Add your API key to backend/.env. We used a free Gemini API key (you can get it at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Without it the game runs but every drawing automatically passes.

**2. Frontend** (runs on port 5173, proxies `/api` to the backend)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.
To test on your computer or phone on the same network, run `npm run dev -- --host`.

