import { useState } from "react";

// Shows only the currently signed-in user — never a list of everyone's
// accounts (that would leak who else uses this app). To switch, the person
// must know the target account's own username and password, exactly like
// signing in fresh — this panel just saves them a trip through the full
// login screen.
export default function SwitchUser({ currentUser, onSelectUser, onLogout, onClose }) {
  const [switching, setSwitching] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value.replace(/\s/g, ""));
  };

  const handleSwitch = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both name and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (data.user) {
        onSelectUser(data.user);
      } else {
        setError(data.error || "Could not switch account");
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
        <h2 style={styles.heading}>Account</h2>

        {!switching ? (
          <>
            <p style={styles.signedInAs}>
              Signed in as <strong>{currentUser.username}</strong>
            </p>

            <button style={styles.actionButton} onClick={() => setSwitching(true)}>
              Switch to Another Account
            </button>
            <button style={styles.logoutButton} onClick={onLogout}>
              Log Out
            </button>
            <button style={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </>
        ) : (
          <form onSubmit={handleSwitch}>
            <p style={styles.hint}>
              Enter an existing account's name and password, or a new name and
              password to create one.
            </p>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Name (no spaces)"
              style={styles.input}
              autoFocus
              autoComplete="username"
            />
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={styles.passwordInput}
                autoComplete="current-password"
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
            <button type="submit" style={styles.actionButton} disabled={loading}>
              {loading ? "Please wait..." : "Continue"}
            </button>
            <button
              type="button"
              style={styles.closeButton}
              onClick={() => {
                setSwitching(false);
                setError("");
                setUsername("");
                setPassword("");
              }}
            >
              Back
            </button>
          </form>
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
  signedInAs: {
    marginTop: 0,
    marginBottom: "1.5rem",
    color: "var(--ink-soft)",
  },
  hint: {
    marginTop: 0,
    marginBottom: "1rem",
    fontSize: "0.85rem",
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
  actionButton: {
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
  logoutButton: {
    width: "100%",
    padding: "0.8rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "transparent",
    color: "#B23A3A",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  error: {
    color: "#B23A3A",
    fontSize: "0.85rem",
    marginBottom: "0.75rem",
    fontWeight: "bold",
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