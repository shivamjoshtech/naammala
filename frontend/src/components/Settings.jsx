import { useEffect, useState } from "react";
import WritingCanvas from "./WritingCanvas.jsx";

const LANGUAGES = [
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
];

export default function Settings({ user, onClose, onSaved }) {
  const [typedNaam, setTypedNaam] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [religion, setReligion] = useState("");
  const [writtenSample, setWrittenSample] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/settings/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTypedNaam(data.settings.typed_naam || "");
          setLanguage(data.settings.language || "Hindi");
          setReligion(data.settings.religion || "");
        }
      });
  }, [user.id]);

  const handleSave = async () => {
    if (!typedNaam.trim()) {
      setStatus("Please type the name");
      return;
    }
    if (!writtenSample) {
      setStatus("Please also write the name with touch/pencil");
      return;
    }

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        typed_naam: typedNaam.trim(),
        language,
        religion: religion.trim(),
        written_sample: writtenSample,
      }),
    });
    const data = await res.json();

    if (data.settings) {
      setStatus("Saved!");
      onSaved(data.settings);
    } else {
      setStatus(data.error || "Could not save");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <h2 style={styles.heading}>Settings — Choose Your Name</h2>

        <label style={styles.label}>Write the name with your pencil</label>
        <WritingCanvas
          height={160}
          placeholder="touch here to write the name"
          onChange={setWrittenSample}
        />

        <label style={styles.label}>Type the same name (in your own language)</label>
        <input
          type="text"
          value={typedNaam}
          onChange={(e) => setTypedNaam(e.target.value)}
          placeholder="Write the name of your God"
          style={styles.input}
        />

        <label style={styles.label}>Choose language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={styles.input}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <label style={styles.label}>Religion (optional)</label>
        <input
          type="text"
          value={religion}
          onChange={(e) => setReligion(e.target.value)}
          placeholder="e.g. Hindu, Sikh, Jain, etc."
          style={styles.input}
        />

        {status && <p style={styles.status}>{status}</p>}

        <div style={styles.buttonRow}>
          <button style={styles.saveButton} onClick={handleSave}>
            Save
          </button>
          <button style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(43, 38, 32, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    overflowY: "auto",
  },
  panel: {
    background: "var(--surface)",
    borderRadius: "12px",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "420px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  heading: {
    marginTop: 0,
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginTop: "1rem",
    marginBottom: "0.4rem",
    fontSize: "0.9rem",
    color: "var(--ink-soft)",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    fontSize: "1rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "var(--bg)",
    color: "var(--ink)",
  },
  status: {
    marginTop: "1rem",
    color: "var(--accent)",
  },
  buttonRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
  saveButton: {
    flex: 1,
    padding: "0.8rem",
    border: "none",
    borderRadius: "8px",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
  },
  closeButton: {
    flex: 1,
    padding: "0.8rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "transparent",
    color: "var(--ink-soft)",
    cursor: "pointer",
    fontSize: "1rem",
  },
};