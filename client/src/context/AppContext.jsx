import { createContext, useContext, useState } from "react";
import { HELPERS } from "../data/helpers";

// ─── CREATE CONTEXT ───────────────────────────────────────────────────────────
export const AppContext = createContext();

// ─── CUSTOM HOOK ──────────────────────────────────────────────────────────────
export const useApp = () => useContext(AppContext);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }) => {
  const [page, setPage]                   = useState("home");
  const [helpers, setHelpers]             = useState(HELPERS);
  const [user, setUser]                   = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [savedIds, setSavedIds]           = useState([]);
  const [toast, setToast]                 = useState(null);

  // ── Toast helper ──
  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Auth ──
  const handleAuth = (userData) => {
    setUser(userData);
    setPage("dashboard");
    showToast(`Welcome, ${userData.name}! 🎉`);
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
    showToast("Logged out successfully", "success");
  };

  // ── Save / unsave a helper ──
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

  // ── Register a new helper ──
  const handleRegister = (data) => {
    const newHelper = {
      id: Date.now(),
      name: data.name,
      avatar: data.name.slice(0, 2).toUpperCase(),
      service: data.service,
      city: data.city,
      area: data.area,
      price: parseInt(data.price),
      rating: 0,
      reviews: 0,
      available: true,
      verified: false,
      experience: "New",
      about: data.about || "Newly registered helper.",
      phone: data.phone,
      skills: [data.service],
      gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    };
    setHelpers((prev) => [newHelper, ...prev]);
    showToast("Helper profile registered! 🚀");
  };

  return (
    <AppContext.Provider
      value={{
        page, setPage,
        helpers, setHelpers,
        user, setUser,
        selectedHelper, setSelectedHelper,
        savedIds, setSavedIds,
        toast, setToast,
        showToast,
        handleAuth,
        handleLogout,
        handleSave,
        handleRegister,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};