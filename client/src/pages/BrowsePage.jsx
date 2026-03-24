// client/src/pages/BrowsePage.jsx
import { useState, useEffect } from "react";
import HelperCard from "../components/HelperCard";
import SkeletonCard from "../components/SkeletonCard";
import { CITIES, SERVICES } from "../data/helpers";

const BrowsePage = ({ helpers, onView, onSave, savedIds }) => {
  const [city, setCity]       = useState("All Cities");
  const [service, setService] = useState("All Services");
  const [maxPrice, setMaxPrice] = useState(8000);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  // Simulate loading when filters change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [city, service]);

  const filtered = helpers.filter((h) => {
    if (city !== "All Cities" && h.city !== city) return false;
    if (service !== "All Services" && h.service !== service) return false;
    if (h.price > maxPrice) return false;
    if (
      search &&
      !h.name.toLowerCase().includes(search.toLowerCase()) &&
      !h.area.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Find <span className="gradient-text">Helpers</span> Near You
          </h1>
          <p style={{ color: "var(--text2)" }}>{filtered.length} helpers found</p>
        </div>

        {/* Filter bar */}
        <div
          className="glass"
          style={{
            borderRadius: "var(--radius)",
            padding: 20,
            marginBottom: 28,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, minWidth: 180 }}>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                letterSpacing: "0.5px",
              }}
            >
              SEARCH
            </label>
            <input
              className="input-field"
              placeholder="Search by name or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, minWidth: 150 }}>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                letterSpacing: "0.5px",
              }}
            >
              CITY
            </label>
            <select
              className="input-field"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 150 }}>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                letterSpacing: "0.5px",
              }}
            >
              SERVICE
            </label>
            <select
              className="input-field"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <label
              style={{
                display: "block",
                color: "var(--text2)",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                letterSpacing: "0.5px",
              }}
            >
              MAX PRICE: ₹{maxPrice.toLocaleString()}
            </label>
            <input
              type="range"
              min={0}
              max={8000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              style={{ width: "100%", accentColor: "var(--blue)" }}
            />
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
              No helpers found
            </h3>
            <p style={{ color: "var(--text2)" }}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((h) => (
              <HelperCard
                key={h.id}
                helper={h}
                onView={onView}
                onSave={onSave}
                saved={savedIds.includes(h.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;