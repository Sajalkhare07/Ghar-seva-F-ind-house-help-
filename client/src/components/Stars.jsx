// client/src/components/Stars.jsx

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <span className="stars" style={{ fontSize: 13 }}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
      <span
        style={{
          color: "#8888aa",
          marginLeft: 6,
          fontFamily: "DM Sans",
          fontSize: 13,
        }}
      >
        {rating}
      </span>
    </span>
  );
};

export default Stars;