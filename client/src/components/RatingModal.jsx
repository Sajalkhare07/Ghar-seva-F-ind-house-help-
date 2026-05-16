import { useState, useEffect } from "react";
import { submitRating, getMyRating } from "../api/index";
import Avatar from "./Avatar";

const starLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const RatingModal = ({ helper, user, onClose, onRated }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [existingRating, setExistingRating] = useState(null);

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
        // no existing rating
      } finally {
        setFetching(false);
      }
    };
    fetchExisting();
  }, [helper]);

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
      onRated?.({
        helperId: helper._id || helper.id,
        newRating: res.data.data.newRating,
        totalReviews: res.data.data.totalReviews,
      });
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeVal = hovered || selected;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 28,
          padding: "30px 28px",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
          boxShadow: "0 28px 70px rgba(61,37,23,0.18)",
          border: "1px solid rgba(201,178,149,0.84)",
          animation: "fadeUp 0.3s ease",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close rating"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,248,240,0.9)",
            border: "1px solid rgba(74,101,114,0.18)",
            borderRadius: "50%",
            width: 34,
            height: 34,
            cursor: "pointer",
            fontSize: 16,
            color: "var(--text2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          x
        </button>

        {success ? (
          <div style={{ textAlign: "center", padding: "18px 0 8px" }}>
            <div style={{ fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green)", fontWeight: 800, marginBottom: 10 }}>
              Thank you
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 30, color: "var(--text)", marginBottom: 8 }}>
              Rating submitted
            </h3>
            <p style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.7 }}>
              Your feedback for <strong>{helper.name}</strong> has been saved.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ fontSize: 24, color: i <= selected ? "var(--gold)" : "rgba(201,178,149,0.55)" }}>*</span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <Avatar
                initials={helper.avatar || (helper.name || "").slice(0, 2).toUpperCase()}
                gradient={helper.gradient}
                imageUrl={helper.livePhoto}
                size={54}
              />
              <div>
                <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  {existingRating ? "Update your feedback" : "Share your feedback"}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text)" }}>
                  {helper.name}
                </div>
                <div style={{ color: "var(--text2)", fontSize: 13 }}>
                  {user?.name ? `Signed in as ${user.name}` : "Your rating helps other families"}
                </div>
              </div>
            </div>

            {fetching ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text2)" }}>Loading your previous rating...</div>
            ) : (
              <>
                {existingRating && (
                  <div style={{ background: "rgba(215,226,223,0.72)", border: "1px solid rgba(48,78,87,0.18)", borderRadius: 16, padding: "12px 14px", fontSize: 13, color: "var(--accent)", marginBottom: 18, lineHeight: 1.6 }}>
                    You rated this helper <strong>{existingRating.rating} / 5</strong> before. Submitting now will update it.
                  </div>
                )}

                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        onClick={() => setSelected(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                          fontSize: 40,
                          cursor: "pointer",
                          color: i <= activeVal ? "var(--gold)" : "rgba(201,178,149,0.58)",
                          transition: "transform 0.15s ease, color 0.15s ease",
                          transform: i <= activeVal ? "scale(1.12)" : "scale(1)",
                          display: "inline-block",
                          lineHeight: 1,
                        }}
                      >
                        *
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: activeVal ? "var(--brand-dark)" : "var(--text3)", minHeight: 22 }}>
                    {activeVal ? starLabel[activeVal] : "Tap a star to rate"}
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Write a review <span style={{ color: "var(--text3)", fontWeight: 500 }}>(optional)</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Share your experience with this helper..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength={300}
                    style={{ resize: "none" }}
                  />
                  <div style={{ textAlign: "right", fontSize: 12, color: "var(--text3)", marginTop: 5 }}>{review.length}/300</div>
                </div>

                {error && (
                  <div style={{ background: "rgba(248,231,228,0.9)", border: "1px solid rgba(182,84,69,0.18)", borderRadius: 14, padding: "11px 14px", fontSize: 13, color: "var(--red)", marginTop: 14 }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !selected}
                  className={selected && !loading ? "btn-primary" : "btn-outline"}
                  style={{
                    width: "100%",
                    marginTop: 18,
                    padding: "13px 16px",
                    fontSize: 15,
                    opacity: !selected || loading ? 0.7 : 1,
                    cursor: !selected || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Submitting..." : existingRating ? "Update rating" : "Submit rating"}
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