// client/src/components/Footer.jsx

const Footer = ({ setPage }) => (
  <footer
    style={{
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      padding: "40px 24px",
    }}
  >
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 32,
      }}
    >
      {/* Brand */}
      <div>
        <div
          style={{
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: 22,
            marginBottom: 12,
          }}
        >
          Ghar<span className="gradient-text">Seva</span>
        </div>
        <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>
          Connecting bachelors & working professionals with reliable domestic
          helpers across India.
        </p>
      </div>

      {/* Platform links */}
      <div>
        <div
          style={{
            fontWeight: 700,
            marginBottom: 12,
            color: "var(--text2)",
            fontSize: 13,
            letterSpacing: "0.5px",
          }}
        >
          PLATFORM
        </div>
        {["Find Help", "Register as Helper", "How it Works"].map((l) => (
          <div
            key={l}
            style={{
              color: "var(--text2)",
              fontSize: 14,
              marginBottom: 8,
              cursor: "pointer",
            }}
            onClick={() =>
              setPage(l === "Find Help" ? "browse" : "register")
            }
          >
            {l}
          </div>
        ))}
      </div>

      {/* Cities */}
      <div>
        <div
          style={{
            fontWeight: 700,
            marginBottom: 12,
            color: "var(--text2)",
            fontSize: 13,
            letterSpacing: "0.5px",
          }}
        >
          CITIES
        </div>
        {["Indore", "Bhopal", "Delhi", "Coming Soon: Mumbai"].map((c) => (
          <div
            key={c}
            style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8 }}
          >
            {c}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div>
        <div
          style={{
            fontWeight: 700,
            marginBottom: 12,
            color: "var(--text2)",
            fontSize: 13,
            letterSpacing: "0.5px",
          }}
        >
          CONTACT
        </div>
        <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8 }}>
          📧 hello@gharseva.in
        </div>
        <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8 }}>
          📞 +91 9876 543210
        </div>
        <div style={{ color: "var(--text2)", fontSize: 14 }}>
          🏙️ Indore, Madhya Pradesh
        </div>
      </div>
    </div>

    {/* Bottom strip */}
    <div
      style={{
        maxWidth: 1100,
        margin: "32px auto 0",
        borderTop: "1px solid var(--border)",
        paddingTop: 24,
        textAlign: "center",
        color: "var(--text3)",
        fontSize: 13,
      }}
    >
      © 2024 GharSeva. Made with ❤️ for bachelors across India.
    </div>
  </footer>
);

export default Footer;