import { useEffect, useState } from "react";

export default function Dashboard({ user, settings }) {
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(true);

  const fetchQuote = () => {
    setQuoteLoading(true);
    fetch(`/api/quote/${user.id}`)
      .then((res) => res.json())
      .then((data) => setQuote(data.quote || ""))
      .catch(() => setQuote(""))
      .finally(() => setQuoteLoading(false));
  };

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch(`/api/counts/${user.id}`).then((res) => res.json()),
      fetch(`/api/counts/${user.id}/history`).then((res) => res.json()),
    ]).then(([countsData, historyData]) => {
      if (!isMounted) return;
      setTodayCount(countsData.today_count || 0);
      setTotalCount(countsData.total_count || 0);
      setHistory(historyData.history || []);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownloadPdf = () => {
    window.open(`/api/pdf/${user.id}`, "_blank");
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Dashboard</h2>
      {settings && (
        <p style={styles.naamLine}>
          <strong>{settings.typed_naam}</strong> jaap record
        </p>
      )}

      <div style={styles.quoteCard}>
        {quoteLoading ? (
          <span style={styles.quoteText}>Loading quote...</span>
        ) : (
          <span style={styles.quoteText}>“{quote}”</span>
        )}
        <button style={styles.refreshButton} onClick={fetchQuote} disabled={quoteLoading}>
          🔄 New Quote
        </button>
      </div>

      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNumber}>{totalCount}</span>
          <span style={styles.summaryLabel}>Total So Far</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNumber}>{todayCount}</span>
          <span style={styles.summaryLabel}>Today's Count</span>
        </div>
      </div>

      <button style={styles.downloadButton} onClick={handleDownloadPdf}>
        📄 Download Today's PDF
      </button>

      <h3 style={styles.historyHeading}>Daily History</h3>

      {loading ? (
        <p style={{ color: "var(--ink-soft)" }}>Loading...</p>
      ) : history.length === 0 ? (
        <p style={{ color: "var(--ink-soft)" }}>
          No jaap counted yet. Start from the Writing Pad.
        </p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Count</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.date}>
                  <td style={styles.td}>{formatDate(row.date)}</td>
                  <td style={styles.td}>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "0 0.5rem",
  },
  heading: {
    textAlign: "center",
    marginBottom: "0.25rem",
  },
  naamLine: {
    textAlign: "center",
    color: "var(--ink-soft)",
    marginTop: 0,
    marginBottom: "1.5rem",
  },
  quoteCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "1.25rem",
    marginBottom: "2rem",
    textAlign: "center",
  },
  quoteText: {
    display: "block",
    fontStyle: "italic",
    color: "var(--ink)",
    marginBottom: "0.75rem",
    lineHeight: 1.5,
  },
  refreshButton: {
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "0.4rem 0.9rem",
    color: "var(--accent)",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  summaryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "1rem 1.75rem",
    minWidth: "120px",
  },
  summaryNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--accent)",
  },
  summaryLabel: {
    fontSize: "0.85rem",
    color: "var(--ink-soft)",
    marginTop: "0.25rem",
  },
  historyHeading: {
    fontSize: "1.1rem",
    marginBottom: "0.75rem",
  },
  downloadButton: {
    display: "block",
    width: "100%",
    maxWidth: "300px",
    margin: "0 auto 2rem",
    padding: "0.85rem",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    background: "var(--surface)",
    color: "var(--accent)",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  tableWrapper: {
    overflowX: "auto",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    background: "var(--surface)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "280px",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid var(--border)",
    color: "var(--ink-soft)",
    fontSize: "0.85rem",
    fontWeight: "normal",
  },
  td: {
    padding: "0.65rem 1rem",
    borderBottom: "1px solid var(--border)",
  },
};