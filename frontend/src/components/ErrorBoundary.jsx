import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Logged for debugging — never shown raw to the user
    console.error("NaamMala crashed:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrapper}>
          <h2 style={styles.heading}>Something went wrong 🙏</h2>
          <p style={styles.text}>
            Don't worry, your jaap count is safe. Please reload the page and try again.
          </p>
          <button style={styles.button} onClick={this.handleReload}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    textAlign: "center",
    background: "var(--bg)",
  },
  heading: {
    marginBottom: "0.5rem",
  },
  text: {
    color: "var(--ink-soft)",
    marginBottom: "1.5rem",
    maxWidth: "320px",
  },
  button: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
  },
};