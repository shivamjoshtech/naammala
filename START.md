# Starting NaamMala Locally — Quick Reference

(For full first-time setup with explanations, see `README.md`. This is the
short version once everything is already installed.)

## Every time you want to run the app:

**Terminal 1 — start the backend:**
```
cd backend
node server.js
```
Wait for: `🪔 NaamMala backend running on http://localhost:4000`

**Terminal 2 — start the frontend:**
```
cd frontend
npm run dev
```
Wait for the `Local: http://localhost:5173/` link.

**Open the app:**
Go to http://localhost:5173 in your browser.

**To stop:**
Click into each terminal and press `Ctrl+C`.

---

## One-time setup (only needed the first time, or on a new computer)

```
cd backend
npm install
```
Create `backend/.env` with:
```
POSTGRES_URL=your_neon_connection_string
GROQ_API_KEY=
```

```
cd frontend
npm install
```

Then follow the "Every time" steps above.

---

## Going live?
See `DEPLOY.md` for the full Vercel deployment steps.
