// NaamMala — User routes
// Handles: register/login by username+password, list usernames (for switching)
// One username = one account. Password required so switching between
// accounts on a shared device requires proving ownership.

import express from "express";
import bcrypt from "bcryptjs";
import { sql } from "../db/database.js";

const router = express.Router();

const USERNAME_MAX_LENGTH = 40;
const PASSWORD_MIN_LENGTH = 4;
const PASSWORD_MAX_LENGTH = 100;
// Letters (any language), numbers, spaces, and basic punctuation only — blocks script/HTML injection attempts
const USERNAME_PATTERN = /^[\p{L}\p{N}\s.'-]+$/u;

function isValidUsername(name) {
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.trim().length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(name.trim())
  );
}

function isValidPassword(pw) {
  return (
    typeof pw === "string" &&
    pw.length >= PASSWORD_MIN_LENGTH &&
    pw.length <= PASSWORD_MAX_LENGTH
  );
}

// POST /api/users/login
// If the username doesn't exist yet, creates a new account with this password.
// If it exists, the password must match.
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username)) {
    return res.status(400).json({
      error: `Name can only contain letters/numbers/spaces, up to ${USERNAME_MAX_LENGTH} characters`,
    });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({
      error: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`,
    });
  }

  const cleanName = username.trim();

  try {
    const existing = await sql`SELECT * FROM users WHERE username = ${cleanName}`;
    let user = existing.rows[0];

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      const inserted = await sql`
        INSERT INTO users (username, password_hash)
        VALUES (${cleanName}, ${passwordHash})
        RETURNING id, username, created_at
      `;
      user = inserted.rows[0];
      return res.json({ user });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.json({ user: { id: user.id, username: user.username, created_at: user.created_at } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed, please try again" });
  }
});

// GET /api/users  → list all usernames (for the "switch user" screen) — never includes passwords
router.get("/", async (req, res) => {
  try {
    const result = await sql`
      SELECT id, username, created_at FROM users ORDER BY created_at ASC
    `;
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load users" });
  }
});

export default router;