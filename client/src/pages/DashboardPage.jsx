// client/src/pages/DashboardPage.jsx
import { useState } from "react";
import Avatar from "../components/Avatar";
import HelperCard from "../components/HelperCard";

const DashboardPage = ({ user, helpers, savedIds, onView, onSave }) => {
  const [tab, setTab] = useState("saved");
  const saved = helpers.filter((h) => savedIds.includes(h.id));

  return (
    <div
      className="page-content"
      style={{ paddingTop: 80, minHeight: "100vh" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── Profile card ── */}
        <div
          className="glass"
          style={{
            borderRadius: 20,
            padding: 28,
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={64} />
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 26,
                marginBottom: 4,
              }}
            >
              Welcome, {user.name}! 👋
            </h1>
            <p style={{ color: "var(--text2)" }}>{user.email}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <span
                className={`tag ${
                  user.role === "helper" ? "tag-purple" : "tag-blue"
                }`}
              >
                {user.role === "helper" ? "🧹 Helper" : "🏠 User"}
              </span>
              <span className="verified-badge">✓ Verified Account</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 24,
                color: "var(--blue)",
              }}
            >
              {saved.length}
            </div>
            <div style={{ color: "var(--text2)", fontSize: 12 }}>Saved</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            width: "fit-content",
          }}
        >
          {[
            ["saved",    "♥ Saved Helpers"],
            ["requests", "📋 My Requests"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              style={{
                padding: "8px 20px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                background:
                  tab === v ? "rgba(79,142,247,0.2)" : "transparent",
                color: tab === v ? "var(--blue)" : "var(--text2)",
                fontFamily: "DM Sans",
                fontWeight: 500,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {tab === "saved" ? (
          saved.length === 0 ? (
            <div
              className="glass"
              style={{
                borderRadius: "var(--radius)",
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>♡</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
                No saved helpers yet
              </h3>
              <p style={{ color: "var(--text2)" }}>
                Browse helpers and tap the heart to save them here
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {saved.map((h) => (
                <HelperCard
                  key={h.id}
                  helper={h}
                  onView={onView}
                  onSave={onSave}
                  saved={true}
                />
              ))}
            </div>
          )
        ) : (
          <div
            className="glass"
            style={{
              borderRadius: "var(--radius)",
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
              No requests yet
            </h3>
            <p style={{ color: "var(--text2)" }}>
              When you contact a helper, your requests will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;