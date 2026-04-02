// client/src/components/RatingModal.jsx
// ── Paste into: client/src/components/RatingModal.jsx ────────────────────────
import { useState, useEffect } from "react";
import { submitRating, getMyRating } from "../api/index";

const RatingModal = ({ helper, user, onClose, onRated }) => {
  const [hovered, setHovered]   = useState(0);
  const [selected, setSelected] = useState(0);
  const [review, setReview]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [existingRating, setExistingRating] = useState(null);

  // ── Load user's previous rating for this helper if any ────────────────────
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await getMyRating(helper._id || helper.id);
        if (res.data.data) {
          setExistingRating(res.data.data);
          setSelected(res.data.data.rating);
          setReview(res.data.data.review || "");
        }
      } catch {
        // no existing rating — that's fine
      } finally {
        setFetching(false);
      }
    };
    fetchExisting();
  }, [helper]);

  // ── Submit rating ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selected) {
      setError("Please select a star rating");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await submitRating(helper._id || helper.id, selected, review);
      setSuccess(true);
      // Notify parent with new avg rating and review count
      if (onRated) {
        onRated({
          helperId:     helper._id || helper.id,
          newRating:    res.data.data.newRating,
          totalReviews: res.data.data.totalReviews,
        });
      }
      // Auto close after 1.8s
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const starLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const activeVal = hovered || selected;

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff", borderRadius: 24,
          padding: "36px 32px", maxWidth: 420, width: "100%",
          boxShadow: "0 20px 60px rgba(37,99,235,0.18)",
          border: "1px solid #e2e8f0",
          animation: "fadeUp 0.3s ease",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "50%", width: 32, height: 32,
            cursor: "pointer", fontSize: 16, color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >×</button>

        {/* ── Success screen ── */}
        {success ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16, animation: "float 1s ease" }}>🎉</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 8 }}>
              Rating Submitted!
            </h3>
            <p style={{ color: "#64748b", fontSize: 15 }}>
              Thank you for rating <strong>{helper.name}</strong>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ fontSize: 24, color: i <= selected ? "#f59e0b" : "#e2e8f0" }}>★</span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Helper info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: helper.gradient || "linear-gradient(135deg,#2563eb,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Syne, sans-serif", fontWeight: 700,
                fontSize: 16, color: "#fff", flexShrink: 0,
              }}>
                {helper.avatar || (helper.name || "").slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "#0f172a" }}>
                  {existingRating ? "Update Your Rating" : "Rate This Helper"}
                </div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{helper.name}</div>
              </div>
            </div>

            {fetching ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                Loading...
              </div>
            ) : (
              <>
                {/* Existing rating notice */}
                {existingRating && (
                  <div style={{
                    background: "#eff6ff", border: "1px solid #bfdbfe",
                    borderRadius: 10, padding: "10px 14px",
                    fontSize: 13, color: "#1d4ed8", marginBottom: 20,
                  }}>
                    ℹ️ You rated this helper <strong>{existingRating.rating}★</strong> before. Submitting will update it.
                  </div>
                )}

                {/* Star selector */}
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <span
                        key={i}
                        onClick={() => setSelected(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                          fontSize: 40,
                          cursor: "pointer",
                          color: i <= activeVal ? "#f59e0b" : "#e2e8f0",
                          transition: "all 0.15s",
                          transform: i <= activeVal ? "scale(1.15)" : "scale(1)",
                          display: "inline-block",
                          lineHeight: 1,
                        }}
                      >★</span>
                    ))}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: activeVal ? "#f59e0b" : "#94a3b8",
                    minHeight: 20, transition: "all 0.15s",
                  }}>
                    {activeVal ? starLabel[activeVal] : "Tap a star to rate"}
                  </div>
                </div>

                {/* Review text */}
                <div style={{ marginBottom: 20, marginTop: 20 }}>
                  <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Write a review <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Share your experience with this helper..."
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    maxLength={300}
                    style={{ resize: "none" }}
                  />
                  <div style={{ textAlign: "right", fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    {review.length}/300
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 8, padding: "10px 14px",
                    fontSize: 13, color: "#dc2626", marginBottom: 16,
                  }}>
                    ❌ {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selected}
                  style={{
                    width: "100%", padding: "13px",
                    borderRadius: 50, border: "none",
                    background: (!selected || loading)
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: (!selected || loading) ? "#94a3b8" : "#fff",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 700, fontSize: 15,
                    cursor: (!selected || loading) ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: selected && !loading ? "0 4px 14px rgba(37,99,235,0.3)" : "none",
                  }}
                >
                  {loading
                    ? "⏳ Submitting..."
                    : existingRating
                    ? "Update Rating"
                    : "Submit Rating"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;