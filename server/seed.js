require("dotenv").config();
const mongoose = require("mongoose");
const Helper = require("./models/Helper");

const helpers = [
  {
    name: "Sunita Devi",
    phone: "9876543210",
    service: "Maid",
    city: "Indore",
    area: "Vijay Nagar",
    price: 3500,
    rating: 4.8,
    reviews: 34,
    available: true,
    verified: true,
    verificationStatus: "approved",
    experience: "5 years",
    about: "Experienced in housekeeping, utensil washing and sweeping. Honest and punctual.",
    skills: ["Sweeping", "Mopping", "Utensil Washing", "Clothes Washing"],
    gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    dateOfBirth: "1990-01-12",
    currentAddress: "Vijay Nagar, Indore",
    emergencyContactName: "Ramesh Devi",
    emergencyContactPhone: "9876500001",
    verificationDocuments: [
      { type: "Aadhaar Card", documentNumber: "123412341234", documentUrl: "https://example.com/docs/sunita-aadhaar" },
      { type: "PAN Card", documentNumber: "ABCDE1234F", documentUrl: "https://example.com/docs/sunita-pan" },
      { type: "Voter ID", documentNumber: "MPVOTER1234", documentUrl: "https://example.com/docs/sunita-voter" }
    ]
  },
  {
    name: "Radha Bai",
    phone: "9876543211",
    service: "Cook",
    city: "Indore",
    area: "Palasia",
    price: 4500,
    rating: 4.9,
    reviews: 52,
    available: true,
    verified: true,
    verificationStatus: "approved",
    experience: "8 years",
    about: "Specializes in North Indian and Rajasthani cuisine. Can cook for bachelor groups.",
    skills: ["North Indian", "Rajasthani", "Roti", "Dal Tadka", "Sabzi"],
    gradient: "linear-gradient(135deg,#f093fb,#f5576c)",
    dateOfBirth: "1988-04-02",
    currentAddress: "Palasia, Indore",
    emergencyContactName: "Mohan Bai",
    emergencyContactPhone: "9876500002",
    verificationDocuments: [
      { type: "Aadhaar Card", documentNumber: "223412341234", documentUrl: "https://example.com/docs/radha-aadhaar" },
      { type: "PAN Card", documentNumber: "BCDEF2345G", documentUrl: "https://example.com/docs/radha-pan" },
      { type: "Driving Licence", documentNumber: "MP09DL12345", documentUrl: "https://example.com/docs/radha-licence" }
    ]
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await Helper.deleteMany({});
    console.log("Cleared old helpers");
    const inserted = await Helper.insertMany(helpers);
    console.log(`${inserted.length} helpers seeded successfully`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};
seed();
