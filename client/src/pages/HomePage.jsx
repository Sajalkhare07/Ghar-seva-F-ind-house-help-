// client/src/pages/HomePage.jsx
import { useState, useEffect, useRef } from "react";
import { TESTIMONIALS } from "../data/helpers";

// ══════════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL HOOK
// Watches elements and adds .visible class when they enter the viewport
// ══════════════════════════════════════════════════════════════════════════════
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Once revealed, stop watching (animation plays once)
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe all elements with reveal classes
    const targets = document.querySelectorAll(
      ".reveal, .reveal-scale, .reveal-left"
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

// ══════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ══════════════════════════════════════════════════════════════════════════════
const useCounter = (target, duration = 1800) => {
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

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const StatCard = ({ value, suffix, label, icon }) => {
  const count = useCounter(value);
  return (
    <div
      style={{
        background: "#fff", border: "1px solid #e8edf5", borderRadius: 16,
        padding: "22px 18px", textAlign: "center",
        boxShadow: "0 2px 10px rgba(37,99,235,0.06)", transition: "all 0.25s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 10px rgba(37,99,235,0.06)"; }}
    >
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 30, color: "#1d4ed8", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginTop: 5, fontWeight: 500, letterSpacing: "0.3px" }}>{label}</div>
    </div>
  );
};

const ServicePill = ({ icon, name, count, color, bg, onClick }) => (
  <button onClick={onClick}
    style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 18px", borderRadius: 50, background: bg, border: `1.5px solid ${color}22`, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color, outline: "none", letterSpacing: "0.01em" }}
    onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 16px ${color}33`; }}
    onMouseLeave={e => { e.currentTarget.style.background = bg;    e.currentTarget.style.color = color; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span>{name}</span>
    <span style={{ background: `${color}18`, color, borderRadius: 50, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{count}</span>
  </button>
);

// ── STEP CARD — scroll reveal with unfold animation ────────────────────────
const StepCard = ({ number, icon, title, desc, delay }) => (
  <div
    className={`reveal-scale reveal-delay-${delay}`}
    style={{
      background: "#fff", borderRadius: 20, padding: "32px 28px",
      border: "1.5px solid #e8edf5",
      boxShadow: "0 2px 10px rgba(37,99,235,0.05)",
      position: "relative", overflow: "hidden",
      transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(37,99,235,0.13)"; e.currentTarget.style.transform = "translateY(-5px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8edf5"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(37,99,235,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    {/* Ghost step number */}
    <div style={{ position: "absolute", top: -8, right: 0, fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 80, color: "#2563eb", opacity: 0.04, lineHeight: 1, userSelect: "none", letterSpacing: "-4px" }}>{number}</div>

    {/* Step indicator pill */}
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 50, padding: "4px 12px", marginBottom: 18 }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "0.8px", textTransform: "uppercase" }}>Step {number}</span>
    </div>

    {/* Icon */}
    <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18, border: "1px solid #bfdbfe" }}>
      {icon}
    </div>

    <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 10, color: "#0f172a", letterSpacing: "-0.01em" }}>{title}</h3>
    <p style={{ color: "#64748b", lineHeight: 1.75, fontSize: 14, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
  </div>
);

// ── TESTIMONIAL CARD — scroll reveal ──────────────────────────────────────
const TestimonialCard = ({ t, delay }) => (
  <div
    className={`reveal reveal-delay-${delay}`}
    style={{
      background: "#fff", borderRadius: 20, padding: "28px 26px",
      border: "1.5px solid #e8edf5",
      boxShadow: "0 2px 10px rgba(37,99,235,0.05)",
      transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
      display: "flex", flexDirection: "column", gap: 16,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(37,99,235,0.11)"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 10px rgba(37,99,235,0.05)"; e.currentTarget.style.borderColor = "#e8edf5"; }}
  >
    {/* Quote mark */}
    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, lineHeight: 1, color: "#bfdbfe", fontStyle: "italic", marginBottom: -8 }}>"</div>

    {/* Stars */}
    <div style={{ display: "flex", gap: 2 }}>
      {"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 13 }}>{s}</span>)}
    </div>

    <p style={{ color: "#334155", lineHeight: 1.8, fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: 400, flex: 1, fontStyle: "italic" }}>
      {t.text}
    </p>

    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0 }}>
        {t.avatar}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>{t.name}</div>
        <div style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{t.role} · {t.city}</div>
      </div>
    </div>
  </div>
);

// ── WHY CARD — scroll reveal ───────────────────────────────────────────────
const WhyCard = ({ icon, title, desc, color, bg, delay }) => (
  <div
    className={`reveal reveal-delay-${delay}`}
    style={{
      background: "#f8fafc", borderRadius: 18, padding: "22px 20px",
      border: "1.5px solid #f1f5f9",
      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s, background 0.3s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 14px 32px ${color}18`; e.currentTarget.style.borderColor = `${color}28`; e.currentTarget.style.background = "#fff"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.background = "#f8fafc"; }}
  >
    <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14, border: `1px solid ${color}20` }}>
      {icon}
    </div>
    <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h3>
    <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION HEADING HELPER
// ══════════════════════════════════════════════════════════════════════════════
const SectionHeading = ({ badge, badgeBg, badgeColor, badgeBorder, title, highlight, subtitle }) => (
  <div className="reveal" style={{ textAlign: "center", marginBottom: 52 }}>
    <div style={{ display: "inline-block", background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`, borderRadius: 50, padding: "5px 16px", fontSize: 11, fontWeight: 700, marginBottom: 14, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
      {badge}
    </div>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(26px, 4vw, 40px)", color: "#0f172a", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
      {title}{" "}
      {highlight && (
        <span style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>
          {highlight}
        </span>
      )}
    </h2>
    {subtitle && (
      <p style={{ color: "#64748b", fontSize: 16, marginTop: 12, maxWidth: 460, margin: "12px auto 0", fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
        {subtitle}
      </p>
    )}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HOMEPAGE
// ══════════════════════════════════════════════════════════════════════════════
const HomePage = ({ setPage }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchCity, setSearchCity]           = useState("");
  const [searchService, setSearchService]     = useState("");

  // Initialise scroll reveal after mount
  useScrollReveal();

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="video-hero-wrapper" style={{ borderBottom: "1px solid #e2e8f0", paddingTop: 100, paddingBottom: 88 }}>
        <video className="video-hero-bg" autoPlay muted loop playsInline>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="video-hero-overlay" />

        {/* Blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 380, height: 380, borderRadius: "50%", background: "rgba(37,99,235,0.07)", pointerEvents: "none", zIndex: 2 }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(124,58,237,0.05)", pointerEvents: "none", zIndex: 2 }} />

        <div className="video-hero-content" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>

          {/* Live badge */}
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 50, padding: "6px 16px", marginBottom: 28, fontSize: 12, color: "#1d4ed8", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.3px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
            Now live in Indore, Bhopal & Delhi
          </div>

          {/* Headline — Playfair Display */}
          <h1 className="fade-up-1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(34px, 5.5vw, 68px)", lineHeight: 1.1, color: "#0f172a", maxWidth: 820, margin: "0 auto 20px", letterSpacing: "-0.03em" }}>
            Find Trusted{" "}
            <span style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>
              Domestic Helpers
            </span>{" "}
            Near You
          </h1>

          <p className="fade-up-2" style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "#475569", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
            Verified maids, cooks & cleaners — affordable prices, transparent reviews, zero middlemen.
          </p>

          {/* Search bar */}
          <div className="fade-up-3" style={{ maxWidth: 620, margin: "0 auto 48px", background: "#fff", borderRadius: 60, border: isSearchFocused ? "2px solid #2563eb" : "2px solid #e2e8f0", boxShadow: isSearchFocused ? "0 0 0 4px rgba(37,99,235,0.08), 0 8px 30px rgba(37,99,235,0.12)" : "0 4px 20px rgba(0,0,0,0.07)", padding: "8px 8px 8px 22px", display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s" }}>
            <span style={{ fontSize: 18 }}>🏙️</span>
            <select value={searchCity} onChange={e => setSearchCity(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#0f172a", flex: 1, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              <option value="">Select City</option>
              {["Indore", "Bhopal", "Delhi"].map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{ width: 1, height: 26, background: "#e2e8f0", flexShrink: 0 }} />
            <span style={{ fontSize: 18 }}>🧹</span>
            <select value={searchService} onChange={e => setSearchService(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#0f172a", flex: 1, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              <option value="">Service Type</option>
              {["Maid", "Cook", "Cleaner", "Cook+Maid"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setPage("browse")}
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", borderRadius: 50, padding: "11px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 12px rgba(37,99,235,0.32)", transition: "all 0.2s", letterSpacing: "0.01em" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.42)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.32)"; }}
            >
              Find Help →
            </button>
          </div>

          {/* Service pills */}
          <div className="fade-up-3" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <ServicePill icon="🧹" name="Maid"      count="180+" color="#2563eb" bg="#eff6ff" onClick={() => setPage("browse")} />
            <ServicePill icon="👨‍🍳" name="Cook"      count="120+" color="#7c3aed" bg="#f5f3ff" onClick={() => setPage("browse")} />
            <ServicePill icon="✨"  name="Cleaner"   count="90+"  color="#0891b2" bg="#ecfeff" onClick={() => setPage("browse")} />
            <ServicePill icon="🏠" name="Cook+Maid" count="60+"  color="#059669" bg="#ecfdf5" onClick={() => setPage("browse")} />
          </div>

          {/* Stat cards */}
          <div className="fade-up-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 14, maxWidth: 680, margin: "0 auto" }}>
            <StatCard value={500} suffix="+"  label="Verified Helpers" icon="✅" />
            <StatCard value={10}  suffix="K+" label="Happy Families"   icon="🏠" />
            <StatCard value={3}   suffix=""   label="Cities Covered"   icon="🏙️" />
            <StatCard value={48}  suffix="★"  label="Avg Rating 4.8"  icon="⭐" />
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS — scroll reveal cards ══════════════════════════════ */}
      <section style={{ padding: "88px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeading
          badge="Simple Process"
          badgeBg="#eff6ff" badgeColor="#2563eb" badgeBorder="#bfdbfe"
          title="How"
          highlight="GharSeva Works"
          subtitle="Three simple steps to find your perfect domestic helper"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 24 }}>
          <StepCard delay={1} number="01" icon="🔍" title="Search & Filter"
            desc="Browse verified helpers by city, service type, price range and availability. Smart filters help you find the right match in minutes." />
          <StepCard delay={2} number="02" icon="📋" title="View Full Profiles"
            desc="Check real ratings, genuine reviews, detailed skills, experience and transparent pricing before making any decision." />
          <StepCard delay={3} number="03" icon="📞" title="Connect Directly"
            desc="Call or WhatsApp the helper directly. No middlemen, no hidden commission. Simple, honest, and instant." />
        </div>
      </section>

      {/* ══ WHY GHARSEVA — scroll reveal cards ══════════════════════════════ */}
      <section style={{ background: "#fff", padding: "88px 24px", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeading
            badge="Why Us"
            badgeBg="#f5f3ff" badgeColor="#7c3aed" badgeBorder="#ddd6fe"
            title="Why Choose"
            highlight="GharSeva?"
            subtitle="Built specifically for bachelors and working professionals in Indian cities"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
            <WhyCard delay={1} icon="🛡️" title="Background Verified"  desc="Every helper passes our verification before being listed on the platform."     color="#2563eb" bg="#eff6ff" />
            <WhyCard delay={2} icon="💰" title="Transparent Pricing"   desc="See the exact monthly price upfront. No hidden charges, ever."                  color="#7c3aed" bg="#f5f3ff" />
            <WhyCard delay={3} icon="⭐" title="Real Reviews"          desc="Genuine ratings from verified families and working professionals only."          color="#d97706" bg="#fef9c3" />
            <WhyCard delay={4} icon="📱" title="Direct Connection"     desc="Contact helpers via call or WhatsApp directly. Zero commission."                 color="#059669" bg="#ecfdf5" />
            <WhyCard delay={5} icon="📍" title="Locality Based"        desc="Find helpers in your specific area, not just by city."                          color="#0891b2" bg="#ecfeff" />
            <WhyCard delay={6} icon="⚡" title="Instant Access"        desc="No approval wait. Connect with available helpers right now."                    color="#dc2626" bg="#fef2f2" />
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS — scroll reveal cards ══════════════════════════════ */}
      <section style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeading
            badge="Real Reviews"
            badgeBg="#f0fdf4" badgeColor="#15803d" badgeBorder="#bbf7d0"
            title="What People"
            highlight="Say"
            subtitle="Real stories from families and professionals across India"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} t={t} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 24px 88px" }}>
        <div className="reveal" style={{ maxWidth: 840, margin: "0 auto", background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #7c3aed 100%)", borderRadius: 28, padding: "60px 48px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 20px 60px rgba(37,99,235,0.28)" }}>
          <div style={{ position: "absolute", top: 16,    right: 36,  width: 90,  height: 90,  borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: -24, left: 16,  width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 42px)", color: "#fff", marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.2, fontStyle: "italic" }}>
            Ready to Find Your Perfect Helper?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>
            Join thousands of happy families across India who found reliable domestic help through GharSeva.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("browse")}
              style={{ background: "#fff", color: "#1d4ed8", border: "none", borderRadius: 50, padding: "13px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "all 0.2s", letterSpacing: "0.01em" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}
            >
              Find Help Now
            </button>
            <button onClick={() => setPage("register")}
              style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.38)", borderRadius: 50, padding: "13px 36px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.24)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
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