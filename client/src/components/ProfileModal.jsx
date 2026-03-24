// client/src/components/ProfileModal.jsx
import Avatar from "./Avatar";
import Stars from "./Stars";
import { SERVICE_ICONS } from "../data/helpers";

const STATIC_REVIEWS = [
  { text: "Very honest and punctual. Recommended!", from: "Karan S.", stars: 5 },
  { text: "Good work, never misses a day.",          from: "Ankit M.", stars: 4 },
  { text: "Cooking is excellent! We love her food.", from: "Priya J.", stars: 5 },
];

const ProfileModal = ({ helper, onClose, onSave, saved }) => {
  if (!helper) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass"
        style={{
          borderRadius: 20,
          maxWidth: 580,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px 28px",
          position: "relative",
          animation: "fadeUp 0.3s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 0,
            float: "right",
            background: "rgba(255,255,255,0.07)",
            border: "none",
            color: "var(--text2)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <Avatar
            initials={helper.avatar}
            gradient={helper.gradient}
            size={72}
          />
          <div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{helper.name}</h2>
              {helper.verified && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
              <span className="tag tag-blue">
                {SERVICE_ICONS[helper.service]} {helper.service}
              </span>
              <span className="tag tag-purple">⏱ {helper.experience}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: helper.available ? "var(--green)" : "#ff6b6b",
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: helper.available ? "var(--green)" : "#ff6b6b",
                  }}
                >
                  {helper.available ? "Available" : "Currently Busy"}
                </span>
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <Stars rating={helper.rating} />
              <span
                style={{
                  color: "var(--text2)",
                  fontSize: 13,
                  marginLeft: 6,
                }}
              >
                ({helper.reviews} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Price + location */}
        <div
          className="glass"
          style={{ borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}
        >
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
                  color: "var(--text2)",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Monthly Charge
              </div>
              <div
                style={{
                  fontFamily: "Syne",
                  fontWeight: 800,
                  fontSize: 28,
                  background: "var(--grad)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ₹{helper.price.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: "var(--text2)",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Location
              </div>
              <div style={{ fontWeight: 600 }}>
                📍 {helper.area}, {helper.city}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 10,
              color: "var(--text2)",
            }}
          >
            ABOUT
          </h3>
          <p style={{ color: "var(--text)", lineHeight: 1.7, fontSize: 15 }}>
            {helper.about}
          </p>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text2)",
            }}
          >
            SKILLS
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {helper.skills.map((s) => (
              <span key={s} className="tag tag-blue">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text2)",
            }}
          >
            REVIEWS
          </h3>
          {STATIC_REVIEWS.slice(0, 2).map((r, i) => (
            <div
              key={i}
              className="glass"
              style={{
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.from}</span>
                <span className="stars" style={{ fontSize: 12 }}>
                  {"★".repeat(r.stars)}
                </span>
              </div>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>{r.text}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href={`https://wa.me/91${helper.phone}`}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1,
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: 50,
              background: "rgba(37,211,102,0.15)",
              border: "1px solid rgba(37,211,102,0.3)",
              color: "#25d366",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            📱 WhatsApp
          </a>
          <a
            href={`tel:${helper.phone}`}
            style={{
              flex: 1,
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: 50,
              background: "var(--grad)",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            📞 Call Now
          </a>
          <button
            onClick={() => onSave(helper.id)}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: saved ? "rgba(155,92,255,0.15)" : "transparent",
              color: saved ? "var(--purple)" : "var(--text2)",
              cursor: "pointer",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;