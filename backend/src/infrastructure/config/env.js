import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  TZ: process.env.TZ || "America/Caracas",
};
