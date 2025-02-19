import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { User } from "../model/user.model.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import fs from "fs-extra";
import { PDFDocument } from "pdf-lib";
import path from "path";

const option = {
  httpOnly: true,
  secure: false,
  sameSite: "Lax",
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return { error: "Something went wrong while generating tokens" };
  }
};

const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res
        .status(200)
        .json(new ApiResponse(200, userExist, "User already exists"));
    }

    const user = await User.create({
      userName: userName.toLowerCase(),
      email,
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      return res.status(500).json(new ApiError(500, "Unable to create user"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User created"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    const existUser = await User.findOne({ email });

    if (!existUser) {
      return res.status(404).json(new ApiError(404, "User does not exist"));
    }

    const isCorrect = await existUser.isPasswordCorrect(password);

    if (!isCorrect) {
      return res.status(400).json(new ApiError(400, "Incorrect password"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      existUser._id
    );

    if (accessToken?.error) {
      return res.status(500).json(new ApiError(500, accessToken.error));
    }

    const loggedInUser = await User.findById(existUser._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    return res
      .status(200)
      .clearCookie("accessToken", option)
      .clearCookie("refreshToken", option)
      .json(new ApiResponse(200, {}, "User logged out"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

const sendPasswordResetLink = async (req, res) => {
  try {
    console.log("🔹 Received request for password reset");

    // Step 1: Check if email is present in the request body
    const { email } = req.body;
    if (!email) {
      console.error("❌ Error: Email is missing in request body");
      return res.status(400).json(new ApiError(400, "Email is required"));
    }
    console.log(`✅ Email received: ${email}`);

    // Step 2: Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ Error: User with email ${email} not found`);
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    console.log(`✅ User found: ${user.email}`);

    // Step 3: Generate reset token and hash it
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log(`🔹 Generated reset token: ${resetToken}`);

    const hashedToken = await bcrypt.hash(resetToken, 10);
    console.log(`✅ Hashed reset token saved to database`);

    // Step 4: Store hashed token and expiration time in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();
    console.log("✅ Token saved in database");

    // Step 5: Construct the reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log(`🔹 Reset URL: ${resetUrl}`);

    // Step 6: Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    // Step 7: Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    console.log(`🔹 Sending email to ${user.email}`);

    // Step 8: Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password reset link sent to email"));
  } catch (error) {
    console.error("❌ Error in sendPasswordResetLink:", error);
    const { email } = req.body;
    const user = await User.findOne({ email });
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;
    await user.save();
    return res
      .status(500)
      .json(new ApiError(500, error.message || "Internal Server Error"));
  }
};

const resetPassword = async (req, res) => {
  try {
    console.log("🔹 Reset password request received");

    const { resetToken } = req.params;

    const { newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    // Check if the user exists with a valid token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    console.log("✅ Valid reset token found for:", user.email);

    // Update password (pre-save middleware will handle hashing)
    user.password = newPassword;

    // Remove reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    console.log("✅ Password reset successfully for:", user.email);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// little error in reset password about token

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Email, old password, and new password are required"
          )
        );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const isSame = await bcrypt.compare(oldPassword, user.password);

    if (!isSame) {
      return res.status(400).json(new ApiError(400, "Incorrect old password"));
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json(new ApiError(400, "New password cannot be same as old password"));
    }

    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password changed successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};


export {
  registerUser,
  loginUser,
  logoutUser,
  sendPasswordResetLink,
  resetPassword,
  changePassword,
};
