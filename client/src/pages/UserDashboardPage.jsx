import { useEffect, useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import HelperCard from "../components/HelperCard";
import { getSavedHelpers, getMyBookings } from "../api/index";

const statusStyle = (status) => {
  const map = {
    pending: { bg: "rgba(74,101,114,0.14)", color: "#4A6572", label: "Pending" },
    accepted: { bg: "rgba(27,156,133,0.14)", color: "#167c6a", label: "Accepted" },
    rejected: { bg: "rgba(182,84,69,0.14)", color: "#9f4336", label: "Rejected" },
    completed: { bg: "rgba(16,42,67,0.12)", color: "#102A43", label: "Completed" },
  };
  return map[status] || map.pending;
};

const panelStyle = {
  borderRadius: 26,
  border: "1px solid rgba(74,101,114,0.18)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
  boxShadow: "0 20px 50px rgba(16,42,67,0.08)",
};

const statCard = {
  padding: "16px 18px",
  borderRadius: 20,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(74,101,114,0.16)",
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

const EmptyState = ({ tag, title, text, actionLabel, onAction }) => (
  <div style={{ ...panelStyle, padding: "54px 24px", textAlign: "center" }}>
    <div className="tag tag-blue" style={{ margin: "0 auto 14px", width: "fit-content" }}>{tag}</div>
    <h3 style={{ fontSize: 30, marginBottom: 10 }}>{title}</h3>
    <p style={{ color: "var(--text2)", marginBottom: 18, lineHeight: 1.75, maxWidth: 560, marginInline: "auto" }}>
      {text}
    </p>
    {actionLabel && <button type="button" className="btn-primary" onClick={onAction}>{actionLabel}</button>}
  </div>
);

const UserDashboardPage = ({ user, savedIds, onView, onSave, setPage }) => {
  const [tab, setTab] = useState("overview");
  const [savedHelpers, setSavedHelpers] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setSavedLoading(true);
    setBookingsLoading(true);

    getSavedHelpers()
      .then((res) => {
        if (!cancelled) {
          const list = (res.data.data || []).map((helper) => ({ ...helper, id: helper._id }));
          setSavedHelpers(list);
        }
      })
      .catch(() => {
        if (!cancelled) setSavedHelpers([]);
      })
      .finally(() => {
        if (!cancelled) setSavedLoading(false);
      });

    getMyBookings()
      .then((res) => {
        if (!cancelled) setMyBookings(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) setMyBookings([]);
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, savedIds]);

  const bookingGroups = useMemo(() => {
    const active = myBookings.filter((booking) => ["pending", "accepted"].includes(booking.status));
    const history = myBookings.filter((booking) => ["rejected", "completed"].includes(booking.status));
    return { active, history };
  }, [myBookings]);

  const nextStep = useMemo(() => {
    if (!savedHelpers.length) {
      return {
        label: "Start here",
        title: "Build your shortlist first",
        text: "Browse verified helpers and save the ones that feel right for your home before sending requests.",
        actionLabel: "Browse helpers",
        action: () => setPage("browse"),
      };
    }

    if (!bookingGroups.active.length) {
      return {
        label: "Next step",
        title: "Send your first booking request",
        text: "You already have shortlisted helpers. Open a profile and send a request when you are ready to talk.",
        actionLabel: "View shortlist",
        action: () => setTab("shortlist"),
      };
    }

    return {
      label: "In progress",
      title: "Track your active requests",
      text: "Your current requests are moving. Keep an eye on responses and accepted helpers here.",
      actionLabel: "Open active requests",
      action: () => setTab("active"),
    };
  }, [savedHelpers.length, bookingGroups.active.length, setPage]);

  const statItems = [
    ["Saved helpers", savedHelpers.length, "var(--brand-dark)"],
    ["Active requests", bookingGroups.active.length, "var(--accent)"],
    ["Past bookings", bookingGroups.history.length, "var(--text2)"],
  ];

  const renderBookingList = (bookings) => (
    <div style={{ display: "grid", gap: 14 }}>
      {bookings.map((booking) => {
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
              <div style={statCard}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Preferred start</div>
                <div style={{ fontWeight: 700, color: "var(--text)" }}>
                  {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "Flexible"}
                </div>
              </div>
              <div style={statCard}>
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
  );

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
                  One place to shortlist helpers, track active requests, and revisit your booking history without jumping around the app.
                </p>
                <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(120px, 1fr))", gap: 12, minWidth: 360 }}>
              {statItems.map(([label, value, tone]) => (
                <div key={label} style={statCard}>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: tone }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, padding: 24, marginBottom: 22 }}>
          <div className="tag tag-green" style={{ marginBottom: 12 }}>{nextStep.label}</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <h2 style={{ fontSize: 30, marginBottom: 8 }}>{nextStep.title}</h2>
              <p style={{ color: "var(--text2)", lineHeight: 1.75, maxWidth: 640 }}>{nextStep.text}</p>
            </div>
            <button type="button" className="btn-primary" onClick={nextStep.action}>{nextStep.actionLabel}</button>
          </div>
        </div>

        <div style={{ display: "inline-flex", gap: 6, padding: 6, borderRadius: 999, border: "1px solid rgba(74,101,114,0.18)", background: "rgba(255,255,255,0.85)", marginBottom: 22, flexWrap: "wrap" }}>
          {[
            ["overview", "Overview"],
            ["shortlist", "Shortlist"],
            ["active", "Active requests"],
            ["history", "History"],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} style={tabButton(tab === value)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18 }}>
            <div style={{ ...panelStyle, padding: 24 }}>
              <div className="tag tag-purple" style={{ marginBottom: 12 }}>Shortlist summary</div>
              <h3 style={{ fontSize: 26, marginBottom: 8 }}>Saved helpers</h3>
              <p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>
                Keep trusted profiles together so you can compare and decide faster.
              </p>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 42, color: "var(--brand-dark)", marginBottom: 16 }}>{savedHelpers.length}</div>
              <button type="button" className="btn-outline" onClick={() => setTab("shortlist")}>Open shortlist</button>
            </div>

            <div style={{ ...panelStyle, padding: 24 }}>
              <div className="tag tag-blue" style={{ marginBottom: 12 }}>Request summary</div>
              <h3 style={{ fontSize: 26, marginBottom: 8 }}>Booking flow</h3>
              <p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>
                Stay on top of households requests that are still moving and the ones already finished.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
                <div style={statCard}>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Active</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>{bookingGroups.active.length}</div>
                </div>
                <div style={statCard}>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>History</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>{bookingGroups.history.length}</div>
                </div>
              </div>
              <button type="button" className="btn-outline" onClick={() => setTab("active")}>View active requests</button>
            </div>
          </div>
        )}

        {tab === "shortlist" &&
          (savedLoading ? (
            <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading saved helpers...</div>
          ) : savedHelpers.length === 0 ? (
            <EmptyState
              tag="Shortlist empty"
              title="No saved helpers yet"
              text="Browse helpers and save the ones that feel right for your home. Your shortlist will stay here for quick access."
              actionLabel="Find helpers"
              onAction={() => setPage("browse")}
            />
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

        {tab === "active" && (
          bookingsLoading ? (
            <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading your active requests...</div>
          ) : bookingGroups.active.length === 0 ? (
            <EmptyState
              tag="No active requests"
              title="Nothing is in progress right now"
              text="Once you send a booking request, you will be able to track pending and accepted updates here."
              actionLabel="Browse helpers"
              onAction={() => setPage("browse")}
            />
          ) : renderBookingList(bookingGroups.active)
        )}

        {tab === "history" && (
          bookingsLoading ? (
            <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading booking history...</div>
          ) : bookingGroups.history.length === 0 ? (
            <EmptyState
              tag="No history yet"
              title="Past bookings will appear here"
              text="Completed and rejected requests are grouped here so your active flow stays clean."
            />
          ) : renderBookingList(bookingGroups.history)
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;