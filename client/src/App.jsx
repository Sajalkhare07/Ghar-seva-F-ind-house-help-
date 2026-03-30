import { useState, useEffect } from "react";
import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import Toast         from "./components/Toast";
import ProfileModal  from "./components/ProfileModal";
import HomePage      from "./pages/HomePage";
import BrowsePage    from "./pages/BrowsePage";
import AuthPage      from "./pages/AuthPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { getMe }     from "./api/index";

const shapeUser = (raw) => ({
  id: String(raw?.id || raw?._id || ""),
  name: raw?.name,
  email: raw?.email,
  role: raw?.role || "user",
});

const App = () => {
  const [page, setPage]                     = useState("home");
  const [user, setUser]                     = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [savedIds, setSavedIds]             = useState([]);
  const [toast, setToast]                   = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      try {
        setUser(shapeUser(JSON.parse(savedUser)));
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
        const u = shapeUser(res.data.user);
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      });
  }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleAuth = (userData) => {
    const u = shapeUser(userData);
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    setPage("dashboard");
    if (u.role === "helper") {
      showToast(
        `Welcome, ${u.name}! Your helper workspace is open — add your listing or manage requests.`,
        "success"
      );
    } else {
      showToast(`Welcome, ${u.name}! 🎉`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
    showToast("Logged out successfully");
  };

  const handleSave = (id) => {
    const sid = String(id);
    setSavedIds((prev) => {
      const strPrev = prev.map(String);
      const exists = strPrev.includes(sid);
      showToast(
        exists ? "Removed from saved" : "Helper saved! ♥",
        exists ? "error" : "success"
      );
      return exists
        ? prev.filter((i) => String(i) !== sid)
        : [...prev, sid];
    });
  };

  const renderPage = () => {
    switch (page) {
      case "home":      return <HomePage      setPage={setPage} onView={setSelectedHelper} onSave={handleSave} savedIds={savedIds} />;
      case "browse":    return <BrowsePage    onView={setSelectedHelper} onSave={handleSave} savedIds={savedIds} />;
      case "login":     return <AuthPage      mode="login"  setPage={setPage} onAuth={handleAuth} />;
      case "signup":    return <AuthPage      mode="signup" setPage={setPage} onAuth={handleAuth} />;
      case "register":  return <RegisterPage  />;
      case "dashboard": return user
        ? (
            <DashboardPage
              user={user}
              savedIds={savedIds}
              onView={setSelectedHelper}
              onSave={handleSave}
              setPage={setPage}
            />
          )
        : <AuthPage mode="login" setPage={setPage} onAuth={handleAuth} />;
      default:          return <HomePage      setPage={setPage} onView={setSelectedHelper} onSave={handleSave} savedIds={savedIds} />;
    }
  };

  return (
    <>
      <div className="noise-overlay" />
      <Navbar page={page} setPage={setPage} user={user} setUser={handleLogout} />
      {renderPage()}
      {page === "home" && <Footer setPage={setPage} />}
      {selectedHelper && (
        <ProfileModal
          helper={selectedHelper}
          onClose={() => setSelectedHelper(null)}
          onSave={handleSave}
          saved={savedIds.map(String).includes(
            String(selectedHelper.id || selectedHelper._id)
          )}
          user={user}
          setPage={setPage}
          onBookingSuccess={() =>
            showToast("Booking request sent! Check My requests in Dashboard.", "success")
          }
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default App;
