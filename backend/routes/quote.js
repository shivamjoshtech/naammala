// NaamMala — Groq AI quote route
// Handles: generate a short, real-time quote/line related to the user's chosen
// naam, religion, and language, drawn from their character's stories.
//
// Without a GROQ_API_KEY, this falls back to a rotating set of calm, generic
// lines (personalized with the user's own chosen naam) so the app still
// works — but for genuinely varying, AI-written lines tailored to the god,
// religion, and language the user picked, a real GROQ_API_KEY is required.

import express from "express";
import { sql } from "../db/database.js";

const router = express.Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function fallbackQuotes(naam) {
  const name = naam || "your chosen name";
  return [
    `Devotion grows with every name you take. May today's jaap of ${name} bring you peace. 🙏`,
    `Each time you chant ${name}, a little more stillness enters your day. 🙏`,
    `${name} is with you in every breath you take today. 🙏`,
    `Let the sound of ${name} settle your mind, one jaap at a time. 🙏`,
    `Faith is built one name at a time — today, that name is ${name}. 🙏`,
  ];
}

function randomFallback(naam) {
  const quotes = fallbackQuotes(naam);
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function buildPrompt(settings) {
  const naam = settings.typed_naam;
  const religion = settings.religion || "unspecified";
  const language = settings.language;

  return `You are a gentle spiritual assistant inside a naam-jaap (chanting) app.
The user chants the name: "${naam}".
Their stated religion/tradition: "${religion}".
Their preferred language: "${language}".

Write exactly ONE short line (max 25 words) that is either:
- an inspiring quote related to this deity/name and tradition, or
- a brief reference to a moment from their traditional stories related to this name.

Rules:
- Reply in ${language} language/script only.
- No preamble, no quotation marks, no explanation — output only the single line.
- Make it feel fresh and different each time — vary the angle, wording, and which story or aspect you draw on.
- Keep it respectful, warm, and universally appropriate.`;
}

// GET /api/quote/:userId  → fetch one fresh AI-generated line for the dashboard
router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "user id is invalid" });
  }

  try {
    const result = await sql`SELECT * FROM settings WHERE user_id = ${userId}`;
    const settings = result.rows[0];
    if (!settings) {
      return res.status(404).json({ error: "Please set your name in Settings first" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.json({ quote: randomFallback(settings.typed_naam), source: "fallback" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: buildPrompt(settings) }],
        max_tokens: 80,
        temperature: 1.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!groqRes.ok) {
      console.error("Groq API error:", groqRes.status, await groqRes.text());
      return res.json({ quote: randomFallback(settings.typed_naam), source: "fallback" });
    }

    const data = await groqRes.json();
    const quote = data?.choices?.[0]?.message?.content?.trim();

    if (!quote) {
      return res.json({ quote: randomFallback(settings.typed_naam), source: "fallback" });
    }

    res.json({ quote, source: "groq" });
  } catch (err) {
    console.error(err);
    res.json({ quote: randomFallback(), source: "fallback" });
  }
});

export default router;