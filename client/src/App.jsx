import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import ProfileModal from "./components/ProfileModal";

import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import AuthPage from "./pages/AuthPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

import { getMe, toggleSavedHelper } from "./api/index";

const shapeUser = (raw) => ({
  id: String(raw?.id || raw?._id || ""),
  name: raw?.name || "",
  email: raw?.email || "",
  role: raw?.role || "user",
  savedHelpers: (raw?.savedHelpers || []).map(String),
});

const App = () => {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        const parsed = shapeUser(JSON.parse(savedUser));
        setUser(parsed);
        setSavedIds(parsed.savedHelpers || []);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getMe()
      .then((res) => {
        const currentUser = shapeUser(res.data.user);
        setUser(currentUser);
        setSavedIds(currentUser.savedHelpers || []);
        localStorage.setItem("user", JSON.stringify(currentUser));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setSavedIds([]);
        }
      });
  }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleAuth = (userData) => {
    const currentUser = shapeUser(userData);
    setUser(currentUser);
    setSavedIds(currentUser.savedHelpers || []);
    localStorage.setItem("user", JSON.stringify(currentUser));
    setPage("dashboard");

    if (currentUser.role === "helper") {
      showToast(`Welcome, ${currentUser.name}! Your helper workspace is open.`, "success");
    } else {
      showToast(`Welcome, ${currentUser.name}!`, "success");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setSavedIds([]);
    setPage("home");
    showToast("Logged out successfully");
  };

  const handleSave = async (id) => {
    const helperId = String(id);

    if (!user) {
      showToast("Please login to save helpers", "error");
      return;
    }

    try {
      const res = await toggleSavedHelper(helperId);
      const updatedSavedIds = (res.data.savedHelpers || []).map(String);

      setSavedIds(updatedSavedIds);

      const updatedUser = {
        ...user,
        savedHelpers: updatedSavedIds,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showToast(
        res.data.saved ? "Helper saved!" : "Removed from saved",
        res.data.saved ? "success" : "error"
      );
    } catch (err) {
      showToast(
        err.response?.data?.msg || "Could not update saved helpers",
        "error"
      );
    }
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage setPage={setPage} />;

      case "browse":
        return (
          <BrowsePage
            user={user}
            onView={setSelectedHelper}
            onSave={handleSave}
            savedIds={savedIds}
          />
        );

      case "login":
        return <AuthPage mode="login" setPage={setPage} onAuth={handleAuth} />;

      case "signup":
        return <AuthPage mode="signup" setPage={setPage} onAuth={handleAuth} />;

      case "register":
        return <RegisterPage />;

      case "dashboard":
        return user ? (
          <DashboardPage
            user={user}
            savedIds={savedIds}
            onView={setSelectedHelper}
            onSave={handleSave}
            setPage={setPage}
          />
        ) : (
          <AuthPage mode="login" setPage={setPage} onAuth={handleAuth} />
        );

      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
    <>
      <div className="noise-overlay" />

      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        setUser={handleLogout}
      />

      {renderPage()}

      {page === "home" && <Footer setPage={setPage} />}

      {selectedHelper && (
        <ProfileModal
          helper={selectedHelper}
          onClose={() => setSelectedHelper(null)}
          onSave={handleSave}
          saved={savedIds.map(String).includes(String(selectedHelper.id || selectedHelper._id))}
          user={user}
          setPage={setPage}
          onBookingSuccess={() =>
            showToast(
              "Booking request sent! Check My booking requests in Dashboard.",
              "success"
            )
          }
        />
      )}

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
