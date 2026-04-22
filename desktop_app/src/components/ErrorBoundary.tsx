import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** Optional label shown in the error card header */
  label?: string;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

/**
 * Catches any JS errors in child components and renders a full stack-trace
 * card instead of a white screen. Only active in development.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#0f0f1a",
          color: "#e2e8f0",
          fontFamily: "monospace",
          fontSize: 13,
          overflowY: "auto",
          padding: "24px 32px",
        }}
      >
        <div style={{ color: "#f87171", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
          💥 {this.props.label ?? "Runtime Error"}
        </div>

        {/* Error message */}
        <div
          style={{
            background: "#1e1b2e",
            border: "1px solid #7c3aed",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>{error.name}: </span>
          {error.message}
        </div>

        {/* JS stack trace */}
        <div style={{ color: "#94a3b8", marginBottom: 8, fontWeight: 600 }}>JS Stack</div>
        <pre
          style={{
            background: "#1e1b2e",
            borderRadius: 8,
            padding: "12px 16px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            marginBottom: 20,
            color: "#cbd5e1",
            fontSize: 12,
          }}
        >
          {error.stack}
        </pre>

        {/* React component stack */}
        {info?.componentStack && (
          <>
            <div style={{ color: "#94a3b8", marginBottom: 8, fontWeight: 600 }}>
              React Component Stack
            </div>
            <pre
              style={{
                background: "#1e1b2e",
                borderRadius: 8,
                padding: "12px 16px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                color: "#cbd5e1",
                fontSize: 12,
              }}
            >
              {info.componentStack}
            </pre>
          </>
        )}

        <button
          onClick={() => this.setState({ error: null, info: null })}
          style={{
            marginTop: 20,
            padding: "8px 20px",
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ↺ Retry
        </button>
      </div>
    );
  }
}
