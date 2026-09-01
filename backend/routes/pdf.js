// NaamMala — PDF report route
// Handles: generate a simple, light-theme PDF for one day —
// big heading with the chosen naam, and a grid of small boxes, one per jaap counted.

import express from "express";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "../db/database.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEVANAGARI_LANGUAGES = new Set(["Hindi", "Sanskrit", "Marathi"]);
const FONT_DEVANAGARI = path.join(__dirname, "../fonts/NotoSansDevanagari-Regular.ttf");
const FONT_LATIN = path.join(__dirname, "../fonts/NotoSans-Regular.ttf");

const MAX_BOXES_RENDERED = 2000;

function todayDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

function fontForLanguage(language) {
  return DEVANAGARI_LANGUAGES.has(language) ? FONT_DEVANAGARI : FONT_LATIN;
}

// GET /api/pdf/:userId?date=YYYY-MM-DD  → download a daily jaap report as PDF
router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "user id is invalid" });
  }

  const requestedDate = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "")
    ? req.query.date
    : todayDateString();

  try {
    const userResult = await sql`SELECT * FROM users WHERE id = ${userId}`;
    const settingsResult = await sql`SELECT * FROM settings WHERE user_id = ${userId}`;
    const user = userResult.rows[0];
    const settings = settingsResult.rows[0];

    if (!user || !settings) {
      return res.status(404).json({ error: "User or settings not found" });
    }

    const countResult = await sql`
      SELECT count FROM jaap_counts WHERE user_id = ${userId} AND date = ${requestedDate}
    `;
    const count = countResult.rows[0] ? countResult.rows[0].count : 0;

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="NaamMala-${requestedDate}.pdf"`
    );

    doc.pipe(res);

    const font = fontForLanguage(settings.language);
    doc.registerFont("naam-font", font);

    doc.font("naam-font").fontSize(54).fillColor("#2B2620");
    doc.text(settings.typed_naam, { align: "center" });

    doc.moveDown(0.5);
    doc.font(FONT_LATIN).fontSize(12).fillColor("#6B6255");
    const displayDate = new Date(requestedDate + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`${displayDate}  •  Total Jaap: ${count}`, { align: "center" });

    doc.moveDown(1.5);

    if (count === 0) {
      doc.font(FONT_LATIN).fontSize(12).fillColor("#6B6255");
      doc.text("No jaap counted on this day.", { align: "center" });
      doc.end();
      return;
    }

    const boxesToRender = Math.min(count, MAX_BOXES_RENDERED);
    const cols = 8;
    const margin = 40;
    const usableWidth = doc.page.width - margin * 2;
    const boxSize = usableWidth / cols;
    const boxPadding = 4;

    let x = margin;
    let y = doc.y;
    const pageBottom = doc.page.height - margin;

    doc.font("naam-font").fontSize(15).fillColor("#2B2620");

    for (let i = 0; i < boxesToRender; i++) {
      if (y + boxSize > pageBottom) {
        doc.addPage();
        x = margin;
        y = margin;
      }

      doc
        .lineWidth(0.75)
        .strokeColor("#E7DFCF")
        .rect(x, y, boxSize - boxPadding, boxSize - boxPadding)
        .stroke();

      doc.text(settings.typed_naam, x, y + boxSize / 2 - 8, {
        width: boxSize - boxPadding,
        align: "center",
      });

      x += boxSize;
      if ((i + 1) % cols === 0) {
        x = margin;
        y += boxSize;
      }
    }

    if (count > MAX_BOXES_RENDERED) {
      doc.moveDown(2);
      doc.font(FONT_LATIN).fontSize(10).fillColor("#6B6255");
      doc.text(
        `... and ${count - MAX_BOXES_RENDERED} more jaap (included in total count)`,
        { align: "center" }
      );
    }

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Could not generate PDF" });
    } else {
      res.end();
    }
  }
});

export default router;