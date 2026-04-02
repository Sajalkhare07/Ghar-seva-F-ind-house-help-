import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App";

const IntroAnimation = ({ onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <>
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

      <div className="intro-broom">🧹</div>
      <div className="intro-pan">🍳</div>

      <div className="intro-sparkle" style={{ left: "20%" }}>✨</div>
      <div className="intro-sparkle" style={{ left: "40%", animationDelay: "1.0s" }}>⭐</div>
      <div className="intro-sparkle" style={{ left: "60%", animationDelay: "1.1s" }}>✨</div>
      <div className="intro-sparkle" style={{ left: "80%", animationDelay: "0.9s" }}>⭐</div>
    </>
  );
};

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
