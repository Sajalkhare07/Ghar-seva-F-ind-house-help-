import { useState } from "react";
import Avatar from "./Avatar";
import Stars from "./Stars";
import { SERVICE_ICONS } from "../data/helpers";
import { createBooking } from "../api/index";

const STATIC_REVIEWS = [
  { text: "Very honest and punctual. Recommended!", from: "Karan S.", stars: 5 },
  { text: "Good work, never misses a day.", from: "Ankit M.", stars: 4 },
  { text: "Cooking is excellent! We love the food.", from: "Priya J.", stars: 5 },
];

const sectionCard = {
  borderRadius: 22,
  border: "1px solid rgba(74,101,114,0.16)",
  background: "rgba(255,251,246,0.94)",
  padding: "18px 18px",
  boxShadow: "0 10px 30px rgba(61,37,23,0.06)",
};

const ProfileModal = ({ helper, onClose, onSave, saved, user, setPage, onBookingSuccess }) => {
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  if (!helper) return null;

  const helperId = String(helper.id || helper._id || "");
  const skills = Array.isArray(helper.skills) && helper.skills.length ? helper.skills : [helper.service];
  const canBook = user && user.role !== "helper";

  const submitBooking = async () => {
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
      onBookingSuccess?.();
      onClose();
    } catch (err) {
      setBookingError(err.response?.data?.msg || "Could not send booking request.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="glass"
        style={{
          borderRadius: 30,
          maxWidth: 760,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "30px",
          position: "relative",
          animation: "fadeUp 0.3s ease",
          background: "linear-gradient(180deg, rgba(255,251,246,0.98), rgba(247,239,230,0.96))",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close profile"
          style={{
            position: "sticky",
            top: 0,
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "1px solid rgba(74,101,114,0.18)",
            background: "rgba(255,248,240,0.92)",
            color: "var(--text2)",
            cursor: "pointer",
            fontSize: 18,
            zIndex: 2,
          }}
        >
          x
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(250px, 0.9fr)", gap: 18, marginTop: 4 }}>
          <div style={sectionCard}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
              <Avatar initials={helper.avatar} gradient={helper.gradient} imageUrl={helper.livePhoto} size={84} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                    {helper.name}
                  </h2>
                  {helper.verified && <span className="verified-badge">Verified</span>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="tag tag-blue">
                    {SERVICE_ICONS[helper.service]} {helper.service}
                  </span>
                  <span className="tag tag-purple">{helper.experience || "Trusted helper"}</span>
                  <span className="tag tag-green">{helper.available ? "Available" : "Busy"}</span>
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Stars rating={helper.rating} />
                  <span style={{ color: "var(--text2)", fontSize: 13 }}>
                    {helper.reviews || 0} {helper.reviews === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
              <div style={{ padding: "14px 16px", borderRadius: 18, background: "var(--surface-soft)", border: "1px solid rgba(201,178,149,0.58)" }}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Monthly charge</div>
                <div className="gradient-text" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>
                  Rs.{Number(helper.price || 0).toLocaleString()}
                </div>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 18, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(201,178,149,0.58)" }}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Location</div>
                <div style={{ fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
                  {helper.area ? `${helper.area}, ` : ""}
                  {helper.city}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                About
              </div>
              <p style={{ color: "var(--text)", lineHeight: 1.75, fontSize: 15 }}>
                {helper.about || "Families will see the helper's work style and service details here after approval."}
              </p>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((skill) => (
                  <span key={skill} className="tag tag-blue">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={sectionCard}>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                Quick actions
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <a
                  href={`https://wa.me/91${helper.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                  style={{ textDecoration: "none", textAlign: "center", padding: "12px 16px" }}
                >
                  WhatsApp helper
                </a>
                <a
                  href={`tel:${helper.phone}`}
                  className="btn-primary"
                  style={{ textDecoration: "none", textAlign: "center", padding: "12px 16px" }}
                >
                  Call now
                </a>
                <button
                  onClick={() => onSave(helper.id || helper._id)}
                  className="btn-outline"
                  style={{ padding: "12px 16px", background: saved ? "rgba(164,76,52,0.12)" : undefined }}
                >
                  {saved ? "Saved to shortlist" : "Save to shortlist"}
                </button>
              </div>
            </div>

            <div style={sectionCard}>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                Reviews snapshot
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {STATIC_REVIEWS.slice(0, 2).map((review, index) => (
                  <div key={index} style={{ borderRadius: 16, border: "1px solid rgba(74,101,114,0.16)", padding: "14px 14px", background: "rgba(255,255,255,0.9)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: "var(--text)" }}>{review.from}</span>
                      <span style={{ color: "var(--gold)", fontSize: 13 }}>{"*".repeat(review.stars)}</span>
                    </div>
                    <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...sectionCard, marginTop: 18 }}>
          <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Request booking
          </div>
          {!user ? (
            <>
              <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 14, lineHeight: 1.7 }}>
                Sign in to send a booking request to this helper.
              </p>
              {setPage && (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%", padding: "13px 16px" }}
                  onClick={() => {
                    onClose();
                    setPage("login");
                  }}
                >
                  Sign in to continue
                </button>
              )}
            </>
          ) : !canBook ? (
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>
              Booking is for households looking for help. Use a user account to request a helper.
            </p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
                <div>
                  <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Preferred start date
                  </label>
                  <input className="input-field" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Monthly budget (Rs)
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    min={500}
                    placeholder={String(helper.price)}
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                  Message to helper
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Need a cook for a family of 4, veg only."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ resize: "vertical", minHeight: 96 }}
                />
              </div>
              {bookingError && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 10 }}>{bookingError}</p>}
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", marginTop: 16, padding: "13px 16px", fontSize: 15 }}
                disabled={bookingLoading}
                onClick={submitBooking}
              >
                {bookingLoading ? "Sending..." : "Send booking request"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;