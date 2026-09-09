import { useEffect, useState } from "react";

// Switching to another account requires that account's password —
// this prevents anyone on a shared device from opening someone else's jaap data.
export default function SwitchUser({ currentUser, onSelectUser, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  const startSwitch = (username) => {
    setSelectedUsername(username);
    setPassword("");
    setError("");
  };

  const confirmSwitch = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter the password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUsername, password }),
      });
      const data = await res.json();

      if (data.user) {
        onSelectUser(data.user);
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <h2 style={styles.heading}>Switch User</h2>

        {selectedUsername ? (
          <form onSubmit={confirmSwitch}>
            <p style={styles.switchingTo}>
              Switching to <strong>{selectedUsername}</strong>
            </p>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={styles.passwordInput}
                autoFocus
              />
              <button
                type="button"
                style={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.saveButton} disabled={loading}>
              {loading ? "Checking..." : "Switch"}
            </button>
            <button
              type="button"
              style={styles.closeButton}
              onClick={() => setSelectedUsername(null)}
            >
              Back
            </button>
          </form>
        ) : (
          <>
            <div style={styles.list}>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startSwitch(u.username)}
                  style={{
                    ...styles.userItem,
                    ...(currentUser?.id === u.id ? styles.userItemActive : {}),
                  }}
                >
                  {u.username}
                  {currentUser?.id === u.id && <span style={styles.tag}>Active</span>}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={styles.closeButton}>
              Close
            </button>
          </>
        )}
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
  },
  panel: {
    background: "var(--surface)",
    borderRadius: "12px",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "360px",
  },
  heading: {
    marginTop: 0,
    marginBottom: "1rem",
  },
  switchingTo: {
    marginTop: 0,
    marginBottom: "1rem",
    color: "var(--ink-soft)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    maxHeight: "300px",
    overflowY: "auto",
  },
  userItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "var(--bg)",
    color: "var(--ink)",
    cursor: "pointer",
    fontSize: "1rem",
    textAlign: "left",
  },
  userItemActive: {
    borderColor: "var(--accent)",
  },
  tag: {
    fontSize: "0.75rem",
    color: "var(--accent)",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    fontSize: "1rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "var(--bg)",
    color: "var(--ink)",
    marginBottom: "0.75rem",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  passwordInput: {
    width: "100%",
    padding: "0.7rem 2.75rem 0.7rem 0.9rem",
    fontSize: "1rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "var(--bg)",
    color: "var(--ink)",
  },
  eyeButton: {
    position: "absolute",
    right: "0.5rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    padding: "0.4rem",
    minHeight: "auto",
    lineHeight: 1,
  },
  saveButton: {
    width: "100%",
    padding: "0.8rem",
    border: "none",
    borderRadius: "8px",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  error: {
    color: "#B23A3A",
    fontSize: "0.85rem",
    marginBottom: "0.75rem",
  },
  closeButton: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "transparent",
    color: "var(--ink-soft)",
    cursor: "pointer",
  },
};