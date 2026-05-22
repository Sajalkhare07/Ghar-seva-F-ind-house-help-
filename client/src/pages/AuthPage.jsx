import { useEffect, useMemo, useState } from "react";
import { signup, login } from "../api/index";

const BASE_ROLE_OPTIONS = [
  ["user", "Looking for help"],
  ["helper", "I am a helper"],
];

const labelStyle = {
  display: "block",
  color: "var(--text2)",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 6,
};

const AUTH_PROMPT_KEY = "gharseva-auth-prompt";

const AuthPage = ({ mode, setPage, onAuth }) => {
  const isAdminAccess = mode === "admin";
  const isLogin = mode === "login";
  const [adminTab, setAdminTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminInviteCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showAdminSignup, setShowAdminSignup] = useState(false);

  useEffect(() => {
    if (isAdminAccess) {
      setForm((current) => ({ ...current, role: "admin" }));
    }
  }, [isAdminAccess]);

  useEffect(() => {
    const prompt = sessionStorage.getItem(AUTH_PROMPT_KEY);
    if (prompt) {
      setNotice(prompt);
      sessionStorage.removeItem(AUTH_PROMPT_KEY);
    }
  }, []);

  const isAdminCreate = isAdminAccess && adminTab === "create";
  const effectiveLogin = isAdminAccess ? adminTab === "login" : isLogin;

  const roleOptions = showAdminSignup
    ? [...BASE_ROLE_OPTIONS, ["admin", "Admin invite"]]
    : BASE_ROLE_OPTIONS;

  const selectedRoleLabel = useMemo(
    () => roleOptions.find(([value]) => value === form.role)?.[1] || "account",
    [form.role, roleOptions]
  );

  const handle = async () => {
    if (!form.email || !form.password || (!effectiveLogin && !form.name)) {
      setError("Please fill all required fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if ((isAdminCreate || (!effectiveLogin && form.role === "admin")) && !form.adminInviteCode.trim()) {
      setError("Admin invite code is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = effectiveLogin
        ? await login({ email: form.email, password: form.password })
        : await signup({
            name: form.name,
            email: form.email,
            password: form.password,
            role: isAdminAccess ? "admin" : form.role,
            adminInviteCode:
              isAdminAccess || form.role === "admin" ? form.adminInviteCode : undefined,
          });

      if (isAdminAccess && res.data.user?.role !== "admin") {
        setError("This account is not an admin account.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onAuth(res.data.user);
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handle();
  };

  const heroTitle = isAdminAccess
    ? "Admin control, restored."
    : effectiveLogin
      ? "Welcome back."
      : "Create a calmer start.";

  const heroText = isAdminAccess
    ? "Sign in as admin to review helper profiles, verify documents, approve listings, and control the platform flow. New admin accounts can still be created only with the invite code from the server .env file."
    : effectiveLogin
      ? "Sign in to manage saved helpers, continue chat, or contact approved profiles from the dashboard."
      : `Open your ${selectedRoleLabel.toLowerCase()} account and continue with the redesigned GharSeva flow.`;

  const cardTitle = isAdminAccess
    ? adminTab === "login"
      ? "Admin Sign In"
      : "Create Admin Account"
    : effectiveLogin
      ? "Sign in"
      : "Join GharSeva";

  const cardSubtitle = isAdminAccess
    ? adminTab === "login"
      ? "Use your admin email and password"
      : "Use the invite code from server .env"
    : effectiveLogin
      ? "Access your account"
      : "Set up your profile in a few simple steps";

  return (
    <div className="page-content" style={{ minHeight: "100vh", padding: "118px 24px 48px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 22, alignItems: "stretch" }}>
        <div className="glass" style={{ borderRadius: 34, padding: "40px 34px", background: isAdminAccess ? "linear-gradient(160deg, rgba(244,236,226,0.97), rgba(225,234,231,0.94))" : "linear-gradient(160deg, rgba(255,249,241,0.96), rgba(242,231,217,0.92))" }}>
          <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            {isAdminAccess ? "GharSeva admin access" : "GharSeva access"}
          </div>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.05, marginBottom: 16 }}>
            {heroTitle}
          </h1>
          <p style={{ color: "var(--text2)", lineHeight: 1.9, fontSize: 16, marginBottom: 28 }}>
            {heroText}
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            {(isAdminAccess
              ? [
                  "Review helper registrations and documents",
                  "Approve or remove listings from the marketplace",
                  "Protected admin creation with .env invite code",
                ]
              : [
                  "Cleaner, easier to trust interface",
                  "Verified helper profiles with real photos",
                  "Simple browsing and contact flow",
                ]).map((point) => (
              <div key={point} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text2)", fontWeight: 700 }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: isAdminAccess ? "var(--accent)" : "var(--brand)" }} />
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 34, padding: "34px 30px", background: "rgba(255,252,247,0.95)" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: isAdminAccess ? "linear-gradient(145deg, #1B9C85, #102A43)" : "var(--grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 16 }}>
              {isAdminAccess ? "A" : "G"}
            </div>
            <h2 style={{ fontSize: 34, marginBottom: 6 }}>{cardTitle}</h2>
            <p style={{ color: "var(--text2)", fontSize: 15 }}>{cardSubtitle}</p>
          </div>

          {notice && <div style={{ background: "rgba(225,234,231,0.84)", border: "1px solid rgba(27,156,133,0.18)", color: "var(--brand-dark)", borderRadius: 16, padding: "12px 14px", marginBottom: 16, fontWeight: 700 }}>{notice}</div>}

          {isAdminAccess ? (
            <div style={{ display: "inline-flex", gap: 6, padding: 6, borderRadius: 999, border: "1px solid rgba(74,101,114,0.18)", background: "rgba(255,250,244,0.78)", marginBottom: 20, flexWrap: "wrap" }}>
              {[["login", "Existing admin"], ["create", "Create with invite code"]].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAdminTab(value);
                    setError("");
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: "1px solid transparent",
                    cursor: "pointer",
                    background: adminTab === value ? "rgba(27,156,133,0.14)" : "transparent",
                    color: adminTab === value ? "var(--brand-dark)" : "var(--text2)",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : !effectiveLogin && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "var(--text3)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Choose role</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                {roleOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role: value }))}
                    style={{
                      borderRadius: 18,
                      border: form.role === value ? "1.5px solid rgba(164,76,52,0.45)" : "1px solid rgba(74,101,114,0.18)",
                      background: form.role === value ? "rgba(16,42,67,0.08)" : "rgba(255,250,244,0.9)",
                      color: form.role === value ? "var(--brand-dark)" : "var(--text2)",
                      padding: "14px 12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!showAdminSignup && (
                <div style={{ marginTop: 10, color: "var(--text3)", fontSize: 13 }}>
                  <span style={{ cursor: "pointer", color: "var(--brand)", fontWeight: 800 }} onClick={() => setShowAdminSignup(true)}>
                    Have an admin invite code?
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "grid", gap: 16, marginBottom: 18 }}>
            {(!effectiveLogin || isAdminCreate) && (
              <div>
                <label style={labelStyle}>Full name</label>
                <input className="input-field" placeholder="Your full name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} onKeyDown={handleKeyDown} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} onKeyDown={handleKeyDown} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="input-field" type={showPass ? "text" : "password"} placeholder="Minimum 6 characters" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} onKeyDown={handleKeyDown} style={{ paddingRight: 72 }} />
                <button type="button" onClick={() => setShowPass((value) => !value)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text3)", fontWeight: 800, cursor: "pointer" }}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {(isAdminCreate || (!effectiveLogin && form.role === "admin")) && (
              <div>
                <label style={labelStyle}>Admin invite code</label>
                <input className="input-field" type="password" placeholder="Enter invite code from .env" value={form.adminInviteCode} onChange={(e) => setForm((current) => ({ ...current, adminInviteCode: e.target.value }))} onKeyDown={handleKeyDown} />
              </div>
            )}
          </div>

          {error && <div style={{ background: "#f8e7e4", border: "1px solid rgba(182,84,69,0.16)", color: "var(--red)", borderRadius: 16, padding: "12px 14px", marginBottom: 16, fontWeight: 700 }}>{error}</div>}

          <button className="btn-primary" style={{ width: "100%", padding: "14px 20px", marginBottom: 16 }} onClick={handle} disabled={loading}>
            {loading
              ? "Please wait..."
              : isAdminAccess
                ? adminTab === "login"
                  ? "Open Admin Dashboard"
                  : "Create Admin Account"
                : effectiveLogin
                  ? "Sign In"
                  : "Create Account"}
          </button>

          <div style={{ textAlign: "center", color: "var(--text2)", fontSize: 14 }}>
            {isAdminAccess ? (
              <>
                Looking for normal user login? <span style={{ color: "var(--brand)", fontWeight: 800, cursor: "pointer" }} onClick={() => setPage("login")}>Go to sign in</span>
              </>
            ) : effectiveLogin ? (
              <>
                Do not have an account? <span style={{ color: "var(--brand)", fontWeight: 800, cursor: "pointer" }} onClick={() => setPage("signup")}>Sign up</span>
              </>
            ) : (
              <>
                Already have an account? <span style={{ color: "var(--brand)", fontWeight: 800, cursor: "pointer" }} onClick={() => setPage("login")}>Sign in</span>
              </>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 14, color: "var(--text3)", fontSize: 13, fontWeight: 700, cursor: "pointer" }} onClick={() => setPage("home")}>
            Back to home
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
