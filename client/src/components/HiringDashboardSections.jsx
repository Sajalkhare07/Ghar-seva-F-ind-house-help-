import { useMemo, useState } from "react";
import Avatar from "./Avatar";
import {
  addEmploymentAttendance,
  addEmploymentWeeklyReview,
  requestBookingCall,
  updateEmploymentNotes,
  updateEmploymentSalary,
} from "../api/index";

const panelStyle = {
  borderRadius: 26,
  border: "1px solid rgba(74,101,114,0.18)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
  boxShadow: "0 20px 50px rgba(16,42,67,0.08)",
};

const statCard = {
  padding: "14px 16px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(74,101,114,0.16)",
};

const smallLabel = { color: "var(--text3)", fontSize: 12, marginBottom: 5 };

const dateLabel = (value) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : "Not set";
};

const monthLabel = () => new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
const today = () => new Date().toISOString().slice(0, 10);

const Empty = ({ tag, title, text }) => (
  <div style={{ ...panelStyle, padding: "46px 22px", textAlign: "center" }}>
    <div className="tag tag-blue" style={{ margin: "0 auto 12px", width: "fit-content" }}>{tag}</div>
    <h3 style={{ fontSize: 28, marginBottom: 8 }}>{title}</h3>
    <p style={{ color: "var(--text2)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>{text}</p>
  </div>
);

const DecisionCard = ({ decision, onView, onOpenConnections, showTrial = false }) => {
  const helper = decision.helper || {};
  return (
    <div style={{ ...panelStyle, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar initials={helper.avatar || helper.name?.slice?.(0, 2)?.toUpperCase() || "GH"} imageUrl={helper.livePhoto} size={62} />
          <div>
            <div className={showTrial ? "tag tag-green" : "tag tag-purple"} style={{ marginBottom: 8 }}>{showTrial ? "Trial scheduled" : "Pending decision"}</div>
            <h3 style={{ fontSize: 28, marginBottom: 5 }}>{helper.name || "Helper"}</h3>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>{helper.service} in {helper.area}, {helper.city}</p>
          </div>
        </div>
        {helper.verified ? <span className="verified-badge">Verified</span> : null}
      </div>
      {showTrial ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
          <div style={statCard}><div style={smallLabel}>Trial date</div><strong>{dateLabel(decision.trialDate)}</strong></div>
          <div style={statCard}><div style={smallLabel}>Trial timing</div><strong>{decision.trialTiming || "Not set"}</strong></div>
          <div style={statCard}><div style={smallLabel}>Status</div><strong style={{ textTransform: "capitalize" }}>{String(decision.status || "open").replace(/_/g, " ")}</strong></div>
        </div>
      ) : null}
      {decision.notes ? <p style={{ marginTop: 14, color: "var(--text2)", lineHeight: 1.7 }}>{decision.notes}</p> : null}
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button type="button" className="btn-outline" onClick={() => onView?.({ ...helper, id: helper._id })}>View profile</button>
        <button type="button" className="btn-primary" onClick={onOpenConnections}>Continue chat</button>
      </div>
    </div>
  );
};

const ActiveHelperCard = ({ employment, onUpdated, onOpenConnections, showToast }) => {
  const helper = employment.helper || {};
  const [attendanceDate, setAttendanceDate] = useState(today());
  const [salaryForm, setSalaryForm] = useState({ monthLabel: monthLabel(), amount: employment.salary || "", dueDate: "", status: "unpaid" });
  const [reviewForm, setReviewForm] = useState({ weekLabel: "", punctuality: "5", behavior: "5", workQuality: "5", consistency: "5", notes: "" });
  const [notes, setNotes] = useState(employment.privateNotes || "");
  const [loading, setLoading] = useState("");

  const attendanceSummary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const entries = (employment.attendance || []).filter((entry) => String(entry.date || "").startsWith(currentMonth));
    return {
      present: entries.filter((entry) => entry.status === "present").length,
      absent: entries.filter((entry) => entry.status === "absent").length,
    };
  }, [employment.attendance]);

  const latestSalary = employment.salaryTracker?.[0];

  const saveAttendance = async (status) => {
    setLoading(`attendance:${status}`);
    try {
      const res = await addEmploymentAttendance(employment._id, { date: attendanceDate, status });
      onUpdated?.(res.data.data);
      showToast?.(`Marked ${status}.`, "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not update attendance.", "error");
    } finally {
      setLoading("");
    }
  };

  const saveSalary = async (status = salaryForm.status) => {
    setLoading("salary");
    try {
      const res = await updateEmploymentSalary(employment._id, { ...salaryForm, status });
      onUpdated?.(res.data.data);
      showToast?.("Salary tracker updated.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not update salary.", "error");
    } finally {
      setLoading("");
    }
  };

  const saveReview = async () => {
    setLoading("review");
    try {
      const res = await addEmploymentWeeklyReview(employment._id, reviewForm);
      onUpdated?.(res.data.data);
      setReviewForm({ weekLabel: "", punctuality: "5", behavior: "5", workQuality: "5", consistency: "5", notes: "" });
      showToast?.("Weekly review saved.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not save review.", "error");
    } finally {
      setLoading("");
    }
  };

  const saveNotes = async () => {
    setLoading("notes");
    try {
      const res = await updateEmploymentNotes(employment._id, notes);
      onUpdated?.(res.data.data);
      showToast?.("Private notes saved.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not save notes.", "error");
    } finally {
      setLoading("");
    }
  };

  const requestCall = async () => {
    if (!employment.booking?._id) return showToast?.("Chat connection is not ready yet.", "error");
    setLoading("call");
    try {
      await requestBookingCall(employment.booking._id, "Requesting a follow-up call from Active Helpers.");
      showToast?.("Masked call request sent.", "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Could not request call.", "error");
    } finally {
      setLoading("");
    }
  };

  return (
    <div style={{ ...panelStyle, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar initials={helper.avatar || helper.name?.slice?.(0, 2)?.toUpperCase() || "GH"} imageUrl={helper.livePhoto} size={70} />
          <div>
            <div className="tag tag-green" style={{ marginBottom: 8 }}>Active helper</div>
            <h3 style={{ fontSize: 30, marginBottom: 5 }}>{helper.name || "Helper"}</h3>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>{employment.role} | Joined {dateLabel(employment.joiningDate)}</p>
          </div>
        </div>
        {helper.verified ? <span className="verified-badge">Verified</span> : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
        <div style={statCard}><div style={smallLabel}>Salary</div><strong>Rs.{Number(employment.salary || 0).toLocaleString()}</strong></div>
        <div style={statCard}><div style={smallLabel}>Timing</div><strong>{employment.workingHours}</strong></div>
        <div style={statCard}><div style={smallLabel}>Payment status</div><strong style={{ textTransform: "capitalize" }}>{latestSalary?.status || "unpaid"}</strong></div>
        <div style={statCard}><div style={smallLabel}>Due date</div><strong>{dateLabel(latestSalary?.dueDate)}</strong></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 16 }}>
        <section style={statCard}>
          <h4 style={{ marginBottom: 10 }}>Attendance tracker</h4>
          <input className="input-field" type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn-primary" type="button" disabled={loading === "attendance:present"} onClick={() => saveAttendance("present")}>Present</button>
            <button className="btn-outline" type="button" disabled={loading === "attendance:absent"} onClick={() => saveAttendance("absent")}>Absent</button>
          </div>
          <p style={{ color: "var(--text2)", marginTop: 10, fontSize: 14 }}>This month: {attendanceSummary.present} present, {attendanceSummary.absent} absent</p>
        </section>

        <section style={statCard}>
          <h4 style={{ marginBottom: 10 }}>Salary tracker</h4>
          <div style={{ display: "grid", gap: 10 }}>
            <input className="input-field" value={salaryForm.monthLabel} onChange={(event) => setSalaryForm((current) => ({ ...current, monthLabel: event.target.value }))} />
            <input className="input-field" type="number" min="0" value={salaryForm.amount} onChange={(event) => setSalaryForm((current) => ({ ...current, amount: event.target.value }))} />
            <input className="input-field" type="date" value={salaryForm.dueDate} onChange={(event) => setSalaryForm((current) => ({ ...current, dueDate: event.target.value }))} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn-primary" type="button" onClick={() => saveSalary("paid")}>Mark paid</button><button className="btn-outline" type="button" onClick={() => saveSalary("unpaid")}>Mark unpaid</button></div>
          </div>
        </section>
      </div>

      <section style={{ ...statCard, marginTop: 14 }}>
        <h4 style={{ marginBottom: 10 }}>Weekly review</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <input className="input-field" placeholder="Week label" value={reviewForm.weekLabel} onChange={(event) => setReviewForm((current) => ({ ...current, weekLabel: event.target.value }))} />
          {["punctuality", "behavior", "workQuality", "consistency"].map((field) => (
            <select key={field} className="input-field" value={reviewForm[field]} onChange={(event) => setReviewForm((current) => ({ ...current, [field]: event.target.value }))}>
              {[5, 4, 3, 2, 1].map((score) => <option key={score} value={String(score)}>{field.replace("workQuality", "work quality")} {score}/5</option>)}
            </select>
          ))}
          <input className="input-field" placeholder="Notes" value={reviewForm.notes} onChange={(event) => setReviewForm((current) => ({ ...current, notes: event.target.value }))} />
          <button className="btn-outline" type="button" disabled={loading === "review"} onClick={saveReview}>Save review</button>
        </div>
      </section>

      <section style={{ ...statCard, marginTop: 14 }}>
        <h4 style={{ marginBottom: 10 }}>Private notes and communication</h4>
        <textarea className="input-field" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Private instructions, preferences, or reminders" />
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <button className="btn-outline" type="button" disabled={loading === "notes"} onClick={saveNotes}>Save notes</button>
          <button className="btn-primary" type="button" onClick={onOpenConnections}>Continue chat</button>
          <button className="btn-outline" type="button" disabled={loading === "call"} onClick={requestCall}>Request call</button>
          <button className="btn-outline" type="button">Need Replacement?</button>
        </div>
      </section>
    </div>
  );
};

const HiringDashboardSections = ({ mode, data, loading, onView, onOpenConnections, onEmploymentUpdated, showToast }) => {
  if (loading) return <div style={{ ...panelStyle, padding: 26, color: "var(--text2)" }}>Loading hiring workflow...</div>;

  if (mode === "pending") {
    const items = data.pendingDecisions || [];
    if (!items.length) return <Empty tag="No pending decisions" title="Helpers you are thinking about will appear here" text="After a call, choose Thinking About Hiring to keep a helper available for later profile review and chat." />;
    return <div style={{ display: "grid", gap: 14 }}>{items.map((item) => <DecisionCard key={item._id} decision={item} onView={onView} onOpenConnections={onOpenConnections} />)}</div>;
  }

  if (mode === "trials") {
    const items = data.trials || [];
    if (!items.length) return <Empty tag="No trials" title="Scheduled trials will appear here" text="Use Schedule Trial after a protected call to store trial date, time, notes, and status." />;
    return <div style={{ display: "grid", gap: 14 }}>{items.map((item) => <DecisionCard key={item._id} decision={item} showTrial onView={onView} onOpenConnections={onOpenConnections} />)}</div>;
  }

  const items = data.employments || [];
  if (!items.length) return <Empty tag="No active helpers" title="Hire a helper to unlock the active dashboard" text="Active Helpers includes attendance, salary tracking, weekly reviews, private notes, chat, and call requests." />;
  return <div style={{ display: "grid", gap: 14 }}>{items.map((item) => <ActiveHelperCard key={item._id} employment={item} onUpdated={onEmploymentUpdated} onOpenConnections={onOpenConnections} showToast={showToast} />)}</div>;
};

export default HiringDashboardSections;
