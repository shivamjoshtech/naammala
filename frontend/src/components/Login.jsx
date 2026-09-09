import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Strip spaces as the user types — usernames may not contain them
  const handleUsernameChange = (e) => {
    setUsername(e.target.value.replace(/\s/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!password) {
      setError("Please enter a password");
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
        onLogin(data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>NaamMala</h1>
      <p style={styles.subtitle}>Enter your name and password to begin</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Your name (no spaces)"
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
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Please wait..." : "Continue"}
        </button>
      </form>

      <p style={styles.hint}>
        First time here? Just pick any password — it creates your account.
        Returning? Use the same password to switch back in.
      </p>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "1.5rem",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "0.25rem",
  },
  subtitle: {
    color: "var(--ink-soft)",
    marginBottom: "2rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%",
    maxWidth: "320px",
  },
  input: {
    padding: "0.9rem 1rem",
    fontSize: "1rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "var(--surface)",
    color: "var(--ink)",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    padding: "0.9rem 2.75rem 0.9rem 1rem",
    fontSize: "1rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "var(--surface)",
    color: "var(--ink)",
    width: "100%",
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
  button: {
    padding: "0.9rem 1rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
  },
  hint: {
    marginTop: "1.25rem",
    maxWidth: "320px",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "var(--ink-soft)",
  },
  error: {
    color: "#B23A3A",
    marginTop: "1rem",
    fontWeight: "bold",
  },
};