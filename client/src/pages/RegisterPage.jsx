// client/src/pages/RegisterPage.jsx
import { useState } from "react";

const RegisterPage = ({ onRegister }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "Maid",
    price: "",
    city: "Indore",
    area: "",
    availability: "Morning (6-10 AM)",
    about: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handle = async () => {
    if (!form.name || !form.phone || !form.price || !form.area) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    if (onRegister) onRegister(form);
  };

  // ── Success screen ──
  if (submitted)
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
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
          <div
            style={{
              fontSize: 72,
              marginBottom: 20,
              animation: "float 3s ease infinite",
            }}
          >
            🎉
          </div>
          <h2
            style={{
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: 32,
              marginBottom: 12,
            }}
          >
            Profile Submitted!
          </h2>
          <p
            style={{
              color: "var(--text2)",
              fontSize: 17,
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            Your profile will be verified within 24 hours. We'll contact you on
            your phone number.
          </p>
          <div
            className="glass"
            style={{
              borderRadius: 12,
              padding: 20,
              marginTop: 24,
              maxWidth: 300,
              margin: "24px auto 0",
              textAlign: "left",
            }}
          >
            <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 4 }}>
              Submitted Details
            </div>
            <div style={{ fontWeight: 600 }}>{form.name}</div>
            <div style={{ color: "var(--text2)", fontSize: 14 }}>
              {form.service} · {form.city} · ₹{form.price}/month
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className="page-content"
      style={{ paddingTop: 80, minHeight: "100vh" }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <div className="tag tag-green" style={{ marginBottom: 12 }}>
            💼 For Helpers
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Register as a <span className="gradient-text">Helper</span>
          </h1>
          <p style={{ color: "var(--text2)" }}>
            Fill in your details and start getting work opportunities
          </p>
        </div>

        <div
          className="glass"
          style={{ borderRadius: "var(--radius)", padding: 32 }}
        >
          {/* Row 1 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Full Name *
              </label>
              <input
                className="input-field"
                placeholder="Sunita Devi"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Phone Number *
              </label>
              <input
                className="input-field"
                placeholder="98765 43210"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Row 2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Service Type *
              </label>
              <select
                className="input-field"
                value={form.service}
                onChange={(e) =>
                  setForm((f) => ({ ...f, service: e.target.value }))
                }
              >
                {["Maid", "Cook", "Cleaner", "Cook+Maid"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Monthly Price (₹) *
              </label>
              <input
                className="input-field"
                type="number"
                placeholder="3500"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Row 3 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                City *
              </label>
              <select
                className="input-field"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              >
                {["Indore", "Bhopal", "Delhi"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Area / Locality *
              </label>
              <input
                className="input-field"
                placeholder="e.g. Vijay Nagar"
                value={form.area}
                onChange={(e) =>
                  setForm((f) => ({ ...f, area: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Availability */}
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
              Availability
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                "Morning (6-10 AM)",
                "Afternoon (1-4 PM)",
                "Evening (6-9 PM)",
                "Full Day",
              ].map((a) => (
                <button
                  key={a}
                  onClick={() => setForm((f) => ({ ...f, availability: a }))}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 50,
                    cursor: "pointer",
                    background:
                      form.availability === a
                        ? "rgba(79,142,247,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      form.availability === a
                        ? "1px solid rgba(79,142,247,0.5)"
                        : "1px solid var(--border)",
                    color:
                      form.availability === a ? "var(--blue)" : "var(--text2)",
                    fontSize: 13,
                    fontFamily: "DM Sans",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div style={{ marginBottom: 28 }}>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              About Yourself
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Tell potential employers about your experience, skills, and why they should hire you..."
              value={form.about}
              onChange={(e) =>
                setForm((f) => ({ ...f, about: e.target.value }))
              }
              style={{ resize: "vertical", minHeight: 100 }}
            />
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: 16 }}
            onClick={handle}
            disabled={loading}
          >
            {loading ? "⏳ Submitting..." : "🚀 Submit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;