import mongoose from "mongoose";
import "dotenv/config";

export async function connectDb() {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined in eve-agent/.env");
    }
    await mongoose.connect(mongoUri);
  }
}
