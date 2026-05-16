import { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import HelperCard from "../components/HelperCard";
import { getSavedHelpers, getMyBookings } from "../api/index";

const statusStyle = (status) => {
  const map = {
    pending: { bg: "rgba(199,146,62,0.16)", color: "#9a6d1d", label: "Pending" },
    accepted: { bg: "rgba(80,115,95,0.14)", color: "#3f6552", label: "Accepted" },
    rejected: { bg: "rgba(182,84,69,0.14)", color: "#9f4336", label: "Rejected" },
    completed: { bg: "rgba(48,78,87,0.14)", color: "#2f515b", label: "Completed" },
  };
  return map[status] || map.pending;
};

const panelStyle = {
  borderRadius: 26,
  border: "1px solid rgba(74,101,114,0.18)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
  boxShadow: "0 20px 50px rgba(61,37,23,0.08)",
};

const tabButton = (active) => ({
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid transparent",
  cursor: "pointer",
  background: active ? "rgba(27,156,133,0.14)" : "transparent",
  color: active ? "var(--brand-dark)" : "var(--text2)",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.02em",
});

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
        const list = (res.data.data || []).map((helper) => ({ ...helper, id: helper._id }));
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

  useEffect(() => {
    if (tab !== "bookings") return;

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

    loadMyBookings();
  }, [tab]);

  return (
    <div className="page-content" style={{ paddingTop: 88, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px 70px" }}>
        <div style={{ ...panelStyle, padding: 30, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
              <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={70} />
              <div>
                <div className="tag tag-blue" style={{ marginBottom: 10 }}>Household dashboard</div>
                <h1 style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.03, marginBottom: 8 }}>
                  Welcome home, {user.name}
                </h1>
                <p style={{ color: "var(--text2)", lineHeight: 1.75, fontSize: 15, maxWidth: 640 }}>
                  Track saved helpers, revisit trusted profiles, and manage every booking request you send from one calm dashboard.
                </p>
                <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(110px, 1fr))", gap: 12, minWidth: 250 }}>
              <div style={{ padding: "16px 18px", borderRadius: 20, background: "rgba(255,255,255,0.52)", border: "1px solid rgba(221,206,185,0.8)" }}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Saved helpers</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "var(--brand-dark)" }}>{savedIds.length}</div>
              </div>
              <div style={{ padding: "16px 18px", borderRadius: 20, background: "rgba(255,255,255,0.52)", border: "1px solid rgba(221,206,185,0.8)" }}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Booking requests</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "var(--accent)" }}>{myBookings.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "inline-flex", gap: 6, padding: 6, borderRadius: 999, border: "1px solid rgba(74,101,114,0.18)", background: "rgba(255,250,244,0.78)", marginBottom: 22, flexWrap: "wrap" }}>
          {[
            ["saved", "Saved helpers"],
            ["bookings", "My booking requests"],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} style={tabButton(tab === value)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "saved" &&
          (savedLoading ? (
            <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading saved helpers...</div>
          ) : savedHelpers.length === 0 ? (
            <div style={{ ...panelStyle, padding: "54px 24px", textAlign: "center" }}>
              <div className="tag tag-orange" style={{ margin: "0 auto 14px", width: "fit-content" }}>Shortlist empty</div>
              <h3 style={{ fontSize: 30, marginBottom: 10 }}>No saved helpers yet</h3>
              <p style={{ color: "var(--text2)", marginBottom: 18, lineHeight: 1.75, maxWidth: 520, marginInline: "auto" }}>
                Browse helpers and save the ones that feel right for your home. Your shortlist will stay here for quick access.
              </p>
              <button type="button" className="btn-primary" onClick={() => setPage("browse")}>
                Find helpers
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {savedHelpers.map((helper) => (
                <HelperCard
                  key={String(helper._id)}
                  helper={{ ...helper, id: helper._id }}
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
              <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading your requests...</div>
            ) : myBookings.length === 0 ? (
              <div style={{ ...panelStyle, padding: "54px 24px", textAlign: "center" }}>
                <div className="tag tag-blue" style={{ margin: "0 auto 14px", width: "fit-content" }}>No requests yet</div>
                <h3 style={{ fontSize: 30, marginBottom: 10 }}>Your booking timeline is empty</h3>
                <p style={{ color: "var(--text2)", marginBottom: 18, lineHeight: 1.75, maxWidth: 560, marginInline: "auto" }}>
                  Open a helper profile and send a booking request when you are ready. Updates will appear here as helpers respond.
                </p>
                <button type="button" className="btn-primary" onClick={() => setPage("browse")}>
                  Browse helpers
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {myBookings.map((booking) => {
                  const helper = booking.helper;
                  const status = statusStyle(booking.status);
                  return (
                    <div key={String(booking._id)} style={{ ...panelStyle, padding: 22 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                            Booking request
                          </div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text)", marginBottom: 6 }}>
                            {helper?.name || "Helper"}
                          </div>
                          <div style={{ color: "var(--text2)", fontSize: 14 }}>
                            {helper?.service} in {helper?.area}, {helper?.city}
                          </div>
                        </div>
                        <span style={{ padding: "8px 13px", borderRadius: 999, background: status.bg, color: status.color, fontWeight: 800, fontSize: 12 }}>
                          {status.label}
                        </span>
                      </div>

                      {booking.message && (
                        <p style={{ marginTop: 14, color: "var(--text)", lineHeight: 1.75, fontSize: 14 }}>
                          {booking.message}
                        </p>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
                        <div style={{ padding: "14px 16px", borderRadius: 18, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(221,206,185,0.8)" }}>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Preferred start</div>
                          <div style={{ fontWeight: 700, color: "var(--text)" }}>
                            {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "Flexible"}
                          </div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: 18, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(221,206,185,0.8)" }}>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Monthly budget</div>
                          <div style={{ fontWeight: 700, color: "var(--text)" }}>
                            {booking.monthlyBudget != null ? `Rs.${Number(booking.monthlyBudget).toLocaleString()}/mo` : "Not specified"}
                          </div>
                        </div>
                      </div>
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