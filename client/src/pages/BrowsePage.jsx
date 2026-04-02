// import { useState, useEffect } from "react";
// import HelperCard from "../components/HelperCard";
// import SkeletonCard from "../components/SkeletonCard";
// import { getHelpers } from "../api/index";
// import { CITIES, SERVICES } from "../data/helpers";

// const BrowsePage = ({ onView, onSave, savedIds }) => {
//   const [helpers, setHelpers]   = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState("");
//   const [city, setCity]         = useState("All Cities");
//   const [service, setService]   = useState("All Services");
//   const [maxPrice, setMaxPrice] = useState(8000);
//   const [search, setSearch]     = useState("");

//   // ── Fetch helpers from MongoDB ──────────────────────────────────────────────
//   const fetchHelpers = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const params = {};
//       if (city    !== "All Cities")    params.city    = city;
//       if (service !== "All Services")  params.service = service;
//       if (maxPrice < 8000)             params.maxPrice = maxPrice;

//       const res = await getHelpers(params);
//       setHelpers(res.data.data);
//     } catch (err) {
//       setError("Failed to load helpers. Is the backend running?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch on mount and whenever filters change
//   useEffect(() => {
//     fetchHelpers();
//   }, [city, service, maxPrice]);

//   // Client-side search filter
//   const filtered = helpers.filter(h => {
//     if (!search) return true;
//     return (
//       h.name.toLowerCase().includes(search.toLowerCase()) ||
//       h.area.toLowerCase().includes(search.toLowerCase())
//     );
//   });

//   return (
//     <div className="page-content" style={{ paddingTop:80, minHeight:"100vh", background:"#f8fafc" }}>
//       <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px" }}>

//         {/* Page heading */}
//         <div style={{ marginBottom:32 }}>
//           <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(28px, 4vw, 44px)", marginBottom:8, color:"#0f172a" }}>
//             Find{" "}
//             <span style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
//               Helpers
//             </span>{" "}
//             Near You
//           </h1>
//           <p style={{ color:"#64748b" }}>
//             {loading ? "Loading..." : `${filtered.length} helper${filtered.length !== 1 ? "s" : ""} found`}
//           </p>
//         </div>

//         {/* Filter bar */}
//         <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:20, marginBottom:28, display:"flex", gap:14, flexWrap:"wrap", alignItems:"flex-end", boxShadow:"0 2px 8px rgba(37,99,235,0.06)" }}>

//           <div style={{ flex:1, minWidth:180 }}>
//             <label style={{ display:"block", color:"#475569", fontSize:12, fontWeight:600, marginBottom:6, letterSpacing:"0.5px" }}>SEARCH</label>
//             <input className="input-field" placeholder="Search by name or area..."
//               value={search} onChange={e => setSearch(e.target.value)} />
//           </div>

//           <div style={{ flex:1, minWidth:150 }}>
//             <label style={{ display:"block", color:"#475569", fontSize:12, fontWeight:600, marginBottom:6, letterSpacing:"0.5px" }}>CITY</label>
//             <select className="input-field" value={city} onChange={e => setCity(e.target.value)}>
//               {CITIES.map(c => <option key={c}>{c}</option>)}
//             </select>
//           </div>

//           <div style={{ flex:1, minWidth:150 }}>
//             <label style={{ display:"block", color:"#475569", fontSize:12, fontWeight:600, marginBottom:6, letterSpacing:"0.5px" }}>SERVICE</label>
//             <select className="input-field" value={service} onChange={e => setService(e.target.value)}>
//               {SERVICES.map(s => <option key={s}>{s}</option>)}
//             </select>
//           </div>

//           <div style={{ flex:1, minWidth:180 }}>
//             <label style={{ display:"block", color:"#475569", fontSize:12, fontWeight:600, marginBottom:6, letterSpacing:"0.5px" }}>
//               MAX PRICE: ₹{maxPrice.toLocaleString()}
//             </label>
//             <input type="range" min={0} max={8000} step={500} value={maxPrice}
//               onChange={e => setMaxPrice(+e.target.value)}
//               style={{ width:"100%", accentColor:"#2563eb" }} />
//           </div>

//           <button
//             onClick={fetchHelpers}
//             style={{ padding:"12px 20px", borderRadius:10, background:"#2563eb", color:"#fff", border:"none", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:14, whiteSpace:"nowrap", boxShadow:"0 4px 12px rgba(37,99,235,0.3)", transition:"all 0.2s" }}
//             onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
//             onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
//           >
//             🔄 Refresh
//           </button>
//         </div>

//         {/* Error state */}
//         {error && (
//           <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", borderRadius:12, padding:"16px 20px", marginBottom:24, fontSize:14 }}>
//             ❌ {error}
//           </div>
//         )}

//         {/* Results */}
//         {loading ? (
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20 }}>
//             {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div style={{ textAlign:"center", padding:"80px 20px", background:"#fff", borderRadius:20, border:"1px solid #e2e8f0" }}>
//             <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
//             <h3 style={{ fontWeight:700, marginBottom:8, color:"#0f172a" }}>No helpers found</h3>
//             <p style={{ color:"#64748b" }}>Try adjusting your filters or add helpers via the Register page</p>
//           </div>
//         ) : (
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20 }}>
//             {filtered.map(h => (
//               <HelperCard
//                 key={h._id}
//                 helper={{ ...h, id: h._id }}
//                 onView={onView}
//                 onSave={onSave}
//                 saved={savedIds.map(String).includes(String(h._id))}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BrowsePage;



import { useState, useEffect } from "react";
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
      setHelpers(res.data.data);
    } catch {
      setError("Failed to load helpers. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
  }, [city, service, maxPrice]);

  const filtered = helpers.filter((h) => {
    if (!search) return true;

    return (
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.area.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div
      className="page-content"
      style={{ paddingTop: 80, minHeight: "100vh", background: "#f8fafc" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 44px)",
              marginBottom: 8,
              color: "#0f172a",
            }}
          >
            Find{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Helpers
            </span>{" "}
            Near You
          </h1>
          <p style={{ color: "#64748b" }}>
            {loading
              ? "Loading..."
              : `${filtered.length} helper${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 20,
            marginBottom: 28,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "flex-end",
            boxShadow: "0 2px 8px rgba(37,99,235,0.06)",
          }}
        >
          <div style={{ flex: 1, minWidth: 180 }}>
            <label
              style={{
                display: "block",
                color: "#475569",
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
                color: "#475569",
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
                color: "#475569",
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
                color: "#475569",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                letterSpacing: "0.5px",
              }}
            >
              MAX PRICE: Rs.{maxPrice.toLocaleString()}
            </label>
            <input
              type="range"
              min={0}
              max={8000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              style={{ width: "100%", accentColor: "#2563eb" }}
            />
          </div>

          <button
            onClick={fetchHelpers}
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              transition: "all 0.2s",
            }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

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
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>Search</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
              No helpers found
            </h3>
            <p style={{ color: "#64748b" }}>
              Try adjusting your filters or add helpers via the Register page
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
                key={h._id}
                helper={{ ...h, id: h._id }}
                user={user}
                onView={onView}
                onSave={onSave}
                saved={savedIds.map(String).includes(String(h._id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
