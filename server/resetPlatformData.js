require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Helper = require("./models/Helper");
const Booking = require("./models/Booking");
const Rating = require("./models/Rating");

const resetPlatformData = async () => {
  await connectDB();

  const [users, helpers, bookings, ratings] = await Promise.all([
    User.deleteMany({}),
    Helper.deleteMany({}),
    Booking.deleteMany({}),
    Rating.deleteMany({}),
  ]);

  console.log("Platform data reset complete.");
  console.log(`Users removed: ${users.deletedCount}`);
  console.log(`Helpers removed: ${helpers.deletedCount}`);
  console.log(`Bookings removed: ${bookings.deletedCount}`);
  console.log(`Ratings removed: ${ratings.deletedCount}`);
  process.exit(0);
};

resetPlatformData().catch((error) => {
  console.error("Failed to reset platform data:", error.message);
  process.exit(1);
});
