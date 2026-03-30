import { useState } from "react";
import { addHelper } from "../api/index";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "", phone: "", service: "Maid",
    price: "", city: "Indore", area: "",
    availability: "Morning (6-10 AM)", about: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handle = async () => {
    if (!form.name || !form.phone || !form.price || !form.area) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addHelper({
        ...form,
        price:    parseInt(form.price),
        skills:   [form.service],
        avatar:   form.name.slice(0, 2).toUpperCase(),
        gradient: "linear-gradient(135deg,#667eea,#764ba2)",
        experience: "New",
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="page-content" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 24px", background:"#f8fafc" }}>
      <div style={{ textAlign:"center", animation:"fadeUp 0.4s ease" }}>
        <div style={{ fontSize:72, marginBottom:20, animation:"float 3s ease infinite" }}>🎉</div>
        <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:32, marginBottom:12, color:"#0f172a" }}>
          Profile Submitted!
        </h2>
        <p style={{ color:"#64748b", fontSize:17, maxWidth:400, margin:"0 auto 24px" }}>
          Your profile has been saved. We'll verify it within 24 hours and contact you on your phone number.
        </p>
        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:20, maxWidth:300, margin:"0 auto", textAlign:"left", boxShadow:"0 2px 12px rgba(37,99,235,0.08)" }}>
          <div style={{ color:"#64748b", fontSize:13, marginBottom:6 }}>Submitted Details</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#0f172a" }}>{form.name}</div>
          <div style={{ color:"#64748b", fontSize:14, marginTop:4 }}>
            {form.service} · {form.city} · ₹{form.price}/month
          </div>
        </div>
      </div>
    </div>
  );

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="page-content" style={{ paddingTop:80, minHeight:"100vh", background:"#f8fafc" }}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px" }}>

        {/* Heading */}
        <div style={{ marginBottom:36 }}>
          <div style={{ display:"inline-block", background:"#ecfdf5", color:"#059669", borderRadius:50, padding:"4px 16px", fontSize:13, fontWeight:700, marginBottom:12, border:"1px solid #a7f3d0" }}>
            💼 For Helpers
          </div>
          <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(28px, 4vw, 44px)", marginBottom:8, color:"#0f172a" }}>
            Register as a{" "}
            <span style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Helper
            </span>
          </h1>
          <p style={{ color:"#64748b" }}>Fill in your details and start getting work opportunities</p>
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:32, border:"1px solid #e2e8f0", boxShadow:"0 2px 12px rgba(37,99,235,0.06)" }}>

          {/* Row 1 — Name + Phone */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div>
              <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:6 }}>Full Name *</label>
              <input className="input-field" placeholder="Sunita Devi"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:6 }}>Phone Number *</label>
              <input className="input-field" placeholder="98765 43210"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          {/* Row 2 — Service + Price */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div>
              <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:6 }}>Service Type *</label>
              <select className="input-field" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}>
                {["Maid","Cook","Cleaner","Cook+Maid"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:6 }}>Monthly Price (₹) *</label>
              <input className="input-field" type="number" placeholder="3500"
                value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
          </div>

          {/* Row 3 — City + Area */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div>
              <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:6 }}>City *</label>
              <select className="input-field" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                {["Indore","Bhopal","Delhi"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:6 }}>Area / Locality *</label>
              <input className="input-field" placeholder="e.g. Vijay Nagar"
                value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
            </div>
          </div>

          {/* Availability */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:8 }}>Availability</label>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {["Morning (6-10 AM)","Afternoon (1-4 PM)","Evening (6-9 PM)","Full Day"].map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, availability: a }))}
                  style={{
                    padding:"8px 16px", borderRadius:50, cursor:"pointer",
                    background: form.availability === a ? "#2563eb" : "#fff",
                    color:      form.availability === a ? "#fff"    : "#64748b",
                    border:     form.availability === a ? "none"    : "1px solid #e2e8f0",
                    fontSize:13, fontFamily:"DM Sans, sans-serif", fontWeight:500, transition:"all 0.2s",
                    boxShadow:  form.availability === a ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                  }}
                >{a}</button>
              ))}
            </div>
          </div>

          {/* About */}
          <div style={{ marginBottom:28 }}>
            <label style={{ display:"block", color:"#475569", fontSize:13, fontWeight:600, marginBottom:6 }}>About Yourself</label>
            <textarea className="input-field" rows={4}
              placeholder="Tell potential employers about your experience and skills..."
              value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
              style={{ resize:"vertical", minHeight:100 }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:14 }}>
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="btn-primary"
            style={{ width:"100%", padding:"14px", fontSize:16 }}
            onClick={handle}
            disabled={loading}
          >
            {loading ? "⏳ Saving to database..." : "🚀 Submit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
