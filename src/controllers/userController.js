import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Create User (Sign Up)
async function CreateUser(req, res) {
  const { name, email, number, password, role } = req.body;

  if (!name || !email || !number || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      number,
      password: hashedPassword,
      role: req.body.role || "User",
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        number: newUser.number,
        role: newUser.role, // ✅ Add this
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
}

// Login User
async function LoginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "72h",
    });

    // Remove password before sending user info
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      role: user.role,
    };

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("userInfo", JSON.stringify(userInfo), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      userInfo: userInfo,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
}

// Logout User
function LogoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
}

// Get Single User
async function getSingleUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

// Get All Users
async function getAllUser(req, res) {
  try {
    const users = await userModel.find().select("-password");
    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

// Update User
async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { name, email, number, password } = req.body;

    let updatedData = { name, email, number };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updatedData, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
}

// Delete User
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    const deletedUser = await userModel.findByIdAndDelete(userId);

    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
}

export default {
  CreateUser,
  LoginUser,
  LogoutUser,
  getSingleUser,
  getAllUser,
  updateUser,
  deleteUser,
};
