import Avatar from "./Avatar";

const dashboardLabel = (role) => {
  if (role === "helper") return "Helper Hub";
  if (role === "admin") return "Admin";
  return "Dashboard";
};

const Navbar = ({ page, setPage, user, setUser }) => (
  <nav
    style={{
      position: "fixed",
      top: 16,
      left: 16,
      right: 16,
      zIndex: 100,
    }}
  >
    <div
      className="glass"
      style={{
        maxWidth: 1220,
        margin: "0 auto",
        minHeight: 74,
        borderRadius: 999,
        padding: "10px 14px 10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        background: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "linear-gradient(145deg, #102A43, #1B9C85)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 18,
            boxShadow: "0 10px 22px rgba(16, 42, 67, 0.18)",
          }}
        >
          G
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 23, fontWeight: 700, lineHeight: 1 }}>
            Ghar<span className="gradient-text">Seva</span>
          </div>
          <div className="hide-mobile" style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>
            Trusted help for modern homes
          </div>
        </div>
      </div>

      <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <span className={`nav-link ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>Home</span>
        <span className={`nav-link ${page === "browse" ? "active" : ""}`} onClick={() => setPage("browse")}>Browse Helpers</span>
        <span className={`nav-link ${page === "register" ? "active" : ""}`} onClick={() => setPage("register")}>Become a Helper</span>
        {!user && <span className={`nav-link ${page === "admin" ? "active" : ""}`} onClick={() => setPage("admin")}>Admin Access</span>}
        {user && (
          <span className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>
            {dashboardLabel(user.role)}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {user ? (
          <>
            <button
              type="button"
              onClick={() => setPage("dashboard")}
              style={{
                border: "1px solid rgba(74, 101, 114, 0.18)",
                background: "rgba(255, 255, 255, 0.96)",
                borderRadius: 999,
                padding: "8px 12px 8px 8px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={32} />
              <div className="hide-mobile" style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{dashboardLabel(user.role)}</div>
              </div>
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px" }} onClick={setUser}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn-outline hide-mobile" style={{ padding: "10px 18px" }} onClick={() => setPage("admin")}>Admin</button>
            <button className="btn-outline hide-mobile" style={{ padding: "10px 18px" }} onClick={() => setPage("login")}>Login</button>
            <button className="btn-primary" style={{ padding: "10px 20px" }} onClick={() => setPage("signup")}>Get Started</button>
          </>
        )}
      </div>
    </div>
  </nav>
);

export default Navbar;