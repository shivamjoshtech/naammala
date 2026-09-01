// NaamMala — Groq AI quote route
// Handles: generate a short, real-time quote/line related to the user's chosen
// naam, religion, and language, drawn from their character's stories.

import express from "express";
import { sql } from "../db/database.js";

const router = express.Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const FALLBACK_QUOTE =
  "Devotion grows with every name you take. May today's jaap bring you peace. 🙏";

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
- Keep it respectful, warm, and universally appropriate.`;
}

// GET /api/quote/:userId  → fetch one fresh AI-generated line for the dashboard
router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "user id is invalid" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.json({ quote: FALLBACK_QUOTE, source: "fallback" });
  }

  try {
    const result = await sql`SELECT * FROM settings WHERE user_id = ${userId}`;
    const settings = result.rows[0];
    if (!settings) {
      return res.status(404).json({ error: "Please set your name in Settings first" });
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
        temperature: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!groqRes.ok) {
      console.error("Groq API error:", groqRes.status, await groqRes.text());
      return res.json({ quote: FALLBACK_QUOTE, source: "fallback" });
    }

    const data = await groqRes.json();
    const quote = data?.choices?.[0]?.message?.content?.trim();

    if (!quote) {
      return res.json({ quote: FALLBACK_QUOTE, source: "fallback" });
    }

    res.json({ quote, source: "groq" });
  } catch (err) {
    console.error(err);
    res.json({ quote: FALLBACK_QUOTE, source: "fallback" });
  }
});

export default router;