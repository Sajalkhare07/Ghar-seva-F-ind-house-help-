import { useEffect, useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import { getMyHelperProfile, getHelperRequests, updateBookingStatus } from "../api/index";

const statusStyle = (status) => {
  const map = {
    pending: { bg: "rgba(234,179,8,0.15)", color: "#ca8a04", label: "Pending" },
    accepted: { bg: "rgba(34,197,94,0.15)", color: "#16a34a", label: "Accepted" },
    rejected: { bg: "rgba(239,68,68,0.12)", color: "#dc2626", label: "Rejected" },
    completed: { bg: "rgba(59,130,246,0.12)", color: "#2563eb", label: "Completed" },
  };
  return map[status] || map.pending;
};

const verificationStyles = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "#b45309", label: "Pending admin review" },
  approved: { bg: "rgba(34,197,94,0.12)", color: "#15803d", label: "Approved and live" },
  rejected: { bg: "rgba(239,68,68,0.12)", color: "#b91c1c", label: "Changes requested" },
};

const HelperDashboardPage = ({ user, setPage, showToast }) => {
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
    if (tab === "incoming" && profile?.verificationStatus === "approved") {
      loadIncoming();
    }
  }, [tab, profile]);

  const stats = useMemo(() => {
    const pending = incoming.filter((booking) => booking.status === "pending").length;
    const active = incoming.filter((booking) => booking.status === "accepted").length;
    const done = incoming.filter((booking) => booking.status === "completed").length;
    return { pending, active, done };
  }, [incoming]);

  const verification = verificationStyles[profile?.verificationStatus || "pending"];

  const handleStatus = async (bookingId, status) => {
    setActionId(String(bookingId));
    try {
      await updateBookingStatus(bookingId, status);
      await loadIncoming();
      if (showToast) showToast(`Booking marked ${status}.`, "success");
    } catch (err) {
      if (showToast) showToast(err.response?.data?.msg || "Could not update booking.", "error");
    } finally {
      setActionId(null);
    }
  };

  const refreshAll = async () => {
    const current = await loadProfile();
    if (current?.verificationStatus === "approved") {
      await loadIncoming();
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px" }}>
        <div className="glass" style={{ borderRadius: 20, padding: 28, marginBottom: 24, border: "1px solid rgba(59,130,246,0.22)", background: "linear-gradient(145deg, rgba(102,126,234,0.08), rgba(37,99,235,0.04))" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={64} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "inline-block", marginBottom: 8, padding: "4px 12px", borderRadius: 50, fontSize: 12, fontWeight: 700, background: "rgba(59,130,246,0.16)", color: "#1d4ed8" }}>
                Helper workspace
              </div>
              <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 26, marginBottom: 8 }}>
                Welcome back, {user.name}
              </h1>
              <p style={{ color: "var(--text2)", lineHeight: 1.6, fontSize: 15 }}>
                Keep your profile complete, track your approval status, and manage incoming work requests after the admin clears your listing.
              </p>
              <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>{user.email}</p>
            </div>
          </div>

          {profile && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <span style={{ padding: "8px 14px", borderRadius: 999, background: verification.bg, color: verification.color, fontWeight: 700, fontSize: 13 }}>
                {verification.label}
              </span>
              {profile.approvalNotes && (
                <span style={{ padding: "8px 14px", borderRadius: 999, background: "rgba(148,163,184,0.14)", color: "#475569", fontWeight: 600, fontSize: 13 }}>
                  Admin note: {profile.approvalNotes}
                </span>
              )}
            </div>
          )}

          {!profileLoading && profile && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 22 }}>
              {[
                ["Pending jobs", stats.pending],
                ["Active jobs", stats.active],
                ["Completed", stats.done],
              ].map(([label, value]) => (
                <div key={label} className="glass" style={{ borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "var(--blue)" }}>{value}</div>
                  <div style={{ color: "var(--text2)", fontSize: 12 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!profileLoading && profileError === "no_profile" && (
          <div className="glass" style={{ borderRadius: 16, padding: "28px 24px", marginBottom: 24, border: "1px dashed var(--border)" }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Next step: submit your helper verification profile</h2>
            <p style={{ color: "var(--text2)", lineHeight: 1.8, fontSize: 14, marginBottom: 20 }}>
              Add your work details, Aadhaar, and supporting documents. Your listing stays hidden until an admin approves it.
            </p>
            <button type="button" className="btn-primary" style={{ padding: "12px 24px" }} onClick={() => setPage("register")}>
              Complete my verification profile
            </button>
          </div>
        )}

        {profileLoading && <p style={{ color: "var(--text2)", marginBottom: 24 }}>Loading your workspace...</p>}

        {profileError === "load_failed" && !profileLoading && (
          <div className="glass" style={{ borderRadius: 12, padding: 20, marginBottom: 24, color: "var(--text2)" }}>
            Could not load your profile. <button type="button" onClick={refreshAll} style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontWeight: 600 }}>Retry</button>
          </div>
        )}

        {profile && (
          <>
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, marginBottom: 24, flexWrap: "wrap", width: "fit-content" }}>
              {[
                ["incoming", "Incoming requests"],
                ["listing", "My profile"],
                ["documents", "Verification docs"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    background: tab === value ? "rgba(59,130,246,0.18)" : "transparent",
                    color: tab === value ? "var(--blue)" : "var(--text2)",
                    fontFamily: "DM Sans",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "listing" && (
              <div className="glass" style={{ borderRadius: 16, padding: "24px 22px" }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: 17 }}>Your approval-ready listing</h3>
                <div style={{ display: "grid", gap: 10, fontSize: 15, color: "var(--text)" }}>
                  <div><span style={{ color: "var(--text2)", fontSize: 13 }}>Name</span><div style={{ fontWeight: 700 }}>{profile.name}</div></div>
                  <div><span style={{ color: "var(--text2)", fontSize: 13 }}>Service and city</span><div>{profile.service}  -  {profile.area}, {profile.city}</div></div>
                  <div><span style={{ color: "var(--text2)", fontSize: 13 }}>Monthly rate</span><div style={{ fontWeight: 700 }}>Rs.{Number(profile.price).toLocaleString()}/mo</div></div>
                  <div><span style={{ color: "var(--text2)", fontSize: 13 }}>Phone</span><div>{profile.phone}</div></div>
                  <div><span style={{ color: "var(--text2)", fontSize: 13 }}>Verification status</span><div style={{ color: verification.color, fontWeight: 700 }}>{verification.label}</div></div>
                  {profile.livePhoto && (
                    <div>
                      <span style={{ color: "var(--text2)", fontSize: 13 }}>Live photo</span>
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={profile.livePhoto}
                          alt={profile.name}
                          style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 16, border: "1px solid rgba(148,163,184,0.2)" }}
                        />
                      </div>
                    </div>
                  )}
                  {profile.about && <div><span style={{ color: "var(--text2)", fontSize: 13 }}>About</span><p style={{ lineHeight: 1.6, marginTop: 4 }}>{profile.about}</p></div>}
                </div>
                <div style={{ marginTop: 20 }}>
                  <button type="button" className="btn-outline" onClick={() => setPage("register")}>Submit a revised profile</button>
                </div>
              </div>
            )}

            {tab === "documents" && (
              <div className="glass" style={{ borderRadius: 16, padding: "24px 22px" }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: 17 }}>Documents under review</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {(profile.verificationDocuments || []).map((doc) => (
                    <div key={`${doc.type}-${doc.documentNumber}`} style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14, padding: 16 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{doc.type}</div>
                        <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>{doc.documentNumber}</div>
                      </div>
                      <a href={doc.documentUrl} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", fontWeight: 700 }}>
                        Open document
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "incoming" && (
              profile.verificationStatus !== "approved" ? (
                <div className="glass" style={{ borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
                  <h3 style={{ fontWeight: 800, marginBottom: 10 }}>Incoming work unlocks after approval</h3>
                  <p style={{ color: "var(--text2)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
                    Families cannot see your listing yet. Once the admin approves your helper profile, booking requests will start appearing here.
                  </p>
                </div>
              ) : incomingLoading ? (
                <p style={{ color: "var(--text2)" }}>Loading requests...</p>
              ) : incoming.length === 0 ? (
                <div className="glass" style={{ borderRadius: "var(--radius)", padding: "48px 20px", textAlign: "center" }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No requests yet</h3>
                  <p style={{ color: "var(--text2)" }}>Your approved profile is now live. When someone sends a request, you will see it here.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {incoming.map((booking) => {
                    const st = statusStyle(booking.status);
                    const busy = actionId === String(booking._id);
                    return (
                      <div key={String(booking._id)} className="glass" style={{ borderRadius: 14, padding: "18px 20px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{booking.user?.name || "Customer"}</div>
                            <div style={{ color: "var(--text2)", fontSize: 13 }}>{booking.user?.email}</div>
                          </div>
                          <span style={{ padding: "6px 12px", borderRadius: 50, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                        {booking.message && <p style={{ marginTop: 12, fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>{booking.message}</p>}
                        <div style={{ marginTop: 10, fontSize: 13, color: "var(--text2)" }}>
                          {booking.startDate && `Start: ${new Date(booking.startDate).toLocaleDateString()}  -  `}
                          {booking.monthlyBudget != null && `Budget: Rs.${Number(booking.monthlyBudget).toLocaleString()}/mo`}
                        </div>
                        {booking.status === "pending" && (
                          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                            <button type="button" className="btn-primary" disabled={busy} style={{ padding: "8px 18px", fontSize: 14 }} onClick={() => handleStatus(booking._id, "accepted")}>Accept</button>
                            <button type="button" className="btn-outline" disabled={busy} style={{ padding: "8px 18px", fontSize: 14 }} onClick={() => handleStatus(booking._id, "rejected")}>Decline</button>
                          </div>
                        )}
                        {booking.status === "accepted" && (
                          <button type="button" className="btn-outline" disabled={busy} style={{ marginTop: 14, padding: "8px 18px" }} onClick={() => handleStatus(booking._id, "completed")}>
                            Mark completed
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HelperDashboardPage;
