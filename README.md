# NaamMala — Step 1: Project Setup

Naam-jaap counter web app. Stack: **React (Vite) + Node/Express + SQLite**

## Structure

```
naammala/
├── backend/
│   ├── server.js         → Express server + health check route
│   ├── db/database.js    → SQLite setup (users, settings, jaap_counts tables)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx        → placeholder page, checks backend connection
    │   ├── main.jsx
    │   └── index.css      → light theme base tokens
    ├── index.html
    └── package.json
```

## Database tables created (empty, ready for Step 2+)

- `users` — username-only accounts
- `settings` — each user's chosen naam (typed text + language + written sample)
- `jaap_counts` — daily count per user

## How to run

**Backend:**
```
cd backend
npm install
npm start
```
Runs on `http://localhost:4000`. Visit `/api/health` to confirm it's working.

**Frontend:**
```
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and talks to the backend automatically.

## What's next
- Step 2: Login / user switch / logout system
- Step 3: Settings screen (touch-write + typed naam, language choice)
- Step 4: Writing pad with tap-to-count
- Step 5: Counting logic (backend)
- Step 6: Dashboard
- Step 7: Groq AI integration
- Step 8: PDF generation
- Step 9: Testing & polish
