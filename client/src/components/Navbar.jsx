// client/src/components/Navbar.jsx
import Avatar from "./Avatar";

const Navbar = ({ page, setPage, user, setUser }) => (
  <nav
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "rgba(8,8,16,0.8)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* Logo */}
    <div
      onClick={() => setPage("home")}
      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--grad)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Syne",
          fontWeight: 800,
          fontSize: 16,
          color: "#fff",
        }}
      >
        G
      </div>
      <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>
        Ghar<span className="gradient-text">Seva</span>
      </span>
    </div>

    {/* Desktop nav links */}
    <div
      className="hide-mobile"
      style={{ display: "flex", gap: 28, alignItems: "center" }}
    >
      <span
        className={`nav-link ${page === "home" ? "active" : ""}`}
        onClick={() => setPage("home")}
      >
        Home
      </span>
      <span
        className={`nav-link ${page === "browse" ? "active" : ""}`}
        onClick={() => setPage("browse")}
      >
        Find Help
      </span>
      <span
        className={`nav-link ${page === "register" ? "active" : ""}`}
        onClick={() => setPage("register")}
      >
        Register
      </span>
      {user && (
        <span
          className={`nav-link ${page === "dashboard" ? "active" : ""}`}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </span>
      )}
    </div>

    {/* Auth area */}
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
            onClick={() => setPage("dashboard")}
          >
            <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={26} />
            <span
              className="hide-mobile"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              {user.name}
            </span>
          </div>
          <button
            className="btn-outline"
            style={{ padding: "7px 16px", fontSize: 13 }}
            onClick={() => setUser(null)}
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <button
            className="btn-outline hide-mobile"
            style={{ padding: "7px 16px", fontSize: 13 }}
            onClick={() => setPage("login")}
          >
            Login
          </button>
          <button
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: 13 }}
            onClick={() => setPage("signup")}
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  </nav>
);

export default Navbar;