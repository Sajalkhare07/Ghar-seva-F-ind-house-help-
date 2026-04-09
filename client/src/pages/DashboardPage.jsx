import UserDashboardPage from "./UserDashboardPage";
import HelperDashboardPage from "./HelperDashboardPage";
import AdminDashboardPage from "./AdminDashboardPage";

const DashboardPage = ({ user, savedIds, onView, onSave, setPage, showToast }) => {
  if (user.role === "admin") {
    return <AdminDashboardPage user={user} showToast={showToast} />;
  }

  if (user.role === "helper") {
    return <HelperDashboardPage user={user} setPage={setPage} showToast={showToast} />;
  }

  return (
    <UserDashboardPage
      user={user}
      savedIds={savedIds}
      onView={onView}
      onSave={onSave}
      setPage={setPage}
    />
  );
};

export default DashboardPage;
