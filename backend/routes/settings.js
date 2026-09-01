// NaamMala — Settings routes
// Handles: save/update the user's chosen naam (typed + written + language + religion), fetch current settings

import express from "express";
import { sql } from "../db/database.js";

const router = express.Router();

const TYPED_NAAM_MAX_LENGTH = 100;
const RELIGION_MAX_LENGTH = 40;
const ALLOWED_LANGUAGES = new Set([
  "Hindi",
  "English",
  "Sanskrit",
  "Punjabi",
  "Gujarati",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Odia",
  "Urdu",
  "Other",
]);
// Blocks angle brackets so no HTML/script can be stored, while allowing any script (Devanagari, Tamil, etc.), "/" for Ram/राम style entries, and common punctuation
const SAFE_TEXT_PATTERN = /^[^<>]+$/;

function isValidTypedNaam(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= TYPED_NAAM_MAX_LENGTH &&
    SAFE_TEXT_PATTERN.test(value.trim())
  );
}

function isValidReligion(value) {
  if (!value) return true; // optional field
  return (
    typeof value === "string" &&
    value.trim().length <= RELIGION_MAX_LENGTH &&
    SAFE_TEXT_PATTERN.test(value.trim())
  );
}

function isValidWrittenSample(value) {
  // Must be a PNG data URL produced by our own canvas — rejects arbitrary payloads
  return typeof value === "string" && value.startsWith("data:image/png;base64,");
}

// POST /api/settings  → create or update settings for a user (upsert via ON CONFLICT)
router.post("/", async (req, res) => {
  const { user_id, typed_naam, language, religion, written_sample } = req.body;

  if (!Number.isInteger(user_id)) {
    return res.status(400).json({ error: "user_id is invalid" });
  }
  if (!isValidTypedNaam(typed_naam)) {
    return res.status(400).json({ error: `Name must be 1-${TYPED_NAAM_MAX_LENGTH} characters, without < >` });
  }
  if (!ALLOWED_LANGUAGES.has(language)) {
    return res.status(400).json({ error: "Please choose a language from the list" });
  }
  if (!isValidReligion(religion)) {
    return res.status(400).json({ error: `Religion can be at most ${RELIGION_MAX_LENGTH} characters` });
  }
  if (written_sample && !isValidWrittenSample(written_sample)) {
    return res.status(400).json({ error: "Written sample is not in a valid format" });
  }

  try {
    const userExists = await sql`SELECT id FROM users WHERE id = ${user_id}`;
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const cleanNaam = typed_naam.trim();
    const cleanReligion = religion?.trim() || null;
    const sample = written_sample || null;

    const result = await sql`
      INSERT INTO settings (user_id, typed_naam, language, religion, written_sample)
      VALUES (${user_id}, ${cleanNaam}, ${language}, ${cleanReligion}, ${sample})
      ON CONFLICT (user_id) DO UPDATE SET
        typed_naam = EXCLUDED.typed_naam,
        language = EXCLUDED.language,
        religion = EXCLUDED.religion,
        written_sample = EXCLUDED.written_sample,
        updated_at = NOW()
      RETURNING *
    `;

    res.json({ settings: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save settings" });
  }
});

// GET /api/settings/:userId  → fetch a user's current settings
router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "user id is invalid" });
  }

  try {
    const result = await sql`SELECT * FROM settings WHERE user_id = ${userId}`;
    res.json({ settings: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load settings" });
  }
});

export default router;