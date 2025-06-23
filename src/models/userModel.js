import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String },
  password: { type: String },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "profile",
    required: false,
  },
  role: {
    type: String,
    enum: ["User", "Admin"],
    default: "User",
  },

  // Password reset
  resetPasswordCode: { type: String },
  resetPasswordExpiry: { type: Date },

  // Email verification
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpiry: { type: Date },

  // Optionally keep this if you're using token-based verification
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
});

export default mongoose.model("user", userSchema);
