import { useEffect, useMemo, useState } from "react";
import { addHelper, getMyHelperProfile, updateHelper } from "../api/index";
import { openPdfDocument } from "../utils/document";

const DOCUMENT_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID",
  "Driving Licence",
  "Passport",
  "Ration Card",
];

const MAX_PDF_SIZE = 4 * 1024 * 1024;

const EMPTY_DOC = (type = "") => ({
  type,
  documentNumber: "",
  documentUrl: "",
  fileName: "",
  mimeType: "application/pdf",
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

const normalizeDoc = (doc = {}) => ({
  type: doc.type || "",
  documentNumber: doc.documentNumber || "",
  documentUrl: doc.documentUrl || "",
  fileName: doc.fileName || "",
  mimeType: doc.mimeType || "application/pdf",
});

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
      ? profile.verificationDocuments.map(normalizeDoc)
      : initialForm.verificationDocuments,
});

const shellCard = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,249,0.96))",
  borderRadius: 30,
  border: "1px solid rgba(74,101,114,0.18)",
  boxShadow: "0 24px 60px rgba(61,37,23,0.10)",
};

const sectionCard = {
  borderRadius: 24,
  border: "1px solid rgba(74,101,114,0.16)",
  background: "rgba(255,255,255,0.96)",
  padding: 22,
};

const labelStyle = {
  display: "block",
  color: "var(--text2)",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
};

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

  const handleDocumentUpload = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload verification documents only as PDF files.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      setError("Each PDF must be 4 MB or smaller for upload.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateDoc(index, "documentUrl", typeof reader.result === "string" ? reader.result : "");
      updateDoc(index, "fileName", file.name);
      updateDoc(index, "mimeType", file.type || "application/pdf");
      setError("");
    };
    reader.onerror = () => {
      setError("Could not read the selected PDF. Please try another file.");
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
      setError("Please upload Aadhaar plus at least two more PDF documents.");
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
      gradient: "linear-gradient(135deg,#102A43,#1B9C85)",
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
      <div className="page-content" style={{ paddingTop: 88, minHeight: "100vh" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "30px 24px 70px" }}>
          <div style={{ ...shellCard, padding: 34 }}>
            <div className="tag tag-purple" style={{ marginBottom: 16 }}>Helper onboarding</div>
            <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.05, marginBottom: 14 }}>
              Helper verification starts after helper sign in
            </h1>
            <p style={{ color: "var(--text2)", lineHeight: 1.8, fontSize: 16, maxWidth: 760, marginBottom: 22 }}>
              Please create or login with a helper account first. Every helper profile is now linked to an account so the admin can review documents, approve the listing, and keep the marketplace secure.
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
      <div className="page-content" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "90px 24px" }}>
        <div style={{ maxWidth: 620, width: "100%", textAlign: "center", ...shellCard, padding: 34 }}>
          <div className="tag tag-green" style={{ margin: "0 auto 16px", width: "fit-content" }}>Submitted for review</div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 12 }}>
            {existingProfile ? "Profile re-submitted" : "Verification submitted"}
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 16, lineHeight: 1.8, maxWidth: 500, margin: "0 auto 24px" }}>
            Your helper profile is now waiting for admin approval. It stays hidden from families until the documents and live photo are reviewed.
          </p>
          <div style={{ ...sectionCard, textAlign: "left" }}>
            <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Submitted details</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", marginBottom: 4 }}>{form.name}</div>
            <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>
              {form.service} in {form.city} at Rs.{form.price}/month
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8, color: "var(--text2)", fontSize: 14 }}>
              <div>Documents ready: {completedDocs}</div>
              <div>Live photo: {form.livePhoto ? "Uploaded" : "Missing"}</div>
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: 22 }} onClick={() => setPage("dashboard")}>
            Go to helper dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ paddingTop: 88, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 24px 70px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(280px, 0.52fr)", gap: 18, alignItems: "start" }}>
          <div style={{ ...shellCard, padding: 30 }}>
            <div className="tag tag-purple" style={{ marginBottom: 16 }}>Modern India Minimal</div>
            <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.02, marginBottom: 14 }}>
              {existingProfile ? "Update your verified helper profile" : "Register as a verified helper"}
            </h1>
            <p style={{ color: "var(--text2)", lineHeight: 1.8, fontSize: 16, maxWidth: 680 }}>
              Submit your profile, Aadhaar, live photo, and additional PDF identity documents. Admin approval is required before your profile appears to families.
            </p>

            {profileLoading && <p style={{ color: "var(--text2)", marginTop: 14 }}>Loading your current helper profile...</p>}

            <div style={{ display: "grid", gap: 18, marginTop: 26 }}>
              <div style={sectionCard}>
                <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                  Basic details
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Full name *</label>
                    <input className="input-field" placeholder="Sunita Devi" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone number *</label>
                    <input className="input-field" placeholder="9876543210" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Service type *</label>
                    <select className="input-field" value={form.service} onChange={(e) => setForm((current) => ({ ...current, service: e.target.value }))}>
                      {["Maid", "Cook", "Cleaner", "Cook+Maid"].map((service) => <option key={service}>{service}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Monthly price (Rs.) *</label>
                    <input className="input-field" type="number" placeholder="3500" value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>City *</label>
                    <select className="input-field" value={form.city} onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}>
                      {["Indore", "Bhopal", "Delhi", "Mumbai", "Pune", "Hyderabad"].map((city) => <option key={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Area / locality *</label>
                    <input className="input-field" placeholder="e.g. Vijay Nagar" value={form.area} onChange={(e) => setForm((current) => ({ ...current, area: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div style={sectionCard}>
                <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                  Personal verification
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Date of birth *</label>
                    <input className="input-field" type="date" value={form.dateOfBirth} onChange={(e) => setForm((current) => ({ ...current, dateOfBirth: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Availability</label>
                    <select className="input-field" value={form.availability} onChange={(e) => setForm((current) => ({ ...current, availability: e.target.value }))}>
                      {["Morning (6-10 AM)", "Afternoon (1-4 PM)", "Evening (6-9 PM)", "Full Day"].map((slot) => <option key={slot}>{slot}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Emergency contact name *</label>
                    <input className="input-field" placeholder="Ramesh Devi" value={form.emergencyContactName} onChange={(e) => setForm((current) => ({ ...current, emergencyContactName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Emergency contact number *</label>
                    <input className="input-field" placeholder="9898989898" value={form.emergencyContactPhone} onChange={(e) => setForm((current) => ({ ...current, emergencyContactPhone: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Current address *</label>
                  <textarea className="input-field" rows={3} placeholder="House number, street, locality, landmark" value={form.currentAddress} onChange={(e) => setForm((current) => ({ ...current, currentAddress: e.target.value }))} style={{ resize: "vertical", minHeight: 92 }} />
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>About yourself</label>
                  <textarea className="input-field" rows={4} placeholder="Tell families about your experience and the kind of work you do." value={form.about} onChange={(e) => setForm((current) => ({ ...current, about: e.target.value }))} style={{ resize: "vertical", minHeight: 106 }} />
                </div>
              </div>

              <div style={sectionCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 14 }}>
                  <div>
                    <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      Live helper photo
                    </div>
                    <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7, maxWidth: 520 }}>
                      Upload a clear real-time photo. This image will be shown on the approved helper profile card after admin approval.
                    </p>
                  </div>
                  {form.livePhoto && (
                    <img
                      src={form.livePhoto}
                      alt="Live helper preview"
                      style={{ width: 128, height: 128, objectFit: "cover", borderRadius: 24, border: "1px solid rgba(74,101,114,0.18)", boxShadow: "0 14px 26px rgba(61,37,23,0.10)" }}
                    />
                  )}
                </div>
                <label style={labelStyle}>Upload photo *</label>
                <input className="input-field" type="file" accept="image/*" onChange={handleLivePhotoChange} style={{ padding: 12 }} />
              </div>

              <div style={sectionCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 14 }}>
                  <div>
                    <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      Verification documents
                    </div>
                    <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7, maxWidth: 620 }}>
                      Aadhaar is mandatory. Upload at least two more government-issued identity documents directly as PDF files.
                    </p>
                  </div>
                  <div className="tag tag-blue" style={{ alignSelf: "flex-start", fontSize: 12 }}>
                    {completedDocs}/3 ready
                  </div>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {form.verificationDocuments.map((doc, index) => (
                    <div key={`${doc.type}-${index}`} style={{ borderRadius: 20, border: "1px solid rgba(74,101,114,0.16)", background: "rgba(255,255,255,0.92)", padding: 18 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
                        <div>
                          <label style={labelStyle}>Document type *</label>
                          <select className="input-field" value={doc.type} onChange={(e) => updateDoc(index, "type", e.target.value)}>
                            <option value="">Select document</option>
                            {DOCUMENT_TYPES.map((type) => <option key={type}>{type}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Document number *</label>
                          <input className="input-field" placeholder="Enter number" value={doc.documentNumber} onChange={(e) => updateDoc(index, "documentNumber", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Upload PDF *</label>
                          <input className="input-field" type="file" accept="application/pdf" onChange={(e) => handleDocumentUpload(index, e)} style={{ padding: 12 }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ color: doc.documentUrl ? "var(--green)" : "var(--text3)", fontSize: 13, fontWeight: 700 }}>
                          {doc.documentUrl ? `PDF ready: ${doc.fileName || "Uploaded document"}` : "No PDF selected yet"}
                        </div>
                        {doc.documentUrl && (
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
                            Open uploaded PDF
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: "rgba(248,231,228,0.92)", border: "1px solid rgba(182,84,69,0.18)", color: "var(--red)", borderRadius: 18, padding: "13px 16px", fontSize: 14 }}>
                  {error}
                </div>
              )}

              <button className="btn-primary" style={{ width: "100%", padding: "15px", fontSize: 16 }} onClick={handle} disabled={loading || profileLoading}>
                {loading ? "Submitting for review..." : existingProfile ? "Resubmit profile for approval" : "Submit helper profile for approval"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ ...sectionCard, position: "sticky", top: 98 }}>
              <div style={{ color: "var(--text3)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                Review checklist
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["Account logged in", !!user],
                  ["Live helper photo uploaded", !!form.livePhoto],
                  ["Aadhaar PDF uploaded", form.verificationDocuments.some((doc) => doc.type === "Aadhaar Card" && doc.documentNumber.trim() && doc.documentUrl.trim())],
                  ["Three PDF documents ready", completedDocs >= 3],
                  ["Address and contacts filled", !!form.currentAddress && !!form.emergencyContactName && !!form.emergencyContactPhone],
                ].map(([label, done]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingBottom: 10, borderBottom: "1px solid rgba(221,206,185,0.64)" }}>
                    <span style={{ color: "var(--text)", fontSize: 14 }}>{label}</span>
                    <span className={done ? "tag tag-green" : "tag tag-orange"} style={{ fontSize: 10 }}>
                      {done ? "Ready" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, padding: "16px 16px", borderRadius: 18, background: "var(--surface-soft)", border: "1px solid rgba(201,178,149,0.64)" }}>
                <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>What admin checks</div>
                <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>
                  The admin reviews your uploaded PDF documents, live photo, address details, and service information before your card goes live for families.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;