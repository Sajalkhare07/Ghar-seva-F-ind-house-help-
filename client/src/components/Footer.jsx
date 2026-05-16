const Footer = ({ setPage }) => (
  <footer style={{ padding: "36px 24px 48px" }}>
    <div
      className="glass"
      style={{
        maxWidth: 1220,
        margin: "0 auto",
        borderRadius: 32,
        padding: "34px 30px 22px",
        background: "linear-gradient(160deg, rgba(16,42,67,0.98), rgba(74,101,114,0.92))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 10, color: "#ffffff" }}>
            Ghar<span style={{ color: "#72d7c5" }}>Seva</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.78)", maxWidth: 320, fontSize: 14, lineHeight: 1.8 }}>
            Beautifully simple hiring for maids, cooks, and cleaners with a calm, trustworthy experience for families and helpers alike.
          </p>
        </div>

        <div>
          <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Explore
          </div>
          {[
            ["Find Helpers", "browse"],
            ["Register Helper", "register"],
            ["Admin Access", "admin"],
            ["Home", "home"],
          ].map(([label, target]) => (
            <div key={label} style={{ marginBottom: 10, color: "rgba(255,255,255,0.82)", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage(target)}>
              {label}
            </div>
          ))}
        </div>

        <div>
          <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Cities
          </div>
          {[
            "Indore",
            "Bhopal",
            "Delhi",
            "Mumbai soon",
          ].map((city) => (
            <div key={city} style={{ marginBottom: 10, color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>{city}</div>
          ))}
        </div>

        <div>
          <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Contact
          </div>
          <div style={{ color: "rgba(255,255,255,0.82)", marginBottom: 10, fontWeight: 600 }}>hello@gharseva.in</div>
          <div style={{ color: "rgba(255,255,255,0.82)", marginBottom: 10, fontWeight: 600 }}>+91 9876 543210</div>
          <div style={{ color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>Indore, Madhya Pradesh</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 28, paddingTop: 18, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700 }}>
        <span>2026 GharSeva</span>
        <span>Designed for clarity, warmth, and trust.</span>
      </div>
    </div>
  </footer>
);

export default Footer;