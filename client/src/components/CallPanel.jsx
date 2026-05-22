const callTone = {
  requesting: { label: "Preparing call", color: "#102A43" },
  connecting: { label: "Connecting", color: "#1B9C85" },
  "in-progress": { label: "Call in progress", color: "#167c6a" },
  ended: { label: "Call ended", color: "#4A6572" },
  cancelled: { label: "Call cancelled", color: "#8b4b40" },
  rejected: { label: "Call rejected", color: "#9f4336" },
  error: { label: "Call error", color: "#9f4336" },
};

const CallPanel = ({ callState, onHangup }) => {
  if (!callState?.status) return null;

  const tone = callTone[callState.status] || callTone.requesting;
  const showHangup = ["requesting", "connecting", "in-progress"].includes(callState.status);

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        width: "min(360px, calc(100vw - 32px))",
        borderRadius: 24,
        border: "1px solid rgba(74,101,114,0.18)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
        boxShadow: "0 24px 60px rgba(16,42,67,0.16)",
        padding: 18,
        zIndex: 1200,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            Browser call
          </div>
          <div style={{ fontWeight: 800, color: tone.color, fontSize: 18 }}>{tone.label}</div>
          <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 6 }}>
            {callState.helperName || "Approved helper"}
          </div>
          {callState.message ? <div style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>{callState.message}</div> : null}
        </div>
        {showHangup ? (
          <button type="button" className="btn-outline" onClick={onHangup}>
            Hang up
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default CallPanel;
