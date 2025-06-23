import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin"],
      default: "Admin",
    },
    isVerified: {
      type: Boolean,
      default: true, // Admins are usually verified by default
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
adminModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("admin", adminModel);
