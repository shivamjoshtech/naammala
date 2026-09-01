import { useEffect, useState } from "react";
import WritingCanvas from "./WritingCanvas.jsx";

export default function JaapPad({ user, settings }) {
  const [hasWritten, setHasWritten] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // forces a fresh canvas after each count
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch(`/api/counts/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTodayCount(data.today_count || 0);
        setTotalCount(data.total_count || 0);
      });
  }, [user.id]);

  const handleCount = async () => {
    if (!hasWritten || isCounting) return; // guards against double-tap double-counting

    setIsCounting(true);
    try {
      const res = await fetch("/api/counts/increment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();

      if (res.ok) {
        setTodayCount(data.today_count);
        setTotalCount(data.total_count);
        setFeedback("🙏");
        setTimeout(() => setFeedback(""), 700);
      } else {
        setFeedback(data.error || "Could not save count");
      }
    } catch {
      setFeedback("Connection error");
    } finally {
      // Fresh blank canvas for the next naam, whether it succeeded or failed
      setHasWritten(false);
      setCanvasKey((k) => k + 1);
      setIsCounting(false);
    }
  };

  if (!settings) {
    return (
      <p style={{ color: "var(--ink-soft)", textAlign: "center" }}>
        Please choose your name in ⚙️ Settings first.
      </p>
    );
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.naamHeading}>{settings.typed_naam}</h2>

      <div style={styles.countRow}>
        <div style={styles.countBox}>
          <span style={styles.countNumber}>{todayCount}</span>
          <span style={styles.countLabel}>Today</span>
        </div>
        <div style={styles.countBox}>
          <span style={styles.countNumber}>{totalCount}</span>
          <span style={styles.countLabel}>Total</span>
        </div>
      </div>

      <WritingCanvas
        key={canvasKey}
        height={320}
        placeholder={`touch here to write "${settings.typed_naam}"`}
        onChange={(dataUrl) => setHasWritten(!!dataUrl)}
      />

      <button
        style={{
          ...styles.tapButton,
          ...(hasWritten ? {} : styles.tapButtonDisabled),
        }}
        onClick={handleCount}
        disabled={!hasWritten || isCounting}
      >
        {feedback || "Count"}
      </button>

      <p style={styles.hint}>Write the name, then tap the button above to count it</p>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "0 0.5rem",
  },
  naamHeading: {
    textAlign: "center",
    fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
    marginBottom: "1rem",
  },
  countRow: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  countBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "0.75rem 1.5rem",
    minWidth: "90px",
  },
  countNumber: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "var(--accent)",
  },
  countLabel: {
    fontSize: "0.8rem",
    color: "var(--ink-soft)",
  },
  tapButton: {
    width: "100%",
    marginTop: "1rem",
    padding: "1rem",
    fontSize: "1.1rem",
    border: "none",
    borderRadius: "10px",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
  },
  tapButtonDisabled: {
    background: "var(--border)",
    color: "var(--ink-soft)",
    cursor: "not-allowed",
  },
  hint: {
    textAlign: "center",
    fontSize: "0.85rem",
    color: "var(--ink-soft)",
    marginTop: "0.75rem",
  },
};