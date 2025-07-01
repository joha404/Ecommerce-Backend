import Profile from "../models/profileModel.js";

// update Profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not found in request" });
    }

    const profileData = {
      ...req.body,
      user: req.user._id,
    };

    const existingProfile = await Profile.findOne({ user: req.user._id });

    if (existingProfile) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true }
      );
      return res.status(200).json(updatedProfile);
    }

    const newProfile = await Profile.create(profileData);
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// user profile get

export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      "-password"
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all profile (only for admin)
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", "-password");
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get profile by userId
export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate(
      "user",
      "-password"
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete profile
export const deleteMyProfile = async (req, res) => {
  try {
    await Profile.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Profile deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
