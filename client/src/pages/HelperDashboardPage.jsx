import { useEffect, useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import {
  addBookingAttendance,
  getHelperRequests,
  getMyHelperProfile,
  requestBookingCall,
  sendBookingMessage,
  updateBookingCall,
  updateBookingStatus,
} from "../api/index";
import { openPdfDocument } from "../utils/document";

const statusStyle = (status) => ({
  pending: { bg: "rgba(74,101,114,0.14)", color: "#4A6572", label: "New connection" },
  accepted: { bg: "rgba(27,156,133,0.14)", color: "#167c6a", label: "Accepted" },
  active: { bg: "rgba(16,42,67,0.12)", color: "#102A43", label: "Service active" },
  rejected: { bg: "rgba(182,84,69,0.14)", color: "#9f4336", label: "Declined" },
  completed: { bg: "rgba(27,156,133,0.10)", color: "#1B9C85", label: "Completed" },
  cancelled: { bg: "rgba(182,84,69,0.10)", color: "#8b4b40", label: "Cancelled" },
}[status] || { bg: "rgba(74,101,114,0.14)", color: "#4A6572", label: "Open" });

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

const statTile = { padding: "16px 18px", borderRadius: 20, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(74,101,114,0.16)" };
const tabButton = (active) => ({ padding: "10px 18px", borderRadius: 999, border: "1px solid transparent", cursor: "pointer", background: active ? "rgba(27,156,133,0.14)" : "transparent", color: active ? "var(--brand-dark)" : "var(--text2)", fontWeight: 800, fontSize: 13, letterSpacing: "0.02em" });
const EmptyState = ({ tag, title, text, actionLabel, onAction }) => <div style={{ ...panelStyle, padding: "46px 24px", textAlign: "center" }}><div className="tag tag-blue" style={{ margin: "0 auto 14px", width: "fit-content" }}>{tag}</div><h3 style={{ fontSize: 30, marginBottom: 10 }}>{title}</h3><p style={{ color: "var(--text2)", maxWidth: 600, margin: "0 auto", lineHeight: 1.8, marginBottom: actionLabel ? 18 : 0 }}>{text}</p>{actionLabel ? <button type="button" className="btn-primary" onClick={onAction}>{actionLabel}</button> : null}</div>;
const formatDateTime = (value) => { const parsed = value ? new Date(value) : null; return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString() : "Just now"; };

const HelperDashboardPage = ({ user, setPage, showToast }) => {
  const [tab, setTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [messageDrafts, setMessageDrafts] = useState({});
  const [callNotes, setCallNotes] = useState({});
  const [attendanceForms, setAttendanceForms] = useState({});

  const loadProfile = async () => {
    setProfileLoading(true); setProfileError(null);
    try { const res = await getMyHelperProfile(); setProfile(res.data.data); return res.data.data; }
    catch (err) { if (err.response?.status === 404) { setProfile(null); setProfileError("no_profile"); } else { setProfileError("load_failed"); } return null; }
    finally { setProfileLoading(false); }
  };

  const loadIncoming = async () => {
    setIncomingLoading(true);
    try { const res = await getHelperRequests(); setIncoming(res.data.data || []); }
    catch { setIncoming([]); }
    finally { setIncomingLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { if (profile?.verificationStatus === "approved") loadIncoming(); }, [profile?.verificationStatus]);

  const requestGroups = useMemo(() => ({
    newRequests: incoming.filter((booking) => booking.status === "pending"),
    connections: incoming.filter((booking) => booking.status === "accepted"),
    active: incoming.filter((booking) => booking.status === "active"),
    history: incoming.filter((booking) => ["rejected", "completed", "cancelled"].includes(booking.status)),
  }), [incoming]);

  const verification = verificationStyles[profile?.verificationStatus || "pending"];

  const nextStep = useMemo(() => {
    if (!profile) return { label: "Start here", title: "Complete your helper verification", text: "Add your work details, live photo, and documents so the admin can review your listing.", actionLabel: "Complete verification", action: () => setPage("register") };
    if (profile.verificationStatus === "pending") return { label: "Waiting for review", title: "Your profile is with the admin team", text: "No extra action is needed right now. Keep your profile documents ready in case the admin asks for clarification.", actionLabel: "View documents", action: () => setTab("documents") };
    if (profile.verificationStatus === "rejected") return { label: "Needs changes", title: "Update your profile and resubmit", text: profile.approvalNotes || "The admin requested changes before your listing can go live again.", actionLabel: "Edit profile", action: () => setPage("register") };
    if (requestGroups.newRequests.length) return { label: "Action needed", title: `You have ${requestGroups.newRequests.length} new household connection${requestGroups.newRequests.length > 1 ? "s" : ""}`, text: "Review the household note, reply in chat, and accept the helpers you want to work with.", actionLabel: "Open requests", action: () => setTab("requests") };
    if (requestGroups.active.length) return { label: "Live service", title: "Track active households from one place", text: "Use attendance updates and in-app communication to keep the service relationship organised.", actionLabel: "Open live services", action: () => setTab("services") };
    return { label: "Profile live", title: "Your listing is visible and ready", text: "Stay ready for new household requests and keep the conversation inside GharSeva.", actionLabel: "Open overview", action: () => setTab("overview") };
  }, [profile, requestGroups, setPage]);
  const syncBooking = (updatedBooking) => setIncoming((current) => current.map((item) => (String(item._id) === String(updatedBooking._id) ? updatedBooking : item)));
  const refreshAll = async () => { const current = await loadProfile(); if (current?.verificationStatus === "approved") await loadIncoming(); };

  const handleStatus = async (bookingId, status) => {
    setActionId(`${bookingId}:${status}`);
    try { const res = await updateBookingStatus(bookingId, status); syncBooking(res.data.data); showToast?.(`Connection marked ${status}.`, "success"); }
    catch (err) { showToast?.(err.response?.data?.msg || "Could not update connection.", "error"); }
    finally { setActionId(null); }
  };

  const handleMessage = async (bookingId) => {
    const text = (messageDrafts[bookingId] || "").trim();
    if (!text) return;
    setActionId(`${bookingId}:message`);
    try { const res = await sendBookingMessage(bookingId, text); syncBooking(res.data.data); setMessageDrafts((current) => ({ ...current, [bookingId]: "" })); }
    catch (err) { showToast?.(err.response?.data?.msg || "Could not send message.", "error"); }
    finally { setActionId(null); }
  };

  const handleCallRequest = async (bookingId) => {
    setActionId(`${bookingId}:callrequest`);
    try { const res = await requestBookingCall(bookingId, callNotes[bookingId] || ""); syncBooking(res.data.data); setCallNotes((current) => ({ ...current, [bookingId]: "" })); showToast?.("Masked call request sent.", "success"); }
    catch (err) { showToast?.(err.response?.data?.msg || "Could not request call.", "error"); }
    finally { setActionId(null); }
  };

  const handleCallAction = async (bookingId, callId, status) => {
    setActionId(`${bookingId}:call:${callId}:${status}`);
    try { const res = await updateBookingCall(bookingId, callId, status); syncBooking(res.data.data); showToast?.(`Call request ${status}.`, "success"); }
    catch (err) { showToast?.(err.response?.data?.msg || "Could not update call request.", "error"); }
    finally { setActionId(null); }
  };

  const handleAttendance = async (bookingId) => {
    const form = attendanceForms[bookingId] || {};
    if (!form.date) return showToast?.("Choose an attendance date first.", "error");
    setActionId(`${bookingId}:attendance`);
    try { const res = await addBookingAttendance(bookingId, { date: form.date, status: form.status || "present", note: form.note || "" }); syncBooking(res.data.data); setAttendanceForms((current) => ({ ...current, [bookingId]: { date: "", status: "present", note: "" } })); showToast?.("Attendance updated.", "success"); }
    catch (err) { showToast?.(err.response?.data?.msg || "Could not update attendance.", "error"); }
    finally { setActionId(null); }
  };

  const renderMessages = (booking) => <div style={{ ...statTile, display: "grid", gap: 12 }}><div style={{ fontWeight: 800, color: "var(--text)" }}>Private chat</div><div style={{ display: "grid", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>{(booking.messages || []).length ? booking.messages.map((entry) => <div key={String(entry._id)} style={{ borderRadius: 16, padding: "12px 14px", background: entry.senderRole === "helper" ? "rgba(27,156,133,0.10)" : "rgba(16,42,67,0.06)", border: "1px solid rgba(74,101,114,0.12)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6, fontSize: 12, color: "var(--text3)" }}><span>{entry.senderRole === "helper" ? "You" : booking.user?.name || "Household"}</span><span>{formatDateTime(entry.createdAt)}</span></div><div style={{ color: "var(--text)", lineHeight: 1.6, fontSize: 14 }}>{entry.text}</div></div>) : <div style={{ color: "var(--text2)", fontSize: 14 }}>No messages yet.</div>}</div>{!["rejected", "completed", "cancelled"].includes(booking.status) ? <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10 }}><input className="input-field" placeholder="Reply to the household" value={messageDrafts[booking._id] || ""} onChange={(e) => setMessageDrafts((current) => ({ ...current, [booking._id]: e.target.value }))} /><button type="button" className="btn-primary" disabled={actionId === `${booking._id}:message`} onClick={() => handleMessage(booking._id)}>Send</button></div> : null}</div>;

  const renderCalls = (booking) => <div style={{ ...statTile, display: "grid", gap: 12 }}><div style={{ fontWeight: 800, color: "var(--text)" }}>Masked call requests</div><div style={{ display: "grid", gap: 8 }}>{(booking.callRequests || []).length ? [...booking.callRequests].reverse().map((call) => <div key={String(call._id)} style={{ borderRadius: 16, border: "1px solid rgba(74,101,114,0.12)", padding: "12px 14px", background: "rgba(255,255,255,0.86)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div style={{ fontWeight: 700, color: "var(--text)" }}>{call.requestedByRole === "helper" ? "You asked for a call" : `${booking.user?.name || "Household"} asked for a call`}</div><span className="tag tag-blue" style={{ textTransform: "capitalize" }}>{call.status}</span></div>{call.note ? <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>{call.note}</div> : null}{call.status === "pending" && call.requestedByRole === "user" ? <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}><button type="button" className="btn-primary" onClick={() => handleCallAction(booking._id, call._id, "accepted")}>Accept call</button><button type="button" className="btn-outline" onClick={() => handleCallAction(booking._id, call._id, "declined")}>Decline</button></div> : null}{call.status === "accepted" ? <button type="button" className="btn-outline" style={{ marginTop: 10 }} onClick={() => handleCallAction(booking._id, call._id, "completed")}>Mark call done</button> : null}</div>) : <div style={{ color: "var(--text2)", fontSize: 14 }}>No call requests yet.</div>}</div>{!["rejected", "completed", "cancelled"].includes(booking.status) ? <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10 }}><input className="input-field" placeholder="Suggest a time for a call" value={callNotes[booking._id] || ""} onChange={(e) => setCallNotes((current) => ({ ...current, [booking._id]: e.target.value }))} /><button type="button" className="btn-outline" onClick={() => handleCallRequest(booking._id)}>Request call</button></div> : null}</div>;

  const renderServiceTracker = (booking) => {
    const attendanceForm = attendanceForms[booking._id] || { date: "", status: "present", note: "" };
    return <div style={{ display: "grid", gap: 14, marginTop: 14 }}><div style={{ ...statTile, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}><div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Started on</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{booking.serviceStartedAt ? new Date(booking.serviceStartedAt).toLocaleDateString() : "Waiting for household"}</div></div><div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Attendance records</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{(booking.attendance || []).length}</div></div><div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Payments logged</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{(booking.payments || []).length}</div></div><div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Weekly reviews</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{(booking.weeklyReviews || []).length}</div></div></div><div style={{ ...statTile, display: "grid", gap: 12 }}><div style={{ fontWeight: 800, color: "var(--text)" }}>Mark attendance</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}><input className="input-field" type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForms((current) => ({ ...current, [booking._id]: { ...attendanceForm, date: e.target.value } }))} /><select className="input-field" value={attendanceForm.status} onChange={(e) => setAttendanceForms((current) => ({ ...current, [booking._id]: { ...attendanceForm, status: e.target.value } }))}><option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option></select><input className="input-field" placeholder="Optional note" value={attendanceForm.note} onChange={(e) => setAttendanceForms((current) => ({ ...current, [booking._id]: { ...attendanceForm, note: e.target.value } }))} /><button type="button" className="btn-outline" onClick={() => handleAttendance(booking._id)}>Save attendance</button></div>{(booking.attendance || []).length ? <div style={{ display: "grid", gap: 8 }}>{booking.attendance.slice(0, 6).map((entry) => <div key={String(entry._id)} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderTop: "1px solid rgba(74,101,114,0.10)", paddingTop: 8 }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{entry.date}</span><span style={{ color: "var(--text2)", textTransform: "capitalize" }}>{entry.status}</span><span style={{ color: "var(--text3)", fontSize: 12 }}>Marked by {entry.markedByRole}</span></div>)}</div> : null}</div><div style={{ ...statTile, display: "grid", gap: 8 }}><div style={{ fontWeight: 800, color: "var(--text)" }}>Payments from household</div>{(booking.payments || []).length ? booking.payments.slice(0, 6).map((payment) => <div key={String(payment._id)} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderTop: "1px solid rgba(74,101,114,0.10)", paddingTop: 8 }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{payment.monthLabel}</span><span style={{ color: "var(--text2)" }}>Rs.{Number(payment.amount || 0).toLocaleString()}</span><span style={{ color: "var(--text3)", fontSize: 12 }}>{payment.paidOn ? new Date(payment.paidOn).toLocaleDateString() : "Paid"}</span></div>) : <div style={{ color: "var(--text2)", fontSize: 14 }}>No payments logged yet.</div>}</div><div style={{ ...statTile, display: "grid", gap: 8 }}><div style={{ fontWeight: 800, color: "var(--text)" }}>Weekly household feedback</div>{(booking.weeklyReviews || []).length ? booking.weeklyReviews.slice(0, 6).map((review) => <div key={String(review._id)} style={{ borderTop: "1px solid rgba(74,101,114,0.10)", paddingTop: 8 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{review.weekLabel}</span><span style={{ color: "var(--accent)" }}>{review.rating}/5</span></div>{review.review ? <div style={{ color: "var(--text2)", marginTop: 4, fontSize: 14 }}>{review.review}</div> : null}</div>) : <div style={{ color: "var(--text2)", fontSize: 14 }}>No weekly feedback yet.</div>}</div></div>;
  };

  const renderBookingCard = (booking, includeServiceTools = false) => {
    const status = statusStyle(booking.status);
    return <div key={String(booking._id)} style={{ ...panelStyle, padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}><div><div className="tag tag-blue" style={{ marginBottom: 10 }}>Household connection</div><div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text)" }}>{booking.user?.name || "Customer"}</div><div style={{ color: "var(--text2)", fontSize: 14, marginTop: 6 }}>{booking.user?.email}</div></div><span style={{ padding: "8px 13px", borderRadius: 999, background: status.bg, color: status.color, fontWeight: 800, fontSize: 12 }}>{status.label}</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}><div style={statTile}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Preferred start</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "Flexible"}</div></div><div style={statTile}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Budget</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{booking.monthlyBudget != null ? `Rs.${Number(booking.monthlyBudget).toLocaleString()}/mo` : "Not specified"}</div></div><div style={statTile}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Household contact</div><div style={{ fontWeight: 800, color: "var(--text)" }}>Masked by GharSeva</div></div></div>{booking.message ? <p style={{ marginTop: 14, fontSize: 14, color: "var(--text)", lineHeight: 1.75 }}><strong style={{ color: "var(--brand-dark)" }}>First note:</strong> {booking.message}</p> : null}<div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 14, marginTop: 16 }}>{renderMessages(booking)}{renderCalls(booking)}</div>{booking.status === "pending" ? <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}><button type="button" className="btn-primary" disabled={actionId === `${booking._id}:accepted`} onClick={() => handleStatus(booking._id, "accepted")}>Accept connection</button><button type="button" className="btn-outline" disabled={actionId === `${booking._id}:rejected`} onClick={() => handleStatus(booking._id, "rejected")}>Decline</button></div> : null}{booking.status === "accepted" ? <div style={{ ...statTile, marginTop: 16, color: "var(--text2)", lineHeight: 1.7 }}>You accepted this household. The service tracker will become live when the household marks that work has started.</div> : null}{booking.status === "active" ? <button type="button" className="btn-outline" style={{ marginTop: 18 }} disabled={actionId === `${booking._id}:completed`} onClick={() => handleStatus(booking._id, "completed")}>Mark service completed</button> : null}{includeServiceTools ? renderServiceTracker(booking) : null}</div>;
  };
  return (
    <div className="page-content" style={{ paddingTop: 88, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 24px 70px" }}>
        <div style={{ ...panelStyle, padding: 30, marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
              <Avatar initials={user.name.slice(0, 2).toUpperCase()} imageUrl={profile?.livePhoto} size={72} />
              <div>
                <div className="tag tag-blue" style={{ marginBottom: 10 }}>Helper workspace</div>
                <h1 style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.03, marginBottom: 8 }}>Welcome back, {user.name}</h1>
                <p style={{ color: "var(--text2)", lineHeight: 1.75, fontSize: 15, maxWidth: 700 }}>Respond to households, keep the conversation inside GharSeva, and manage active service cleanly once work begins.</p>
                <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>{user.email}</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10, minWidth: 220 }}><span style={{ width: "fit-content", padding: "8px 13px", borderRadius: 999, background: verification.bg, color: verification.color, fontWeight: 800, fontSize: 12 }}>{verification.label}</span>{profile?.approvalNotes ? <div style={{ color: "var(--text2)", fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>Admin note: {profile.approvalNotes}</div> : null}</div>
          </div>
          {profile ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 22 }}>{[["New requests", requestGroups.newRequests.length, "var(--brand-dark)"], ["Accepted", requestGroups.connections.length, "var(--accent)"], ["Active services", requestGroups.active.length, "var(--text)"], ["History", requestGroups.history.length, "var(--text2)"]].map(([label, value, tone]) => <div key={label} style={statTile}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>{label}</div><div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: tone }}>{value}</div></div>)}</div> : null}
        </div>

        {!profileLoading && profileError === "no_profile" ? <EmptyState tag="Verification needed" title="Complete your helper profile first" text="Add your work details, Aadhaar, live photo, and supporting documents. Your listing stays hidden until an admin approves it." actionLabel="Complete my verification profile" onAction={() => setPage("register")} /> : null}
        {profileLoading ? <div style={{ ...panelStyle, padding: 24, marginBottom: 22, color: "var(--text2)" }}>Loading your workspace...</div> : null}
        {profileError === "load_failed" && !profileLoading ? <div style={{ ...panelStyle, padding: 22, marginBottom: 22, color: "var(--text2)" }}>Could not load your profile. <button type="button" onClick={refreshAll} style={{ background: "none", border: "none", color: "var(--brand-dark)", cursor: "pointer", fontWeight: 800 }}>Retry</button></div> : null}

        {profile ? <>
          <div style={{ ...panelStyle, padding: 24, marginBottom: 22 }}><div className="tag tag-green" style={{ marginBottom: 12 }}>{nextStep.label}</div><div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}><div><h2 style={{ fontSize: 30, marginBottom: 8 }}>{nextStep.title}</h2><p style={{ color: "var(--text2)", lineHeight: 1.75, maxWidth: 640 }}>{nextStep.text}</p></div><button type="button" className="btn-primary" onClick={nextStep.action}>{nextStep.actionLabel}</button></div></div>

          <div style={{ display: "inline-flex", gap: 6, padding: 6, borderRadius: 999, border: "1px solid rgba(74,101,114,0.18)", background: "rgba(255,255,255,0.85)", marginBottom: 22, flexWrap: "wrap" }}>{[["overview", "Overview"], ["requests", "Requests"], ["services", "Live services"], ["documents", "Documents"], ["history", "History"]].map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} style={tabButton(tab === value)}>{label}</button>)}</div>

          {tab === "overview" ? <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 0.42fr)", gap: 18 }}><div style={{ ...panelStyle, padding: 24 }}><div className="tag tag-purple" style={{ marginBottom: 12 }}>Listing overview</div><h3 style={{ fontSize: 30, marginBottom: 14 }}>{profile.name}</h3><div style={{ display: "grid", gap: 12, fontSize: 15, color: "var(--text)" }}><div><span style={{ color: "var(--text3)", fontSize: 12 }}>Service and city</span><div>{profile.service} in {profile.area}, {profile.city}</div></div><div><span style={{ color: "var(--text3)", fontSize: 12 }}>Monthly rate</span><div style={{ fontWeight: 800 }}>Rs.{Number(profile.price).toLocaleString()}/mo</div></div><div><span style={{ color: "var(--text3)", fontSize: 12 }}>Phone</span><div>{profile.phone}</div></div><div><span style={{ color: "var(--text3)", fontSize: 12 }}>Verification status</span><div style={{ color: verification.color, fontWeight: 800 }}>{verification.label}</div></div>{profile.about ? <div><span style={{ color: "var(--text3)", fontSize: 12 }}>About</span><p style={{ lineHeight: 1.7, marginTop: 4 }}>{profile.about}</p></div> : null}</div><button type="button" className="btn-outline" style={{ marginTop: 18 }} onClick={() => setPage("register")}>Edit and resubmit profile</button></div><div style={statTile}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 8 }}>Live photo</div>{profile.livePhoto ? <img src={profile.livePhoto} alt={profile.name} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 22, border: "1px solid rgba(74,101,114,0.16)" }} /> : <div style={{ borderRadius: 22, aspectRatio: "1 / 1", display: "grid", placeItems: "center", background: "var(--surface-soft)", color: "var(--text3)" }}>No live photo</div>}</div></div> : null}

          {tab === "documents" ? <div style={{ ...panelStyle, padding: 24 }}><div className="tag tag-blue" style={{ marginBottom: 12 }}>Verification docs</div><h3 style={{ fontSize: 30, marginBottom: 16 }}>Documents ready for review</h3><div style={{ display: "grid", gap: 12 }}>{(profile.verificationDocuments || []).map((doc) => <div key={`${doc.type}-${doc.documentNumber}`} style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", border: "1px solid rgba(74,101,114,0.16)", borderRadius: 20, padding: 18, background: "rgba(255,255,255,0.92)" }}><div><div style={{ fontWeight: 800, color: "var(--text)" }}>{doc.type}</div><div style={{ color: "var(--text2)", fontSize: 13, marginTop: 5 }}>{doc.documentNumber}</div><div style={{ color: "var(--text3)", fontSize: 12, marginTop: 5 }}>{doc.fileName || "Uploaded PDF"}</div></div><button type="button" onClick={() => openPdfDocument(doc.documentUrl, doc.fileName || `${doc.type}.pdf`)} style={{ background: "none", border: "none", color: "var(--brand-dark)", fontWeight: 800, cursor: "pointer", padding: 0 }}>Open document</button></div>)}</div></div> : null}

          {tab === "requests" ? (profile.verificationStatus !== "approved" ? <EmptyState tag="Pending approval" title="Household contact unlocks after approval" text="Families cannot message you yet. Once the admin approves your helper profile, private household connections will appear here." /> : incomingLoading ? <div style={{ ...panelStyle, padding: 24, color: "var(--text2)" }}>Loading requests...</div> : (requestGroups.newRequests.length || requestGroups.connections.length) ? <div style={{ display: "grid", gap: 22 }}><div><div className="tag tag-blue" style={{ marginBottom: 12 }}>New requests</div>{requestGroups.newRequests.length ? requestGroups.newRequests.map((booking) => renderBookingCard(booking)) : <EmptyState tag="No new requests" title="Nothing new has come in" text="When a household starts a private connection, it will appear here first." />}</div><div><div className="tag tag-green" style={{ marginBottom: 12 }}>Accepted, waiting to start</div>{requestGroups.connections.length ? requestGroups.connections.map((booking) => renderBookingCard(booking)) : <EmptyState tag="No accepted connections" title="No households are waiting to start yet" text="Accepted households will stay here until they mark the service as started." />}</div></div> : <EmptyState tag="No requests" title="No household connections yet" text="Once a family contacts you through the web app, the full conversation flow will appear here." />) : null}

          {tab === "services" ? (incomingLoading ? <div style={{ ...panelStyle, padding: 24, color: "var(--text2)" }}>Loading live services...</div> : requestGroups.active.length ? <div style={{ display: "grid", gap: 18 }}>{requestGroups.active.map((booking) => renderBookingCard(booking, true))}</div> : <EmptyState tag="No live services" title="Active work will appear here" text="When a household starts the service tracker, you will be able to manage attendance and review the month from this section." />) : null}

          {tab === "history" ? (incomingLoading ? <div style={{ ...panelStyle, padding: 24, color: "var(--text2)" }}>Loading service history...</div> : requestGroups.history.length ? <div style={{ display: "grid", gap: 18 }}>{requestGroups.history.map((booking) => renderBookingCard(booking, booking.status === "completed"))}</div> : <EmptyState tag="No history yet" title="Past household decisions will appear here" text="Completed, declined, and cancelled connections are grouped here so active work stays cleaner." />) : null}
        </> : null}
      </div>
    </div>
  );
};

export default HelperDashboardPage;

