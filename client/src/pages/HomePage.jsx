

// client/src/pages/HomePage.jsx
// ── Video hero + real MongoDB data + professional light UI ────────────────────
// import { useState, useEffect } from "react";
// import HelperCard from "../components/HelperCard";
// import { TESTIMONIALS } from "../data/helpers";
// import { getHelpers } from "../api/index";

// // ── Animated counter ──────────────────────────────────────────────────────────
// const useCounter = (target, duration = 1800) => {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     let start = 0;
//     const step = target / (duration / 16);
//     const timer = setInterval(() => {
//       start += step;
//       if (start >= target) { setCount(target); clearInterval(timer); }
//       else setCount(Math.floor(start));
//     }, 16);
//     return () => clearInterval(timer);
//   }, [target]);
//   return count;
// };

// // ── Sub-components ────────────────────────────────────────────────────────────
// const StatCard = ({ value, suffix, label, icon }) => {
//   const count = useCounter(value);
//   return (
//     <div
//       style={{ background:"#fff", border:"1px solid #e8edf5", borderRadius:16, padding:"22px 18px", textAlign:"center", boxShadow:"0 2px 10px rgba(37,99,235,0.06)", transition:"all 0.25s" }}
//       onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(37,99,235,0.12)"; }}
//       onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 2px 10px rgba(37,99,235,0.06)"; }}
//     >
//       <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
//       <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:30, color:"#1d4ed8", lineHeight:1 }}>{count}{suffix}</div>
//       <div style={{ color:"#64748b", fontSize:12, marginTop:5, fontWeight:500 }}>{label}</div>
//     </div>
//   );
// };

// const ServicePill = ({ icon, name, count, color, bg, onClick }) => (
//   <button onClick={onClick}
//     style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 18px", borderRadius:50, background:bg, border:`1.5px solid ${color}22`, cursor:"pointer", transition:"all 0.2s", fontFamily:"DM Sans,sans-serif", fontWeight:600, fontSize:14, color, outline:"none" }}
//     onMouseEnter={e => { e.currentTarget.style.background=color; e.currentTarget.style.color="#fff"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 16px ${color}33`; }}
//     onMouseLeave={e => { e.currentTarget.style.background=bg;    e.currentTarget.style.color=color;  e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="none"; }}
//   >
//     <span style={{ fontSize:17 }}>{icon}</span>
//     <span>{name}</span>
//     <span style={{ background:`${color}18`, color, borderRadius:50, padding:"1px 8px", fontSize:11, fontWeight:700 }}>{count}</span>
//   </button>
// );

// const StepCard = ({ number, icon, title, desc }) => (
//   <div
//     style={{ background:"#fff", borderRadius:20, padding:28, border:"1.5px solid #e8edf5", boxShadow:"0 2px 10px rgba(37,99,235,0.05)", position:"relative", overflow:"hidden", transition:"all 0.3s" }}
//     onMouseEnter={e => { e.currentTarget.style.borderColor="#bfdbfe"; e.currentTarget.style.boxShadow="0 10px 32px rgba(37,99,235,0.12)"; e.currentTarget.style.transform="translateY(-4px)"; }}
//     onMouseLeave={e => { e.currentTarget.style.borderColor="#e8edf5"; e.currentTarget.style.boxShadow="0 2px 10px rgba(37,99,235,0.05)"; e.currentTarget.style.transform="translateY(0)"; }}
//   >
//     <div style={{ position:"absolute", top:-12, right:-4, fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:72, color:"#2563eb", opacity:0.04, lineHeight:1, userSelect:"none" }}>{number}</div>
//     <div style={{ width:50, height:50, borderRadius:14, background:"linear-gradient(135deg,#eff6ff,#dbeafe)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16, border:"1px solid #bfdbfe" }}>{icon}</div>
//     <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:17, marginBottom:8, color:"#0f172a" }}>{title}</h3>
//     <p style={{ color:"#64748b", lineHeight:1.7, fontSize:14 }}>{desc}</p>
//   </div>
// );

// const TestimonialCard = ({ t }) => (
//   <div
//     style={{ background:"#fff", borderRadius:20, padding:28, border:"1.5px solid #e8edf5", boxShadow:"0 2px 10px rgba(37,99,235,0.05)", transition:"all 0.3s", display:"flex", flexDirection:"column", gap:16 }}
//     onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(37,99,235,0.10)"; e.currentTarget.style.borderColor="#bfdbfe"; }}
//     onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 2px 10px rgba(37,99,235,0.05)"; e.currentTarget.style.borderColor="#e8edf5"; }}
//   >
//     <div style={{ display:"flex", gap:2 }}>
//       {"★★★★★".split("").map((s,i) => <span key={i} style={{ color:"#f59e0b", fontSize:14 }}>{s}</span>)}
//     </div>
//     <p style={{ color:"#334155", lineHeight:1.75, fontSize:15, fontStyle:"italic", flex:1 }}>"{t.text}"</p>
//     <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//       <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:14, color:"#fff", flexShrink:0 }}>{t.avatar}</div>
//       <div>
//         <div style={{ fontWeight:600, fontSize:15, color:"#0f172a" }}>{t.name}</div>
//         <div style={{ color:"#64748b", fontSize:13 }}>{t.role} · {t.city}</div>
//       </div>
//     </div>
//   </div>
// );

// const CityBadge = ({ city, count, active, onClick }) => (
//   <button onClick={onClick}
//     style={{ padding:"7px 18px", borderRadius:50, cursor:"pointer", background:active?"#2563eb":"#fff", color:active?"#fff":"#64748b", border:active?"none":"1px solid #e2e8f0", fontFamily:"DM Sans,sans-serif", fontWeight:600, fontSize:13, transition:"all 0.2s", boxShadow:active?"0 4px 12px rgba(37,99,235,0.25)":"none", outline:"none" }}
//   >
//     {city} <span style={{ opacity:0.7, fontSize:11 }}>({count})</span>
//   </button>
// );

// const SkeletonCard = () => (
//   <div style={{ background:"#fff", borderRadius:18, padding:20, border:"1.5px solid #e8edf5" }}>
//     <div style={{ display:"flex", gap:12, marginBottom:16 }}>
//       <div className="skeleton" style={{ width:48, height:48, borderRadius:"50%", flexShrink:0 }} />
//       <div style={{ flex:1 }}>
//         <div className="skeleton" style={{ height:15, marginBottom:8, borderRadius:6 }} />
//         <div className="skeleton" style={{ height:11, width:"60%", borderRadius:6 }} />
//       </div>
//     </div>
//     <div className="skeleton" style={{ height:11, marginBottom:8, borderRadius:6 }} />
//     <div className="skeleton" style={{ height:11, width:"75%", marginBottom:16, borderRadius:6 }} />
//     <div className="skeleton" style={{ height:38, borderRadius:50 }} />
//   </div>
// );

// // ── MAIN HOMEPAGE ─────────────────────────────────────────────────────────────
// const HomePage = ({ setPage, onView, onSave, savedIds }) => {
//   const [featuredHelpers, setFeaturedHelpers] = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [activeCity, setActiveCity]           = useState("All");
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
//   const [searchCity, setSearchCity]           = useState("");
//   const [searchService, setSearchService]     = useState("");
//   const [totalCount, setTotalCount]           = useState(15);

//   useEffect(() => {
//     const fetchFeatured = async () => {
//       setLoading(true);
//       try {
//         const res = await getHelpers({ verified: true });
//         const all = res.data.data;
//         setTotalCount(all.length || 15);
//         const top = all
//           .filter(h => h.rating >= 4.4)
//           .sort((a, b) => b.rating - a.rating)
//           .slice(0, 6);
//         setFeaturedHelpers(top);
//       } catch {
//         // fallback silently
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFeatured();
//   }, []);

//   const cityCounts = {
//     All:    featuredHelpers.length,
//     Indore: featuredHelpers.filter(h => h.city === "Indore").length,
//     Bhopal: featuredHelpers.filter(h => h.city === "Bhopal").length,
//     Delhi:  featuredHelpers.filter(h => h.city === "Delhi").length,
//   };

//   const filtered = activeCity === "All"
//     ? featuredHelpers
//     : featuredHelpers.filter(h => h.city === activeCity);

//   return (
//     <div style={{ background:"#f8fafc", minHeight:"100vh" }}>

//       {/* ══ HERO WITH VIDEO BACKGROUND ═════════════════════════════════════ */}
//       <section className="video-hero-wrapper" style={{
//         borderBottom:"1px solid #e2e8f0",
//         paddingTop:100, paddingBottom:80,
//       }}>
//         {/* Looping background video — subtle, behind overlay */}
//         <video
//           className="video-hero-bg"
//           autoPlay muted loop playsInline
//           poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80"
//         >
//           {/* 
//             IMPORTANT: Replace the src below with a real local video file.
//             Place your video at: client/public/hero-video.mp4
//             Then change src to: /hero-video.mp4
            
//             For now it uses a free stock video from Pexels:
//           */}
//           <source src="https://www.pexels.com/download/video/4270204/" type="video/mp4" />
//         </video>

//         {/* Gradient overlay on top of video */}
//         <div className="video-hero-overlay" />

//         {/* Decorative blobs */}
//         <div style={{ position:"absolute", top:-60, right:-60, width:380, height:380, borderRadius:"50%", background:"rgba(37,99,235,0.07)", pointerEvents:"none", zIndex:2 }} />
//         <div style={{ position:"absolute", bottom:-80, left:-80, width:280, height:280, borderRadius:"50%", background:"rgba(124,58,237,0.05)", pointerEvents:"none", zIndex:2 }} />

//         <div className="video-hero-content" style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", textAlign:"center" }}>

//           {/* Live badge */}
//           <div className="fade-up" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:50, padding:"6px 16px", marginBottom:24, fontSize:13, color:"#1d4ed8", fontWeight:600 }}>
//             <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 0 3px rgba(34,197,94,0.2)" }} />
//             Now live in Indore, Bhopal & Delhi
//           </div>

//           {/* Headline */}
//           <h1 className="fade-up-1" style={{
//             fontFamily:"Syne,sans-serif", fontWeight:800,
//             fontSize:"clamp(34px,5.5vw,66px)", lineHeight:1.1,
//             color:"#0f172a", maxWidth:820, margin:"0 auto 18px",
//           }}>
//             Find Trusted{" "}
//             <span style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
//               Domestic Helpers
//             </span>{" "}
//             Near You
//           </h1>

//           <p className="fade-up-2" style={{ fontSize:"clamp(15px,1.8vw,19px)", color:"#475569", maxWidth:560, margin:"0 auto 36px", lineHeight:1.8 }}>
//             Verified maids, cooks & cleaners — affordable prices, transparent reviews, zero middlemen.
//           </p>

//           {/* Search bar */}
//           <div className="fade-up-3" style={{
//             maxWidth:620, margin:"0 auto 44px", background:"#fff",
//             borderRadius:60,
//             border: isSearchFocused ? "2px solid #2563eb" : "2px solid #e2e8f0",
//             boxShadow: isSearchFocused
//               ? "0 0 0 4px rgba(37,99,235,0.08), 0 8px 30px rgba(37,99,235,0.12)"
//               : "0 4px 20px rgba(0,0,0,0.07)",
//             padding:"8px 8px 8px 22px",
//             display:"flex", alignItems:"center", gap:10,
//             transition:"all 0.3s",
//           }}>
//             <span style={{ fontSize:19 }}>🏙️</span>
//             <select value={searchCity} onChange={e => setSearchCity(e.target.value)}
//               onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
//               style={{ border:"none", outline:"none", background:"transparent", fontSize:15, color:"#0f172a", flex:1, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}
//             >
//               <option value="">Select City</option>
//               {["Indore","Bhopal","Delhi"].map(c => <option key={c}>{c}</option>)}
//             </select>
//             <div style={{ width:1, height:26, background:"#e2e8f0", flexShrink:0 }} />
//             <span style={{ fontSize:19 }}>🧹</span>
//             <select value={searchService} onChange={e => setSearchService(e.target.value)}
//               onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
//               style={{ border:"none", outline:"none", background:"transparent", fontSize:15, color:"#0f172a", flex:1, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}
//             >
//               <option value="">Service Type</option>
//               {["Maid","Cook","Cleaner","Cook+Maid"].map(s => <option key={s}>{s}</option>)}
//             </select>
//             <button onClick={() => setPage("browse")}
//               style={{ background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff", border:"none", borderRadius:50, padding:"11px 26px", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"DM Sans,sans-serif", boxShadow:"0 4px 12px rgba(37,99,235,0.32)", transition:"all 0.2s" }}
//               onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(37,99,235,0.42)"; }}
//               onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow="0 4px 12px rgba(37,99,235,0.32)"; }}
//             >Find Help →</button>
//           </div>

//           {/* Service pills */}
//           <div className="fade-up-3" style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:52 }}>
//             <ServicePill icon="🧹" name="Maid"      count="180+" color="#2563eb" bg="#eff6ff" onClick={() => setPage("browse")} />
//             <ServicePill icon="👨‍🍳" name="Cook"      count="120+" color="#7c3aed" bg="#f5f3ff" onClick={() => setPage("browse")} />
//             <ServicePill icon="✨"  name="Cleaner"   count="90+"  color="#0891b2" bg="#ecfeff" onClick={() => setPage("browse")} />
//             <ServicePill icon="🏠" name="Cook+Maid" count="60+"  color="#059669" bg="#ecfdf5" onClick={() => setPage("browse")} />
//           </div>

//           {/* Stat cards */}
//           <div className="fade-up-4" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:14, maxWidth:680, margin:"0 auto" }}>
//             <StatCard value={totalCount} suffix="+"  label="Verified Helpers" icon="✅" />
//             <StatCard value={10}         suffix="K+" label="Happy Families"   icon="🏠" />
//             <StatCard value={3}          suffix=""   label="Cities Covered"   icon="🏙️" />
//             <StatCard value={48}         suffix="★"  label="Avg Rating 4.8"  icon="⭐" />
//           </div>
//         </div>
//       </section>

//       {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════ */}
//       <section style={{ padding:"72px 24px", maxWidth:1100, margin:"0 auto" }}>
//         <div style={{ textAlign:"center", marginBottom:44 }}>
//           <div style={{ display:"inline-block", background:"#eff6ff", color:"#2563eb", borderRadius:50, padding:"4px 16px", fontSize:12, fontWeight:700, marginBottom:12, border:"1px solid #bfdbfe", letterSpacing:"0.5px", textTransform:"uppercase" }}>
//             Simple Process
//           </div>
//           <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,40px)", color:"#0f172a" }}>
//             How{" "}
//             <span style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>GharSeva</span>{" "}
//             Works
//           </h2>
//         </div>
//         <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:22 }}>
//           <StepCard number="01" icon="🔍" title="Search & Filter"    desc="Browse verified helpers by city, service type, price range and availability. Smart filters help you find the perfect match." />
//           <StepCard number="02" icon="📋" title="View Full Profiles" desc="Check real ratings, genuine reviews, detailed skills, experience and transparent pricing before deciding." />
//           <StepCard number="03" icon="📞" title="Connect Directly"   desc="Call or WhatsApp the helper directly. No middlemen, no hidden commission. Simple and honest." />
//         </div>
//       </section>

//       {/* ══ FEATURED HELPERS — REAL MONGODB DATA ═══════════════════════════ */}
//       <section style={{ background:"#fff", padding:"72px 24px", borderTop:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9" }}>
//         <div style={{ maxWidth:1100, margin:"0 auto" }}>
//           <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:14 }}>
//             <div>
//               <div style={{ display:"inline-block", background:"#fef9c3", color:"#a16207", borderRadius:50, padding:"4px 14px", fontSize:12, fontWeight:700, marginBottom:10, border:"1px solid #fde68a", letterSpacing:"0.3px" }}>⭐ Top Rated</div>
//               <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(22px,3vw,34px)", color:"#0f172a", margin:0 }}>
//                 Featured Helpers
//                 {!loading && (
//                   <span style={{ fontSize:13, color:"#94a3b8", fontFamily:"DM Sans,sans-serif", fontWeight:400, marginLeft:10 }}>
//                     live from database
//                   </span>
//                 )}
//               </h2>
//             </div>
//             <button onClick={() => setPage("browse")}
//               style={{ background:"transparent", border:"1.5px solid #2563eb", color:"#2563eb", borderRadius:50, padding:"9px 22px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,sans-serif", transition:"all 0.2s", outline:"none" }}
//               onMouseEnter={e => { e.currentTarget.style.background="#2563eb"; e.currentTarget.style.color="#fff"; }}
//               onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#2563eb"; }}
//             >View All Helpers →</button>
//           </div>

//           {/* City filter */}
//           <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
//             {Object.entries(cityCounts).map(([city, count]) => (
//               <CityBadge key={city} city={city} count={count} active={activeCity===city} onClick={() => setActiveCity(city)} />
//             ))}
//           </div>

//           {/* Cards */}
//           {loading ? (
//             <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:18 }}>
//               {[...Array(4)].map((_,i) => <SkeletonCard key={i} />)}
//             </div>
//           ) : filtered.length === 0 ? (
//             <div style={{ textAlign:"center", padding:"48px 20px", color:"#64748b", background:"#f8fafc", borderRadius:16, border:"1px solid #e2e8f0" }}>
//               No verified helpers in {activeCity} yet.{" "}
//               <span style={{ color:"#2563eb", cursor:"pointer", fontWeight:600 }} onClick={() => setPage("browse")}>Browse all →</span>
//             </div>
//           ) : (
//             <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:18 }}>
//               {filtered.map(h => (
//                 <HelperCard
//                   key={h._id || h.id}
//                   helper={{ ...h, id: h._id || h.id }}
//                   onView={onView}
//                   onSave={onSave}
//                   saved={savedIds.includes(h._id || h.id)}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ══ WHY GHARSEVA ═══════════════════════════════════════════════════ */}
//       <section style={{ padding:"72px 24px", maxWidth:1100, margin:"0 auto" }}>
//         <div style={{ textAlign:"center", marginBottom:44 }}>
//           <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,40px)", color:"#0f172a" }}>
//             Why Choose{" "}
//             <span style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>GharSeva?</span>
//           </h2>
//           <p style={{ color:"#64748b", fontSize:16, marginTop:10, maxWidth:480, margin:"10px auto 0" }}>
//             Built specifically for bachelors and working professionals in Indian cities
//           </p>
//         </div>
//         <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:18 }}>
//           {[
//             { icon:"🛡️", title:"Background Verified",  desc:"Every helper passes our verification before being listed on the platform.",   color:"#2563eb", bg:"#eff6ff" },
//             { icon:"💰", title:"Transparent Pricing",   desc:"See the exact monthly price upfront. No hidden charges, ever.",              color:"#7c3aed", bg:"#f5f3ff" },
//             { icon:"⭐", title:"Real Reviews",          desc:"Genuine ratings from verified families and working professionals only.",      color:"#d97706", bg:"#fef9c3" },
//             { icon:"📱", title:"Direct Connection",     desc:"Contact helpers via call or WhatsApp directly. Zero commission.",            color:"#059669", bg:"#ecfdf5" },
//             { icon:"📍", title:"Locality Based",        desc:"Find helpers in your specific area, not just by city.",                     color:"#0891b2", bg:"#ecfeff" },
//             { icon:"⚡", title:"Instant Access",        desc:"No approval wait. Browse and connect with available helpers right now.",    color:"#dc2626", bg:"#fef2f2" },
//           ].map(f => (
//             <div key={f.title}
//               style={{ background:"#fff", borderRadius:18, padding:22, border:"1.5px solid #f1f5f9", boxShadow:"0 2px 6px rgba(0,0,0,0.04)", transition:"all 0.25s" }}
//               onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 28px ${f.color}16`; e.currentTarget.style.borderColor=`${f.color}28`; }}
//               onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 2px 6px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor="#f1f5f9"; }}
//             >
//               <div style={{ width:46, height:46, borderRadius:13, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:13, border:`1px solid ${f.color}20` }}>{f.icon}</div>
//               <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:15, color:"#0f172a", marginBottom:7 }}>{f.title}</h3>
//               <p style={{ color:"#64748b", fontSize:13, lineHeight:1.65 }}>{f.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
//       <section style={{ background:"#fff", padding:"72px 24px", borderTop:"1px solid #f1f5f9" }}>
//         <div style={{ maxWidth:1100, margin:"0 auto" }}>
//           <div style={{ textAlign:"center", marginBottom:44 }}>
//             <div style={{ display:"inline-block", background:"#f0fdf4", color:"#15803d", borderRadius:50, padding:"4px 16px", fontSize:12, fontWeight:700, marginBottom:12, border:"1px solid #bbf7d0", letterSpacing:"0.3px" }}>
//               💬 Real Reviews
//             </div>
//             <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,40px)", color:"#0f172a" }}>What People Say</h2>
//           </div>
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:22 }}>
//             {TESTIMONIALS.map((t,i) => <TestimonialCard key={i} t={t} />)}
//           </div>
//         </div>
//       </section>

//       {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
//       <section style={{ padding:"72px 24px" }}>
//         <div style={{
//           maxWidth:840, margin:"0 auto",
//           background:"linear-gradient(135deg,#1d4ed8 0%,#2563eb 40%,#7c3aed 100%)",
//           borderRadius:28, padding:"56px 44px", textAlign:"center",
//           position:"relative", overflow:"hidden",
//           boxShadow:"0 20px 60px rgba(37,99,235,0.28)",
//         }}>
//           <div style={{ position:"absolute", top:16,    right:36,  width:90,  height:90,  borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
//           <div style={{ position:"absolute", bottom:-24, left:16,  width:130, height:130, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
//           <div style={{ position:"absolute", top:"50%", left:"5%", transform:"translateY(-50%)", width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />

//           <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,42px)", color:"#fff", marginBottom:14, position:"relative" }}>
//             Ready to Find Your Perfect Helper?
//           </h2>
//           <p style={{ color:"rgba(255,255,255,0.82)", fontSize:16, maxWidth:480, margin:"0 auto 32px", lineHeight:1.75 }}>
//             Join thousands of happy families across India who found reliable domestic help through GharSeva.
//           </p>
//           <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
//             <button onClick={() => setPage("browse")}
//               style={{ background:"#fff", color:"#1d4ed8", border:"none", borderRadius:50, padding:"13px 34px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"DM Sans,sans-serif", boxShadow:"0 4px 16px rgba(0,0,0,0.15)", transition:"all 0.2s" }}
//               onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.2)"; }}
//               onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.15)"; }}
//             >Find Help Now</button>
//             <button onClick={() => setPage("register")}
//               style={{ background:"rgba(255,255,255,0.14)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.38)", borderRadius:50, padding:"13px 34px", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,sans-serif", transition:"all 0.2s" }}
//               onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.24)"; }}
//               onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.14)"; }}
//             >Register as Helper</button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;

// client/src/pages/HomePage.jsx
// ── Paste into: client/src/pages/HomePage.jsx ─────────────────────────────────
// REMOVED: Featured Helpers section, City filter tabs
// KEPT:    Hero, How It Works, Why GharSeva, Testimonials, CTA Banner

import { useState, useEffect } from "react";
import { TESTIMONIALS } from "../data/helpers";

// ── Animated counter ──────────────────────────────────────────────────────────
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ value, suffix, label, icon }) => {
  const count = useCounter(value);
  return (
    <div
      style={{
        background: "#fff", border: "1px solid #e8edf5", borderRadius: 16,
        padding: "22px 18px", textAlign: "center",
        boxShadow: "0 2px 10px rgba(37,99,235,0.06)",
        transition: "all 0.25s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 10px rgba(37,99,235,0.06)"; }}
    >
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 30, color: "#1d4ed8", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  );
};

// ── Service Pill ──────────────────────────────────────────────────────────────
const ServicePill = ({ icon, name, count, color, bg, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 9,
      padding: "10px 18px", borderRadius: 50,
      background: bg, border: `1.5px solid ${color}22`,
      cursor: "pointer", transition: "all 0.2s",
      fontFamily: "DM Sans, sans-serif", fontWeight: 600,
      fontSize: 14, color, outline: "none",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background  = color;
      e.currentTarget.style.color       = "#fff";
      e.currentTarget.style.transform   = "translateY(-2px)";
      e.currentTarget.style.boxShadow   = `0 6px 16px ${color}33`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background  = bg;
      e.currentTarget.style.color       = color;
      e.currentTarget.style.transform   = "translateY(0)";
      e.currentTarget.style.boxShadow   = "none";
    }}
  >
    <span style={{ fontSize: 17 }}>{icon}</span>
    <span>{name}</span>
    <span style={{ background: `${color}18`, color, borderRadius: 50, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
      {count}
    </span>
  </button>
);

// ── Step Card ─────────────────────────────────────────────────────────────────
const StepCard = ({ number, icon, title, desc }) => (
  <div
    style={{
      background: "#fff", borderRadius: 20, padding: 28,
      border: "1.5px solid #e8edf5",
      boxShadow: "0 2px 10px rgba(37,99,235,0.05)",
      position: "relative", overflow: "hidden",
      transition: "all 0.3s",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "#bfdbfe";
      e.currentTarget.style.boxShadow   = "0 10px 32px rgba(37,99,235,0.12)";
      e.currentTarget.style.transform   = "translateY(-4px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "#e8edf5";
      e.currentTarget.style.boxShadow   = "0 2px 10px rgba(37,99,235,0.05)";
      e.currentTarget.style.transform   = "translateY(0)";
    }}
  >
    {/* Ghost number */}
    <div style={{
      position: "absolute", top: -12, right: -4,
      fontFamily: "Syne, sans-serif", fontWeight: 900,
      fontSize: 72, color: "#2563eb", opacity: 0.04,
      lineHeight: 1, userSelect: "none",
    }}>{number}</div>

    <div style={{
      width: 50, height: 50, borderRadius: 14,
      background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, marginBottom: 16,
      border: "1px solid #bfdbfe",
    }}>{icon}</div>

    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8, color: "#0f172a" }}>
      {title}
    </h3>
    <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: 14 }}>{desc}</p>
  </div>
);

// ── Testimonial Card ──────────────────────────────────────────────────────────
const TestimonialCard = ({ t }) => (
  <div
    style={{
      background: "#fff", borderRadius: 20, padding: 28,
      border: "1.5px solid #e8edf5",
      boxShadow: "0 2px 10px rgba(37,99,235,0.05)",
      transition: "all 0.3s",
      display: "flex", flexDirection: "column", gap: 16,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform   = "translateY(-4px)";
      e.currentTarget.style.boxShadow   = "0 12px 32px rgba(37,99,235,0.10)";
      e.currentTarget.style.borderColor = "#bfdbfe";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform   = "translateY(0)";
      e.currentTarget.style.boxShadow   = "0 2px 10px rgba(37,99,235,0.05)";
      e.currentTarget.style.borderColor = "#e8edf5";
    }}
  >
    <div style={{ display: "flex", gap: 2 }}>
      {"★★★★★".split("").map((s, i) => (
        <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>{s}</span>
      ))}
    </div>
    <p style={{ color: "#334155", lineHeight: 1.75, fontSize: 15, fontStyle: "italic", flex: 1 }}>
      "{t.text}"
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Syne, sans-serif", fontWeight: 700,
        fontSize: 14, color: "#fff", flexShrink: 0,
      }}>{t.avatar}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>{t.name}</div>
        <div style={{ color: "#64748b", fontSize: 13 }}>{t.role} · {t.city}</div>
      </div>
    </div>
  </div>
);

// ── MAIN HOMEPAGE ─────────────────────────────────────────────────────────────
const HomePage = ({ setPage }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchCity, setSearchCity]           = useState("");
  const [searchService, setSearchService]     = useState("");

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section
        className="video-hero-wrapper"
        style={{
          borderBottom: "1px solid #e2e8f0",
          paddingTop: 100, paddingBottom: 80,
        }}
      >
        {/* Subtle background video */}
        <video
          className="video-hero-bg"
          autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80"
        >
          {/*
            To use your own video:
            1. Place file at: client/public/hero-video.mp4
            2. Change src to: /hero-video.mp4
          */}
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="video-hero-overlay" />

        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 380, height: 380, borderRadius: "50%", background: "rgba(37,99,235,0.07)", pointerEvents: "none", zIndex: 2 }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(124,58,237,0.05)", pointerEvents: "none", zIndex: 2 }} />

        <div className="video-hero-content" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>

          {/* Live badge */}
          <div className="fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 50, padding: "6px 16px",
            marginBottom: 24, fontSize: 13, color: "#1d4ed8", fontWeight: 600,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
            Now live in Indore, Bhopal & Delhi
          </div>

          {/* Headline */}
          <h1 className="fade-up-1" style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(34px, 5.5vw, 66px)", lineHeight: 1.1,
            color: "#0f172a", maxWidth: 820, margin: "0 auto 18px",
          }}>
            Find Trusted{" "}
            <span style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Domestic Helpers
            </span>{" "}
            Near You
          </h1>

          <p className="fade-up-2" style={{
            fontSize: "clamp(15px, 1.8vw, 19px)", color: "#475569",
            maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.8,
          }}>
            Verified maids, cooks & cleaners — affordable prices, transparent reviews, zero middlemen.
          </p>

          {/* Search bar */}
          <div className="fade-up-3" style={{
            maxWidth: 620, margin: "0 auto 44px",
            background: "#fff", borderRadius: 60,
            border: isSearchFocused ? "2px solid #2563eb" : "2px solid #e2e8f0",
            boxShadow: isSearchFocused
              ? "0 0 0 4px rgba(37,99,235,0.08), 0 8px 30px rgba(37,99,235,0.12)"
              : "0 4px 20px rgba(0,0,0,0.07)",
            padding: "8px 8px 8px 22px",
            display: "flex", alignItems: "center", gap: 10,
            transition: "all 0.3s",
          }}>
            <span style={{ fontSize: 19 }}>🏙️</span>
            <select
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, color: "#0f172a", flex: 1, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}
            >
              <option value="">Select City</option>
              {["Indore", "Bhopal", "Delhi"].map(c => <option key={c}>{c}</option>)}
            </select>

            <div style={{ width: 1, height: 26, background: "#e2e8f0", flexShrink: 0 }} />

            <span style={{ fontSize: 19 }}>🧹</span>
            <select
              value={searchService}
              onChange={e => setSearchService(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, color: "#0f172a", flex: 1, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}
            >
              <option value="">Service Type</option>
              {["Maid", "Cook", "Cleaner", "Cook+Maid"].map(s => <option key={s}>{s}</option>)}
            </select>

            <button
              onClick={() => setPage("browse")}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff", border: "none", borderRadius: 50,
                padding: "11px 26px", fontSize: 14, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: "0 4px 12px rgba(37,99,235,0.32)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.42)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.32)"; }}
            >
              Find Help →
            </button>
          </div>

          {/* Service pills — click to go to browse */}
          <div className="fade-up-3" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 52 }}>
            <ServicePill icon="🧹" name="Maid"      count="180+" color="#2563eb" bg="#eff6ff" onClick={() => setPage("browse")} />
            <ServicePill icon="👨‍🍳" name="Cook"      count="120+" color="#7c3aed" bg="#f5f3ff" onClick={() => setPage("browse")} />
            <ServicePill icon="✨"  name="Cleaner"   count="90+"  color="#0891b2" bg="#ecfeff" onClick={() => setPage("browse")} />
            <ServicePill icon="🏠" name="Cook+Maid" count="60+"  color="#059669" bg="#ecfdf5" onClick={() => setPage("browse")} />
          </div>

          {/* Stat cards */}
          <div className="fade-up-4" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: 14, maxWidth: 680, margin: "0 auto",
          }}>
            <StatCard value={500} suffix="+"  label="Verified Helpers" icon="✅" />
            <StatCard value={10}  suffix="K+" label="Happy Families"   icon="🏠" />
            <StatCard value={3}   suffix=""   label="Cities Covered"   icon="🏙️" />
            <StatCard value={48}  suffix="★"  label="Avg Rating 4.8"  icon="⭐" />
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-block", background: "#eff6ff", color: "#2563eb",
            borderRadius: 50, padding: "4px 16px", fontSize: 12, fontWeight: 700,
            marginBottom: 12, border: "1px solid #bfdbfe",
            letterSpacing: "0.5px", textTransform: "uppercase",
          }}>
            Simple Process
          </div>
          <h2 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(26px, 4vw, 40px)", color: "#0f172a",
          }}>
            How{" "}
            <span style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>GharSeva</span>{" "}
            Works
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, marginTop: 12, maxWidth: 460, margin: "12px auto 0" }}>
            Three simple steps to find your perfect domestic helper
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 22 }}>
          <StepCard
            number="01" icon="🔍"
            title="Search & Filter"
            desc="Browse verified helpers by city, service type, price range and availability. Smart filters help you find the perfect match in minutes."
          />
          <StepCard
            number="02" icon="📋"
            title="View Full Profiles"
            desc="Check real ratings, genuine reviews, detailed skills, experience and transparent pricing before making any decision."
          />
          <StepCard
            number="03" icon="📞"
            title="Connect Directly"
            desc="Call or WhatsApp the helper directly. No middlemen, no hidden commission. Simple, honest, and instant."
          />
        </div>
      </section>

      {/* ══ WHY GHARSEVA ════════════════════════════════════════════════════ */}
      <section style={{
        background: "#fff", padding: "80px 24px",
        borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: "clamp(26px, 4vw, 40px)", color: "#0f172a",
            }}>
              Why Choose{" "}
              <span style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>GharSeva?</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 10, maxWidth: 460, margin: "10px auto 0" }}>
              Built specifically for bachelors and working professionals in Indian cities
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
            {[
              { icon: "🛡️", title: "Background Verified",  desc: "Every helper passes our verification before being listed.",          color: "#2563eb", bg: "#eff6ff" },
              { icon: "💰", title: "Transparent Pricing",   desc: "See the exact monthly price upfront. No hidden charges, ever.",      color: "#7c3aed", bg: "#f5f3ff" },
              { icon: "⭐", title: "Real Reviews",          desc: "Genuine ratings from verified families and professionals only.",     color: "#d97706", bg: "#fef9c3" },
              { icon: "📱", title: "Direct Connection",     desc: "Contact helpers via call or WhatsApp directly. Zero commission.",   color: "#059669", bg: "#ecfdf5" },
              { icon: "📍", title: "Locality Based",        desc: "Find helpers in your specific area, not just by city.",             color: "#0891b2", bg: "#ecfeff" },
              { icon: "⚡", title: "Instant Access",        desc: "No approval wait. Connect with available helpers right now.",       color: "#dc2626", bg: "#fef2f2" },
            ].map(f => (
              <div
                key={f.title}
                style={{
                  background: "#f8fafc", borderRadius: 18, padding: 22,
                  border: "1.5px solid #f1f5f9",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.25s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform   = "translateY(-4px)";
                  e.currentTarget.style.boxShadow   = `0 12px 28px ${f.color}16`;
                  e.currentTarget.style.borderColor = `${f.color}28`;
                  e.currentTarget.style.background  = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform   = "translateY(0)";
                  e.currentTarget.style.boxShadow   = "0 2px 6px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "#f1f5f9";
                  e.currentTarget.style.background  = "#f8fafc";
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 13,
                  background: f.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, marginBottom: 13,
                  border: `1px solid ${f.color}20`,
                }}>{f.icon}</div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 7 }}>
                  {f.title}
                </h3>
                <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-block", background: "#f0fdf4", color: "#15803d",
              borderRadius: 50, padding: "4px 16px", fontSize: 12, fontWeight: 700,
              marginBottom: 12, border: "1px solid #bbf7d0", letterSpacing: "0.3px",
            }}>
              💬 Real Reviews
            </div>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: "clamp(26px, 4vw, 40px)", color: "#0f172a",
            }}>
              What People Say
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 10, maxWidth: 400, margin: "10px auto 0" }}>
              Real stories from families and professionals across India
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{
          maxWidth: 840, margin: "0 auto",
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #7c3aed 100%)",
          borderRadius: 28, padding: "56px 44px", textAlign: "center",
          position: "relative", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(37,99,235,0.28)",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: 16,    right: 36,  width: 90,  height: 90,  borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: -24, left: 16,  width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", top: "50%", left: "5%", transform: "translateY(-50%)", width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <h2 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 42px)", color: "#fff",
            marginBottom: 14, position: "relative",
          }}>
            Ready to Find Your Perfect Helper?
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.82)", fontSize: 16,
            maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.75,
          }}>
            Join thousands of happy families across India who found reliable domestic help through GharSeva.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("browse")}
              style={{
                background: "#fff", color: "#1d4ed8", border: "none",
                borderRadius: 50, padding: "13px 34px", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}
            >
              Find Help Now
            </button>
            <button
              onClick={() => setPage("register")}
              style={{
                background: "rgba(255,255,255,0.14)", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.38)", borderRadius: 50,
                padding: "13px 34px", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                transition: "all 0.2s",
              }}
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