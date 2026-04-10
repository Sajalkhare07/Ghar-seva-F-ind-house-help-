import { useEffect, useMemo, useState } from "react";
import { getAdminOverview, reviewHelperProfile } from "../api/index";
import Avatar from "../components/Avatar";

const statusTone = {
  pending: { bg: "rgba(245,158,11,0.14)", color: "#b45309" },
  approved: { bg: "rgba(34,197,94,0.14)", color: "#15803d" },
  rejected: { bg: "rgba(239,68,68,0.14)", color: "#b91c1c" },
};

const AdminDashboardPage = ({ user, showToast }) => {
  const [tab, setTab] = useState("helpers");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminOverview();
      setOverview(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const counts = overview?.counts || {
    totalUsers: 0,
    totalHelpers: 0,
    pendingHelpers: 0,
    approvedHelpers: 0,
    rejectedHelpers: 0,
  };

  const helpers = useMemo(() => overview?.helpers || [], [overview]);
  const users = useMemo(() => overview?.users || [], [overview]);

  const handleReview = async (helperId, status) => {
    setBusyId(helperId);
    try {
      const res = await reviewHelperProfile(helperId, {
        status,
        approvalNotes: notes[helperId] || "",
      });

      if (status === "rejected") {
        const removedId = res.data?.removedId || helperId;
        setOverview((current) => {
          if (!current) return current;
          const nextHelpers = (current.helpers || []).filter((helper) => helper._id !== removedId);
          return {
            ...current,
            helpers: nextHelpers,
            counts: {
              ...current.counts,
              totalHelpers: nextHelpers.length,
              pendingHelpers: nextHelpers.filter((helper) => helper.verificationStatus === "pending").length,
              approvedHelpers: nextHelpers.filter((helper) => helper.verificationStatus === "approved").length,
              rejectedHelpers: nextHelpers.filter((helper) => helper.verificationStatus === "rejected").length,
            },
          };
        });
      } else {
        await loadOverview();
      }

      if (showToast) showToast(`Helper ${status} successfully.`, "success");
    } catch (err) {
      if (showToast) showToast(err.response?.data?.msg || "Review action failed.", "error");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px" }}>
        <div className="glass" style={{ borderRadius: 22, padding: 28, marginBottom: 24, border: "1px solid rgba(30,41,59,0.08)", background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.94))", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "inline-block", marginBottom: 10, padding: "4px 12px", borderRadius: 999, background: "rgba(96,165,250,0.18)", color: "#bfdbfe", fontSize: 12, fontWeight: 700 }}>
                Admin control room
              </div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 30, marginBottom: 8 }}>
                Listings, users, and document approvals
              </h1>
              <p style={{ color: "rgba(255,255,255,0.78)", maxWidth: 700, lineHeight: 1.7 }}>
                Monitor helper applications, inspect uploaded documents, verify legitimacy, and control which helpers become visible to families.
              </p>
              <p style={{ color: "rgba(255,255,255,0.64)", fontSize: 13, marginTop: 10 }}>{user.email}</p>
            </div>
            <button className="btn-outline" onClick={loadOverview} style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
              Refresh dashboard
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 22 }}>
            {[
              ["Total users", counts.totalUsers],
              ["Helper profiles", counts.totalHelpers],
              ["Pending review", counts.pendingHelpers],
              ["Approved", counts.approvedHelpers],
              ["Rejected", counts.rejectedHelpers],
            ].map(([label, value]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28 }}>{value}</div>
                <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, marginBottom: 24, flexWrap: "wrap", width: "fit-content" }}>
          {[
            ["helpers", "Helper approvals"],
            ["users", "Users and admins"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              style={{
                padding: "8px 16px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                background: tab === value ? "rgba(79,142,247,0.18)" : "transparent",
                color: tab === value ? "var(--blue)" : "var(--text2)",
                fontFamily: "DM Sans",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "var(--text2)" }}>Loading admin dashboard...</p>
        ) : error ? (
          <div className="glass" style={{ borderRadius: 16, padding: 24, color: "#b91c1c" }}>{error}</div>
        ) : tab === "users" ? (
          <div className="glass" style={{ borderRadius: 18, padding: 22 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 16 }}>All users</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {users.map((account) => (
                <div key={account._id} style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, background: "#fff" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{account.name}</div>
                    <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{account.email}</div>
                  </div>
                  <div style={{ alignSelf: "center", padding: "6px 12px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: 12, textTransform: "capitalize" }}>
                    {account.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {helpers.map((helper) => {
              const tone = statusTone[helper.verificationStatus] || statusTone.pending;
              const isBusy = busyId === helper._id;
              return (
                <div key={helper._id} className="glass" style={{ borderRadius: 18, padding: 22, background: "#fff", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <Avatar initials={helper.avatar} gradient={helper.gradient} imageUrl={helper.livePhoto} size={62} />
                      <div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, margin: 0 }}>{helper.name}</h2>
                          <span style={{ padding: "6px 12px", borderRadius: 999, background: tone.bg, color: tone.color, fontWeight: 700, fontSize: 12, textTransform: "capitalize" }}>
                            {helper.verificationStatus}
                          </span>
                        </div>
                        <p style={{ color: "#64748b", marginTop: 8, lineHeight: 1.7 }}>
                          {helper.service} / {helper.area}, {helper.city} / Rs.{Number(helper.price).toLocaleString()}/month
                        </p>
                        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                          Account: {helper.user?.name || "Unknown"} / {helper.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <div style={{ minWidth: 240 }}>
                      <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>Quick legitimacy view</div>
                      <div style={{ color: "#0f172a", fontSize: 14, lineHeight: 1.7 }}>
                        DOB: {helper.dateOfBirth}<br />
                        Phone: {helper.phone}<br />
                        Emergency: {helper.emergencyContactName} / {helper.emergencyContactPhone}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    {helper.livePhoto && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>Live helper photo</div>
                        <img
                          src={helper.livePhoto}
                          alt={helper.name}
                          style={{ width: 132, height: 132, objectFit: "cover", borderRadius: 16, border: "1px solid #e2e8f0" }}
                        />
                      </div>
                    )}
                    <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>Uploaded documents</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                      {(helper.verificationDocuments || []).map((doc) => (
                        <div key={`${doc.type}-${doc.documentNumber}`} style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, background: "#f8fafc" }}>
                          <div style={{ fontWeight: 700 }}>{doc.type}</div>
                          <div style={{ color: "#64748b", fontSize: 13, margin: "6px 0 10px" }}>{doc.documentNumber}</div>
                          <a href={doc.documentUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700, fontSize: 13 }}>
                            Open document
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Admin notes
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="Add approval notes or rejection reasons"
                      value={notes[helper._id] ?? helper.approvalNotes ?? ""}
                      onChange={(e) => setNotes((current) => ({ ...current, [helper._id]: e.target.value }))}
                      style={{ resize: "vertical", minHeight: 88 }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="btn-primary" disabled={isBusy} onClick={() => handleReview(helper._id, "approved")}>
                      Approve helper
                    </button>
                    <button className="btn-outline" disabled={isBusy} onClick={() => handleReview(helper._id, "rejected")}>
                      Reject helper
                    </button>
                    <button className="btn-outline" disabled={isBusy} onClick={() => handleReview(helper._id, "pending")}>
                      Move to pending
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
