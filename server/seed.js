const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const Helper = require("./models/Helper");

const helpers = [
  { name:"Sunita Devi",    phone:"9876543210", service:"Maid",     city:"Indore", area:"Vijay Nagar",    price:3500, rating:4.8, reviews:34, available:true,  verified:true,  experience:"5 years",  about:"Experienced in housekeeping, utensil washing, and sweeping.", skills:["Sweeping","Mopping","Utensil Washing","Clothes Washing"], gradient:"linear-gradient(135deg,#667eea,#764ba2)" },
  { name:"Radha Bai",      phone:"9876543211", service:"Cook",     city:"Indore", area:"Palasia",        price:4500, rating:4.9, reviews:52, available:true,  verified:true,  experience:"8 years",  about:"Specializes in North Indian and Rajasthani cuisine.",          skills:["North Indian","Rajasthani","Roti","Dal Tadka"],            gradient:"linear-gradient(135deg,#f093fb,#f5576c)" },
  { name:"Kamla Singh",    phone:"9876543212", service:"Maid",     city:"Bhopal", area:"MP Nagar",       price:3000, rating:4.6, reviews:28, available:true,  verified:true,  experience:"3 years",  about:"Reliable maid available for morning slots.",                  skills:["Dusting","Mopping","Sweeping","Window Cleaning"],          gradient:"linear-gradient(135deg,#4facfe,#00f2fe)" },
  { name:"Geeta Patel",    phone:"9876543213", service:"Cook",     city:"Delhi",  area:"Lajpat Nagar",   price:5500, rating:4.7, reviews:41, available:false, verified:true,  experience:"10 years", about:"Expert in multi-cuisine cooking.",                             skills:["South Indian","North Indian","Chinese","Salads"],          gradient:"linear-gradient(135deg,#43e97b,#38f9d7)" },
  { name:"Priya Yadav",    phone:"9876543214", service:"Cleaner",  city:"Indore", area:"Scheme 54",      price:2500, rating:4.5, reviews:19, available:true,  verified:false, experience:"2 years",  about:"Specializes in deep cleaning and bathroom sanitization.",      skills:["Deep Cleaning","Bathroom","Kitchen","Sofa Cleaning"],      gradient:"linear-gradient(135deg,#fa709a,#fee140)" },
  { name:"Lakshmi Verma",  phone:"9876543215", service:"Maid",     city:"Bhopal", area:"Arera Colony",   price:3200, rating:4.7, reviews:38, available:true,  verified:true,  experience:"6 years",  about:"Experienced in all household chores.",                        skills:["All Household Chores","Clothes Ironing","Vessel Cleaning"], gradient:"linear-gradient(135deg,#a18cd1,#fbc2eb)" },
  { name:"Savita Kumari",  phone:"9876543216", service:"Cook",     city:"Delhi",  area:"Dwarka",         price:4000, rating:4.4, reviews:22, available:true,  verified:true,  experience:"4 years",  about:"Cooks fresh home-style meals for bachelors.",                 skills:["North Indian","Dal","Sabzi","Rice","Roti"],                gradient:"linear-gradient(135deg,#ffecd2,#fcb69f)" },
  { name:"Anjali Thakur",  phone:"9876543217", service:"Maid",     city:"Indore", area:"Rajwada",        price:2800, rating:4.3, reviews:15, available:true,  verified:false, experience:"1.5 years",about:"New but enthusiastic and dedicated.",                         skills:["Sweeping","Mopping","Dusting"],                            gradient:"linear-gradient(135deg,#89f7fe,#66a6ff)" },
  { name:"Meena Rawat",    phone:"9876543218", service:"Cook+Maid",city:"Bhopal", area:"Shivaji Nagar",  price:6000, rating:4.9, reviews:67, available:true,  verified:true,  experience:"12 years", about:"Full-time domestic helper. Cooks, cleans, manages home.",     skills:["All Cooking","All Cleaning","Grocery Management"],         gradient:"linear-gradient(135deg,#a1c4fd,#c2e9fb)" },
  { name:"Shanta Gupta",   phone:"9876543219", service:"Cleaner",  city:"Delhi",  area:"Saket",          price:3000, rating:4.6, reviews:31, available:true,  verified:true,  experience:"5 years",  about:"Professional cleaner with residential experience.",           skills:["Deep Cleaning","Vacuum","Disinfection","Carpet Cleaning"], gradient:"linear-gradient(135deg,#fccb90,#d57eeb)" },
  { name:"Usha Sharma",    phone:"9876543220", service:"Cook",     city:"Indore", area:"MG Road",        price:3800, rating:4.5, reviews:26, available:false, verified:true,  experience:"7 years",  about:"Makes excellent Madhya Pradesh-style home food.",             skills:["MP Cuisine","Dal Bafla","Poha","Bhajia","Kadhi"],          gradient:"linear-gradient(135deg,#96fbc4,#f9f586)" },
  { name:"Champa Bai",     phone:"9876543221", service:"Maid",     city:"Delhi",  area:"Karol Bagh",     price:3500, rating:4.2, reviews:18, available:true,  verified:false, experience:"3 years",  about:"Available for part-time work, flexible timings.",             skills:["Sweeping","Mopping","Dusting","Dishwashing"],              gradient:"linear-gradient(135deg,#ff9a9e,#fad0c4)" },
  { name:"Rukmini Devi",   phone:"9876543222", service:"Cook+Maid",city:"Bhopal", area:"Gulmohar",       price:5500, rating:4.8, reviews:44, available:true,  verified:true,  experience:"9 years",  about:"Complete domestic solution for bachelor households.",          skills:["Full Cooking","Full Cleaning","Laundry","Grocery"],        gradient:"linear-gradient(135deg,#30cfd0,#330867)" },
  { name:"Durga Prajapati",phone:"9876543223", service:"Cleaner",  city:"Indore", area:"Bicholi Mardana",price:2000, rating:4.1, reviews:12, available:true,  verified:false, experience:"1 year",   about:"Basic cleaning at affordable prices for small flats.",        skills:["Sweeping","Mopping","Bathroom Cleaning"],                  gradient:"linear-gradient(135deg,#e0c3fc,#8ec5fc)" },
  { name:"Sarla Mishra",   phone:"9876543224", service:"Cook",     city:"Delhi",  area:"Pitampura",      price:4800, rating:4.7, reviews:39, available:true,  verified:true,  experience:"11 years", about:"Veteran home cook specializing in healthy meals.",            skills:["Meal Prep","Healthy Cooking","Tiffin Service","Snacks"],   gradient:"linear-gradient(135deg,#f6d365,#fda085)" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    await Helper.deleteMany({});
    console.log("🗑️  Cleared old helpers");
    await Helper.insertMany(helpers);
    console.log("✅ 15 helpers seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};
