import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    website: {
      type: String,
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("profile", profileSchema);
export default Profile;
