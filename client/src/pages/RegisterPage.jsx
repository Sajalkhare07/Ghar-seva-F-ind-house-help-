import { useEffect, useMemo, useState } from "react";
import { addHelper, getMyHelperProfile, updateHelper } from "../api/index";

const DOCUMENT_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID",
  "Driving Licence",
  "Passport",
  "Ration Card",
];

const EMPTY_DOC = (type = "") => ({
  type,
  documentNumber: "",
  documentUrl: "",
});

const initialForm = {
  name: "",
  phone: "",
  service: "Maid",
  price: "",
  city: "Indore",
  area: "",
  availability: "Morning (6-10 AM)",
  about: "",
  dateOfBirth: "",
  currentAddress: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  livePhoto: "",
  verificationDocuments: [
    EMPTY_DOC("Aadhaar Card"),
    EMPTY_DOC("PAN Card"),
    EMPTY_DOC("Voter ID"),
  ],
};

const mapProfileToForm = (profile) => ({
  name: profile.name || "",
  phone: profile.phone || "",
  service: profile.service || "Maid",
  price: profile.price != null ? String(profile.price) : "",
  city: profile.city || "Indore",
  area: profile.area || "",
  availability: profile.availability || "Morning (6-10 AM)",
  about: profile.about || "",
  dateOfBirth: profile.dateOfBirth || "",
  currentAddress: profile.currentAddress || "",
  emergencyContactName: profile.emergencyContactName || "",
  emergencyContactPhone: profile.emergencyContactPhone || "",
  livePhoto: profile.livePhoto || "",
  verificationDocuments:
    profile.verificationDocuments?.length >= 3
      ? profile.verificationDocuments
      : initialForm.verificationDocuments,
});

const RegisterPage = ({ user, setPage }) => {
  const [form, setForm] = useState(initialForm);
  const [existingProfile, setExistingProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEligible = user && ["helper", "admin"].includes(user.role);

  useEffect(() => {
    if (!isEligible) return;

    let cancelled = false;
    setProfileLoading(true);
    getMyHelperProfile()
      .then((res) => {
        if (cancelled) return;
        setExistingProfile(res.data.data);
        setForm(mapProfileToForm(res.data.data));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status !== 404) {
          setError("Could not load your existing helper profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEligible]);

  const completedDocs = useMemo(
    () =>
      form.verificationDocuments.filter(
        (doc) => doc.type && doc.documentNumber.trim() && doc.documentUrl.trim()
      ).length,
    [form.verificationDocuments]
  );

  const updateDoc = (index, field, value) => {
    setForm((current) => ({
      ...current,
      verificationDocuments: current.verificationDocuments.map((doc, docIndex) =>
        docIndex === index ? { ...doc, [field]: value } : doc
      ),
    }));
  };

  const handleLivePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for the live helper photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        livePhoto: typeof reader.result === "string" ? reader.result : "",
      }));
      setError("");
    };
    reader.onerror = () => {
      setError("Could not read the selected photo. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handle = async () => {
    if (!isEligible) {
      setError("Login with a helper or admin account before submitting a helper profile.");
      return;
    }

    const requiredFields = [
      form.name,
      form.phone,
      form.price,
      form.area,
      form.dateOfBirth,
      form.currentAddress,
      form.emergencyContactName,
      form.emergencyContactPhone,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      setError("Please fill all required fields");
      return;
    }

    if (!form.livePhoto.trim()) {
      setError("Please upload a live photo of the helper.");
      return;
    }

    if (completedDocs < 3) {
      setError("Please add Aadhaar plus at least two more documents.");
      return;
    }

    const hasAadhaar = form.verificationDocuments.some(
      (doc) => doc.type === "Aadhaar Card" && doc.documentNumber.trim() && doc.documentUrl.trim()
    );

    if (!hasAadhaar) {
      setError("Aadhaar Card is required for helper verification.");
      return;
    }

    const payload = {
      ...form,
      price: parseInt(form.price, 10),
      skills: [form.service],
      avatar: form.name.slice(0, 2).toUpperCase(),
      gradient: "linear-gradient(135deg,#667eea,#764ba2)",
      experience: existingProfile?.experience || "New",
      verificationDocuments: form.verificationDocuments.filter(
        (doc) => doc.type && doc.documentNumber.trim() && doc.documentUrl.trim()
      ),
    };

    setLoading(true);
    setError("");
    try {
      if (existingProfile?._id) {
        await updateHelper(existingProfile._id, payload);
      } else {
        await addHelper(payload);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isEligible) {
    return (
      <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", padding: 32, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>
              Helper verification starts after helper sign-in
            </h1>
            <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 18 }}>
              Please create or login with a helper account first. We now link every helper profile to an account so the admin can review documents, approve the profile, and keep the listing secure.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => setPage("signup")}>Create helper account</button>
              <button className="btn-outline" onClick={() => setPage("login")}>Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="page-content" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", maxWidth: 520 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 12, color: "#0f172a" }}>
            {existingProfile ? "Profile re-submitted" : "Verification submitted"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 17, maxWidth: 440, margin: "0 auto 24px" }}>
            Your helper profile is now waiting for admin approval. It stays hidden from users until the documents are reviewed and approved.
          </p>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, textAlign: "left", boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>Submitted Details</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{form.name}</div>
            <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
              {form.service}  -  {form.city}  -  Rs.{form.price}/month
            </div>
            <div style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
              Documents uploaded: {completedDocs}
            </div>
            <div style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
              Live photo: {form.livePhoto ? "Uploaded" : "Missing"}
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setPage("dashboard")}>
            Go to helper dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ paddingTop: 80, minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "inline-block", background: "#ecfdf5", color: "#059669", borderRadius: 50, padding: "4px 16px", fontSize: 13, fontWeight: 700, marginBottom: 12, border: "1px solid #a7f3d0" }}>
            Helper verification
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 8, color: "#0f172a" }}>
            {existingProfile ? "Update your verified helper profile" : "Register as a verified helper"}
          </h1>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            Submit your profile, Aadhaar, and additional identity documents. Admin approval is required before your listing appears to families.
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}>
          {profileLoading && <p style={{ color: "#64748b", marginBottom: 18 }}>Loading your current helper profile...</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Full Name *</label>
              <input className="input-field" placeholder="Sunita Devi" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Phone Number *</label>
              <input className="input-field" placeholder="9876543210" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Service Type *</label>
              <select className="input-field" value={form.service} onChange={(e) => setForm((current) => ({ ...current, service: e.target.value }))}>
                {["Maid", "Cook", "Cleaner", "Cook+Maid"].map((service) => <option key={service}>{service}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Monthly Price (Rs.) *</label>
              <input className="input-field" type="number" placeholder="3500" value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>City *</label>
              <select className="input-field" value={form.city} onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}>
                {["Indore", "Bhopal", "Delhi", "Mumbai", "Pune", "Hyderabad"].map((city) => <option key={city}>{city}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Area / Locality *</label>
              <input className="input-field" placeholder="e.g. Vijay Nagar" value={form.area} onChange={(e) => setForm((current) => ({ ...current, area: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Date of Birth *</label>
              <input className="input-field" type="date" value={form.dateOfBirth} onChange={(e) => setForm((current) => ({ ...current, dateOfBirth: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Emergency Contact Number *</label>
              <input className="input-field" placeholder="9898989898" value={form.emergencyContactPhone} onChange={(e) => setForm((current) => ({ ...current, emergencyContactPhone: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Emergency Contact Name *</label>
              <input className="input-field" placeholder="Ramesh Devi" value={form.emergencyContactName} onChange={(e) => setForm((current) => ({ ...current, emergencyContactName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Availability</label>
              <select className="input-field" value={form.availability} onChange={(e) => setForm((current) => ({ ...current, availability: e.target.value }))}>
                {["Morning (6-10 AM)", "Afternoon (1-4 PM)", "Evening (6-9 PM)", "Full Day"].map((slot) => <option key={slot}>{slot}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Current Address *</label>
            <textarea className="input-field" rows={3} placeholder="House number, street, locality, landmark" value={form.currentAddress} onChange={(e) => setForm((current) => ({ ...current, currentAddress: e.target.value }))} style={{ resize: "vertical", minHeight: 90 }} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>About Yourself</label>
            <textarea className="input-field" rows={4} placeholder="Tell families about your experience and the kind of work you do." value={form.about} onChange={(e) => setForm((current) => ({ ...current, about: e.target.value }))} style={{ resize: "vertical", minHeight: 100 }} />
          </div>

          <div style={{ border: "1px solid #dbeafe", background: "#f8fbff", borderRadius: 18, padding: 22, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>
                  Live helper photo
                </h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                  Upload a clear real-time photo. This image will appear on the helper card after admin approval.
                </p>
              </div>
              {form.livePhoto && (
                <img
                  src={form.livePhoto}
                  alt="Live helper preview"
                  style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 18, border: "1px solid #bfdbfe" }}
                />
              )}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Upload Photo *</label>
              <input
                className="input-field"
                type="file"
                accept="image/*"
                onChange={handleLivePhotoChange}
                style={{ padding: "12px" }}
              />
            </div>
          </div>

          <div style={{ border: "1px solid #dbeafe", background: "#f8fbff", borderRadius: 18, padding: 22, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>
                  Verification documents
                </h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                  Aadhaar is mandatory. Add at least two more government-issued identity documents using shareable links.
                </p>
              </div>
              <div style={{ alignSelf: "flex-start", padding: "8px 14px", borderRadius: 999, background: "#dbeafe", color: "#1d4ed8", fontWeight: 700, fontSize: 13 }}>
                {completedDocs}/3 ready
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {form.verificationDocuments.map((doc, index) => (
                <div key={`${doc.type}-${index}`} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Document Type *</label>
                      <select className="input-field" value={doc.type} onChange={(e) => updateDoc(index, "type", e.target.value)}>
                        <option value="">Select document</option>
                        {DOCUMENT_TYPES.map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Document Number *</label>
                      <input className="input-field" placeholder="Enter number" value={doc.documentNumber} onChange={(e) => updateDoc(index, "documentNumber", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#475569", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Document Link *</label>
                      <input className="input-field" placeholder="Google Drive or file link" value={doc.documentUrl} onChange={(e) => updateDoc(index, "documentUrl", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 16 }} onClick={handle} disabled={loading || profileLoading}>
            {loading ? "Submitting for review..." : existingProfile ? "Resubmit profile for approval" : "Submit helper profile for approval"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
