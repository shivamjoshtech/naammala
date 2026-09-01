# NaamMala — Naam Jaap Counter

NaamMala is a simple, calming web app for counting your daily naam-jaap
(chanting). Write your chosen name by hand on a touch pad, track your daily
and total count, get an AI-generated reflection each day, and download a
daily PDF report — all in a clean, light theme that works on any device.

**Tech stack:** React (Vite) frontend, Node.js/Express backend, PostgreSQL
database, Groq AI for daily quotes, pdfkit for PDF reports. Deploys to Vercel.

---

## Table of Contents

1. [What you need before starting](#1-what-you-need-before-starting)
2. [Getting the project onto your computer](#2-getting-the-project-onto-your-computer)
3. [Opening the project in VS Code](#3-opening-the-project-in-vs-code)
4. [Setting up the database (Postgres)](#4-setting-up-the-database-postgres)
5. [Setting up the backend](#5-setting-up-the-backend)
6. [Setting up the frontend](#6-setting-up-the-frontend)
7. [Running the app locally](#7-running-the-app-locally)
8. [Optional: AI quotes with Groq](#8-optional-ai-quotes-with-groq)
9. [Project structure](#9-project-structure)
10. [Deploying to Vercel](#10-deploying-to-vercel)
11. [Common problems and fixes](#11-common-problems-and-fixes)

---

## 1. What you need before starting

Install these on your computer first (all free):

| Tool | What it's for | Download link |
|---|---|---|
| **Node.js** (v18 or higher) | Runs the backend and builds the frontend | https://nodejs.org |
| **VS Code** | Code editor | https://code.visualstudio.com |
| **Git** | To clone/push code from GitHub | https://git-scm.com |
| **A GitHub account** | To store and deploy your code | https://github.com |
| **A Vercel account** | To create a free Postgres database and deploy the app live | https://vercel.com |

To check Node.js and Git are installed, open any terminal and run:
```
node -v
git -v
```
Both should print a version number. If either says "command not found," install it from the links above.

---

## 2. Getting the project onto your computer

You can get the project in **either** of two ways — pick one.

### Option A — You have a ZIP file of the project

1. Find the downloaded `.zip` file (usually in your Downloads folder).
2. Right-click it → **Extract All** (Windows) or double-click it (Mac) to unzip it.
3. Move the extracted `naammala` folder wherever you want to keep your projects (e.g. `Documents/Projects/naammala`).

### Option B — Cloning from GitHub

If the project is already pushed to a GitHub repository:

1. Open the repository page on GitHub.
2. Click the green **Code** button → copy the HTTPS URL (looks like `https://github.com/your-username/naammala.git`).
3. Open a terminal (or VS Code's terminal) and run:
   ```
   cd Documents
   git clone https://github.com/your-username/naammala.git
   ```
4. This creates a `naammala` folder with the full project inside.

---

## 3. Opening the project in VS Code

1. Open VS Code.
2. Go to **File → Open Folder**.
3. Select the `naammala` folder (the one containing `backend`, `frontend`, `README.md`, etc.).
4. The whole project will appear in the sidebar on the left.

---

## 4. Setting up the database (Postgres)

This app needs a PostgreSQL database to store users, settings, and jaap counts. The easiest free option is **Neon** through Vercel.

1. Go to https://vercel.com and sign in (use "Continue with GitHub" for the easiest setup).
2. In your Vercel dashboard, click the **Storage** tab.
3. Click **Create Database** (or the Marketplace database providers list) → choose **Neon** (Serverless Postgres).
4. Give it a name (e.g. `naammala-db`), pick a region close to you, and create it.
5. Once created, open the Neon project (click on it, or go to https://console.neon.tech and sign in with the same account).
6. On the Neon project dashboard, click **Connect** near the top.
7. A connection string will appear — it looks like:
   ```
   postgresql://username:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require
   ```
8. Copy this entire string. You'll need it in the next step.

Keep this connection string private — treat it like a password.

---

## 5. Setting up the backend

1. In VS Code, open a terminal: **Terminal → New Terminal**.
2. Move into the backend folder and install its packages:
   ```
   cd backend
   npm install
   ```
3. Create a new file inside the `backend` folder named exactly **`.env`** (no other text before or after the dot).
   - In VS Code: right-click the `backend` folder in the sidebar → **New File** → type `.env` → Enter.
4. Open `.env` and add these two lines:
   ```
   POSTGRES_URL=paste_your_connection_string_here
   GROQ_API_KEY=
   ```
   (Leave `GROQ_API_KEY` empty for now — see [section 8](#8-optional-ai-quotes-with-groq) if you want AI quotes.)
5. Save the file.

**Never commit or upload your `.env` file anywhere.** It contains secrets. The project's `.gitignore` already prevents it from being pushed to GitHub by accident.

---

## 6. Setting up the frontend

1. Open a **second, separate terminal** in VS Code (click the `+` icon next to the terminal tabs) — keep the first one free for the backend.
2. Move into the frontend folder and install its packages:
   ```
   cd frontend
   npm install
   ```

That's it for setup — no `.env` needed on the frontend; it talks to the backend automatically.

---

## 7. Running the app locally

You need **both** the backend and frontend running at the same time, in their own terminals.

**Terminal 1 — Backend:**
```
cd backend
node server.js
```
You should see:
```
🪔 NaamMala backend running on http://localhost:4000
```
Leave this terminal open and running.

**Terminal 2 — Frontend:**
```
cd frontend
npm run dev
```
You'll see a link like:
```
Local:   http://localhost:5173/
```

**Open the app:** Ctrl+Click (or Cmd+Click on Mac) the `http://localhost:5173/` link, or paste it into your browser.

You should see the NaamMala login screen. Create an account (any name + password), go to Settings to choose the name you want to chant, then use the Writing Pad to start counting.

To stop either server, click into its terminal and press `Ctrl+C`.

---

## 8. Optional: AI quotes with Groq

The Dashboard shows a short daily reflection powered by Groq's AI. Without a key, it shows a calm fallback message instead — the app works fully either way.

To enable it:
1. Go to https://console.groq.com and sign up (free).
2. Create an API key.
3. Open `backend/.env` and set:
   ```
   GROQ_API_KEY=your_key_here
   ```
4. Restart the backend (`Ctrl+C`, then `node server.js` again).

---

## 9. Project structure

```
naammala/
├── README.md
├── DEPLOY.md
├── vercel.json
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example        (copy this to .env and fill in your own values)
│   ├── server.js            Express app entry point
│   ├── api/
│   │   └── index.js         Vercel serverless entry point
│   ├── db/
│   │   └── database.js      Postgres connection + table setup
│   ├── fonts/                Fonts used for PDF generation (Devanagari + Latin)
│   └── routes/
│       ├── users.js          Login / register / list users
│       ├── settings.js       Save / fetch chosen naam, language, religion
│       ├── counts.js         Increment and fetch jaap counts
│       ├── quote.js          Groq AI daily quote
│       └── pdf.js            Daily PDF report generation
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── index.css
        ├── main.jsx
        ├── App.jsx
        └── components/
            ├── Login.jsx
            ├── SwitchUser.jsx
            ├── WritingCanvas.jsx
            ├── Settings.jsx
            ├── JaapPad.jsx
            ├── Dashboard.jsx
            └── ErrorBoundary.jsx
```

---

## 10. Deploying to Vercel

Once the app works locally, you can put it live on the internet for free.

1. **Push your code to GitHub** (if you haven't already):
   ```
   cd naammala
   git init
   git add .
   git commit -m "NaamMala first version"
   git branch -M main
   git remote add origin https://github.com/your-username/naammala.git
   git push -u origin main
   ```
   Your `.env` file will **not** be pushed — `.gitignore` blocks it automatically.

2. Go to https://vercel.com/dashboard → **Add New → Project** → select your `naammala` GitHub repository → **Import**.

3. On the import screen, open **Environment Variables** and add:
   - `POSTGRES_URL` → your Neon connection string
   - `GROQ_API_KEY` → your Groq key (optional)

   These are typed directly into Vercel's dashboard — never stored in a file in your repo.

4. Click **Deploy**. After a minute or two, you'll get a live URL like `naammala.vercel.app`.

5. Open that URL and test the full flow: create an account, set your name in Settings, count some jaap, check the Dashboard, and download a PDF.

Full details are also in `DEPLOY.md`.

---

## 11. Common problems and fixes

**`ECONNREFUSED` / `connect ECONNREFUSED 127.0.0.1:5432`**
Your backend can't reach a database. This means `POSTGRES_URL` is missing or wrong in `backend/.env`. Double-check you copied the full Neon connection string correctly, with no extra spaces or missing characters.

**`{"error":"Route nahi mila"}` / `{"error":"Route not found"}` at `http://localhost:4000`**
This is normal — the backend only responds to `/api/...` paths, not the root `/`. Try `http://localhost:4000/api/health` instead to confirm the backend is running.

**Frontend loads but nothing works / network errors in browser console**
Make sure the backend terminal is still running (`node server.js`). The frontend depends on it.

**`npm install` fails**
Make sure Node.js is installed (`node -v` in terminal). If it's very old (below v18), update it from https://nodejs.org.

**`.env` file doesn't seem to save correctly on Windows**
Windows Explorer sometimes renames `.env` to `.env.txt`. Create and edit it directly inside VS Code instead of File Explorer, or enable "show file extensions" in Windows settings to check.

**Changes to code don't show up in the browser**
For the frontend, Vite auto-reloads — just save the file. For the backend, stop the server (`Ctrl+C`) and run `node server.js` again after any code change.

**Still stuck?**
Copy the exact error message you're seeing and share it — most issues are quick to fix once the exact error is visible.
