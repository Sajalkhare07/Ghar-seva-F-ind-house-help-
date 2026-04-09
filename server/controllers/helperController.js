const Helper = require("../models/Helper");

const ALLOWED_SERVICES = ["Maid", "Cook", "Cleaner", "Cook+Maid"];
const ALLOWED_CITIES = ["Indore", "Bhopal", "Delhi", "Mumbai", "Pune", "Hyderabad"];
const ALLOWED_AVAILABILITY = [
  "Morning (6-10 AM)",
  "Afternoon (1-4 PM)",
  "Evening (6-9 PM)",
  "Full Day",
];
const ALLOWED_DOCUMENT_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID",
  "Driving Licence",
  "Passport",
  "Ration Card",
];

const approvedBrowseFilter = {
  $or: [
    { verificationStatus: "approved", verified: true },
    { verified: true, verificationStatus: { $exists: false } },
  ],
};

const sanitizeDocuments = (docs) => {
  if (!Array.isArray(docs)) return undefined;

  return docs
    .map((doc) => ({
      type: typeof doc?.type === "string" ? doc.type.trim() : "",
      documentNumber:
        typeof doc?.documentNumber === "string" ? doc.documentNumber.trim() : "",
      documentUrl:
        typeof doc?.documentUrl === "string" ? doc.documentUrl.trim() : "",
    }))
    .filter((doc) => doc.type || doc.documentNumber || doc.documentUrl);
};

const sanitizeHelperPayload = (body = {}) => {
  const payload = {
    name: typeof body.name === "string" ? body.name.trim() : undefined,
    phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
    service: typeof body.service === "string" ? body.service.trim() : undefined,
    city: typeof body.city === "string" ? body.city.trim() : undefined,
    area: typeof body.area === "string" ? body.area.trim() : undefined,
    availability:
      typeof body.availability === "string" ? body.availability.trim() : undefined,
    about: typeof body.about === "string" ? body.about.trim() : undefined,
    experience:
      typeof body.experience === "string" ? body.experience.trim() : undefined,
    avatar: typeof body.avatar === "string" ? body.avatar.trim() : undefined,
    gradient: typeof body.gradient === "string" ? body.gradient.trim() : undefined,
    dateOfBirth:
      typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : undefined,
    currentAddress:
      typeof body.currentAddress === "string" ? body.currentAddress.trim() : undefined,
    emergencyContactName:
      typeof body.emergencyContactName === "string"
        ? body.emergencyContactName.trim()
        : undefined,
    emergencyContactPhone:
      typeof body.emergencyContactPhone === "string"
        ? body.emergencyContactPhone.trim()
        : undefined,
  };

  if (body.price !== undefined && body.price !== "") {
    payload.price = Number(body.price);
  }

  if (Array.isArray(body.skills)) {
    payload.skills = body.skills
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (body.available !== undefined) {
    payload.available = body.available === true || body.available === "true";
  }

  const documents = sanitizeDocuments(body.verificationDocuments);
  if (documents !== undefined) {
    payload.verificationDocuments = documents;
  }

  return payload;
};

const validatePhone = (value) => /^\d{10,15}$/.test(String(value || "").replace(/\s+/g, ""));

const validateDocuments = (documents) => {
  if (!Array.isArray(documents) || documents.length < 3) {
    return "Upload at least three documents for verification";
  }

  const seenTypes = new Set();
  for (const doc of documents) {
    if (!ALLOWED_DOCUMENT_TYPES.includes(doc.type)) {
      return "Invalid document type selected";
    }
    if (!doc.documentNumber || !doc.documentUrl) {
      return "Each document needs a number and URL";
    }
    if (seenTypes.has(doc.type)) {
      return "Please avoid uploading the same document type twice";
    }
    seenTypes.add(doc.type);
  }

  if (!seenTypes.has("Aadhaar Card")) {
    return "Aadhaar Card is required for helper verification";
  }

  return null;
};

const validateHelperPayload = (payload, isPartial = false) => {
  if (!isPartial || payload.name !== undefined) {
    if (!payload.name) return "Name is required";
  }

  if (!isPartial || payload.phone !== undefined) {
    if (!payload.phone) return "Phone number is required";
    if (!validatePhone(payload.phone)) {
      return "Phone number must be 10 to 15 digits";
    }
  }

  if (!isPartial || payload.service !== undefined) {
    if (!ALLOWED_SERVICES.includes(payload.service)) {
      return "Invalid service type";
    }
  }

  if (!isPartial || payload.city !== undefined) {
    if (!ALLOWED_CITIES.includes(payload.city)) {
      return "Invalid city";
    }
  }

  if (!isPartial || payload.area !== undefined) {
    if (!payload.area) return "Area/locality is required";
  }

  if (!isPartial || payload.price !== undefined) {
    if (!Number.isFinite(payload.price) || payload.price < 500) {
      return "Price must be a valid number of at least 500";
    }
  }

  if (payload.availability !== undefined && !ALLOWED_AVAILABILITY.includes(payload.availability)) {
    return "Invalid availability value";
  }

  if (payload.about !== undefined && payload.about.length > 1000) {
    return "About section must be under 1000 characters";
  }

  if (!isPartial || payload.dateOfBirth !== undefined) {
    if (!payload.dateOfBirth) return "Date of birth is required";
  }

  if (!isPartial || payload.currentAddress !== undefined) {
    if (!payload.currentAddress) return "Current address is required";
  }

  if (!isPartial || payload.emergencyContactName !== undefined) {
    if (!payload.emergencyContactName) return "Emergency contact name is required";
  }

  if (!isPartial || payload.emergencyContactPhone !== undefined) {
    if (!payload.emergencyContactPhone) return "Emergency contact phone is required";
    if (!validatePhone(payload.emergencyContactPhone)) {
      return "Emergency contact phone must be 10 to 15 digits";
    }
  }

  if (!isPartial || payload.verificationDocuments !== undefined) {
    const documentError = validateDocuments(payload.verificationDocuments);
    if (documentError) return documentError;
  }

  return null;
};

const getHelpers = async (req, res) => {
  try {
    const { city, service, minPrice, maxPrice, available } = req.query;

    const filter = { ...approvedBrowseFilter };

    if (city && city !== "All Cities") filter.city = city;
    if (service && service !== "All Services") filter.service = service;
    if (available !== undefined) filter.available = available === "true";

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !Number.isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice && !Number.isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const helpers = await Helper.find(filter).sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: helpers.length,
      data: helpers,
    });
  } catch (err) {
    console.error("getHelpers error:", err.message);
    res.status(500).json({ msg: "Failed to fetch helpers", error: err.message });
  }
};

const getMyHelperProfile = async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.user._id }).populate(
      "approvedBy",
      "name email"
    );

    if (!helper) {
      return res.status(404).json({
        success: false,
        msg: "No helper profile linked to this account",
      });
    }

    res.status(200).json({
      success: true,
      data: helper,
    });
  } catch (err) {
    console.error("getMyHelperProfile error:", err.message);
    res.status(500).json({ msg: "Failed to load profile", error: err.message });
  }
};

const getHelper = async (req, res) => {
  try {
    const helper = await Helper.findOne({
      _id: req.params.id,
      ...approvedBrowseFilter,
    });

    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    res.status(200).json({
      success: true,
      data: helper,
    });
  } catch (err) {
    console.error("getHelper error:", err.message);
    res.status(500).json({ msg: "Failed to fetch helper", error: err.message });
  }
};

const addHelper = async (req, res) => {
  try {
    const helperData = sanitizeHelperPayload(req.body);
    const validationError = validateHelperPayload(helperData, false);

    if (validationError) {
      return res.status(400).json({ msg: validationError });
    }

    const existingProfile = await Helper.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        msg: "You already have a helper profile linked to this account",
      });
    }

    helperData.user = req.user._id;
    helperData.verified = false;
    helperData.verificationStatus = "pending";
    helperData.approvalNotes = "";
    helperData.approvedAt = null;
    helperData.approvedBy = null;

    const helper = await Helper.create(helperData);

    res.status(201).json({
      success: true,
      data: helper,
      msg: "Helper profile submitted for admin review",
    });
  } catch (err) {
    console.error("addHelper error:", err.message);
    res.status(400).json({ msg: "Failed to create helper", error: err.message });
  }
};

const updateHelper = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);

    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    if (!helper.user || String(helper.user) !== String(req.user._id)) {
      return res.status(403).json({
        msg: "You can only update your own helper profile",
      });
    }

    const updates = sanitizeHelperPayload(req.body);
    delete updates.user;

    const validationError = validateHelperPayload(updates, true);
    if (validationError) {
      return res.status(400).json({ msg: validationError });
    }

    updates.verified = false;
    updates.verificationStatus = "pending";
    updates.approvalNotes = "";
    updates.approvedAt = null;
    updates.approvedBy = null;

    const updatedHelper = await Helper.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedHelper,
      msg: "Profile updated and sent back for admin review",
    });
  } catch (err) {
    console.error("updateHelper error:", err.message);
    res.status(400).json({ msg: "Failed to update helper", error: err.message });
  }
};

const deleteHelper = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);

    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    if (!helper.user || String(helper.user) !== String(req.user._id)) {
      return res.status(403).json({
        msg: "You can only delete your own helper profile",
      });
    }

    await Helper.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      msg: "Helper deleted",
    });
  } catch (err) {
    console.error("deleteHelper error:", err.message);
    res.status(500).json({ msg: "Failed to delete helper", error: err.message });
  }
};

module.exports = {
  getHelpers,
  getMyHelperProfile,
  getHelper,
  addHelper,
  updateHelper,
  deleteHelper,
  ALLOWED_DOCUMENT_TYPES,
};
