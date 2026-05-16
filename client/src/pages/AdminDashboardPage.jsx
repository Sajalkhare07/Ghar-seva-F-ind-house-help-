import { useEffect, useMemo, useState } from "react";
import { getAdminOverview, reviewHelperProfile } from "../api/index";
import Avatar from "../components/Avatar";
import { openPdfDocument } from "../utils/document";

const statusTone = {
  pending: { bg: "rgba(199,146,62,0.16)", color: "#9a6d1d" },
  approved: { bg: "rgba(80,115,95,0.14)", color: "#3f6552" },
  rejected: { bg: "rgba(182,84,69,0.14)", color: "#9f4336" },
};

const shellCard = {
  borderRadius: 28,
  border: "1px solid rgba(74,101,114,0.18)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
  boxShadow: "0 24px 60px rgba(61,37,23,0.10)",
};

const statCard = {
  padding: 18,
  borderRadius: 20,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(74,101,114,0.16)",
};

const tabButton = (active) => ({
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid transparent",
  cursor: "pointer",
  background: active ? "rgba(27,156,133,0.14)" : "transparent",
  color: active ? "var(--brand-dark)" : "var(--text2)",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.02em",
});

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

      showToast?.(`Helper ${status} successfully.`, "success");
    } catch (err) {
      showToast?.(err.response?.data?.msg || "Review action failed.", "error");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: 88, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 70px" }}>
        <div style={{ ...shellCard, padding: 30, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ maxWidth: 760 }}>
              <div className="tag tag-blue" style={{ marginBottom: 12 }}>Admin control room</div>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.02, marginBottom: 10 }}>
                Listings, users, and document approvals
              </h1>
              <p style={{ color: "var(--text2)", lineHeight: 1.8, fontSize: 16 }}>
                Review helper applications, inspect uploaded PDF documents and live photos, approve trustworthy profiles, and remove rejected submissions cleanly from the system.
              </p>
              <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 10 }}>{user.email}</p>
            </div>
            <button className="btn-outline" onClick={loadOverview}>
              Refresh dashboard
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 22 }}>
            {[
              ["Total users", counts.totalUsers, "var(--accent)"],
              ["Helper profiles", counts.totalHelpers, "var(--brand-dark)"],
              ["Pending review", counts.pendingHelpers, "var(--gold)"],
              ["Approved", counts.approvedHelpers, "var(--green)"],
              ["Rejected", counts.rejectedHelpers, "var(--red)"],
            ].map(([label, value, tone]) => (
              <div key={label} style={statCard}>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: tone }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "inline-flex", gap: 6, padding: 6, borderRadius: 999, border: "1px solid rgba(74,101,114,0.18)", background: "rgba(255,250,244,0.78)", marginBottom: 22, flexWrap: "wrap" }}>
          {[
            ["helpers", "Helper approvals"],
            ["users", "Users and admins"],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} style={tabButton(tab === value)}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ ...shellCard, padding: 24, color: "var(--text2)" }}>Loading admin dashboard...</div>
        ) : error ? (
          <div style={{ ...shellCard, padding: 24, color: "var(--red)" }}>{error}</div>
        ) : tab === "users" ? (
          <div style={{ ...shellCard, padding: 24 }}>
            <div className="tag tag-purple" style={{ marginBottom: 12 }}>Accounts overview</div>
            <h2 style={{ fontSize: 32, marginBottom: 16 }}>All users</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {users.map((account) => (
                <div key={account._id} style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", border: "1px solid rgba(74,101,114,0.16)", borderRadius: 20, padding: 18, background: "rgba(255,255,255,0.92)" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--text)" }}>{account.name}</div>
                    <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>{account.email}</div>
                  </div>
                  <div className="tag tag-blue" style={{ alignSelf: "center", textTransform: "capitalize" }}>
                    {account.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {helpers.map((helper) => {
              const tone = statusTone[helper.verificationStatus] || statusTone.pending;
              const isBusy = busyId === helper._id;
              return (
                <div key={helper._id} style={{ ...shellCard, padding: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 0.52fr)", gap: 18 }}>
                    <div>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <Avatar initials={helper.avatar} gradient={helper.gradient} imageUrl={helper.livePhoto} size={68} />
                        <div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <h2 style={{ fontSize: 30, margin: 0 }}>{helper.name}</h2>
                            <span style={{ padding: "8px 13px", borderRadius: 999, background: tone.bg, color: tone.color, fontWeight: 800, fontSize: 12, textTransform: "capitalize" }}>
                              {helper.verificationStatus}
                            </span>
                          </div>
                          <p style={{ color: "var(--text2)", marginTop: 8, lineHeight: 1.7 }}>
                            {helper.service} in {helper.area}, {helper.city} at Rs.{Number(helper.price).toLocaleString()}/month
                          </p>
                          <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 4 }}>
                            Account: {helper.user?.name || "Unknown"} / {helper.user?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 18 }}>
                        <div style={statCard}>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Date of birth</div>
                          <div style={{ fontWeight: 800 }}>{helper.dateOfBirth || "Not added"}</div>
                        </div>
                        <div style={statCard}>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Phone</div>
                          <div style={{ fontWeight: 800 }}>{helper.phone}</div>
                        </div>
                        <div style={statCard}>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 6 }}>Emergency contact</div>
                          <div style={{ fontWeight: 800 }}>{helper.emergencyContactName || "-"}</div>
                          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>{helper.emergencyContactPhone || "-"}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 18 }}>
                        <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                          Uploaded PDF documents
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                          {(helper.verificationDocuments || []).map((doc) => (
                            <div key={`${doc.type}-${doc.documentNumber}`} style={{ border: "1px solid rgba(74,101,114,0.16)", borderRadius: 20, padding: 16, background: "rgba(255,255,255,0.92)" }}>
                              <div style={{ fontWeight: 800 }}>{doc.type}</div>
                              <div style={{ color: "var(--text2)", fontSize: 13, margin: "6px 0 6px" }}>{doc.documentNumber}</div>
                              <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 10 }}>{doc.fileName || "Uploaded PDF"}</div>
                              <button
                                type="button"
                                onClick={() => openPdfDocument(doc.documentUrl, doc.fileName || `${doc.type}.pdf`)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  color: "var(--brand-dark)",
                                  fontWeight: 800,
                                  fontSize: 13,
                                  cursor: "pointer",
                                }}
                              >
                                Open PDF document
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 14, alignSelf: "start" }}>
                      <div style={statCard}>
                        <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 8 }}>Live helper photo</div>
                        {helper.livePhoto ? (
                          <img src={helper.livePhoto} alt={helper.name} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 22, border: "1px solid rgba(74,101,114,0.16)" }} />
                        ) : (
                          <div style={{ borderRadius: 22, aspectRatio: "1 / 1", display: "grid", placeItems: "center", background: "var(--surface-soft)", color: "var(--text3)" }}>No live photo</div>
                        )}
                      </div>

                      <div style={statCard}>
                        <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                          Admin notes
                        </label>
                        <textarea
                          className="input-field"
                          rows={4}
                          placeholder="Add approval notes or rejection reasons"
                          value={notes[helper._id] ?? helper.approvalNotes ?? ""}
                          onChange={(e) => setNotes((current) => ({ ...current, [helper._id]: e.target.value }))}
                          style={{ resize: "vertical", minHeight: 110 }}
                        />
                      </div>

                      <div style={{ display: "grid", gap: 10 }}>
                        <button className="btn-primary" disabled={isBusy} onClick={() => handleReview(helper._id, "approved")}>
                          Approve helper
                        </button>
                        <button className="btn-outline" disabled={isBusy} onClick={() => handleReview(helper._id, "rejected")}>
                          Reject and remove
                        </button>
                        <button className="btn-outline" disabled={isBusy} onClick={() => handleReview(helper._id, "pending")}>
                          Move to pending
                        </button>
                      </div>
                    </div>
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