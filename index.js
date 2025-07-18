import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import DBConnect from "./src/config/db.js";
import userRoutes from "./src/routes/userRoute.js";
import categoryRouter from "./src/routes/categoryRoute.js";
import productRoute from "./src/routes/productRoute.js";
import cartRouter from "./src/routes/cartRoute.js";
import addressRouter from "./src/routes/addressRoute.js";
import orderRouter from "./src/routes/orderRoute.js";
import reviewRouter from "./src/routes/reviewRoute.js";
import authRouter from "./src/routes/authRoutes.js";
import adminRouter from "./src/routes/adminRoutes.js";
import profileRouter from "./src/routes/profileRoutes.js";
import paymentRouter from "./src/routes/paymentRoute.js";

const __dirname = path.resolve();
const app = express();

DBConnect().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});

const allowedOrigins = [
  "https://ecom-front-end-gsal.vercel.app",
  "http://localhost:5173",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("CORS blocked:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Hey Developer! Your Server is Running Now");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/payment", paymentRouter);

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
