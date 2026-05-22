import { useEffect, useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import HelperCard from "../components/HelperCard";
import {
  addBookingAttendance,
  addBookingPayment,
  addBookingWeeklyReview,
  getMyBookings,
  getSavedHelpers,
  requestBookingCall,
  sendBookingMessage,
  updateBookingCall,
  updateBookingStatus,
} from "../api/index";

const statusStyle = (status) => ({
  pending: { bg: "rgba(74,101,114,0.14)", color: "#4A6572", label: "Waiting for helper" },
  accepted: { bg: "rgba(27,156,133,0.14)", color: "#167c6a", label: "Accepted" },
  active: { bg: "rgba(16,42,67,0.12)", color: "#102A43", label: "Service active" },
  rejected: { bg: "rgba(182,84,69,0.14)", color: "#9f4336", label: "Declined" },
  completed: { bg: "rgba(27,156,133,0.10)", color: "#1B9C85", label: "Completed" },
  cancelled: { bg: "rgba(182,84,69,0.10)", color: "#8b4b40", label: "Cancelled" },
}[status] || { bg: "rgba(74,101,114,0.14)", color: "#4A6572", label: "Open" });

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
    <p style={{ color: "var(--text2)", marginBottom: 18, lineHeight: 1.75, maxWidth: 560, marginInline: "auto" }}>{text}</p>
    {actionLabel ? <button type="button" className="btn-primary" onClick={onAction}>{actionLabel}</button> : null}
  </div>
);

const formatDateTime = (value) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString() : "Just now";
};

const UserDashboardPage = ({ user, savedIds, onView, onSave, setPage, showToast }) => {
  const [tab, setTab] = useState("overview");
  const [savedHelpers, setSavedHelpers] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [actionId, setActionId] = useState("");
  const [messageDrafts, setMessageDrafts] = useState({});
  const [callNotes, setCallNotes] = useState({});
  const [attendanceForms, setAttendanceForms] = useState({});
  const [paymentForms, setPaymentForms] = useState({});
  const [reviewForms, setReviewForms] = useState({});

  const loadSavedHelpers = async () => {
    setSavedLoading(true);
    try {
      const res = await getSavedHelpers();
      setSavedHelpers((res.data.data || []).map((helper) => ({ ...helper, id: helper._id })));
    } catch {
      setSavedHelpers([]);
    } finally {
      setSavedLoading(false);
    }
  };

  const loadBookings = async () => {
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
    if (!user) return;
    loadSavedHelpers();
    loadBookings();
  }, [user, savedIds]);

  const bookingGroups = useMemo(() => ({
    connections: myBookings.filter((booking) => ["pending", "accepted"].includes(booking.status)),
    activeServices: myBookings.filter((booking) => booking.status === "active"),
    history: myBookings.filter((booking) => ["rejected", "completed", "cancelled"].includes(booking.status)),
  }), [myBookings]);

  const nextStep = useMemo(() => {
    if (!savedHelpers.length) return { label: "Start here", title: "Build your shortlist first", text: "Browse verified helpers and save the ones that feel right for your home before starting a private connection.", actionLabel: "Browse helpers", action: () => setPage("browse") };
    if (!bookingGroups.connections.length && !bookingGroups.activeServices.length) return { label: "Next step", title: "Start a private connection with a helper", text: "Your shortlist is ready. Open a profile and begin the conversation inside GharSeva instead of moving to WhatsApp.", actionLabel: "View shortlist", action: () => setTab("shortlist") };
    if (bookingGroups.connections.some((booking) => booking.status === "accepted")) return { label: "Ready to begin", title: "Start service tracking when the helper joins", text: "Once work begins, turn the accepted connection into an active service to unlock attendance, payment, and weekly review tracking.", actionLabel: "Open connections", action: () => setTab("connections") };
    if (bookingGroups.activeServices.length) return { label: "Live service", title: "Track attendance, payments, and quality weekly", text: "Your active services are where the monthly relationship lives now, with updates kept inside the dashboard.", actionLabel: "Open live services", action: () => setTab("services") };
    return { label: "In progress", title: "Watch for helper responses", text: "Your open requests are waiting for a reply. Keep the conversation going right here inside the web app.", actionLabel: "Open connections", action: () => setTab("connections") };
  }, [savedHelpers.length, bookingGroups, setPage]);

  const statItems = [["Saved helpers", savedHelpers.length, "var(--brand-dark)"], ["Open connections", bookingGroups.connections.length, "var(--accent)"], ["Live services", bookingGroups.activeServices.length, "var(--text)"], ["History", bookingGroups.history.length, "var(--text2)"]];

  const syncBooking = (updatedBooking) => setMyBookings((current) => current.map((item) => (String(item._id) === String(updatedBooking._id) ? updatedBooking : item)));

  const handleStatus = async (bookingId, status) => {
    setActionId(`${bookingId}:${status}`);
    try {
      const res = await updateBookingStatus(bookingId, status);
      syncBooking(res.data.data);
      showToast?.(status === "active" ? "Service tracking started." : `Connection marked ${status}.`, "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not update connection.", "error");
    } finally {
      setActionId("");
    }
  };

  const handleMessage = async (bookingId) => {
    const text = (messageDrafts[bookingId] || "").trim();
    if (!text) return;
    setActionId(`${bookingId}:message`);
    try {
      const res = await sendBookingMessage(bookingId, text);
      syncBooking(res.data.data);
      setMessageDrafts((current) => ({ ...current, [bookingId]: "" }));
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not send message.", "error");
    } finally {
      setActionId("");
    }
  };

  const handleCallRequest = async (bookingId) => {
    setActionId(`${bookingId}:callrequest`);
    try {
      const res = await requestBookingCall(bookingId, callNotes[bookingId] || "");
      syncBooking(res.data.data);
      setCallNotes((current) => ({ ...current, [bookingId]: "" }));
      showToast?.("Masked call request sent inside the app.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not request call.", "error");
    } finally {
      setActionId("");
    }
  };
  const handleCallAction = async (bookingId, callId, status) => {
    setActionId(`${bookingId}:call:${callId}:${status}`);
    try {
      const res = await updateBookingCall(bookingId, callId, status);
      syncBooking(res.data.data);
      showToast?.(`Call request ${status}.`, "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not update call request.", "error");
    } finally {
      setActionId("");
    }
  };

  const handleAttendance = async (bookingId) => {
    const form = attendanceForms[bookingId] || {};
    if (!form.date) return showToast?.("Choose an attendance date first.", "error");
    setActionId(`${bookingId}:attendance`);
    try {
      const res = await addBookingAttendance(bookingId, { date: form.date, status: form.status || "present", note: form.note || "" });
      syncBooking(res.data.data);
      setAttendanceForms((current) => ({ ...current, [bookingId]: { date: "", status: "present", note: "" } }));
      showToast?.("Attendance updated.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not update attendance.", "error");
    } finally {
      setActionId("");
    }
  };

  const handlePayment = async (bookingId) => {
    const form = paymentForms[bookingId] || {};
    if (!form.monthLabel || !form.amount) return showToast?.("Add a month and amount first.", "error");
    setActionId(`${bookingId}:payment`);
    try {
      const res = await addBookingPayment(bookingId, { monthLabel: form.monthLabel, amount: Number(form.amount), paidOn: form.paidOn || undefined, note: form.note || "" });
      syncBooking(res.data.data);
      setPaymentForms((current) => ({ ...current, [bookingId]: { monthLabel: "", amount: "", paidOn: "", note: "" } }));
      showToast?.("Payment logged.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not log payment.", "error");
    } finally {
      setActionId("");
    }
  };

  const handleReview = async (bookingId) => {
    const form = reviewForms[bookingId] || {};
    if (!form.weekLabel || !form.rating) return showToast?.("Add a week label and rating first.", "error");
    setActionId(`${bookingId}:review`);
    try {
      const res = await addBookingWeeklyReview(bookingId, { weekLabel: form.weekLabel, rating: Number(form.rating), review: form.review || "", recommended: !!form.recommended });
      syncBooking(res.data.data);
      setReviewForms((current) => ({ ...current, [bookingId]: { weekLabel: "", rating: "5", review: "", recommended: false } }));
      showToast?.("Weekly review saved.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not save weekly review.", "error");
    } finally {
      setActionId("");
    }
  };

  const renderMessages = (booking) => (
    <div style={{ ...statCard, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Private chat</div>
          <div style={{ fontWeight: 800, color: "var(--text)" }}>Continue inside GharSeva</div>
        </div>
        <span className="tag tag-blue">Masked contact via GharSeva</span>
      </div>
      <div style={{ display: "grid", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
        {(booking.messages || []).length ? booking.messages.map((entry) => (
          <div key={String(entry._id)} style={{ borderRadius: 16, padding: "12px 14px", background: entry.senderRole === "user" ? "rgba(27,156,133,0.10)" : "rgba(16,42,67,0.06)", border: "1px solid rgba(74,101,114,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6, fontSize: 12, color: "var(--text3)" }}>
              <span>{entry.senderRole === "user" ? "You" : booking.helper?.name || "Helper"}</span>
              <span>{formatDateTime(entry.createdAt)}</span>
            </div>
            <div style={{ color: "var(--text)", lineHeight: 1.6, fontSize: 14 }}>{entry.text}</div>
          </div>
        )) : <div style={{ color: "var(--text2)", fontSize: 14 }}>No messages yet. Start the conversation here.</div>}
      </div>
      {!["rejected", "completed", "cancelled"].includes(booking.status) ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10 }}>
          <input className="input-field" placeholder="Write a message to the helper" value={messageDrafts[booking._id] || ""} onChange={(e) => setMessageDrafts((current) => ({ ...current, [booking._id]: e.target.value }))} />
          <button type="button" className="btn-primary" disabled={actionId === `${booking._id}:message`} onClick={() => handleMessage(booking._id)}>Send</button>
        </div>
      ) : null}
    </div>
  );

  const renderCalls = (booking) => (
    <div style={{ ...statCard, display: "grid", gap: 12 }}>
      <div>
        <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Masked calling</div>
        <div style={{ fontWeight: 800, color: "var(--text)" }}>Manage masked call requests inside the app</div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {(booking.callRequests || []).length ? [...booking.callRequests].reverse().map((call) => (
          <div key={String(call._id)} style={{ borderRadius: 16, border: "1px solid rgba(74,101,114,0.12)", padding: "12px 14px", background: "rgba(255,255,255,0.86)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, color: "var(--text)" }}>{call.requestedByRole === "user" ? "You asked for a call" : `${booking.helper?.name || "Helper"} asked for a call`}</div>
              <span className="tag tag-blue" style={{ textTransform: "capitalize" }}>{call.status}</span>
            </div>
            {call.note ? <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>{call.note}</div> : null}
            <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 6 }}>{formatDateTime(call.createdAt)}</div>
            {call.status === "pending" && call.requestedByRole === "helper" ? <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}><button type="button" className="btn-primary" onClick={() => handleCallAction(booking._id, call._id, "accepted")}>Accept call</button><button type="button" className="btn-outline" onClick={() => handleCallAction(booking._id, call._id, "declined")}>Decline</button></div> : null}
            {call.status === "accepted" ? <button type="button" className="btn-outline" style={{ marginTop: 10 }} onClick={() => handleCallAction(booking._id, call._id, "completed")}>Mark call done</button> : null}
          </div>
        )) : <div style={{ color: "var(--text2)", fontSize: 14 }}>No call requests yet.</div>}
      </div>
      {!["rejected", "completed", "cancelled"].includes(booking.status) ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10 }}>
          <input className="input-field" placeholder="Best time for a quick call" value={callNotes[booking._id] || ""} onChange={(e) => setCallNotes((current) => ({ ...current, [booking._id]: e.target.value }))} />
          <button type="button" className="btn-outline" onClick={() => handleCallRequest(booking._id)}>Request call</button>
        </div>
      ) : null}
    </div>
  );
  const renderServiceTracker = (booking) => {
    const attendanceForm = attendanceForms[booking._id] || { date: "", status: "present", note: "" };
    const paymentForm = paymentForms[booking._id] || { monthLabel: "", amount: "", paidOn: "", note: "" };
    const reviewForm = reviewForms[booking._id] || { weekLabel: "", rating: "5", review: "", recommended: false };

    return (
      <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
        <div style={{ ...statCard, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Service started</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{booking.serviceStartedAt ? new Date(booking.serviceStartedAt).toLocaleDateString() : "Not started yet"}</div></div>
          <div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Attendance records</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{(booking.attendance || []).length}</div></div>
          <div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Payments logged</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{(booking.payments || []).length}</div></div>
          <div><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4 }}>Weekly reviews</div><div style={{ fontWeight: 800, color: "var(--text)" }}>{(booking.weeklyReviews || []).length}</div></div>
        </div>

        <div style={{ ...statCard, display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 800, color: "var(--text)" }}>Attendance tracker</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <input className="input-field" type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForms((current) => ({ ...current, [booking._id]: { ...attendanceForm, date: e.target.value } }))} />
            <select className="input-field" value={attendanceForm.status} onChange={(e) => setAttendanceForms((current) => ({ ...current, [booking._id]: { ...attendanceForm, status: e.target.value } }))}><option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option></select>
            <input className="input-field" placeholder="Optional note" value={attendanceForm.note} onChange={(e) => setAttendanceForms((current) => ({ ...current, [booking._id]: { ...attendanceForm, note: e.target.value } }))} />
            <button type="button" className="btn-outline" onClick={() => handleAttendance(booking._id)}>Save attendance</button>
          </div>
          {(booking.attendance || []).length ? <div style={{ display: "grid", gap: 8 }}>{booking.attendance.slice(0, 6).map((entry) => <div key={String(entry._id)} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderTop: "1px solid rgba(74,101,114,0.10)", paddingTop: 8 }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{entry.date}</span><span style={{ color: "var(--text2)", textTransform: "capitalize" }}>{entry.status}</span><span style={{ color: "var(--text3)", fontSize: 12 }}>Marked by {entry.markedByRole}</span></div>)}</div> : null}
        </div>

        <div style={{ ...statCard, display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 800, color: "var(--text)" }}>Monthly payment tracker</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <input className="input-field" placeholder="May 2026" value={paymentForm.monthLabel} onChange={(e) => setPaymentForms((current) => ({ ...current, [booking._id]: { ...paymentForm, monthLabel: e.target.value } }))} />
            <input className="input-field" type="number" min="0" placeholder="Amount" value={paymentForm.amount} onChange={(e) => setPaymentForms((current) => ({ ...current, [booking._id]: { ...paymentForm, amount: e.target.value } }))} />
            <input className="input-field" type="date" value={paymentForm.paidOn} onChange={(e) => setPaymentForms((current) => ({ ...current, [booking._id]: { ...paymentForm, paidOn: e.target.value } }))} />
            <input className="input-field" placeholder="Optional note" value={paymentForm.note} onChange={(e) => setPaymentForms((current) => ({ ...current, [booking._id]: { ...paymentForm, note: e.target.value } }))} />
            <button type="button" className="btn-outline" onClick={() => handlePayment(booking._id)}>Log payment</button>
          </div>
          {(booking.payments || []).length ? <div style={{ display: "grid", gap: 8 }}>{booking.payments.slice(0, 6).map((payment) => <div key={String(payment._id)} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderTop: "1px solid rgba(74,101,114,0.10)", paddingTop: 8 }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{payment.monthLabel}</span><span style={{ color: "var(--text2)" }}>Rs.{Number(payment.amount || 0).toLocaleString()}</span><span style={{ color: "var(--text3)", fontSize: 12 }}>{payment.paidOn ? new Date(payment.paidOn).toLocaleDateString() : "Paid"}</span></div>)}</div> : null}
        </div>

        <div style={{ ...statCard, display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 800, color: "var(--text)" }}>Weekly quality review</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <input className="input-field" placeholder="Week of 18 May" value={reviewForm.weekLabel} onChange={(e) => setReviewForms((current) => ({ ...current, [booking._id]: { ...reviewForm, weekLabel: e.target.value } }))} />
            <select className="input-field" value={reviewForm.rating} onChange={(e) => setReviewForms((current) => ({ ...current, [booking._id]: { ...reviewForm, rating: e.target.value } }))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={String(value)}>{value} / 5</option>)}</select>
            <input className="input-field" placeholder="How was the service this week?" value={reviewForm.review} onChange={(e) => setReviewForms((current) => ({ ...current, [booking._id]: { ...reviewForm, review: e.target.value } }))} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text2)", fontSize: 14, padding: "0 8px" }}><input type="checkbox" checked={!!reviewForm.recommended} onChange={(e) => setReviewForms((current) => ({ ...current, [booking._id]: { ...reviewForm, recommended: e.target.checked } }))} />I would recommend GharSeva</label>
            <button type="button" className="btn-outline" onClick={() => handleReview(booking._id)}>Save review</button>
          </div>
          {(booking.weeklyReviews || []).length ? <div style={{ display: "grid", gap: 8 }}>{booking.weeklyReviews.slice(0, 6).map((entry) => <div key={String(entry._id)} style={{ borderTop: "1px solid rgba(74,101,114,0.10)", paddingTop: 8 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{entry.weekLabel}</span><span style={{ color: "var(--accent)" }}>{entry.rating}/5</span></div>{entry.review ? <div style={{ color: "var(--text2)", marginTop: 4, fontSize: 14 }}>{entry.review}</div> : null}</div>)}</div> : null}
        </div>

        <div style={{ ...statCard, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div><div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Share GharSeva with friends</div><p style={{ color: "var(--text2)", lineHeight: 1.6, maxWidth: 520 }}>Happy with the service? Recommend the app to friends and family so we can later unlock referral offers and loyalty rewards.</p></div>
          <button type="button" className="btn-primary">Recommend GharSeva</button>
        </div>
      </div>
    );
  };

  const renderConnectionCard = (booking, includeServiceTools = false) => {
    const helper = booking.helper || {};
    const status = statusStyle(booking.status);
    return (
      <div key={String(booking._id)} style={{ ...panelStyle, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Avatar initials={helper.avatar || helper.name?.slice?.(0, 2)?.toUpperCase() || "GH"} imageUrl={helper.livePhoto} size={62} />
            <div>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Private household connection</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text)", marginBottom: 6 }}>{helper.name || "Helper"}</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>{helper.service} in {helper.area}, {helper.city}</div>
            </div>
          </div>
          <span style={{ padding: "8px 13px", borderRadius: 999, background: status.bg, color: status.color, fontWeight: 800, fontSize: 12 }}>{status.label}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
          <div style={statCard}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Preferred start</div><div style={{ fontWeight: 700, color: "var(--text)" }}>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "Flexible"}</div></div>
          <div style={statCard}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Monthly budget</div><div style={{ fontWeight: 700, color: "var(--text)" }}>{booking.monthlyBudget != null ? `Rs.${Number(booking.monthlyBudget).toLocaleString()}/mo` : "Not specified"}</div></div>
          <div style={statCard}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Last update</div><div style={{ fontWeight: 700, color: "var(--text)" }}>{formatDateTime(booking.updatedAt)}</div></div>
        </div>

        {booking.message ? <p style={{ marginTop: 14, color: "var(--text)", lineHeight: 1.75, fontSize: 14 }}><strong style={{ color: "var(--brand-dark)" }}>First note:</strong> {booking.message}</p> : null}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 14, marginTop: 16 }}>{renderMessages(booking)}{renderCalls(booking)}</div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          {booking.status === "accepted" ? <button type="button" className="btn-primary" disabled={actionId === `${booking._id}:active`} onClick={() => handleStatus(booking._id, "active")}>Start service tracker</button> : null}
          {booking.status === "pending" ? <button type="button" className="btn-outline" disabled={actionId === `${booking._id}:cancelled`} onClick={() => handleStatus(booking._id, "cancelled")}>Cancel request</button> : null}
          {booking.status === "active" ? <button type="button" className="btn-outline" disabled={actionId === `${booking._id}:completed`} onClick={() => handleStatus(booking._id, "completed")}>Mark service completed</button> : null}
        </div>

        {includeServiceTools ? renderServiceTracker(booking) : null}
      </div>
    );
  };
  return (
    <div className="page-content" style={{ paddingTop: 88, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 24px 70px" }}>
        <div style={{ ...panelStyle, padding: 30, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
              <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={70} />
              <div>
                <div className="tag tag-blue" style={{ marginBottom: 10 }}>Household dashboard</div>
                <h1 style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.03, marginBottom: 8 }}>Welcome home, {user.name}</h1>
                <p style={{ color: "var(--text2)", lineHeight: 1.75, fontSize: 15, maxWidth: 700 }}>Manage helper connections, keep the conversation inside the app, and track real ongoing service once work begins.</p>
                <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>{user.email}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(130px, 1fr))", gap: 12, minWidth: 300 }}>{statItems.map(([label, value, tone]) => <div key={label} style={statCard}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>{label}</div><div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: tone }}>{value}</div></div>)}</div>
          </div>
        </div>

        <div style={{ ...panelStyle, padding: 24, marginBottom: 22 }}>
          <div className="tag tag-green" style={{ marginBottom: 12 }}>{nextStep.label}</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div><h2 style={{ fontSize: 30, marginBottom: 8 }}>{nextStep.title}</h2><p style={{ color: "var(--text2)", lineHeight: 1.75, maxWidth: 680 }}>{nextStep.text}</p></div>
            <button type="button" className="btn-primary" onClick={nextStep.action}>{nextStep.actionLabel}</button>
          </div>
        </div>

        <div style={{ display: "inline-flex", gap: 6, padding: 6, borderRadius: 999, border: "1px solid rgba(74,101,114,0.18)", background: "rgba(255,255,255,0.85)", marginBottom: 22, flexWrap: "wrap" }}>
          {[ ["overview", "Overview"], ["shortlist", "Shortlist"], ["connections", "Connections"], ["services", "Live services"], ["history", "History"] ].map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} style={tabButton(tab === value)}>{label}</button>)}
        </div>

        {tab === "overview" ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          <div style={{ ...panelStyle, padding: 24 }}><div className="tag tag-purple" style={{ marginBottom: 12 }}>Shortlist summary</div><h3 style={{ fontSize: 26, marginBottom: 8 }}>Saved helpers</h3><p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>Keep trusted profiles together so you can compare before opening a private connection.</p><div style={{ fontFamily: "var(--font-display)", fontSize: 42, color: "var(--brand-dark)", marginBottom: 16 }}>{savedHelpers.length}</div><button type="button" className="btn-outline" onClick={() => setTab("shortlist")}>Open shortlist</button></div>
          <div style={{ ...panelStyle, padding: 24 }}><div className="tag tag-blue" style={{ marginBottom: 12 }}>Connections</div><h3 style={{ fontSize: 26, marginBottom: 8 }}>Contact flow</h3><p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>Open requests and accepted helpers stay here until real work begins.</p><div style={{ fontFamily: "var(--font-display)", fontSize: 42, color: "var(--accent)", marginBottom: 16 }}>{bookingGroups.connections.length}</div><button type="button" className="btn-outline" onClick={() => setTab("connections")}>Open connections</button></div>
          <div style={{ ...panelStyle, padding: 24 }}><div className="tag tag-green" style={{ marginBottom: 12 }}>Service tracker</div><h3 style={{ fontSize: 26, marginBottom: 8 }}>Live services</h3><p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>Attendance, monthly payment logs, and weekly quality checks live here once a helper starts work.</p><div style={{ fontFamily: "var(--font-display)", fontSize: 42, color: "var(--text)", marginBottom: 16 }}>{bookingGroups.activeServices.length}</div><button type="button" className="btn-outline" onClick={() => setTab("services")}>View live services</button></div>
        </div> : null}

        {tab === "shortlist" ? (savedLoading ? <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading saved helpers...</div> : savedHelpers.length === 0 ? <EmptyState tag="Shortlist empty" title="No saved helpers yet" text="Browse helpers and save the ones that feel right for your home. Your shortlist will stay here for quick access." actionLabel="Find helpers" onAction={() => setPage("browse")} /> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>{savedHelpers.map((helper) => <HelperCard key={String(helper._id)} helper={{ ...helper, id: helper._id }} user={user} onView={onView} onSave={onSave} saved />)}</div>) : null}

        {tab === "connections" ? (bookingsLoading ? <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading your connections...</div> : bookingGroups.connections.length === 0 ? <EmptyState tag="No open connections" title="Start a private conversation with a helper" text="Once you contact a helper, accepted and pending connections will appear here with in-app chat and call request controls." actionLabel="Browse helpers" onAction={() => setPage("browse")} /> : <div style={{ display: "grid", gap: 14 }}>{bookingGroups.connections.map((booking) => renderConnectionCard(booking))}</div>) : null}

        {tab === "services" ? (bookingsLoading ? <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading live services...</div> : bookingGroups.activeServices.length === 0 ? <EmptyState tag="No live services" title="Service tracking begins when the helper starts" text="After a helper accepts, use the connection card to start the service tracker. That unlocks attendance, payment, and weekly quality tracking." actionLabel="Open connections" onAction={() => setTab("connections")} /> : <div style={{ display: "grid", gap: 14 }}>{bookingGroups.activeServices.map((booking) => renderConnectionCard(booking, true))}</div>) : null}

        {tab === "history" ? (bookingsLoading ? <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading connection history...</div> : bookingGroups.history.length === 0 ? <EmptyState tag="No history yet" title="Past service history will appear here" text="Completed, cancelled, and declined relationships are grouped separately so active work stays cleaner." /> : <div style={{ display: "grid", gap: 14 }}>{bookingGroups.history.map((booking) => renderConnectionCard(booking, booking.status === "completed"))}</div>) : null}
      </div>
    </div>
  );
};

export default UserDashboardPage;

