import { useState } from "react";
import Avatar from "./Avatar";
import Stars from "./Stars";
import { SERVICE_ICONS } from "../data/helpers";
import { createBooking, getCallToken } from "../api/index";
import { startBrowserMaskedCall } from "../utils/twilioVoice";

const STATIC_REVIEWS = [
  { text: "Very honest and punctual. Recommended!", from: "Karan S.", stars: 5 },
  { text: "Good work, never misses a day.", from: "Ankit M.", stars: 4 },
  { text: "Cooking is excellent! We love the food.", from: "Priya J.", stars: 5 },
];

const sectionCard = {
  borderRadius: 22,
  border: "1px solid rgba(74,101,114,0.16)",
  background: "rgba(255,255,255,0.94)",
  padding: "18px 18px",
  boxShadow: "0 10px 30px rgba(16,42,67,0.06)",
};

const AUTH_PROMPT_KEY = "gharseva-auth-prompt";

const ProfileModal = ({ helper, onClose, onSave, saved, user, setPage, onBookingSuccess }) => {
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  if (!helper) return null;

  const helperId = String(helper.id || helper._id || "");
  const skills = Array.isArray(helper.skills) && helper.skills.length ? helper.skills : [helper.service];
  const canConnect = user && user.role === "user";

  const openAuth = (intentLabel) => {
    sessionStorage.setItem(
      AUTH_PROMPT_KEY,
      `Please login first or sign up first to continue with ${intentLabel.toLowerCase()}.`
    );
    onClose();
    setPage?.("login");
  };

  const startChat = async () => {
    setBookingError("");
    setBookingLoading(true);
    try {
      await createBooking({
        helperId,
        message: message.trim(),
        startDate: startDate || undefined,
        monthlyBudget: monthlyBudget !== "" ? Number(monthlyBudget) : helper.price,
      });
      setMessage("");
      setStartDate("");
      setMonthlyBudget("");
      onBookingSuccess?.("Chat started. Check your dashboard to continue.");
      onClose();
    } catch (err) {
      setBookingError(err.response?.data?.msg || "Could not start chat with this helper.");
    } finally {
      setBookingLoading(false);
    }
  };

  const startCall = async () => {
    setBookingError("");
    setCallLoading(true);
    try {
      const tokenResponse = await getCallToken();
      await startBrowserMaskedCall({
        token: tokenResponse.data.token,
        helperId,
        helperName: helper.name,
        startDate,
        monthlyBudget: monthlyBudget !== "" ? Number(monthlyBudget) : helper.price,
        message: message.trim() || `Calling ${helper.name} from GharSeva browser voice.`,
      });
      onBookingSuccess?.(`Calling ${helper.name} from your browser.`);
      onClose();
    } catch (err) {
      setBookingError(err.response?.data?.msg || err.message || "Could not start the browser call.");
    } finally {
      setCallLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass" style={{ borderRadius: 30, maxWidth: 840, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "30px", position: "relative", animation: "fadeUp 0.3s ease", background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))" }}>
        <button onClick={onClose} aria-label="Close profile" style={{ position: "sticky", top: 0, marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(74,101,114,0.18)", background: "rgba(255,255,255,0.92)", color: "var(--text2)", cursor: "pointer", fontSize: 18, zIndex: 2 }}>x</button>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(260px, 0.88fr)", gap: 18, marginTop: 4 }}>
          <div style={sectionCard}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
              <Avatar initials={helper.avatar} gradient={helper.gradient} imageUrl={helper.livePhoto} size={84} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", margin: 0 }}>{helper.name}</h2>
                  {helper.verified && <span className="verified-badge">Verified</span>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="tag tag-blue">{SERVICE_ICONS[helper.service]} {helper.service}</span>
                  <span className="tag tag-purple">{helper.experience || "Trusted helper"}</span>
                  <span className="tag tag-green">{helper.available ? "Available" : "Busy"}</span>
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Stars rating={helper.rating} />
                  <span style={{ color: "var(--text2)", fontSize: 13 }}>{helper.reviews || 0} {helper.reviews === 1 ? "review" : "reviews"}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
              <div style={{ padding: "14px 16px", borderRadius: 18, background: "var(--surface-soft)", border: "1px solid rgba(74,101,114,0.16)" }}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Monthly charge</div><div className="gradient-text" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>Rs.{Number(helper.price || 0).toLocaleString()}</div></div>
              <div style={{ padding: "14px 16px", borderRadius: 18, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(74,101,114,0.16)" }}><div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Location</div><div style={{ fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>{helper.area ? `${helper.area}, ` : ""}{helper.city}</div></div>
            </div>

            <div style={{ marginTop: 20 }}><div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>About</div><p style={{ color: "var(--text)", lineHeight: 1.75, fontSize: 15 }}>{helper.about || "Families will see the helper's work style and service details here after approval."}</p></div>
            <div style={{ marginTop: 20 }}><div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Skills</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{skills.map((skill) => <span key={skill} className="tag tag-blue">{skill}</span>)}</div></div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={sectionCard}>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Quick actions</div>
              <div style={{ display: "grid", gap: 10 }}>
                <button onClick={() => onSave(helper.id || helper._id)} className="btn-outline" style={{ padding: "12px 16px", background: saved ? "rgba(27,156,133,0.10)" : undefined }}>{saved ? "Saved to shortlist" : "Save to shortlist"}</button>
                <div style={{ borderRadius: 16, border: "1px solid rgba(74,101,114,0.16)", padding: "14px 14px", background: "rgba(255,255,255,0.9)" }}><div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Protected contact</div><p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>The helper's phone number stays hidden. Chat and call start only after a household account signs in.</p></div>
              </div>
            </div>

            <div style={sectionCard}>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Reviews snapshot</div>
              <div style={{ display: "grid", gap: 10 }}>
                {STATIC_REVIEWS.slice(0, 2).map((review, index) => <div key={index} style={{ borderRadius: 16, border: "1px solid rgba(74,101,114,0.16)", padding: "14px 14px", background: "rgba(255,255,255,0.9)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{review.from}</span><span style={{ color: "var(--accent)", fontSize: 13 }}>{"*".repeat(review.stars)}</span></div><p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>{review.text}</p></div>)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...sectionCard, marginTop: 18 }}>
          <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Contact this helper</div>
          {!user || !canConnect ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <button type="button" className="btn-primary" style={{ width: "100%", padding: "13px 16px" }} onClick={() => openAuth("Chat")}>Chat</button>
              <button type="button" className="btn-outline" style={{ width: "100%", padding: "13px 16px" }} onClick={() => openAuth("Call")}>Call</button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
                <div><label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Preferred start date</label><input className="input-field" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div><label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Monthly budget (Rs)</label><input className="input-field" type="number" min={500} placeholder={String(helper.price)} value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} /></div>
              </div>
              <div style={{ marginTop: 14 }}><label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Intro message</label><textarea className="input-field" rows={4} placeholder="Hello, we need help six days a week for cooking and light cleaning." value={message} onChange={(e) => setMessage(e.target.value)} style={{ resize: "vertical", minHeight: 96 }} /></div>
              <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>Chat opens inside GharSeva. Call uses Twilio browser voice, so you can talk from the laptop while Twilio masks the number seen by the helper.</p>
              {bookingError && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 10 }}>{bookingError}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
                <button type="button" className="btn-primary" style={{ width: "100%", padding: "13px 16px", fontSize: 15 }} disabled={bookingLoading || callLoading} onClick={startChat}>{bookingLoading ? "Starting..." : "Chat"}</button>
                <button type="button" className="btn-outline" style={{ width: "100%", padding: "13px 16px", fontSize: 15 }} disabled={bookingLoading || callLoading} onClick={startCall}>{callLoading ? "Starting..." : "Call"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
