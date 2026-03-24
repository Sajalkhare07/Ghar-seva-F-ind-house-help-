// client/src/components/HelperCard.jsx
import Avatar from "./Avatar";
import Stars from "./Stars";
import { SERVICE_ICONS } from "../data/helpers";

const HelperCard = ({ helper, onView, onSave, saved }) => (
  <div
    className="glass glass-hover gradient-border"
    style={{
      borderRadius: "var(--radius)",
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative corner gradient */}
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        background: helper.gradient,
        opacity: 0.08,
        borderRadius: "0 16px 0 50%",
      }}
    />

    {/* Header row */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar initials={helper.avatar} gradient={helper.gradient} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}
          >
            {helper.name}
          </span>
          {helper.verified && (
            <span className="verified-badge">✓ Verified</span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 3,
            flexWrap: "wrap",
          }}
        >
          <span className="tag tag-blue">
            {SERVICE_ICONS[helper.service]} {helper.service}
          </span>
          <span style={{ color: "var(--text2)", fontSize: 13 }}>
            📍 {helper.city}
          </span>
        </div>
      </div>
    </div>

    {/* Rating */}
    <Stars rating={helper.rating} />

    {/* Price + availability */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: 20,
            background: "var(--grad)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ₹{helper.price.toLocaleString()}
        </div>
        <div style={{ color: "var(--text3)", fontSize: 12 }}>per month</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: helper.available ? "var(--green)" : "#ff6b6b",
            boxShadow: helper.available ? "0 0 8px var(--green)" : "none",
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: helper.available ? "var(--green)" : "#ff6b6b",
            fontWeight: 500,
          }}
        >
          {helper.available ? "Available" : "Busy"}
        </span>
      </div>
    </div>

    {/* Action buttons */}
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="btn-primary"
        style={{ flex: 1, padding: "10px 16px", fontSize: 14 }}
        onClick={() => onView(helper)}
      >
        View Profile
      </button>
      <button
        onClick={() => onSave(helper.id)}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "1px solid var(--border)",
          background: saved ? "rgba(155,92,255,0.15)" : "transparent",
          color: saved ? "var(--purple)" : "var(--text2)",
          cursor: "pointer",
          fontSize: 18,
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {saved ? "♥" : "♡"}
      </button>
    </div>
  </div>
);

export default HelperCard;