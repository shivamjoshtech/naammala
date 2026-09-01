// NaamMala — Backend Entry Point
// Runs standalone locally (node server.js) AND as a Vercel serverless function
// (via api/index.js, which imports the exported `app` below).

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { sql, ensureTables } from "./db/database.js";
import usersRouter from "./routes/users.js";
import settingsRouter from "./routes/settings.js";
import countsRouter from "./routes/counts.js";
import quoteRouter from "./routes/quote.js";
import pdfRouter from "./routes/pdf.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Allow the frontend origin only for cross-origin dev. On Vercel, frontend and
// backend share one domain, so this restriction simply has no effect there.
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "5mb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
app.use(generalLimiter);

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
});
app.use("/api/users/login", loginLimiter);

const quoteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many quote requests, please try again later" },
});
app.use("/api/quote", quoteLimiter);

// Ensure tables exist before handling any request — runs once per cold start,
// then the resolved promise is reused for every warm invocation.
const tablesReady = ensureTables().catch((err) => {
  console.error("Table setup failed:", err);
});
app.use(async (req, res, next) => {
  await tablesReady;
  next();
});

app.use("/api/users", usersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/counts", countsRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/pdf", pdfRouter);

app.get("/api/health", async (req, res) => {
  try {
    const row = await sql`SELECT COUNT(*) AS user_count FROM users`;
    res.json({
      status: "NaamMala backend is running",
      users_in_db: Number(row.rows[0].user_count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not connect to the database" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// Only listen on a port for local development — on Vercel, the platform
// invokes the exported app directly per-request, so app.listen never runs there.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🪔 NaamMala backend running on http://localhost:${PORT}`);
  });
}

export default app;