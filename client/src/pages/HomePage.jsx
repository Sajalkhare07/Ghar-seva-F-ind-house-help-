import { useEffect } from "react";
import { TESTIMONIALS } from "../data/helpers";

const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    document
      .querySelectorAll(".reveal, .reveal-scale, .reveal-left")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const services = [
  { title: "Maid", subtitle: "Daily home support", tone: "#102A43" },
  { title: "Cook", subtitle: "Home-cooked meals", tone: "#1B9C85" },
  { title: "Cleaner", subtitle: "Deep and routine cleaning", tone: "#4A6572" },
  { title: "Cook + Maid", subtitle: "Flexible mixed support", tone: "#4A6572" },
];

const whyItems = [
  { title: "Verified listings", text: "Profiles stay hidden until documents are reviewed by the admin team." },
  { title: "Simple contact flow", text: "Families can browse, compare, and connect without clutter or confusion." },
  { title: "Designed for trust", text: "Cleaner cards, stronger hierarchy, and calmer details help people decide faster." },
];

const steps = [
  { label: "1", title: "Browse nearby helpers", text: "Filter by city, service, and monthly budget to focus on relevant profiles." },
  { label: "2", title: "Review the profile", text: "See service details, availability, pricing, reviews, and verified helper photos." },
  { label: "3", title: "Send a request", text: "Reach out with confidence once the right match feels clear." },
];

const HomePage = ({ setPage }) => {
  useScrollReveal();

  return (
    <div className="page-content" style={{ minHeight: "100vh", paddingTop: 108 }}>
      <section style={{ padding: "12px 24px 56px" }}>
        <div
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 26,
            alignItems: "stretch",
          }}
        >
          <div className="glass reveal-left" style={{ borderRadius: 38, padding: "54px 48px", background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,247,249,0.94))" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "rgba(48,78,87,0.08)", color: "var(--accent)", fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
              Modern India Minimal
            </div>
            <h1 style={{ fontSize: "clamp(42px, 7vw, 76px)", lineHeight: 1.02, maxWidth: 680, marginBottom: 18 }}>
              Trusted domestic help,
              <span className="gradient-text"> beautifully simplified.</span>
            </h1>
            <p style={{ maxWidth: 560, color: "var(--text2)", fontSize: 17, lineHeight: 1.9, marginBottom: 30 }}>
              GharSeva helps families discover verified maids, cooks, and cleaners in a calmer, more trustworthy way. The experience feels premium, but it stays easy to use.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <button className="btn-primary" onClick={() => setPage("browse")}>Browse Helpers</button>
              <button className="btn-outline" onClick={() => setPage("register")}>Register as Helper</button>
            </div>
            <div style={{ color: "var(--text3)", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "fit-content" }} onClick={() => setPage("admin")}>
              Admin review access
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginTop: 34 }}>
              {[
                ["500+", "verified helper profiles"],
                ["4.8/5", "average user sentiment"],
                ["3 cities", "currently supported"],
              ].map(([value, label]) => (
                <div key={label} style={{ padding: "14px 0", borderTop: "1px solid rgba(74,101,114,0.18)" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>{value}</div>
                  <div style={{ color: "var(--text3)", fontSize: 13 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-scale" style={{ display: "grid", gap: 18 }}>
            <div className="glass" style={{ borderRadius: 34, padding: 24, background: "linear-gradient(160deg, rgba(255,255,255,0.98), rgba(239,245,248,0.94))" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Quick Match</div>
                  <h3 style={{ fontSize: 28, marginBottom: 6 }}>Find by service</h3>
                  <p style={{ color: "var(--text2)", fontSize: 14 }}>A simpler first step for busy families.</p>
                </div>
                <div style={{ width: 58, height: 58, borderRadius: 18, background: "rgba(27,156,133,0.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", fontSize: 24 }}>+</div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {services.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setPage("browse")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      background: "rgba(255,255,255,0.96)",
                      border: "1px solid rgba(74,101,114,0.16)",
                      borderRadius: 18,
                      padding: "14px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: "var(--text)" }}>{item.title}</div>
                      <div style={{ color: "var(--text3)", fontSize: 13 }}>{item.subtitle}</div>
                    </div>
                    <div style={{ width: 12, height: 12, borderRadius: 999, background: item.tone }} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div className="glass" style={{ borderRadius: 28, padding: 22 }}>
                <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>What improves</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 10 }}>Trust at first glance</div>
                <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.8 }}>Real helper photos, softer cards, and better spacing make every profile feel more credible.</p>
              </div>
              <div className="glass" style={{ borderRadius: 28, padding: 22, background: "var(--grad-soft)" }}>
                <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Design feeling</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 10 }}>Warm, calm, modern</div>
                <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.8 }}>Terracotta and teal add personality without losing clarity or ease of use.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 24px 56px" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 26 }}>
            <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Why GharSeva</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 10 }}>A marketplace that feels human, not mechanical.</h2>
            <p style={{ color: "var(--text2)", maxWidth: 620, fontSize: 16, lineHeight: 1.8 }}>The redesign keeps the product simple, but makes the whole journey feel warmer, more intentional, and easier to trust.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {whyItems.map((item, index) => (
              <div key={item.title} className={`glass reveal reveal-delay-${index + 1}`} style={{ borderRadius: 28, padding: 26 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: index === 1 ? "rgba(48,78,87,0.10)" : "rgba(27,156,133,0.10)", marginBottom: 18 }} />
                <h3 style={{ fontSize: 26, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.85 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 24px 56px" }}>
        <div className="glass" style={{ maxWidth: 1220, margin: "0 auto", borderRadius: 36, padding: "36px 34px" }}>
          <div className="reveal" style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 26 }}>
            <div>
              <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>How it works</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>Simple steps, cleaner decisions.</h2>
            </div>
            <p style={{ color: "var(--text2)", maxWidth: 420, lineHeight: 1.8 }}>The app should never make people work hard just to understand what to do next.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {steps.map((step, index) => (
              <div key={step.label} className={`reveal-scale reveal-delay-${index + 1}`} style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(74,101,114,0.16)", borderRadius: 28, padding: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: 16 }}>{step.label}</div>
                <h3 style={{ fontSize: 24, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.85 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 24px 72px" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 24 }}>
            <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Voices</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", marginBottom: 8 }}>Real responses from people using the platform.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
              <div key={testimonial.name} className={`glass reveal reveal-delay-${index + 1}`} style={{ borderRadius: 28, padding: 24 }}>
                <div style={{ color: "var(--gold)", marginBottom: 12, fontSize: 14 }}>*****</div>
                <p style={{ color: "var(--text)", fontSize: 15, lineHeight: 1.9, marginBottom: 18 }}>
                  {testimonial.text}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{testimonial.name}</div>
                    <div style={{ color: "var(--text3)", fontSize: 13 }}>{testimonial.role} - {testimonial.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;