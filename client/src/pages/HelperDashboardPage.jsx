// Helper workspace — after login, helpers land here to manage listing & requests
import { useState, useEffect, useMemo } from "react";
import Avatar from "../components/Avatar";
import {
  getMyHelperProfile,
  getHelperRequests,
  updateBookingStatus,
} from "../api/index";

const statusStyle = (status) => {
  const map = {
    pending: { bg: "rgba(234,179,8,0.15)", color: "#ca8a04", label: "Pending" },
    accepted: { bg: "rgba(34,197,94,0.15)", color: "#16a34a", label: "Accepted" },
    rejected: { bg: "rgba(239,68,68,0.12)", color: "#dc2626", label: "Rejected" },
    completed: { bg: "rgba(59,130,246,0.12)", color: "#2563eb", label: "Completed" },
  };
  return map[status] || map.pending;
};

const HelperDashboardPage = ({ user, setPage }) => {
  const [tab, setTab] = useState("incoming");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await getMyHelperProfile();
      setProfile(res.data.data);
      return res.data.data;
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
        setProfileError("no_profile");
      } else {
        setProfileError("load_failed");
      }
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const loadIncoming = async () => {
    setIncomingLoading(true);
    try {
      const res = await getHelperRequests();
      setIncoming(res.data.data || []);
    } catch {
      setIncoming([]);
    } finally {
      setIncomingLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (tab === "incoming" && profile) {
      loadIncoming();
    }
  }, [tab, profile]);

  const stats = useMemo(() => {
    const pending = incoming.filter((b) => b.status === "pending").length;
    const active = incoming.filter((b) => b.status === "accepted").length;
    const done = incoming.filter((b) => b.status === "completed").length;
    return { pending, active, done, total: incoming.length };
  }, [incoming]);

  const handleStatus = async (bookingId, status) => {
    setActionId(String(bookingId));
    try {
      await updateBookingStatus(bookingId, { status });
      await loadIncoming();
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const refreshAll = async () => {
    const p = await loadProfile();
    if (p) await loadIncoming();
  };

  return (
    <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {/* ── Header: what happens after helper login ── */}
        <div
          className="glass"
          style={{
            borderRadius: 20,
            padding: 28,
            marginBottom: 24,
            border: "1px solid rgba(155,92,255,0.25)",
            background: "linear-gradient(145deg, rgba(102,126,234,0.08), rgba(118,75,162,0.06))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              initials={user.name.slice(0, 2).toUpperCase()}
              size={64}
            />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div
                style={{
                  display: "inline-block",
                  marginBottom: 8,
                  padding: "4px 12px",
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "rgba(155,92,255,0.2)",
                  color: "var(--purple)",
                }}
              >
                Helper workspace
              </div>
              <h1
                style={{
                  fontFamily: "Syne",
                  fontWeight: 800,
                  fontSize: 26,
                  marginBottom: 8,
                }}
              >
                Welcome back, {user.name}
              </h1>
              <p style={{ color: "var(--text2)", lineHeight: 1.6, fontSize: 15 }}>
                After you sign in as a helper, this is your hub: complete your
                public listing (while logged in), then families can send booking
                requests. You&apos;ll review and accept them under{" "}
                <strong>Incoming requests</strong>.
              </p>
              <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>
                {user.email}
              </p>
            </div>
          </div>

          {!profileLoading && profile && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 12,
                marginTop: 22,
              }}
            >
              {[
                ["Pending", stats.pending, "⏳"],
                ["Active jobs", stats.active, "✓"],
                ["Completed", stats.done, "✔"],
              ].map(([label, n, icon]) => (
                <div
                  key={label}
                  className="glass"
                  style={{
                    borderRadius: 12,
                    padding: "14px 16px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 800,
                      fontSize: 22,
                      color: "var(--blue)",
                    }}
                  >
                    {n}
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: 12 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── No listing yet: onboarding ── */}
        {!profileLoading && profileError === "no_profile" && (
          <div
            className="glass"
            style={{
              borderRadius: 16,
              padding: "28px 24px",
              marginBottom: 24,
              border: "1px dashed var(--border)",
            }}
          >
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
              Next step: add your helper profile
            </h2>
            <ol
              style={{
                color: "var(--text2)",
                lineHeight: 1.85,
                paddingLeft: 20,
                marginBottom: 20,
                fontSize: 14,
              }}
            >
              <li>
                Go to <strong>Register</strong> and submit your details{" "}
                <strong>while you stay logged in</strong> — we link the listing
                to this account.
              </li>
              <li>Once your profile is live, families can send booking requests.</li>
              <li>Return here to <strong>accept</strong> or <strong>decline</strong> requests.</li>
            </ol>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: "12px 24px" }}
              onClick={() => setPage("register")}
            >
              Complete my listing →
            </button>
          </div>
        )}

        {profileLoading && (
          <p style={{ color: "var(--text2)", marginBottom: 24 }}>
            Loading your workspace…
          </p>
        )}

        {profileError === "load_failed" && !profileLoading && (
          <div
            className="glass"
            style={{
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              color: "var(--text2)",
            }}
          >
            Could not load your profile.{" "}
            <button
              type="button"
              onClick={refreshAll}
              style={{
                background: "none",
                border: "none",
                color: "var(--blue)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Tabs (only when profile exists) ── */}
        {profile && (
          <>
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
                ["incoming", "📥 Incoming requests"],
                ["listing", "📋 My public listing"],
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
                    background:
                      tab === v ? "rgba(155,92,255,0.22)" : "transparent",
                    color: tab === v ? "var(--purple)" : "var(--text2)",
                    fontFamily: "DM Sans",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {tab === "listing" && (
              <div
                className="glass"
                style={{ borderRadius: 16, padding: "24px 22px" }}
              >
                <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: 17 }}>
                  How families see you
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    fontSize: 15,
                    color: "var(--text)",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text2)", fontSize: 13 }}>Name</span>
                    <div style={{ fontWeight: 700 }}>{profile.name}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text2)", fontSize: 13 }}>Service & city</span>
                    <div>
                      {profile.service} · {profile.area}, {profile.city}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text2)", fontSize: 13 }}>Monthly rate</span>
                    <div style={{ fontWeight: 700 }}>
                      ₹{Number(profile.price).toLocaleString()}/mo
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text2)", fontSize: 13 }}>Phone</span>
                    <div>{profile.phone}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text2)", fontSize: 13 }}>Status</span>
                    <div>
                      {profile.verified ? (
                        <span className="verified-badge">✓ Verified listing</span>
                      ) : (
                        <span className="tag tag-blue">Verification pending</span>
                      )}
                    </div>
                  </div>
                  {profile.about && (
                    <div>
                      <span style={{ color: "var(--text2)", fontSize: 13 }}>About</span>
                      <p style={{ lineHeight: 1.6, marginTop: 4 }}>{profile.about}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "incoming" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <p style={{ color: "var(--text2)", fontSize: 14, margin: 0 }}>
                    New requests from families appear here first as{" "}
                    <strong>Pending</strong>.
                  </p>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: "6px 14px", fontSize: 13 }}
                    onClick={loadIncoming}
                  >
                    Refresh
                  </button>
                </div>
                {incomingLoading ? (
                  <p style={{ color: "var(--text2)" }}>Loading requests…</p>
                ) : incoming.length === 0 ? (
                  <div
                    className="glass"
                    style={{
                      borderRadius: "var(--radius)",
                      padding: "48px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
                      No requests yet
                    </h3>
                    <p style={{ color: "var(--text2)" }}>
                      When someone sends a booking request to your profile,
                      you&apos;ll see it here and can accept or decline.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 12 }}
                  >
                    {incoming.map((b) => {
                      const u = b.user;
                      const st = statusStyle(b.status);
                      const busy = actionId === String(b._id);
                      return (
                        <div
                          key={String(b._id)}
                          className="glass"
                          style={{ borderRadius: 14, padding: "18px 20px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 12,
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                {u?.name || "Customer"}
                              </div>
                              <div
                                style={{ color: "var(--text2)", fontSize: 13 }}
                              >
                                {u?.email}
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
                          {b.message && (
                            <p
                              style={{
                                marginTop: 12,
                                fontSize: 14,
                                color: "var(--text)",
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
                              `Start: ${new Date(b.startDate).toLocaleDateString()} · `}
                            {b.monthlyBudget != null &&
                              `Budget: ₹${Number(b.monthlyBudget).toLocaleString()}/mo`}
                          </div>
                          {b.status === "pending" && (
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                marginTop: 16,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                className="btn-primary"
                                disabled={busy}
                                style={{ padding: "8px 18px", fontSize: 14 }}
                                onClick={() => handleStatus(b._id, "accepted")}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                disabled={busy}
                                style={{ padding: "8px 18px", fontSize: 14 }}
                                onClick={() => handleStatus(b._id, "rejected")}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {b.status === "accepted" && (
                            <button
                              type="button"
                              className="btn-outline"
                              disabled={busy}
                              style={{ marginTop: 14, padding: "8px 18px" }}
                              onClick={() => handleStatus(b._id, "completed")}
                            >
                              Mark completed
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HelperDashboardPage;
