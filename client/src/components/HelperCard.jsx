// client/src/components/HelperCard.jsx
// ── Key fix: hover is now light blue tint, NOT dark blue overwrite ────────────
import Avatar from "./Avatar";
import Stars from "./Stars";
import { SERVICE_ICONS } from "../data/helpers";

const HelperCard = ({ helper, onView, onSave, saved }) => (
  <div
    style={{
      background: "#fff",
      border: "1.5px solid #e2e8f0",
      borderRadius: 18,
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      cursor: "default",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.25s ease",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform    = "translateY(-4px)";
      e.currentTarget.style.boxShadow    = "0 10px 32px rgba(37,99,235,0.10)";
      e.currentTarget.style.borderColor  = "#bfdbfe";
      e.currentTarget.style.background   = "#fafbff";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform    = "translateY(0)";
      e.currentTarget.style.boxShadow    = "none";
      e.currentTarget.style.borderColor  = "#e2e8f0";
      e.currentTarget.style.background   = "#fff";
    }}
  >
    {/* Decorative corner accent — light gradient, not dark */}
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: 70, height: 70,
      background: helper.gradient,
      opacity: 0.06,
      borderRadius: "0 18px 0 50%",
    }} />

    {/* Header row */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar initials={helper.avatar} gradient={helper.gradient} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700, fontSize: 16, color: "#0f172a",
          }}>
            {helper.name}
          </span>
          {helper.verified && (
            <span className="verified-badge">✓ Verified</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4, flexWrap: "wrap" }}>
          <span className="tag tag-blue" style={{ fontSize: 11 }}>
            {SERVICE_ICONS[helper.service]} {helper.service}
          </span>
          <span style={{ color: "#64748b", fontSize: 12 }}>
            📍 {helper.city}
          </span>
        </div>
      </div>
    </div>

    {/* Rating */}
    <Stars rating={helper.rating} />

    {/* Price + availability */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20,
          background: "linear-gradient(135deg,#2563eb,#7c3aed)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          ₹{helper.price.toLocaleString()}
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12 }}>per month</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: helper.available ? "#22c55e" : "#f87171",
          boxShadow: helper.available ? "0 0 0 3px rgba(34,197,94,0.18)" : "none",
        }} />
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: helper.available ? "#15803d" : "#dc2626",
        }}>
          {helper.available ? "Available" : "Busy"}
        </span>
      </div>
    </div>

    {/* Action buttons */}
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="btn-primary"
        style={{ flex: 1, padding: "10px 16px", fontSize: 14, borderRadius: 12 }}
        onClick={() => onView(helper)}
      >
        View Profile
      </button>
      <button
        onClick={() => onSave(helper.id || helper._id)}
        style={{
          width: 42, height: 42, borderRadius: "50%",
          border: saved ? "1.5px solid #ddd6fe" : "1.5px solid #e2e8f0",
          background: saved ? "#f5f3ff" : "#fff",
          color: saved ? "#7c3aed" : "#94a3b8",
          cursor: "pointer", fontSize: 18,
          transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#7c3aed"; }}
        onMouseLeave={e => {
          e.currentTarget.style.background = saved ? "#f5f3ff" : "#fff";
          e.currentTarget.style.color      = saved ? "#7c3aed" : "#94a3b8";
        }}
      >
        {saved ? "♥" : "♡"}
      </button>
    </div>
  </div>
);

export default HelperCard;