import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import mongoose from "mongoose";
import transporter from "../../config/nodemailer.config.js";
import {
  generateGlobalToken,
  generateOrgToken,
} from "../utils/generatetoken.js";
import {
  signupSchema,
  updateUserSchema,
} from "../validations/User/UserValidation.js";

import User from "../models/userModel.js";
import Org from "../models/OrgModel.js";
import Employee from "../models/employeeModel.js";

dotenv.config();

const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT;
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Check login attempts
    if (user.loginAttempts >= 5) {
      return res.status(400).json({
        message:
          "You have exceeded the maximum number of login attempts. Please reset your password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      user.loginAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    await user.save();

    // Find an organization created by the user (if any)
    const org = await Org.findOne({ createdBy: user._id })
      .select("name contactEmail _id")
      .lean();

    const responseData = {
      id: user._id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      orgName: org?.name || null,
      orgEmail: org?.contactEmail || null,
      orgId: org?._id || null,
    };

    const accessToken = generateGlobalToken(user);

    res.cookie("token", accessToken, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "You have logged in successfully",
      success: true,
      code: 200,
      data: responseData,
      token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const data = result.data;

    // Check for existing user
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(403).json({ message: "User already exists" });
    }

    // Generate unique Employee ID (eid)

    const user = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      uuid: uuidv4(),
    });
    await user.save();

    const accessToken = generateGlobalToken(user);

    res.cookie("token", accessToken, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "You have signed up successfully",
      success: true,
      code: 201,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        uuid: user.eid,
        token: accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error?.message || JSON.stringify(error),
    });
  }
};

export const logout = async (req, res) => {
  try {
    // 🔍 Check the current token before clearing
    console.log("Token before clearing:", req.cookies.Token);
    console.log("AccessToken before clearing:", req.cookies.accessToken);

    // 🧹 Optionally: Explicitly overwrite the cookie with empty string
    res.cookie("token", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 0,
    });
    res.cookie("orgtoken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 0,
    });

    res.cookie("Token", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 0,
    });

    // ✅ Clear cookies as well
    res.clearCookie("Token", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });
    res.clearCookie("orgToken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });
    res.clearCookie("token", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    // ⚠️ req.cookies still shows the old token, it won’t change until the next request
    console.log(
      "Token after clearing (still in req.cookies):",
      req.cookies.Token
    );
    console.log(req.cookies.token)

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(422).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).json({ error: "User does not exist" });
    }

    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send reset email (mocked)
    await transporter.sendMail({
      to: user.email,
      from: USER,
      subject: "Password Reset",
      html: `<p>You requested for password reset</p><p>Click this <a href="${"http://localhost:3000"}/reset-password/${token}">link</a> to reset password</p>`,
    });

    res.status(200).json({
      message: "Reset link sent to your email",
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { password, token } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      expireToken: { $gt: Date.now() },
    });
    if (!user)
      return res.status(422).json({ error: "Session expired. Try again." });

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.expireToken = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    res.status(200).json({
      user,
      success: true,
      code: 200,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getUserList = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      data: users.map(
        ({
          firstName,
          lastName,
          email,
          role,
          department,
          phone,
          permissions,
            avatar,
            _id
        }) => ({
          firstName,
          lastName,
          email,
          role,
          department,
          phone,
          permissions,
          avatar,
          _id
        })
      ),
      success: true,
      code: 200,
      message: "All users fetched!",
    });
  } catch (error) {
    res.status(500).json({ success: false, code: 500, message: error.message });
  }
};

export const getAllusers = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { email } = req.body;

    const org = await Org.findById(orgId);
    if (!org)
      return res
        .status(404)
        .json({ message: "Organization not found", data: [] });

    if (org.orgEmail !== email) {
      return res.status(403).json({ message: "Unauthorized", data: [] });
    }

    const data = await User.find({ orgId })
      .select("-password")
      .sort({ _id: -1 });

    res.status(200).json({
      data,
      success: true,
      code: 200,
      message: "All users fetched successfully",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getUsersByDept = async (req, res) => {
  try {
    const { orgId, department } = req.body;
    const data = await User.find({ orgId, department })
      .select("firstName")
      .sort({ _id: -1 });

    res.status(200).json({
      data,
      success: true,
      code: 200,
      message: "Department users fetched",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No user with that ID.");

  await User.findByIdAndRemove(_id);
  res.json({ message: "User deleted successfully!" });
};

export const updateUser = async (req, res) => {
  const { id: _id } = req.params;
  if (req.user.userId != _id)
    return res.status(401).json({ message: "Unauthorized" });

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No User with that ID.");
  }

  const parseResult = updateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", errors: parseResult.error.errors });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { ...parseResult.data },
      { new: true }
    );
    res.status(200).json({
      success: true,
      code: 200,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfileimage = async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}`;
    const _id = req.params.id;
    const image = await User.findByIdAndUpdate(
      _id,
      { profilePhoto: `${url}/public/user/${req.file.filename}` },
      { new: true }
    );
    res.status(201).json({
      profilePhoto: image.profilePhoto,
      code: 201,
      success: true,
      message: "Profile Photo Updated successfully!",
    });
  } catch (error) {
    res.status(400).json({ message: "Something went wrong!" });
  }
};
export const email = async (req, res) => {
  const { userName, from, to, link } = req.body;
  if (!userName || !from || !to || !link) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const htmlContent = `
      <div style="width: 100%; color: #000; background: #fff; padding: 2rem; margin-top: 0; display: flex; justify-content: center; align-items: center">
        <div style="width: 40%; margin-left: 25%; border: 1px solid #c8c9ca; padding: 2rem">
          <div style="text-align: center">
            <h1 style="text-align: center; color: #000; font-weight: 900">CRM</h1>
            <p style="font-size: 18px; padding: 1rem; border-bottom: 1px solid #c8c9ca">
              ${userName} has invited you to join <span style="font-size: 20px; font-weight: 600">CRM</span>
            </p>
            <p style="margin: 1rem auto; font-size: 13px">
              We're thrilled to invite you to join our 
              <span style="color: blue">CRM</span>,
              designed to supercharge our team collaboration and streamline our workflow.
            </p>
            <a href="${link}" style="display: inline-block; color: #fff; background: blue; border-radius: 5px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 1rem auto; padding: 6px 12px">
              View Invitation
            </a>
            <p style="margin: 1rem auto; font-size: 13px; padding-bottom: 2rem; border-bottom: 1px solid #c8c9ca">
              We believe that by embracing our platform, we can take our
              collaboration and efficiency to new heights. This is an exciting step forward for our team, and we're
              eager to have you on board.
            </p>
            <div style="font-size: 12px; text-align: left">
              <strong>Note:</strong>
              <span>This invitation was intended for 
                <span style="color: blue; font-weight: 600">${to}</span>.
                If you were not expecting this invitation, you can ignore this email.
              </span>
            </div>
            <div style="font-size: 12px; text-align: left; margin-top: 1rem">
              <strong style="color: gray">Button not working? :</strong>
              <span style="color: gray">Copy and paste this link to your browser:</span>
              <p><a href="${link}" target="_blank" style="color: blue">${link}</a></p>
            </div>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `${userName} <${from}>`,
      to: to,
      subject: `${userName} sent an invitation to join CRM ✔`,
      text: "You have been invited to join CRM.",
      html: htmlContent,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error occurred. " + err.message });
      } else {
        return res.status(201).json({ message: `Invitation sent to: ${to}` });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
