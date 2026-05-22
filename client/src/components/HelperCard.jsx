import { useState } from "react";
import Avatar from "./Avatar";
import Stars from "./Stars";
import RatingModal from "./RatingModal";
import { SERVICE_ICONS } from "../data/helpers";

const cardStyle = {
  background: "linear-gradient(180deg, rgba(255,250,244,0.98), rgba(247,239,230,0.96))",
  border: "1px solid rgba(74,101,114,0.18)",
  borderRadius: 24,
  padding: 22,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 16px 40px rgba(61,37,23,0.08)",
  transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
};

const iconButtonStyle = {
  minWidth: 78,
  padding: "11px 14px",
  borderRadius: 999,
  border: "1px solid rgba(199,146,62,0.34)",
  background: "rgba(248,238,216,0.92)",
  color: "var(--gold)",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.01em",
};

const HelperCard = ({ helper, onView, onSave, saved, user }) => {
  const [showRating, setShowRating] = useState(false);
  const [liveRating, setLiveRating] = useState(helper.rating || 0);
  const [liveReviews, setLiveReviews] = useState(helper.reviews || 0);

  const handleRated = ({ newRating, totalReviews }) => {
    setLiveRating(newRating);
    setLiveReviews(totalReviews);
  };

  return (
    <>
      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 24px 54px rgba(61,37,23,0.14)";
          e.currentTarget.style.borderColor = "rgba(164,76,52,0.34)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 16px 40px rgba(61,37,23,0.08)";
          e.currentTarget.style.borderColor = "rgba(74,101,114,0.18)";
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "auto -18px -26px auto",
            width: 108,
            height: 108,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(27,156,133,0.14), rgba(164,76,52,0))",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={helper.avatar} gradient={helper.gradient} imageUrl={helper.livePhoto} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text)" }}>
                {helper.name}
              </span>
              {helper.verified && <span className="verified-badge">Verified</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <span className="tag tag-blue" style={{ fontSize: 11 }}>
                {SERVICE_ICONS[helper.service]} {helper.service}
              </span>
              <span className="tag tag-purple" style={{ fontSize: 11 }}>
                {helper.experience || "Trusted helper"}
              </span>
            </div>
            <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 8 }}>
              {helper.area ? `${helper.area}, ` : ""}
              {helper.city}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: 18, background: "rgba(255,255,255,0.96)", border: "1px solid rgba(221,206,185,0.8)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Stars rating={liveRating} />
              <span style={{ color: "var(--text2)", fontSize: 12 }}>
                {liveReviews} {liveReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
            <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 6 }}>
              Admin-approved listing with masked chat and call access.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="gradient-text" style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 700 }}>
              Rs.{Number(helper.price || 0).toLocaleString()}
            </div>
            <div style={{ color: "var(--text3)", fontSize: 12 }}>per month</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: helper.available ? "var(--green)" : "var(--red)", boxShadow: helper.available ? "0 0 0 5px rgba(80,115,95,0.14)" : "0 0 0 5px rgba(182,84,69,0.12)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: helper.available ? "var(--green)" : "var(--red)" }}>
              {helper.available ? "Available now" : "Currently busy"}
            </span>
          </div>
          <div style={{ color: "var(--text3)", fontSize: 12 }}>
            {helper.maskedContact?.voice || "Masked calling after login"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ flex: 1, minWidth: 150, padding: "12px 14px", fontSize: 13 }} onClick={() => onView(helper)}>
            View profile
          </button>

          {user ? (
            <button onClick={() => setShowRating(true)} title="Rate this helper" style={iconButtonStyle}>
              Rate
            </button>
          ) : (
            <button title="Login to rate" style={{ ...iconButtonStyle, border: "1px solid rgba(201,178,149,0.48)", background: "rgba(239,229,217,0.6)", color: "var(--text3)", cursor: "not-allowed" }}>
              Rate
            </button>
          )}

          <button
            onClick={() => onSave(helper.id || helper._id)}
            style={{ minWidth: 92, padding: "11px 16px", borderRadius: 999, border: saved ? "1px solid rgba(164,76,52,0.34)" : "1px solid rgba(74,101,114,0.18)", background: saved ? "rgba(164,76,52,0.12)" : "rgba(255,250,244,0.92)", color: saved ? "var(--brand-dark)" : "var(--text2)", cursor: "pointer", fontSize: 13, fontWeight: 800, letterSpacing: "0.01em" }}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {showRating && <RatingModal helper={helper} user={user} onClose={() => setShowRating(false)} onRated={handleRated} />}
    </>
  );
};

export default HelperCard;
