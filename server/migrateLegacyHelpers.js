require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const Helper = require("./models/Helper");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Helper.updateMany(
      { verified: true, verificationStatus: { $exists: false } },
      {
        $set: {
          verificationStatus: "approved",
          approvalNotes: "Migrated from legacy verified helper data",
        },
      }
    );
    console.log(`Matched ${result.matchedCount}, updated ${result.modifiedCount} legacy verified helpers.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
