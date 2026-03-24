// client/src/pages/HomePage.jsx
// ─── PASTE THIS FILE INTO: client/src/pages/HomePage.jsx ───────────────────
import { useState, useEffect } from "react";
import HelperCard from "../components/HelperCard";
import { TESTIMONIALS } from "../data/helpers";

// ── Animated counter hook ─────────────────────────────────────────────────────
const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ value, suffix, label, icon }) => {
  const count = useCounter(value);
  return (
    <div
      style={{
        background: "#fff", border: "1px solid #e8edf5",
        borderRadius: 16, padding: "24px 20px", textAlign: "center",
        boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
        transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 12px rgba(37,99,235,0.06)"; }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, color: "#1d4ed8", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ color: "#64748b", fontSize: 13, marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
};

// ── Service Pill ──────────────────────────────────────────────────────────────
const ServicePill = ({ icon, name, count, color, bg, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 20px", borderRadius: 50,
      background: bg, border: `1.5px solid ${color}20`,
      cursor: "pointer", transition: "all 0.2s",
      fontFamily: "DM Sans, sans-serif", fontWeight: 600,
      fontSize: 14, color: color,
    }}
    onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.05)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = bg;    e.currentTarget.style.color = color; e.currentTarget.style.transform = "scale(1)"; }}
  >
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span>{name}</span>
    <span style={{ background: `${color}20`, color, borderRadius: 50, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{count}</span>
  </button>
);

// ── Step Card ─────────────────────────────────────────────────────────────────
const StepCard = ({ number, icon, title, desc }) => (
  <div
    style={{
      background: "#fff", borderRadius: 20, padding: 28,
      border: "1px solid #e8edf5",
      boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
      position: "relative", overflow: "hidden", transition: "all 0.3s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(37,99,235,0.15)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8edf5"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(37,99,235,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{
      position: "absolute", top: -16, right: -8,
      fontFamily: "Syne, sans-serif", fontWeight: 900,
      fontSize: 80, color: "#2563eb", opacity: 0.05, lineHeight: 1,
    }}>{number}</div>
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 24, marginBottom: 16, border: "1px solid #bfdbfe",
    }}>{icon}</div>
    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8, color: "#0f172a" }}>{title}</h3>
    <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: 14 }}>{desc}</p>
  </div>
);

// ── Testimonial Card ──────────────────────────────────────────────────────────
const TestimonialCard = ({ t }) => (
  <div
    style={{
      background: "#fff", borderRadius: 20, padding: 28,
      border: "1px solid #e8edf5",
      boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
      transition: "all 0.3s", display: "flex", flexDirection: "column", gap: 16,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,99,235,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 12px rgba(37,99,235,0.06)"; }}
  >
    <div style={{ display: "flex", gap: 2 }}>
      {"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>{s}</span>)}
    </div>
    <p style={{ color: "#334155", lineHeight: 1.75, fontSize: 15, fontStyle: "italic" }}>"{t.text}"</p>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
      }}>{t.avatar}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>{t.name}</div>
        <div style={{ color: "#64748b", fontSize: 13 }}>{t.role} · {t.city}</div>
      </div>
    </div>
  </div>
);

// ── City Badge ────────────────────────────────────────────────────────────────
const CityBadge = ({ city, count, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 20px", borderRadius: 50, cursor: "pointer",
      background: active ? "#2563eb" : "#fff",
      color:      active ? "#fff"    : "#64748b",
      border:     active ? "none"    : "1px solid #e2e8f0",
      fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14,
      transition: "all 0.2s",
      boxShadow: active ? "0 4px 14px rgba(37,99,235,0.3)" : "none",
    }}
  >
    {city} <span style={{ opacity: 0.7, fontSize: 12 }}>({count})</span>
  </button>
);

// ── Main HomePage ─────────────────────────────────────────────────────────────
const HomePage = ({ setPage, helpers, onView, onSave, savedIds }) => {
  const [searchCity, setSearchCity]         = useState("");
  const [searchService, setSearchService]   = useState("");
  const [activeCity, setActiveCity]         = useState("All");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const featured = helpers.filter(h => h.verified && h.rating >= 4.7).slice(0, 4);

  const cityCounts = {
    All:    helpers.length,
    Indore: helpers.filter(h => h.city === "Indore").length,
    Bhopal: helpers.filter(h => h.city === "Bhopal").length,
    Delhi:  helpers.filter(h => h.city === "Delhi").length,
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(160deg, #eff6ff 0%, #f0f9ff 40%, #f8fafc 100%)",
        borderBottom: "1px solid #e2e8f0",
        paddingTop: 100, paddingBottom: 80,
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:-60,   right:-60,  width:400, height:400, borderRadius:"50%", background:"rgba(37,99,235,0.06)",  pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80,   width:300, height:300, borderRadius:"50%", background:"rgba(124,58,237,0.05)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"30%", left:"10%",  width:12,  height:12,  borderRadius:"50%", background:"#2563eb", opacity:0.15, pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"60%", right:"15%", width:8,   height:8,   borderRadius:"50%", background:"#7c3aed", opacity:0.20, pointerEvents:"none" }} />

        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", textAlign:"center", position:"relative" }}>

          {/* Live pill */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"#eff6ff", border:"1px solid #bfdbfe",
            borderRadius:50, padding:"6px 16px",
            marginBottom:28, fontSize:13, color:"#1d4ed8", fontWeight:600,
          }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 0 3px rgba(34,197,94,0.2)" }} />
            Now live in Indore, Bhopal & Delhi
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:"Syne, sans-serif", fontWeight:800,
            fontSize:"clamp(36px, 5.5vw, 68px)", lineHeight:1.1,
            color:"#0f172a", marginBottom:20, maxWidth:820, margin:"0 auto 20px",
          }}>
            Find Trusted{" "}
            <span style={{ background:"linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Domestic Helpers
            </span>{" "}
            Near You
          </h1>

          <p style={{ fontSize:"clamp(16px, 1.8vw, 20px)", color:"#475569", maxWidth:580, margin:"0 auto 40px", lineHeight:1.75 }}>
            Verified maids, cooks & cleaners — affordable prices, transparent reviews, zero middlemen.
          </p>

          {/* Search bar */}
          <div style={{
            maxWidth:640, margin:"0 auto 48px",
            background:"#fff", borderRadius:60,
            border: isSearchFocused ? "2px solid #2563eb" : "2px solid #e2e8f0",
            boxShadow: isSearchFocused ? "0 0 0 4px rgba(37,99,235,0.1), 0 8px 32px rgba(37,99,235,0.12)" : "0 4px 20px rgba(0,0,0,0.08)",
            padding:"8px 8px 8px 24px",
            display:"flex", alignItems:"center", gap:12,
            transition:"all 0.3s",
          }}>
            <span style={{ fontSize:20 }}>🏙️</span>
            <select
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{ border:"none", outline:"none", background:"transparent", fontSize:15, color:"#0f172a", flex:1, cursor:"pointer", fontFamily:"DM Sans, sans-serif" }}
            >
              <option value="">Select City</option>
              {["Indore","Bhopal","Delhi"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div style={{ width:1, height:28, background:"#e2e8f0" }} />

            <span style={{ fontSize:20 }}>🧹</span>
            <select
              value={searchService}
              onChange={e => setSearchService(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{ border:"none", outline:"none", background:"transparent", fontSize:15, color:"#0f172a", flex:1, cursor:"pointer", fontFamily:"DM Sans, sans-serif" }}
            >
              <option value="">Service Type</option>
              {["Maid","Cook","Cleaner","Cook+Maid"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              onClick={() => setPage("browse")}
              style={{
                background:"linear-gradient(135deg, #2563eb, #1d4ed8)",
                color:"#fff", border:"none", borderRadius:50,
                padding:"12px 28px", fontSize:15, fontWeight:600,
                cursor:"pointer", whiteSpace:"nowrap",
                fontFamily:"DM Sans, sans-serif",
                boxShadow:"0 4px 12px rgba(37,99,235,0.35)",
                transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.35)"; }}
            >
              Find Help →
            </button>
          </div>

          {/* Service pills */}
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:56 }}>
            <ServicePill icon="🧹" name="Maid"      count="180+" color="#2563eb" bg="#eff6ff" onClick={() => setPage("browse")} />
            <ServicePill icon="👨‍🍳" name="Cook"      count="120+" color="#7c3aed" bg="#f5f3ff" onClick={() => setPage("browse")} />
            <ServicePill icon="✨"  name="Cleaner"   count="90+"  color="#0891b2" bg="#ecfeff" onClick={() => setPage("browse")} />
            <ServicePill icon="🏠" name="Cook+Maid" count="60+"  color="#059669" bg="#ecfdf5" onClick={() => setPage("browse")} />
          </div>

          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:16, maxWidth:700, margin:"0 auto" }}>
            <StatCard value={500} suffix="+"  label="Verified Helpers" icon="✅" />
            <StatCard value={10}  suffix="K+" label="Happy Families"   icon="🏠" />
            <StatCard value={3}   suffix=""   label="Cities Covered"   icon="🏙️" />
            <StatCard value={48}  suffix="★"  label="Avg Rating 4.8"  icon="⭐" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ padding:"80px 24px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ display:"inline-block", background:"#eff6ff", color:"#2563eb", borderRadius:50, padding:"4px 16px", fontSize:13, fontWeight:700, marginBottom:12, border:"1px solid #bfdbfe" }}>
            Simple Process
          </div>
          <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(28px, 4vw, 42px)", color:"#0f172a" }}>
            How{" "}
            <span style={{ background:"linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              GharSeva
            </span>{" "}
            Works
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:24 }}>
          <StepCard number="01" icon="🔍" title="Search & Filter"      desc="Browse verified helpers by city, service type, price range and availability. Use smart filters to find the best match." />
          <StepCard number="02" icon="📋" title="View Full Profiles"   desc="Check real ratings, honest reviews, skills, experience and transparent pricing before making any decision." />
          <StepCard number="03" icon="📞" title="Connect Directly"     desc="Call or WhatsApp the helper directly. No middlemen, no hidden commission. Pure direct connection." />
        </div>
      </section>

      {/* ── FEATURED HELPERS ─────────────────────────────────────────────── */}
      <section style={{ background:"#fff", padding:"80px 24px", borderTop:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32, flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ display:"inline-block", background:"#fef9c3", color:"#a16207", borderRadius:50, padding:"4px 14px", fontSize:13, fontWeight:700, marginBottom:10, border:"1px solid #fde68a" }}>
                ⭐ Top Rated
              </div>
              <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(24px, 3vw, 36px)", color:"#0f172a", margin:0 }}>
                Featured Helpers
              </h2>
            </div>
            <button
              onClick={() => setPage("browse")}
              style={{ background:"transparent", border:"1.5px solid #2563eb", color:"#2563eb", borderRadius:50, padding:"10px 24px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563eb"; }}
            >
              View All Helpers →
            </button>
          </div>

          {/* City filter pills */}
          <div style={{ display:"flex", gap:8, marginBottom:28, flexWrap:"wrap" }}>
            {Object.entries(cityCounts).map(([city, count]) => (
              <CityBadge key={city} city={city} count={count} active={activeCity === city} onClick={() => setActiveCity(city)} />
            ))}
          </div>

          {/* Cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:20 }}>
            {featured
              .filter(h => activeCity === "All" || h.city === activeCity)
              .map(h => (
                <HelperCard key={h.id} helper={h} onView={onView} onSave={onSave} saved={savedIds.includes(h.id)} />
              ))}
          </div>
        </div>
      </section>

      {/* ── WHY GHARSEVA ─────────────────────────────────────────────────── */}
      <section style={{ padding:"80px 24px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(28px, 4vw, 42px)", color:"#0f172a" }}>
            Why Choose{" "}
            <span style={{ background:"linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              GharSeva?
            </span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:20 }}>
          {[
            { icon:"🛡️", title:"Background Verified",  desc:"Every helper goes through our verification process before listing.",        color:"#2563eb", bg:"#eff6ff" },
            { icon:"💰", title:"Transparent Pricing",   desc:"No hidden charges. See exact monthly price upfront, always.",              color:"#7c3aed", bg:"#f5f3ff" },
            { icon:"⭐", title:"Real Reviews",          desc:"Genuine ratings and reviews from real families and professionals.",         color:"#d97706", bg:"#fef9c3" },
            { icon:"📱", title:"Direct Connection",     desc:"Contact helpers directly via call or WhatsApp. Zero commission.",          color:"#059669", bg:"#ecfdf5" },
            { icon:"📍", title:"Location Based",        desc:"Find helpers in your specific area or locality, not just city-wide.",      color:"#0891b2", bg:"#ecfeff" },
            { icon:"⚡", title:"Instant Access",        desc:"No waiting. Browse and connect with available helpers right now.",         color:"#dc2626", bg:"#fef2f2" },
          ].map(f => (
            <div
              key={f.title}
              style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #f1f5f9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 28px ${f.color}18`; e.currentTarget.style.borderColor = `${f.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";  e.currentTarget.style.borderColor = "#f1f5f9"; }}
            >
              <div style={{ width:48, height:48, borderRadius:14, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14, border:`1px solid ${f.color}20` }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:16, color:"#0f172a", marginBottom:8 }}>{f.title}</h3>
              <p style={{ color:"#64748b", fontSize:14, lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section style={{ background:"#fff", padding:"80px 24px", borderTop:"1px solid #f1f5f9" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-block", background:"#f0fdf4", color:"#15803d", borderRadius:50, padding:"4px 16px", fontSize:13, fontWeight:700, marginBottom:12, border:"1px solid #bbf7d0" }}>
              💬 Reviews
            </div>
            <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(28px, 4vw, 42px)", color:"#0f172a" }}>
              What People Say
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:24 }}>
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ padding:"80px 24px" }}>
        <div style={{
          maxWidth:860, margin:"0 auto",
          background:"linear-gradient(135deg, #1d4ed8, #7c3aed)",
          borderRadius:28, padding:"64px 48px", textAlign:"center",
          position:"relative", overflow:"hidden",
          boxShadow:"0 20px 60px rgba(37,99,235,0.3)",
        }}>
          <div style={{ position:"absolute", top:20,   right:40,  width:80,  height:80,  borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
          <div style={{ position:"absolute", bottom:-20, left:20,  width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />

          <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(26px, 4vw, 44px)", color:"#fff", marginBottom:16, position:"relative" }}>
            Ready to Find Your Perfect Helper?
          </h2>
          <p style={{ color:"rgba(255,255,255,0.8)", fontSize:17, maxWidth:500, margin:"0 auto 36px", lineHeight:1.7 }}>
            Join thousands of happy families across India who found reliable domestic help through GharSeva.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button
              onClick={() => setPage("browse")}
              style={{ background:"#fff", color:"#1d4ed8", border:"none", borderRadius:50, padding:"14px 36px", fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"DM Sans, sans-serif", boxShadow:"0 4px 16px rgba(0,0,0,0.15)", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}
            >
              Find Help Now
            </button>
            <button
              onClick={() => setPage("register")}
              style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.4)", borderRadius:50, padding:"14px 36px", fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, sans-serif", transition:"all 0.2s", backdropFilter:"blur(10px)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            >
              Register as Helper
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
