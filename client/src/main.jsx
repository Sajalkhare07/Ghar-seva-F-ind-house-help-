// client/src/main.jsx
// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import "./styles/globals.css";
// import App from "./App";

// const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     {googleClientId ? (
//       <GoogleOAuthProvider clientId={googleClientId}>
//         <App />
//       </GoogleOAuthProvider>
//     ) : (
//       <App />
//     )}
//   </StrictMode>
// );

// client/src/main.jsx
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App";

// ── Intro Animation Component ─────────────────────────────────────────────────
// Shows broom 🧹 + pan 🍳 sweeping across on first load, then disappears
const IntroAnimation = ({ onDone }) => {
  useEffect(() => {
    // Remove overlay from DOM after animation completes (2.6s fade + 0.5s)
    const timer = setTimeout(onDone, 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <>
      {/* Full screen overlay */}
      <div className="intro-overlay">
        <div className="intro-brand">
          Ghar<span>Seva</span>
        </div>
        <div className="intro-tagline">
          Find trusted maids, cooks & helpers near you
        </div>
        <div className="intro-dots">
          <div className="intro-dot" />
          <div className="intro-dot" />
          <div className="intro-dot" />
        </div>
      </div>

      {/* 🧹 Broom sweeping left → right */}
      <div className="intro-broom">🧹</div>

      {/* 🍳 Pan sweeping right → left */}
      <div className="intro-pan">🍳</div>

      {/* Sparkle trails ✨ */}
      <div className="intro-sparkle" style={{ left: "20%" }}>✨</div>
      <div className="intro-sparkle" style={{ left: "40%", animationDelay: "1.0s" }}>⭐</div>
      <div className="intro-sparkle" style={{ left: "60%", animationDelay: "1.1s" }}>✨</div>
      <div className="intro-sparkle" style={{ left: "80%", animationDelay: "0.9s" }}>⭐</div>
    </>
  );
};

// ── Root Component with Intro ─────────────────────────────────────────────────
const Root = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <IntroAnimation onDone={() => setShowIntro(false)} />}
      <App />
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);