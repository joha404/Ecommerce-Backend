import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    location: {
      type: String,
    },
    website: {
      type: String,
    },
    social: {
      facebook: String,
      twitter: String,
      linkedin: String,
      github: String,
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("profile", profileSchema);
export default Profile;
