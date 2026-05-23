import { useState } from "react";
import {
  hireHelperAfterCall,
  savePendingHiringDecision,
  scheduleHelperTrial,
} from "../api/index";

const cardStyle = {
  borderRadius: 26,
  border: "1px solid rgba(74,101,114,0.18)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
  boxShadow: "0 24px 60px rgba(16,42,67,0.14)",
};

const fieldLabel = {
  display: "block",
  color: "var(--text2)",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 6,
};

const today = () => new Date().toISOString().slice(0, 10);

const PostCallDecisionModal = ({ helper, onClose, onDone, showToast }) => {
  const [mode, setMode] = useState("choices");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [trialForm, setTrialForm] = useState({ trialDate: "", trialTiming: "", notes: "" });
  const [hireForm, setHireForm] = useState({
    joiningDate: today(),
    salary: "",
    role: "",
    workingHours: "",
    dueDate: "",
  });

  if (!helper?.helperId) return null;

  const helperName = helper.helperName || "this helper";

  const complete = (message) => {
    showToast?.(message, "success");
    onDone?.();
    onClose?.();
  };

  const saveThinking = async () => {
    setLoading(true);
    setError("");
    try {
      await savePendingHiringDecision({ helperId: helper.helperId, notes });
      complete("Saved to Pending Decisions.");
    } catch (err) {
      setError(err.response?.data?.msg || "Could not save this decision.");
    } finally {
      setLoading(false);
    }
  };

  const saveTrial = async () => {
    setLoading(true);
    setError("");
    try {
      await scheduleHelperTrial({ helperId: helper.helperId, ...trialForm });
      complete("Trial scheduled and added to your dashboard.");
    } catch (err) {
      setError(err.response?.data?.msg || "Could not schedule the trial.");
    } finally {
      setLoading(false);
    }
  };

  const saveHire = async () => {
    setLoading(true);
    setError("");
    try {
      await hireHelperAfterCall({ helperId: helper.helperId, ...hireForm });
      complete("Helper hired. Active Helpers is ready.");
    } catch (err) {
      setError(err.response?.data?.msg || "Could not hire this helper.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="glass" style={{ ...cardStyle, width: "min(720px, 100%)", padding: 26, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div className="tag tag-green" style={{ marginBottom: 10 }}>Call completed</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.05, marginBottom: 8 }}>What would you like to do next?</h2>
            <p style={{ color: "var(--text2)", lineHeight: 1.7 }}>Choose the next step for {helperName}. You can keep thinking, schedule a trial, or start the active helper workflow.</p>
          </div>
          <button type="button" className="btn-outline" onClick={onClose} style={{ padding: "9px 14px" }}>Close</button>
        </div>

        {mode === "choices" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
            <button type="button" className="btn-outline" onClick={() => setMode("thinking")} style={{ borderRadius: 18, padding: 18, textAlign: "left" }}>
              <strong>Thinking About Hiring</strong>
              <span style={{ display: "block", color: "var(--text2)", marginTop: 8, lineHeight: 1.5 }}>Save to Pending Decisions and continue chat later.</span>
            </button>
            <button type="button" className="btn-outline" onClick={() => setMode("trial")} style={{ borderRadius: 18, padding: 18, textAlign: "left" }}>
              <strong>Schedule Trial</strong>
              <span style={{ display: "block", color: "var(--text2)", marginTop: 8, lineHeight: 1.5 }}>Pick a trial date, timing, and notes.</span>
            </button>
            <button type="button" className="btn-primary" onClick={() => setMode("hire")} style={{ borderRadius: 18, padding: 18, textAlign: "left" }}>
              <strong>Hire Helper</strong>
              <span style={{ display: "block", color: "rgba(255,255,255,0.86)", marginTop: 8, lineHeight: 1.5 }}>Create an active employment relationship.</span>
            </button>
          </div>
        ) : null}

        {mode === "thinking" ? (
          <div style={{ display: "grid", gap: 14 }}>
            <label><span style={fieldLabel}>Private note</span><textarea className="input-field" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What are you still deciding?" /></label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn-primary" type="button" disabled={loading} onClick={saveThinking}>{loading ? "Saving..." : "Save pending decision"}</button><button className="btn-outline" type="button" onClick={() => setMode("choices")}>Back</button></div>
          </div>
        ) : null}

        {mode === "trial" ? (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <label><span style={fieldLabel}>Trial date</span><input className="input-field" type="date" value={trialForm.trialDate} onChange={(event) => setTrialForm((current) => ({ ...current, trialDate: event.target.value }))} /></label>
              <label><span style={fieldLabel}>Trial timing</span><input className="input-field" placeholder="8 AM - 10 AM" value={trialForm.trialTiming} onChange={(event) => setTrialForm((current) => ({ ...current, trialTiming: event.target.value }))} /></label>
            </div>
            <label><span style={fieldLabel}>Optional notes</span><textarea className="input-field" rows={4} value={trialForm.notes} onChange={(event) => setTrialForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Any trial instructions?" /></label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn-primary" type="button" disabled={loading} onClick={saveTrial}>{loading ? "Scheduling..." : "Schedule trial"}</button><button className="btn-outline" type="button" onClick={() => setMode("choices")}>Back</button></div>
          </div>
        ) : null}

        {mode === "hire" ? (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <label><span style={fieldLabel}>Joining date</span><input className="input-field" type="date" value={hireForm.joiningDate} onChange={(event) => setHireForm((current) => ({ ...current, joiningDate: event.target.value }))} /></label>
              <label><span style={fieldLabel}>Salary</span><input className="input-field" type="number" min="0" placeholder="Monthly salary" value={hireForm.salary} onChange={(event) => setHireForm((current) => ({ ...current, salary: event.target.value }))} /></label>
              <label><span style={fieldLabel}>Role</span><input className="input-field" placeholder="Cook, Maid, Cleaner" value={hireForm.role} onChange={(event) => setHireForm((current) => ({ ...current, role: event.target.value }))} /></label>
              <label><span style={fieldLabel}>Working hours</span><input className="input-field" placeholder="7 AM - 9 AM" value={hireForm.workingHours} onChange={(event) => setHireForm((current) => ({ ...current, workingHours: event.target.value }))} /></label>
              <label><span style={fieldLabel}>First salary due date</span><input className="input-field" type="date" value={hireForm.dueDate} onChange={(event) => setHireForm((current) => ({ ...current, dueDate: event.target.value }))} /></label>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn-primary" type="button" disabled={loading} onClick={saveHire}>{loading ? "Hiring..." : "Hire helper"}</button><button className="btn-outline" type="button" onClick={() => setMode("choices")}>Back</button></div>
          </div>
        ) : null}

        {error ? <p style={{ color: "var(--red)", marginTop: 14, fontSize: 13 }}>{error}</p> : null}
      </div>
    </div>
  );
};

export default PostCallDecisionModal;
