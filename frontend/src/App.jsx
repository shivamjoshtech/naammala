import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import SwitchUser from "./components/SwitchUser.jsx";
import Settings from "./components/Settings.jsx";
import JaapPad from "./components/JaapPad.jsx";
import Dashboard from "./components/Dashboard.jsx";

const SESSION_KEY = "naammala_active_user";

export default function App() {
  const [user, setUser] = useState(null);
  const [showSwitch, setShowSwitch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pad"); // "pad" | "dashboard"

  // Restore session on reload
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Whenever the active user changes, fetch their saved naam settings
  useEffect(() => {
    if (!user) {
      setSettings(null);
      return;
    }
    setSettingsLoading(true);
    fetch(`/api/settings/${user.id}`)
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setSettings(null))
      .finally(() => setSettingsLoading(false));
  }, [user]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
  };

  const handleSwitch = (selectedUser) => {
    handleLogin(selectedUser);
    setShowSwitch(false);
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={styles.header}>
        <h1 style={styles.title}>NaamMala</h1>
        <div style={styles.userBar}>
          <span style={styles.username}>{user.username}</span>
          <button
            style={styles.iconButton}
            onClick={() => setShowSettings(true)}
            title="Settings"
            aria-label="Open settings"
          >
            ⚙️
          </button>
          <button style={styles.linkButton} onClick={() => setShowSwitch(true)}>
            Switch User
          </button>
          <button style={styles.linkButton} onClick={handleLogout} aria-label="Log out">
            Logout
          </button>
        </div>
      </header>

      {settings && (
        <nav style={styles.tabBar} aria-label="Main navigation">
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "pad" ? styles.tabButtonActive : {}),
            }}
            onClick={() => setActiveTab("pad")}
            aria-current={activeTab === "pad" ? "page" : undefined}
          >
            Writing Pad
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "dashboard" ? styles.tabButtonActive : {}),
            }}
            onClick={() => setActiveTab("dashboard")}
            aria-current={activeTab === "dashboard" ? "page" : undefined}
          >
            Dashboard
          </button>
        </nav>
      )}

      <main style={styles.main}>
        {settingsLoading ? (
          <p style={{ color: "var(--ink-soft)" }}>Loading...</p>
        ) : settings ? (
          activeTab === "pad" ? (
            <JaapPad user={user} settings={settings} />
          ) : (
            <Dashboard user={user} settings={settings} />
          )
        ) : (
          <div style={styles.setupPrompt}>
            <button
              style={styles.bigSettingsButton}
              onClick={() => setShowSettings(true)}
              aria-label="Open settings to choose your name"
            >
              ⚙️
            </button>
            <p style={styles.setupText}>
              Tap the settings icon to choose the name you want to chant
            </p>
          </div>
        )}
      </main>

      {showSwitch && (
        <SwitchUser
          currentUser={user}
          onSelectUser={handleSwitch}
          onClose={() => setShowSwitch(false)}
        />
      )}

      {showSettings && (
        <Settings
          user={user}
          onClose={() => setShowSettings(false)}
          onSaved={(saved) => {
            setSettings(saved);
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem clamp(1rem, 4vw, 1.5rem)",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  title: {
    fontSize: "1.5rem",
    margin: 0,
  },
  main: {
    padding: "clamp(1.25rem, 5vw, 2rem)",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto",
  },
  tabBar: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem 0",
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
  },
  tabButton: {
    padding: "0.6rem 1.25rem",
    border: "none",
    borderBottom: "3px solid transparent",
    background: "none",
    color: "var(--ink-soft)",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  tabButtonActive: {
    color: "var(--accent)",
    borderBottomColor: "var(--accent)",
    fontWeight: "bold",
  },
  userBar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.85rem",
  },
  username: {
    fontWeight: "bold",
    wordBreak: "break-word",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: 0,
    minHeight: "auto",
  },
  iconButton: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    minHeight: "auto",
  },
  setupPrompt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    padding: "2rem 0",
  },
  bigSettingsButton: {
    fontSize: "4rem",
    background: "var(--surface)",
    border: "2px solid var(--border)",
    borderRadius: "50%",
    width: "120px",
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  setupText: {
    color: "var(--ink-soft)",
    maxWidth: "280px",
  },
};