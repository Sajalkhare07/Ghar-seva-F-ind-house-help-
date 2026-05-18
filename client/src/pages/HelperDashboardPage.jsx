import { useEffect, useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import { getMyHelperProfile, getHelperRequests, updateBookingStatus } from "../api/index";
import { openPdfDocument } from "../utils/document";

const statusStyle = (status) => {
  const map = {
    pending: { bg: "rgba(74,101,114,0.14)", color: "#4A6572", label: "Pending" },
    accepted: { bg: "rgba(27,156,133,0.14)", color: "#167c6a", label: "Accepted" },
    rejected: { bg: "rgba(182,84,69,0.14)", color: "#9f4336", label: "Rejected" },
    completed: { bg: "rgba(16,42,67,0.12)", color: "#102A43", label: "Completed" },
  };
  return map[status] || map.pending;
};

const verificationStyles = {
  pending: { bg: "rgba(74,101,114,0.14)", color: "#4A6572", label: "Pending admin review" },
  approved: { bg: "rgba(27,156,133,0.14)", color: "#167c6a", label: "Approved and live" },
  rejected: { bg: "rgba(182,84,69,0.14)", color: "#9f4336", label: "Changes requested" },
};

const panelStyle = {
  borderRadius: 26,
  border: "1px solid rgba(74,101,114,0.18)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
  boxShadow: "0 20px 50px rgba(16,42,67,0.08)",
};

const statTile = {
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
  <div style={{ ...panelStyle, padding: "46px 24px", textAlign: "center" }}>
    <div className="tag tag-blue" style={{ margin: "0 auto 14px", width: "fit-content" }}>{tag}</div>
    <h3 style={{ fontSize: 30, marginBottom: 10 }}>{title}</h3>
    <p style={{ color: "var(--text2)", maxWidth: 600, margin: "0 auto", lineHeight: 1.8, marginBottom: actionLabel ? 18 : 0 }}>
      {text}
    </p>
    {actionLabel && <button type="button" className="btn-primary" onClick={onAction}>{actionLabel}</button>}
  </div>
);

const HelperDashboardPage = ({ user, setPage, showToast }) => {
  const [tab, setTab] = useState("overview");
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
    if (profile?.verificationStatus === "approved") {
      loadIncoming();
    }
  }, [profile?.verificationStatus]);

  const requestGroups = useMemo(() => {
    const newRequests = incoming.filter((booking) => booking.status === "pending");
    const active = incoming.filter((booking) => booking.status === "accepted");
    const history = incoming.filter((booking) => ["rejected", "completed"].includes(booking.status));
    return { newRequests, active, history };
  }, [incoming]);

  const verification = verificationStyles[profile?.verificationStatus || "pending"];

  const nextStep = useMemo(() => {
    if (!profile) {
      return {
        label: "Start here",
        title: "Complete your helper verification",
        text: "Add your work details, live photo, and documents so the admin can review your listing.",
        actionLabel: "Complete verification",
        action: () => setPage("register"),
      };
    }

    if (profile.verificationStatus === "pending") {
      return {
        label: "Waiting for review",
        title: "Your profile is with the admin team",
        text: "No extra action is needed right now. Keep your phone available in case the admin needs clarification.",
        actionLabel: "View documents",
        action: () => setTab("documents"),
      };
    }

    if (profile.verificationStatus === "rejected") {
      return {
        label: "Needs changes",
        title: "Update your profile and resubmit",
        text: profile.approvalNotes || "The admin requested changes before your listing can go live again.",
        actionLabel: "Edit profile",
        action: () => setPage("register"),
      };
    }

    if (requestGroups.newRequests.length) {
      return {
        label: "Action needed",
        title: `You have ${requestGroups.newRequests.length} new booking request${requestGroups.newRequests.length > 1 ? "s" : ""}`,
        text: "Review pending household requests and accept the ones you want to take on.",
        actionLabel: "Open requests",
        action: () => setTab("requests"),
      };
    }

    return {
      label: "Profile live",
      title: "Your listing is approved and visible",
      text: "Keep your details updated and stay ready for new household requests.",
      actionLabel: "View profile",
      action: () => setTab("overview"),
    };
  }, [profile, requestGroups.newRequests.length, setPage]);

  const handleStatus = async (bookingId, status) => {
    setActionId(String(bookingId));
    try {
      await updateBookingStatus(bookingId, status);
      await loadIncoming();
      showToast?.(`Booking marked ${status}.`, "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not update booking.", "error");
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

  const renderRequestList = (bookings) => (
    <div style={{ display: "grid", gap: 14 }}>
      {bookings.map((booking) => {
        const status = statusStyle(booking.status);
        const busy = actionId === String(booking._id);
        return (
          <div key={String(booking._id)} style={{ ...panelStyle, padding: 22 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="tag tag-blue" style={{ marginBottom: 10 }}>Household request</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text)" }}>
                  {booking.user?.name || "Customer"}
                </div>
                <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 6 }}>{booking.user?.email}</div>
              </div>
              <span style={{ padding: "8px 13px", borderRadius: 999, background: status.bg, color: status.color, fontWeight: 800, fontSize: 12 }}>
                {status.label}
              </span>
            </div>

            {booking.message && <p style={{ marginTop: 14, fontSize: 14, color: "var(--text)", lineHeight: 1.75 }}>{booking.message}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
              <div style={statTile}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Preferred start</div>
                <div style={{ fontWeight: 800, color: "var(--text)" }}>
                  {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "Flexible"}
                </div>
              </div>
              <div style={statTile}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Budget</div>
                <div style={{ fontWeight: 800, color: "var(--text)" }}>
                  {booking.monthlyBudget != null ? `Rs.${Number(booking.monthlyBudget).toLocaleString()}/mo` : "Not specified"}
                </div>
              </div>
            </div>

            {booking.status === "pending" && (
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" className="btn-primary" disabled={busy} onClick={() => handleStatus(booking._id, "accepted")}>Accept request</button>
                <button type="button" className="btn-outline" disabled={busy} onClick={() => handleStatus(booking._id, "rejected")}>Decline</button>
              </div>
            )}
            {booking.status === "accepted" && (
              <button type="button" className="btn-outline" disabled={busy} style={{ marginTop: 18 }} onClick={() => handleStatus(booking._id, "completed")}>
                Mark completed
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="page-content" style={{ paddingTop: 88, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 24px 70px" }}>
        <div style={{ ...panelStyle, padding: 30, marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
              <Avatar initials={user.name.slice(0, 2).toUpperCase()} imageUrl={profile?.livePhoto} size={72} />
              <div>
                <div className="tag tag-blue" style={{ marginBottom: 10 }}>Helper workspace</div>
                <h1 style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.03, marginBottom: 8 }}>
                  Welcome back, {user.name}
                </h1>
                <p style={{ color: "var(--text2)", lineHeight: 1.75, fontSize: 15, maxWidth: 700 }}>
                  See your next step immediately, track household requests cleanly, and keep your listing ready for work.
                </p>
                <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, minWidth: 220 }}>
              <span style={{ width: "fit-content", padding: "8px 13px", borderRadius: 999, background: verification.bg, color: verification.color, fontWeight: 800, fontSize: 12 }}>
                {verification.label}
              </span>
              {profile?.approvalNotes && (
                <div style={{ color: "var(--text2)", fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>
                  Admin note: {profile.approvalNotes}
                </div>
              )}
            </div>
          </div>

          {profile && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 22 }}>
              {[
                ["New requests", requestGroups.newRequests.length, "var(--brand-dark)"],
                ["Active jobs", requestGroups.active.length, "var(--accent)"],
                ["Completed history", requestGroups.history.length, "var(--text2)"],
              ].map(([label, value, tone]) => (
                <div key={label} style={statTile}>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: tone }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!profileLoading && profileError === "no_profile" && (
          <EmptyState
            tag="Verification needed"
            title="Complete your helper profile first"
            text="Add your work details, Aadhaar, live photo, and supporting documents. Your listing stays hidden until an admin approves it."
            actionLabel="Complete my verification profile"
            onAction={() => setPage("register")}
          />
        )}

        {profileLoading && <div style={{ ...panelStyle, padding: 24, marginBottom: 22, color: "var(--text2)" }}>Loading your workspace...</div>}

        {profileError === "load_failed" && !profileLoading && (
          <div style={{ ...panelStyle, padding: 22, marginBottom: 22, color: "var(--text2)" }}>
            Could not load your profile. <button type="button" onClick={refreshAll} style={{ background: "none", border: "none", color: "var(--brand-dark)", cursor: "pointer", fontWeight: 800 }}>Retry</button>
          </div>
        )}

        {profile && (
          <>
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
                ["requests", "Requests"],
                ["documents", "Documents"],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setTab(value)} style={tabButton(tab === value)}>
                  {label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 0.42fr)", gap: 18 }}>
                <div style={{ ...panelStyle, padding: 24 }}>
                  <div className="tag tag-purple" style={{ marginBottom: 12 }}>Listing overview</div>
                  <h3 style={{ fontSize: 30, marginBottom: 14 }}>{profile.name}</h3>
                  <div style={{ display: "grid", gap: 12, fontSize: 15, color: "var(--text)" }}>
                    <div><span style={{ color: "var(--text3)", fontSize: 12 }}>Service and city</span><div>{profile.service} in {profile.area}, {profile.city}</div></div>
                    <div><span style={{ color: "var(--text3)", fontSize: 12 }}>Monthly rate</span><div style={{ fontWeight: 800 }}>Rs.{Number(profile.price).toLocaleString()}/mo</div></div>
                    <div><span style={{ color: "var(--text3)", fontSize: 12 }}>Phone</span><div>{profile.phone}</div></div>
                    <div><span style={{ color: "var(--text3)", fontSize: 12 }}>Verification status</span><div style={{ color: verification.color, fontWeight: 800 }}>{verification.label}</div></div>
                    {profile.about && <div><span style={{ color: "var(--text3)", fontSize: 12 }}>About</span><p style={{ lineHeight: 1.7, marginTop: 4 }}>{profile.about}</p></div>}
                  </div>
                  <button type="button" className="btn-outline" style={{ marginTop: 18 }} onClick={() => setPage("register")}>Edit and resubmit profile</button>
                </div>
                <div style={statTile}>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 8 }}>Live photo</div>
                  {profile.livePhoto ? (
                    <img src={profile.livePhoto} alt={profile.name} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 22, border: "1px solid rgba(74,101,114,0.16)" }} />
                  ) : (
                    <div style={{ borderRadius: 22, aspectRatio: "1 / 1", display: "grid", placeItems: "center", background: "var(--surface-soft)", color: "var(--text3)" }}>No live photo</div>
                  )}
                </div>
              </div>
            )}

            {tab === "documents" && (
              <div style={{ ...panelStyle, padding: 24 }}>
                <div className="tag tag-blue" style={{ marginBottom: 12 }}>Verification docs</div>
                <h3 style={{ fontSize: 30, marginBottom: 16 }}>Documents ready for review</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {(profile.verificationDocuments || []).map((doc) => (
                    <div key={`${doc.type}-${doc.documentNumber}`} style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", border: "1px solid rgba(74,101,114,0.16)", borderRadius: 20, padding: 18, background: "rgba(255,255,255,0.92)" }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--text)" }}>{doc.type}</div>
                        <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 5 }}>{doc.documentNumber}</div>
                        <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 5 }}>{doc.fileName || "Uploaded PDF"}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPdfDocument(doc.documentUrl, doc.fileName || `${doc.type}.pdf`)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--brand-dark)",
                          fontWeight: 800,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Open document
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "requests" && (
              profile.verificationStatus !== "approved" ? (
                <EmptyState
                  tag="Pending approval"
                  title="Incoming work unlocks after approval"
                  text="Families cannot see your listing yet. Once the admin approves your helper profile, booking requests will start appearing here."
                />
              ) : incomingLoading ? (
                <div style={{ ...panelStyle, padding: 24, color: "var(--text2)" }}>Loading requests...</div>
              ) : (
                <div style={{ display: "grid", gap: 22 }}>
                  <div>
                    <div className="tag tag-blue" style={{ marginBottom: 12 }}>New requests</div>
                    {requestGroups.newRequests.length ? renderRequestList(requestGroups.newRequests) : (
                      <EmptyState tag="No new requests" title="Nothing new has come in" text="When a household sends a new request, it will appear here first." />
                    )}
                  </div>

                  <div>
                    <div className="tag tag-green" style={{ marginBottom: 12 }}>Active jobs</div>
                    {requestGroups.active.length ? renderRequestList(requestGroups.active) : (
                      <EmptyState tag="No active jobs" title="No accepted work in progress" text="Accepted household jobs will stay here until you mark them completed." />
                    )}
                  </div>

                  <div>
                    <div className="tag tag-purple" style={{ marginBottom: 12 }}>Request history</div>
                    {requestGroups.history.length ? renderRequestList(requestGroups.history) : (
                      <EmptyState tag="No history yet" title="Past request decisions will appear here" text="Completed and declined requests are grouped here so your active flow stays cleaner." />
                    )}
                  </div>
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