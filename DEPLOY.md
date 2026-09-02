# Deploying NaamMala to Vercel

Vercel now auto-detects this project as **two services** — a Vite frontend
and an Express backend — from the `vercel.json` at the project root. This
guide matches that newer multi-service Vercel flow.

---

## 1. Push your code to GitHub

If you haven't already:
```
cd naammala
git init
git add .
git commit -m "NaamMala first version"
git branch -M main
git remote add origin https://github.com/your-username/naammala.git
git push -u origin main
```
Your `.env` file is never pushed — `.gitignore` blocks it automatically.

## 2. Create a Postgres database (Neon, via Vercel)

1. Go to https://vercel.com/dashboard → sign in with GitHub.
2. Click the **Storage** tab → find **Neon** (Serverless Postgres) in the marketplace list → click it.
3. Give the database a name (e.g. `naammala-db`), pick a region, and create it.
4. Open the Neon project (or go to https://console.neon.tech) → click **Connect** → copy the full connection string. It looks like:
   ```
   postgresql://username:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require
   ```
   Keep this safe — you'll paste it into Vercel in step 4, never into a file in your repo.

## 3. Import the project into Vercel

1. Vercel dashboard → **Add New → Project** → select your `naammala` GitHub repository → **Import**.
2. Vercel reads `vercel.json` and automatically shows two services:
   - **frontend** (Vite Web Service)
   - **backend** (Express Web Service)
3. Leave the project name as-is (or rename it) and continue.

## 4. Add environment variables

Still on the import screen, find the **Environment Variables** section and add these for the **backend** service (make sure "Production and Preview" is selected):

| Key | Value |
|---|---|
| `POSTGRES_URL` | the Neon connection string from step 2 |
| `GROQ_API_KEY` | your Groq key (optional — leave blank if you don't have one yet) |

These are typed directly into Vercel's dashboard — they never touch your GitHub repo.

## 5. Deploy

Click **Deploy**. Vercel will build and start both services:
- `frontend` — built as a static Vite app
- `backend` — run as a persistent Express server, reachable at `/api/*`

The `rewrites` in `vercel.json` route any `/api/...` request to the backend service, and everything else to the frontend — both served from the same domain.

## 6. First request

The very first request to the backend runs `ensureTables()` automatically — your database tables are created on that first call. No manual migration step needed.

## 7. Test your live app

Open the URL Vercel gives you (e.g. `naammala.vercel.app`) and test the full flow:
1. Create an account (name + password)
2. Set your chosen name in Settings
3. Count some jaap on the Writing Pad
4. Check the Dashboard and today's AI quote
5. Download the daily PDF

If anything doesn't work, check **Vercel Dashboard → your project → backend service → Logs** for the exact error.

---

## Local development (unchanged)

```
# Terminal 1
cd backend
npm install
node server.js

# Terminal 2
cd frontend
npm install
npm run dev
```
For local dev, set `POSTGRES_URL` in `backend/.env` — you can point it at the same Neon database you created above, or a local Postgres instance.
