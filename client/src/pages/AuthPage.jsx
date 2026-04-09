import { useMemo, useState } from "react";
import { signup, login } from "../api/index";

const BASE_ROLE_OPTIONS = [
  ["user", "Looking for Help"],
  ["helper", "I'm a Helper"],
];

const AuthPage = ({ mode, setPage, onAuth }) => {
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminInviteCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showAdminSignup, setShowAdminSignup] = useState(false);

  const roleOptions = showAdminSignup
    ? [...BASE_ROLE_OPTIONS, ["admin", "Admin (Invite Only)"]]
    : BASE_ROLE_OPTIONS;

  const selectedRoleLabel = useMemo(
    () => roleOptions.find(([value]) => value === form.role)?.[1] || "Account",
    [form.role, roleOptions]
  );

  const handle = async () => {
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      setError("Please fill all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!isLogin && form.role === "admin" && !form.adminInviteCode.trim()) {
      setError("Admin invite code is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = isLogin
        ? await login({ email: form.email, password: form.password })
        : await signup({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            adminInviteCode: form.role === "admin" ? form.adminInviteCode : undefined,
          });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onAuth(user);
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handle();
  };

  return (
    <div
      className="page-content"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        background: "#f8fafc",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -60, right: -60, width: 400, height: 400, borderRadius: "50%", background: "rgba(37,99,235,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(124,58,237,0.05)", pointerEvents: "none" }} />

      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", maxWidth: 460, width: "100%", border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(37,99,235,0.10)", animation: "fadeUp 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", margin: "0 auto 16px", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>G</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "#0f172a", marginBottom: 6 }}>
            {isLogin ? "Welcome Back" : "Join GharSeva"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 15 }}>
            {isLogin ? "Sign in to your account" : `Create your ${selectedRoleLabel.toLowerCase()} account`}
          </p>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>I AM A</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {roleOptions.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setForm((current) => ({ ...current, role: value }))}
                  style={{
                    padding: "12px",
                    borderRadius: 12,
                    cursor: "pointer",
                    background: form.role === value ? "#eff6ff" : "#f8fafc",
                    border: form.role === value ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                    color: form.role === value ? "#2563eb" : "#64748b",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {!showAdminSignup && (
              <p style={{ marginTop: 10, fontSize: 13, color: "#64748b", textAlign: "center" }}>
                <span style={{ color: "#2563eb", cursor: "pointer", fontWeight: 700 }} onClick={() => setShowAdminSignup(true)}>
                  Have an admin invite code?
                </span>
              </p>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          {!isLogin && (
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Full Name</label>
              <input className="input-field" placeholder="Your full name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} onKeyDown={handleKeyDown} />
            </div>
          )}
          <div>
            <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email Address</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} onKeyDown={handleKeyDown} />
          </div>
          <div>
            <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input className="input-field" type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} onKeyDown={handleKeyDown} style={{ paddingRight: 44 }} />
              <button onClick={() => setShowPass((open) => !open)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16 }}>
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {!isLogin && form.role === "admin" && (
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Admin Invite Code</label>
              <input className="input-field" type="password" placeholder="Enter admin invite code" value={form.adminInviteCode} onChange={(e) => setForm((current) => ({ ...current, adminInviteCode: e.target.value }))} onKeyDown={handleKeyDown} />
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          onClick={handle}
          disabled={loading}
          style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 700, fontFamily: "DM Sans, sans-serif", borderRadius: 50, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.35)", transition: "all 0.2s", marginBottom: 20 }}
        >
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: 14 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: "#2563eb", cursor: "pointer", fontWeight: 700 }} onClick={() => setPage(isLogin ? "signup" : "login")}>
            {isLogin ? "Sign Up Free" : "Sign In"}
          </span>
        </p>

        <p style={{ textAlign: "center", marginTop: 16 }}>
          <span style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }} onClick={() => setPage("home")}>Back to Home</span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
