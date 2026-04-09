require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  const { MONGO_URI, ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
    console.error("Missing required env vars. Please set MONGO_URI, ADMIN_SEED_EMAIL, and ADMIN_SEED_PASSWORD.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    const email = ADMIN_SEED_EMAIL.trim().toLowerCase();

    let admin = await User.findOne({ email });
    if (admin) {
      admin.name = ADMIN_SEED_NAME?.trim() || admin.name || "Admin";
      admin.password = ADMIN_SEED_PASSWORD;
      admin.role = "admin";
      admin.authProvider = "local";
      admin.googleId = undefined;
      await admin.save();
      console.log(`Updated existing admin: ${email}`);
    } else {
      admin = await User.create({
        name: ADMIN_SEED_NAME?.trim() || "Admin",
        email,
        password: ADMIN_SEED_PASSWORD,
        role: "admin",
      });
      console.log(`Created admin: ${admin.email}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Admin seed failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
