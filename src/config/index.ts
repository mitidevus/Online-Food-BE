import dotenv from "dotenv";
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI || "";
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "";
export const PORT = process.env.PORT || 8000;
