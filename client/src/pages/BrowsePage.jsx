import { useEffect, useMemo, useState } from "react";
import HelperCard from "../components/HelperCard";
import SkeletonCard from "../components/SkeletonCard";
import { getHelpers } from "../api/index";
import { CITIES, SERVICES } from "../data/helpers";

const BrowsePage = ({ user, onView, onSave, savedIds }) => {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("All Cities");
  const [service, setService] = useState("All Services");
  const [maxPrice, setMaxPrice] = useState(8000);
  const [search, setSearch] = useState("");

  const fetchHelpers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (city !== "All Cities") params.city = city;
      if (service !== "All Services") params.service = service;
      if (maxPrice < 8000) params.maxPrice = maxPrice;
      const res = await getHelpers(params);
      setHelpers(res.data.data || []);
    } catch {
      setError("Failed to load helpers. Please check the backend and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
  }, [city, service, maxPrice]);

  const filtered = useMemo(() => {
    return helpers.filter((helper) => {
      if (!search) return true;
      const query = search.toLowerCase();
      return helper.name.toLowerCase().includes(query) || helper.area.toLowerCase().includes(query);
    });
  }, [helpers, search]);

  return (
    <div className="page-content" style={{ paddingTop: 110, minHeight: "100vh", paddingBottom: 56 }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 24px" }}>
        <section className="glass" style={{ borderRadius: 34, padding: "34px 30px", marginBottom: 24, background: "linear-gradient(160deg, rgba(255,250,244,0.96), rgba(243,233,220,0.9))" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "end", marginBottom: 26 }}>
            <div>
              <div style={{ color: "var(--text3)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Browse helpers</div>
              <h1 style={{ fontSize: "clamp(30px, 4.4vw, 52px)", marginBottom: 10 }}>Find help that feels right for your home.</h1>
              <p style={{ color: "var(--text2)", fontSize: 16, lineHeight: 1.8, maxWidth: 620 }}>
                Filter by city, service, and budget. The new layout keeps the search simple, while giving more room to compare real approved profiles.
              </p>
            </div>
            <div style={{ textAlign: "right", minWidth: 130 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 42, lineHeight: 1 }}>{loading ? "..." : filtered.length}</div>
              <div style={{ color: "var(--text3)", fontSize: 13 }}>matching helpers</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", color: "var(--text3)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Search</label>
              <input className="input-field" placeholder="Search by helper name or locality" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--text3)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>City</label>
              <select className="input-field" value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "var(--text3)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Service</label>
              <select className="input-field" value={service} onChange={(e) => setService(e.target.value)}>
                {SERVICES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "var(--text3)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                Budget up to Rs.{maxPrice.toLocaleString()}
              </label>
              <input type="range" min={0} max={8000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%", accentColor: "#102A43" }} />
            </div>
            <button className="btn-primary" onClick={fetchHelpers}>Refresh</button>
          </div>
        </section>

        {error && (
          <div style={{ background: "#f8e7e4", color: "var(--red)", border: "1px solid rgba(182,84,69,0.16)", borderRadius: 18, padding: "14px 18px", marginBottom: 22, fontWeight: 700 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[...Array(6)].map((_, index) => <SkeletonCard key={index} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass" style={{ borderRadius: 30, padding: "72px 24px", textAlign: "center" }}>
            <h3 style={{ fontSize: 34, marginBottom: 10 }}>No helpers match these filters.</h3>
            <p style={{ color: "var(--text2)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
              Try broadening the city, service, or budget selections to see more approved listings.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {filtered.map((helper) => (
              <HelperCard
                key={helper._id}
                helper={{ ...helper, id: helper._id }}
                user={user}
                onView={onView}
                onSave={onSave}
                saved={savedIds.map(String).includes(String(helper._id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;