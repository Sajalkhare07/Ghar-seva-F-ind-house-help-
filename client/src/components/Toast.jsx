// client/src/components/Toast.jsx
import { useEffect } from "react";

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {type === "success" ? "✅ " : "❌ "}
      {msg}
    </div>
  );
};

export default Toast;