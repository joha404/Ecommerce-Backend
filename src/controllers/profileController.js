import Profile from "../models/profileModel.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching profile for userId:", userId);

    const profile = await Profile.findOne({ user: userId }).populate("user", [
      "name",
      "email",
    ]);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("getProfile error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};

export const upsertProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = { ...req.body };

    if (req.file) {
      // Upload avatar to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_avatars",
      });

      // Set avatar URL from Cloudinary response
      profileData.avatar = result.secure_url;

      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: profileData,
        $setOnInsert: { user: userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error("upsertProfile error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};
// ✅ DELETE: Delete profile by user ID
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ user: req.params.userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
