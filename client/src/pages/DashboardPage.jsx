// Routes households vs helpers to the right dashboard after login
import UserDashboardPage from "./UserDashboardPage";
import HelperDashboardPage from "./HelperDashboardPage";

const DashboardPage = ({ user, savedIds, onView, onSave, setPage }) => {
  if (user.role === "helper") {
    return <HelperDashboardPage user={user} setPage={setPage} />;
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
