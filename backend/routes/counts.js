// NaamMala — Jaap count routes
// Handles: increment today's count by 1 (one tap = one jaap), fetch today's + total + history

import express from "express";
import { sql } from "../db/database.js";

const router = express.Router();

function todayDateString() {
  // Local calendar date (YYYY-MM-DD), not UTC — so "today" matches the user's day
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

// POST /api/counts/increment  → adds 1 jaap for today, for this user
router.post("/increment", async (req, res) => {
  const { user_id } = req.body;

  if (!Number.isInteger(user_id)) {
    return res.status(400).json({ error: "user_id is invalid" });
  }

  try {
    const userExists = await sql`SELECT id FROM users WHERE id = ${user_id}`;
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = todayDateString();

    await sql`
      INSERT INTO jaap_counts (user_id, date, count)
      VALUES (${user_id}, ${today}, 1)
      ON CONFLICT (user_id, date) DO UPDATE SET count = jaap_counts.count + 1
    `;

    const todayRow = await sql`
      SELECT count FROM jaap_counts WHERE user_id = ${user_id} AND date = ${today}
    `;

    const totalRow = await sql`
      SELECT COALESCE(SUM(count), 0) AS total FROM jaap_counts WHERE user_id = ${user_id}
    `;

    res.json({
      today_count: todayRow.rows[0].count,
      total_count: Number(totalRow.rows[0].total),
      date: today,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save count" });
  }
});

// GET /api/counts/:userId  → today's count + total count for dashboard
router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "user id is invalid" });
  }

  try {
    const today = todayDateString();

    const todayRow = await sql`
      SELECT count FROM jaap_counts WHERE user_id = ${userId} AND date = ${today}
    `;

    const totalRow = await sql`
      SELECT COALESCE(SUM(count), 0) AS total FROM jaap_counts WHERE user_id = ${userId}
    `;

    res.json({
      today_count: todayRow.rows[0] ? todayRow.rows[0].count : 0,
      total_count: Number(totalRow.rows[0].total),
      date: today,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load count" });
  }
});

// GET /api/counts/:userId/history  → all daily counts, most recent first (for the dashboard table)
router.get("/:userId/history", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "user id is invalid" });
  }

  try {
    const result = await sql`
      SELECT date, count FROM jaap_counts WHERE user_id = ${userId} ORDER BY date DESC
    `;
    res.json({ history: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load history" });
  }
});

export default router;