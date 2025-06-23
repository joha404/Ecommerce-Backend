import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmailMessage } from "../utils/sendEmailMessage.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Register new user
export async function createUser(req, res) {
  try {
    const { name, email, number, password, role } = req.body;

    if (!name || !email || !password || !number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // 6-digit code
    const verificationCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const newUser = new userModel({
      name,
      email,
      number,
      password: hashedPassword,
      role: role || "User",
      isVerified: false,
      verificationCode,
      verificationCodeExpiry,
    });

    await newUser.save();

    await sendEmailMessage({
      to: email,
      subject: "Verify your email",
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code will expire in 1 hour.</p>`,
      message: `Your verification code is: ${verificationCode}. It will expire in 1 hour.`,
    });

    res.status(201).json({
      message: "User registered. Please verify your email with the code sent.",
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Verify email using code
export async function verifyEmailCode(req, res) {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await userModel.findOne({ email });

    if (
      !user ||
      user.isVerified ||
      user.verificationCode !== verificationCode ||
      user.verificationCodeExpiry < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Resend code
export async function resendVerificationCode(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.verificationCode = newCode;
    user.verificationCodeExpiry = newExpiry;
    await user.save();

    await sendEmailMessage({
      to: email,
      subject: "Resend: Your verification code",
      html: `<p>Your new verification code is: <strong>${newCode}</strong></p><p>This code will expire in 1 hour.</p>`,
      message: `Your new verification code is: ${newCode}. It will expire in 1 hour.`,
    });

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (err) {
    console.error("Resend code error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Forgot Password - Send Reset Code
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    console.log(email);
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "User not found or email not verified" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiry = resetCodeExpiry;
    await user.save();

    await sendEmailMessage({
      to: email,
      subject: "Reset your password",
      html: `<p>Your password reset code is: <strong>${resetCode}</strong></p><p>This code will expire in 1 hour.</p>`,
      message: `Your password reset code is: ${resetCode}. It will expire in 1 hour.`,
    });

    res.status(200).json({ message: "Reset code sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Reset Password with Code
export async function resetPassword(req, res) {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });

    if (
      !user ||
      !user.resetPasswordCode ||
      user.resetPasswordCode !== resetCode ||
      user.resetPasswordExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Login
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Optional: check for email verification
    // if (!user.isVerified) {
    //   return res.status(403).json({ message: "Please verify your email first." });
    // }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie(
        "userInfo",
        JSON.stringify({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }),
        {
          httpOnly: false, // allow frontend JS to read it
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      )
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
}

// Logout
export function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
}

// Get all users
export async function getAllUsers(req, res) {
  try {
    const users = await userModel.find().select("-password");
    res.status(200).json({ data: users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
}

// Get single user
export async function getSingleUser(req, res) {
  try {
    const user = await userModel
      .findById(req.params.userId)
      .select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const { name, email, number, password } = req.body;
    const updateData = { name, email, number };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await userModel
      .findByIdAndUpdate(req.params.userId, updateData, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const user = await userModel.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
}
