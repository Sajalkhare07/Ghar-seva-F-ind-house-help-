// client/src/components/Avatar.jsx

const Avatar = ({ initials, gradient, size = 48 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: gradient || "var(--grad)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Syne",
      fontWeight: 700,
      fontSize: size > 60 ? 22 : 15,
      color: "#fff",
      flexShrink: 0,
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    }}
  >
    {initials}
  </div>
);

export default Avatar;