import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const DBConnect = async () => {
  if (isConnected) {
    console.log("🔄 Using existing database connection");
    return;
  }

  if (!process.env.MONGOURL) {
    console.error("⚠️ MONGOURL not set in environment variables.");
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(process.env.MONGOURL, {
      serverSelectionTimeoutMS: 10000, // optional timeout
    });

    isConnected = connection.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default DBConnect;
