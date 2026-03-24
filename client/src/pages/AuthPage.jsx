// client/src/pages/AuthPage.jsx
import { useState } from "react";

const AuthPage = ({ mode, setPage, onAuth }) => {
  const isLogin = mode === "login";
  const [form, setForm]     = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handle = async () => {
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate API call — replace with real axios call in production
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onAuth({
      name: form.name || form.email.split("@")[0],
      email: form.email,
      role: form.role,
    });
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
      }}
    >
      <div
        className="bg-blob"
        style={{
          width: 400,
          height: 400,
          background: "var(--blue)",
          top: "10%",
          right: "10%",
        }}
      />

      <div
        className="glass"
        style={{
          borderRadius: 24,
          padding: "40px 36px",
          maxWidth: 440,
          width: "100%",
          animation: "fadeUp 0.4s ease",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: 28,
              marginBottom: 8,
            }}
          >
            {isLogin ? "Welcome Back" : "Join GharSeva"}
          </div>
          <p style={{ color: "var(--text2)", fontSize: 15 }}>
            {isLogin ? "Sign in to your account" : "Create your free account"}
          </p>
        </div>

        {/* Role selector (signup only) */}
        {!isLogin && (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              I AM A
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                ["user",   "🏠 Looking for Help"],
                ["helper", "🧹 I'm a Helper"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setForm((f) => ({ ...f, role: v }))}
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background:
                      form.role === v
                        ? "rgba(79,142,247,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      form.role === v
                        ? "1px solid rgba(79,142,247,0.5)"
                        : "1px solid var(--border)",
                    color: form.role === v ? "var(--blue)" : "var(--text2)",
                    fontFamily: "DM Sans",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fields */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {!isLogin && (
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text2)",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Full Name
              </label>
              <input
                className="input-field"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
          )}
          <div>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              color: "#ff6b6b",
              fontSize: 14,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%", padding: "13px", fontSize: 16, marginBottom: 20 }}
          onClick={handle}
          disabled={loading}
        >
          {loading
            ? "⏳ Please wait..."
            : isLogin
            ? "Sign In"
            : "Create Account"}
        </button>

        <p style={{ textAlign: "center", color: "var(--text2)", fontSize: 14 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            style={{ color: "var(--blue)", cursor: "pointer", fontWeight: 600 }}
            onClick={() => setPage(isLogin ? "signup" : "login")}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;