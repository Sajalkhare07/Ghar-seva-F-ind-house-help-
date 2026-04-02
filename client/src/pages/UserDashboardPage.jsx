// Household dashboard — saved helpers & booking requests you sent
// import { useState, useEffect } from "react";
// import Avatar from "../components/Avatar";
// import HelperCard from "../components/HelperCard";
// import { getHelpers, getMyBookings } from "../api/index";

// const statusStyle = (status) => {
//   const map = {
//     pending: { bg: "rgba(234,179,8,0.15)", color: "#ca8a04", label: "Pending" },
//     accepted: { bg: "rgba(34,197,94,0.15)", color: "#16a34a", label: "Accepted" },
//     rejected: { bg: "rgba(239,68,68,0.12)", color: "#dc2626", label: "Rejected" },
//     completed: { bg: "rgba(59,130,246,0.12)", color: "#2563eb", label: "Completed" },
//   };
//   return map[status] || map.pending;
// };

// const UserDashboardPage = ({ user, savedIds, onView, onSave, setPage }) => {
//   const [tab, setTab] = useState("saved");
//   const [savedHelpers, setSavedHelpers] = useState([]);
//   const [savedLoading, setSavedLoading] = useState(false);
//   const [myBookings, setMyBookings] = useState([]);
//   const [bookingsLoading, setBookingsLoading] = useState(false);

//   useEffect(() => {
//     if (tab !== "saved" || !savedIds?.length) {
//       setSavedHelpers([]);
//       return;
//     }
//     let cancelled = false;
//     setSavedLoading(true);
//     (async () => {
//       try {
//         const res = await getHelpers();
//         const all = res.data.data || [];
//         const sid = new Set(savedIds.map(String));
//         const list = all
//           .filter((h) => sid.has(String(h._id)))
//           .map((h) => ({ ...h, id: h._id }));
//         if (!cancelled) setSavedHelpers(list);
//       } catch {
//         if (!cancelled) setSavedHelpers([]);
//       } finally {
//         if (!cancelled) setSavedLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [tab, savedIds]);

//   const loadMyBookings = async () => {
//     setBookingsLoading(true);
//     try {
//       const res = await getMyBookings();
//       setMyBookings(res.data.data || []);
//     } catch {
//       setMyBookings([]);
//     } finally {
//       setBookingsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (tab === "bookings") loadMyBookings();
//   }, [tab]);

//   return (
//     <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh" }}>
//       <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
//         <div
//           className="glass"
//           style={{
//             borderRadius: 20,
//             padding: 28,
//             marginBottom: 28,
//             display: "flex",
//             alignItems: "center",
//             gap: 20,
//             flexWrap: "wrap",
//           }}
//         >
//           <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={64} />
//           <div style={{ flex: 1 }}>
//             <h1
//               style={{
//                 fontFamily: "Syne",
//                 fontWeight: 800,
//                 fontSize: 26,
//                 marginBottom: 4,
//               }}
//             >
//               Your home dashboard
//             </h1>
//             <p style={{ color: "var(--text2)", marginBottom: 6 }}>
//               Hi {user.name} — find helpers, save favourites, and track the
//               requests you send.
//             </p>
//             <p style={{ color: "var(--text2)", fontSize: 14 }}>{user.email}</p>
//             <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
//               <span className="tag tag-blue">🏠 Looking for help</span>
//             </div>
//           </div>
//           <div style={{ textAlign: "center" }}>
//             <div
//               style={{
//                 fontFamily: "Syne",
//                 fontWeight: 800,
//                 fontSize: 24,
//                 color: "var(--blue)",
//               }}
//             >
//               {savedHelpers.length}
//             </div>
//             <div style={{ color: "var(--text2)", fontSize: 12 }}>Saved</div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             gap: 4,
//             background: "rgba(255,255,255,0.04)",
//             borderRadius: 12,
//             padding: 4,
//             marginBottom: 24,
//             flexWrap: "wrap",
//             width: "fit-content",
//           }}
//         >
//           {[
//             ["saved", "♥ Saved helpers"],
//             ["bookings", "📋 My booking requests"],
//           ].map(([v, l]) => (
//             <button
//               key={v}
//               type="button"
//               onClick={() => setTab(v)}
//               style={{
//                 padding: "8px 16px",
//                 borderRadius: 9,
//                 border: "none",
//                 cursor: "pointer",
//                 background: tab === v ? "rgba(79,142,247,0.2)" : "transparent",
//                 color: tab === v ? "var(--blue)" : "var(--text2)",
//                 fontFamily: "DM Sans",
//                 fontWeight: 500,
//                 fontSize: 14,
//                 transition: "all 0.2s",
//               }}
//             >
//               {l}
//             </button>
//           ))}
//         </div>

//         {tab === "saved" &&
//           (savedLoading ? (
//             <p style={{ color: "var(--text2)" }}>Loading saved helpers…</p>
//           ) : savedHelpers.length === 0 ? (
//             <div
//               className="glass"
//               style={{
//                 borderRadius: "var(--radius)",
//                 padding: "60px 20px",
//                 textAlign: "center",
//               }}
//             >
//               <div style={{ fontSize: 48, marginBottom: 12 }}>♡</div>
//               <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
//                 No saved helpers yet
//               </h3>
//               <p style={{ color: "var(--text2)", marginBottom: 16 }}>
//                 Browse and tap the heart on a card to save them here.
//               </p>
//               <button
//                 type="button"
//                 className="btn-primary"
//                 onClick={() => setPage("browse")}
//               >
//                 Find helpers
//               </button>
//             </div>
//           ) : (
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
//                 gap: 20,
//               }}
//             >
//               {savedHelpers.map((h) => (
//                 <HelperCard
//                   key={String(h._id)}
//                   helper={{ ...h, id: h._id }}
//                   onView={onView}
//                   onSave={onSave}
//                   saved
//                 />
//               ))}
//             </div>
//           ))}

//         {tab === "bookings" && (
//           <div>
//             {bookingsLoading ? (
//               <p style={{ color: "var(--text2)" }}>Loading your requests…</p>
//             ) : myBookings.length === 0 ? (
//               <div
//                 className="glass"
//                 style={{
//                   borderRadius: "var(--radius)",
//                   padding: "48px 20px",
//                   textAlign: "center",
//                 }}
//               >
//                 <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
//                 <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
//                   No booking requests yet
//                 </h3>
//                 <p style={{ color: "var(--text2)", marginBottom: 16 }}>
//                   Open a helper profile and tap{" "}
//                   <strong>Send booking request</strong>.
//                 </p>
//                 <button
//                   type="button"
//                   className="btn-primary"
//                   style={{ padding: "10px 22px" }}
//                   onClick={() => setPage("browse")}
//                 >
//                   Find helpers
//                 </button>
//               </div>
//             ) : (
//               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//                 {myBookings.map((b) => {
//                   const h = b.helper;
//                   const st = statusStyle(b.status);
//                   return (
//                     <div
//                       key={String(b._id)}
//                       className="glass"
//                       style={{
//                         borderRadius: 14,
//                         padding: "18px 20px",
//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: 16,
//                         alignItems: "flex-start",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <div>
//                         <div style={{ fontWeight: 700, fontSize: 16 }}>
//                           {h?.name || "Helper"}
//                         </div>
//                         <div style={{ color: "var(--text2)", fontSize: 14 }}>
//                           {h?.service} · {h?.area}, {h?.city}
//                         </div>
//                         {b.message && (
//                           <p
//                             style={{
//                               marginTop: 10,
//                               fontSize: 14,
//                               color: "var(--text)",
//                               maxWidth: 480,
//                               lineHeight: 1.5,
//                             }}
//                           >
//                             {b.message}
//                           </p>
//                         )}
//                         <div
//                           style={{
//                             marginTop: 10,
//                             fontSize: 13,
//                             color: "var(--text2)",
//                           }}
//                         >
//                           {b.startDate &&
//                             `Start: ${new Date(b.startDate).toLocaleDateString()} · `}
//                           {b.monthlyBudget != null &&
//                             `Budget: ₹${Number(b.monthlyBudget).toLocaleString()}/mo`}
//                         </div>
//                       </div>
//                       <span
//                         style={{
//                           padding: "6px 12px",
//                           borderRadius: 50,
//                           fontSize: 12,
//                           fontWeight: 600,
//                           background: st.bg,
//                           color: st.color,
//                         }}
//                       >
//                         {st.label}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserDashboardPage;

import { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import HelperCard from "../components/HelperCard";
import { getSavedHelpers, getMyBookings } from "../api/index";

const statusStyle = (status) => {
  const map = {
    pending: { bg: "rgba(234,179,8,0.15)", color: "#ca8a04", label: "Pending" },
    accepted: { bg: "rgba(34,197,94,0.15)", color: "#16a34a", label: "Accepted" },
    rejected: { bg: "rgba(239,68,68,0.12)", color: "#dc2626", label: "Rejected" },
    completed: { bg: "rgba(59,130,246,0.12)", color: "#2563eb", label: "Completed" },
  };
  return map[status] || map.pending;
};

const UserDashboardPage = ({ user, savedIds, onView, onSave, setPage }) => {
  const [tab, setTab] = useState("saved");
  const [savedHelpers, setSavedHelpers] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (tab !== "saved" || !user) {
      setSavedHelpers([]);
      return;
    }

    let cancelled = false;
    setSavedLoading(true);

    (async () => {
      try {
        const res = await getSavedHelpers();
        const list = (res.data.data || []).map((h) => ({ ...h, id: h._id }));
        if (!cancelled) setSavedHelpers(list);
      } catch {
        if (!cancelled) setSavedHelpers([]);
      } finally {
        if (!cancelled) setSavedLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, user, savedIds]);

  const loadMyBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await getMyBookings();
      setMyBookings(res.data.data || []);
    } catch {
      setMyBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "bookings") loadMyBookings();
  }, [tab]);

  return (
    <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div
          className="glass"
          style={{
            borderRadius: 20,
            padding: 28,
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={64} />
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 26,
                marginBottom: 4,
              }}
            >
              Your home dashboard
            </h1>
            <p style={{ color: "var(--text2)", marginBottom: 6 }}>
              Hi {user.name} - find helpers, save favourites, and track the
              requests you send.
            </p>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>{user.email}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <span className="tag tag-blue">Looking for help</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 24,
                color: "var(--blue)",
              }}
            >
              {savedIds.length}
            </div>
            <div style={{ color: "var(--text2)", fontSize: 12 }}>Saved</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            flexWrap: "wrap",
            width: "fit-content",
          }}
        >
          {[
            ["saved", "Saved helpers"],
            ["bookings", "My booking requests"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setTab(v)}
              style={{
                padding: "8px 16px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                background: tab === v ? "rgba(79,142,247,0.2)" : "transparent",
                color: tab === v ? "var(--blue)" : "var(--text2)",
                fontFamily: "DM Sans",
                fontWeight: 500,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "saved" &&
          (savedLoading ? (
            <p style={{ color: "var(--text2)" }}>Loading saved helpers...</p>
          ) : savedHelpers.length === 0 ? (
            <div
              className="glass"
              style={{
                borderRadius: "var(--radius)",
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>♡</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
                No saved helpers yet
              </h3>
              <p style={{ color: "var(--text2)", marginBottom: 16 }}>
                Browse and tap the heart on a card to save them here.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setPage("browse")}
              >
                Find helpers
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {savedHelpers.map((h) => (
                <HelperCard
                  key={String(h._id)}
                  helper={{ ...h, id: h._id }}
                  user={user}
                  onView={onView}
                  onSave={onSave}
                  saved
                />
              ))}
            </div>
          ))}

        {tab === "bookings" && (
          <div>
            {bookingsLoading ? (
              <p style={{ color: "var(--text2)" }}>Loading your requests...</p>
            ) : myBookings.length === 0 ? (
              <div
                className="glass"
                style={{
                  borderRadius: "var(--radius)",
                  padding: "48px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>Bookings</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
                  No booking requests yet
                </h3>
                <p style={{ color: "var(--text2)", marginBottom: 16 }}>
                  Open a helper profile and tap <strong>Send booking request</strong>.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: "10px 22px" }}
                  onClick={() => setPage("browse")}
                >
                  Find helpers
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myBookings.map((b) => {
                  const h = b.helper;
                  const st = statusStyle(b.status);

                  return (
                    <div
                      key={String(b._id)}
                      className="glass"
                      style={{
                        borderRadius: 14,
                        padding: "18px 20px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 16,
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                          {h?.name || "Helper"}
                        </div>
                        <div style={{ color: "var(--text2)", fontSize: 14 }}>
                          {h?.service} - {h?.area}, {h?.city}
                        </div>
                        {b.message && (
                          <p
                            style={{
                              marginTop: 10,
                              fontSize: 14,
                              color: "var(--text)",
                              maxWidth: 480,
                              lineHeight: 1.5,
                            }}
                          >
                            {b.message}
                          </p>
                        )}
                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 13,
                            color: "var(--text2)",
                          }}
                        >
                          {b.startDate &&
                            `Start: ${new Date(b.startDate).toLocaleDateString()} - `}
                          {b.monthlyBudget != null &&
                            `Budget: Rs.${Number(b.monthlyBudget).toLocaleString()}/mo`}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: 50,
                          fontSize: 12,
                          fontWeight: 600,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;

