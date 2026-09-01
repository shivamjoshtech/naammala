# Deploying NaamMala to Vercel

## 1. Push this project to a GitHub repo
Vercel deploys from a git repo (GitHub/GitLab/Bitbucket). Push the whole
`naammala/` folder (with `vercel.json` at the root) to a new repo.

## 2. Create a Vercel Postgres database
1. Go to your Vercel dashboard → **Storage** tab → **Create Database** → **Postgres**.
2. Once created, go to its **.env.local** / **Quickstart** tab and copy the
   `POSTGRES_URL` value.

## 3. Import the project into Vercel
1. Vercel dashboard → **Add New → Project** → import your GitHub repo.
2. Vercel will detect `vercel.json` and build both the frontend (static) and
   backend (serverless function) automatically — no extra config needed.
3. Under **Settings → Environment Variables**, add:
   - `POSTGRES_URL` — from step 2 (or just connect the Postgres database to
     the project from the Storage tab, and Vercel injects it automatically)
   - `GROQ_API_KEY` — your Groq API key (optional — app works without it,
     just shows a fallback quote)
   - `FRONTEND_URL` — not needed on Vercel itself (frontend + backend share
     one domain there), only used for local cross-origin dev

## 4. Deploy
Click **Deploy**. Vercel will:
- Build the React frontend as static files
- Deploy the Express backend as a serverless function at `/api/*`
- Serve both from the same domain

## 5. First request
The very first request after deploy will run `ensureTables()` automatically
— your database tables get created on that first call. No manual migration
step needed.

## Local development (unchanged)
```
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```
For local dev, either run a local Postgres and set `POSTGRES_URL` in
`backend/.env`, or point it at your Vercel Postgres database directly
(works the same way, just add `?sslmode=require` if not already present).
