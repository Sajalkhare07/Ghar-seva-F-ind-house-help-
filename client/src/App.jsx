// client/src/App.jsx
import { useState } from "react";
import { HELPERS } from "./data/helpers";

import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import Toast         from "./components/Toast";
import ProfileModal  from "./components/ProfileModal";

import HomePage      from "./pages/HomePage";
import BrowsePage    from "./pages/BrowsePage";
import AuthPage      from "./pages/AuthPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  const [page, setPage]                     = useState("home");
  const [helpers, setHelpers]               = useState(HELPERS);
  const [user, setUser]                     = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [savedIds, setSavedIds]             = useState([]);
  const [toast, setToast]                   = useState(null);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleAuth = (userData) => {
    setUser(userData);
    setPage("dashboard");
    showToast(`Welcome, ${userData.name}! 🎉`);
  };

  // ── Save / unsave ─────────────────────────────────────────────────────────
  const handleSave = (id) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      showToast(
        exists ? "Removed from saved" : "Helper saved! ♥",
        exists ? "error" : "success"
      );
      return exists ? prev.filter((i) => i !== id) : [...prev, id];
    });
  };

  // ── Register a new helper (optimistic local add) ──────────────────────────
  const handleRegister = (data) => {
    const newHelper = {
      id:         Date.now(),
      name:       data.name,
      avatar:     data.name.slice(0, 2).toUpperCase(),
      service:    data.service,
      city:       data.city,
      area:       data.area,
      price:      parseInt(data.price),
      rating:     0,
      reviews:    0,
      available:  true,
      verified:   false,
      experience: "New",
      about:      data.about || "Newly registered helper.",
      phone:      data.phone,
      skills:     [data.service],
      gradient:   "linear-gradient(135deg,#667eea,#764ba2)",
    };
    setHelpers((prev) => [newHelper, ...prev]);
    showToast("Helper profile registered! 🚀");
  };

  // ── Page renderer ─────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case "home":
        return (
          <HomePage
            setPage={setPage}
            helpers={helpers}
            onView={setSelectedHelper}
            onSave={handleSave}
            savedIds={savedIds}
          />
        );

      case "browse":
        return (
          <BrowsePage
            helpers={helpers}
            onView={setSelectedHelper}
            onSave={handleSave}
            savedIds={savedIds}
          />
        );

      case "login":
        return (
          <AuthPage mode="login" setPage={setPage} onAuth={handleAuth} />
        );

      case "signup":
        return (
          <AuthPage mode="signup" setPage={setPage} onAuth={handleAuth} />
        );

      case "register":
        return <RegisterPage onRegister={handleRegister} />;

      case "dashboard":
        return user ? (
          <DashboardPage
            user={user}
            helpers={helpers}
            savedIds={savedIds}
            onView={setSelectedHelper}
            onSave={handleSave}
          />
        ) : (
          <AuthPage mode="login" setPage={setPage} onAuth={handleAuth} />
        );

      default:
        return (
          <HomePage
            setPage={setPage}
            helpers={helpers}
            onView={setSelectedHelper}
            onSave={handleSave}
            savedIds={savedIds}
          />
        );
    }
  };

  return (
    <>
      {/* Grain noise overlay */}
      <div className="noise-overlay" />

      {/* Fixed top navigation */}
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        setUser={setUser}
      />

      {/* Active page */}
      {renderPage()}

      {/* Footer only on home */}
      {page === "home" && <Footer setPage={setPage} />}

      {/* Helper profile modal */}
      {selectedHelper && (
        <ProfileModal
          helper={selectedHelper}
          onClose={() => setSelectedHelper(null)}
          onSave={handleSave}
          saved={savedIds.includes(selectedHelper.id)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default App;