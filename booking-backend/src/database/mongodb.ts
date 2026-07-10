import mongoose from "mongoose";
import { LOCAL_DATABASE_URI } from "../config";

export const connectDB = async () => {
    try {
        await mongoose.connect(LOCAL_DATABASE_URI);
        console.log("MongoDB connected!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }
}