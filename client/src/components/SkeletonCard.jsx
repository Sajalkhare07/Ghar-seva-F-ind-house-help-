// client/src/components/SkeletonCard.jsx

const SkeletonCard = () => (
  <div className="glass" style={{ borderRadius: "var(--radius)", padding: 20 }}>
    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      <div
        className="skeleton"
        style={{ width: 48, height: 48, borderRadius: "50%" }}
      />
      <div style={{ flex: 1 }}>
        <div
          className="skeleton"
          style={{ height: 16, marginBottom: 8, borderRadius: 6 }}
        />
        <div
          className="skeleton"
          style={{ height: 12, width: "60%", borderRadius: 6 }}
        />
      </div>
    </div>
    <div
      className="skeleton"
      style={{ height: 12, marginBottom: 8, borderRadius: 6 }}
    />
    <div
      className="skeleton"
      style={{ height: 12, width: "80%", marginBottom: 16, borderRadius: 6 }}
    />
    <div className="skeleton" style={{ height: 36, borderRadius: 50 }} />
  </div>
);

export default SkeletonCard;