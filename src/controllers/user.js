import crypto from "crypto";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../config/nodemailer.config.js";
import {

  generateOrgAccessToken,

  generateRefreshToken,
  setTokenCookies,
} from "../utils/generatetoken.js";
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import { resetPasswordTemplate } from "../utils/helperfuntions/emailtemplate.js";
import {
  signupSchema,
  updateUserSchema,
} from "../validations/User/UserValidation.js";

import User from "../models/userModel.js";

import { OrgMember } from "../models/OrganisationMemberSchema.js";
import { uploadImageToCloudinary } from "../utils/helperfuntions/uploadimage.js";
import { Session } from "../models/sessionModel.js";

dotenv.config();
// Helper to extract device info and location
function getDeviceAndLocation(req) {
  const userAgent = req.headers['user-agent'];
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("ip", ip);
  const geo = geoip.lookup(ip);

  return {
    userAgent,
    ip,
    location: geo
      ? `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}`
      : 'Unknown Location',
    deviceId: uuidv4(),
    deviceType: `${result.browser.name} on ${result.os.name}`,
  };
}



const frontendUrl = process.env.FRONTEND_URL;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isProd = process.env.NODE_ENV === 'production';
console.log(process.env.NODE_ENV);
console.log(isProd)
export const login = async (req, res) => {
  const { email, password } = req.body || {};
  const { userAgent, ip, location, deviceId, deviceType } = getDeviceAndLocation(req);
  console.log("userAgent", userAgent, "ip", ip, "location", location, "deviceId", deviceId, "deviceType", deviceType);


  // Validate input
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    })
      .select("+isSuspended")
      .populate("currentOrganization", "_id name contactEmail");

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    if (user.isSuspended) {
      return res.status(400).json({ message: "This account is suspended. Contact admin." });
    }

    if (user.loginAttempts >= 5) {
      return res.status(400).json({
        message: "Too many login attempts. Please reset your password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      user.loginAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Successful login
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    user.isDeleted = false;
    user.isActive = true;
    user.deletedAt = null;
    await user.save();
    if (user.twoFAEnabled) {
      return res.status(200).json({ message: "2FA enabled", uid: user._id });
    }

    let orgToken = null;
    if (user.currentOrganization) {
      const member = await OrgMember.findOne({
        userId: user._id,
        organizationId: user.currentOrganization._id,
        status: "active",
      }).populate("role");

      if (member && member.role) {
        const orgPayload = {
          userId: user._id,
          orgId: member.organizationId,
          employeeId: member.employeeId,
          role: member.role.role,
          permissions: member.role.permissions,
        };
        orgToken = generateOrgAccessToken(orgPayload, userAgent, ip);
      }
    }
   
    const accessToken = generateRefreshToken(user);
    const decoded = jwt.decode(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresInDays = (decoded.exp - nowInSeconds) / (60 * 60 * 24); // seconds → days

    // Step 1: Get the user's IP address

    // Step 2: Check if there's already a session from the same IP
    const existingSession = await Session.findOne({
      user: user._id,
      ip: ip,
      isActive: true,
    });

    if (existingSession) {
      // ✅ Update the existing session
      existingSession.jwtToken = accessToken;
      existingSession.deviceType = deviceType;
      existingSession.location = location;
      existingSession.userAgent = userAgent;
      existingSession.expiresAt = expiresAt;
      existingSession.expiresIn = expiresInDays;
      await existingSession.save();
    }
    // Step 3: Check total active sessions
    const activeSessions = await Session.find({ user: user._id, isActive: true }).sort({ createdAt: 1 });

    if (activeSessions.length >= 500) {
      return res.status(409).json({ message: "Too many active sessions. Please log out from another device." });
    }

    // Step 4: Create new session if no existing session from same IP
    await Session.create({
      user: user._id,
      jwtToken: accessToken,
      ip,
      deviceId,
      deviceType,
      location,
      userAgent,
      expiresAt,
      expiresIn: expiresInDays,
    });
    const responseData = {
      id: user._id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      Globalrole: user.Globalrole,
      avatar: user.avatar.url,
      phone: user.phone,
      currentOrganization: user.currentOrganization?._id || null,
      orgName: user.currentOrganization?.name || null,
      orgEmail: user.currentOrganization?.contactEmail || null,
      orgId: user.currentOrganization?._id || null,
      currentWorkspace: user?.currentWorkspace || null,
    };

    setTokenCookies(res, orgToken, accessToken);
    res.status(200).json({
      message: `Welcome back ${user.firstName}`,
      success: true,
      code: 200,
      data: responseData,
      exp: expiresAt.getTime(),
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
      return res
        .status(400)
        .json({ errors: result.error.errors.map((err) => err.message) });
    }

    const data = result.data;

    // Check for existing user
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res
        .status(403)
        .json({ message: "User already exists", success: false });
    }

    const user = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      uuid: uuidv4(),
    });

    // Only handle image upload if file exists
    if (req.files && req.files.image) {
      const { image } = req.files;

      const cloudinaryResponse = await uploadImageToCloudinary({
        file: image,
        folder: "user", // or any dynamic folder
        // only if replacing
      });

      // console.log(cloudinaryResponse, "cloudinaryResponse");
      user.avatar = {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    await user.save();

    const accessToken = generateGlobalToken(user);
    const { exp } = jwt.decode(accessToken);

    res.cookie("sid", accessToken, {
      httpOnly: isProd,        // Prevents JS access — secure against XSS
      secure: isProd,          // Only send over HTTPS
      sameSite: "lax",    // Prevents CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(201).json({
      message: "You have signed up successfully",
      success: true,
      code: 201,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        Globalrole: user.Globalrole,
        phone: user.phone,
        avatar: user.avatar?.url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error?.message || JSON.stringify(error),
    });
  }
};

export const logout = async (req, res) => {
  try {
    // 🧹 Clear the new-named cookies
    res.clearCookie('_fxl_1A2B3C', {  // access
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
    });

    res.clearCookie('_fxl_9X8Y7Z', {  // refresh
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
    });

    // Legacy cookies (sid / oid) – optional cleanup
    ['sid', 'oid'].forEach(name =>
      res.clearCookie(name, { httpOnly: true, secure: isProd, sameSite: 'Lax', path: '/' })
    );

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(422).json({ error: "Email is required" });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
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

    const resetUrl = `${frontendUrl}/reset-password/${token}`;
    console.log("resetUrl", resetUrl);

    const html = await resetPasswordTemplate(user.firstName, resetUrl);

    // Send reset email (mocked)
    try {
      await sendEmail(email, "Password Reset Request", html);
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ error: "Failed to send reset email" });
    }
  } catch (error) {
    console.log(error, "email error");
    return res.status(500).json({ error: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { password, token } = req.body;
  // console.log(token);
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(422)
        .json({ message: "Password reset link expired.generate new link" });

    // console.log( "before update", user);
    user.password = password;
    user.loginAttempts = 0;
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    // console.log( "after update", user);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", details: err.message });
  }
};

// GET  user profile
export const getUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password").select("+twoFAEnabled")

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "User not found",
      });
    }

    // Pick safe fields to send to frontend
    const sanitizedUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar.url,
      twoFAEnabled: user.twoFAEnabled,
      currentworkspace: user.currentWorkspace || null,
      currentOrganization: user.currentOrganization || null,
      hasReceivedWelcomeEmail: user.hasReceivedWelcomeEmail,
    };
    res.status(200).json({
      user: sanitizedUser,
      success: true,
      code: 200,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

// get all organization users
// export const getAllusers = async (req, res) => {
//   try {
//     const { orgId } = req.params;
//     const { email } = req.body;

//     const org = await Org.findById(orgId);
//     if (!org)
//       return res
//         .status(404)
//         .json({ message: "Organization not found", data: [] });

//     if (org.orgEmail !== email) {
//       return res.status(403).json({ message: "Unauthorized", data: [] });
//     }

//     const data = await User.find({ orgId })
//       .select("-password")
//       .sort({ _id: -1 });

//     res.status(200).json({
//       data,
//       success: true,
//       code: 200,
//       message: "All users fetched successfully",
//     });
//   } catch (error) {
//     res.status(409).json({ message: error.message });
//   }
// };

export const deleteUser = async (req, res) => {
  const _id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No user with that ID.");
  }

  try {
    const user = await User.findById(_id).select("+deletedAt");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log(user);

    // Soft delete the user
    user.isDeleted = true;

    user.isActive = false;
    user.deletedAt = new Date(); // Optional audit field

    await user.save();

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error in soft delete:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id: _id } = req.params;

  if (req.user.userId !== _id) {
    return res.status(401).json({
      message: "This profile doesn't belong to you",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "Invalid User ID." });
  }
  const parseResult = updateUserSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parseResult.error.errors.map((err) => err.message),
    });
  }

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log(parseResult);
    const updateData = { ...parseResult.data };

    // Handle image upload if present
    if (req.files && req.files.image) {
      const { image } = req.files;

      const cloudinaryResponse = await uploadImageToCloudinary({
        file: image,
        folder: "user", // or any dynamic folder
        oldPublicId: user?.avatar?.public_id, // only if replacing
      });

      updateData.avatar = {
        url: cloudinaryResponse.secure_url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      code: 200,
      message: "User why updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error?.message || JSON.stringify(error),
    });
  }
};
// need to implement cloudinary cloud upload
export const updateProfileImage = async (req, res) => {
  try {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ message: "Invalid User ID." });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!req.files || !req.files.image) {
      return res
        .status(400)
        .json({ message: "Please upload a profile image." });
    }

    const imageData = await uploadImageToCloudinary({
      file: req.files.image,
      folder: "user/profile", // Use a subfolder if needed
      oldPublicId: user.avatar?.public_id,
    });

    user.avatar = {
      url: imageData.url,
      public_id: imageData.public_id,
    };
    await user.save();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Profile photo updated successfully",
      profilePhoto: user.avatar.url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong while updating profile photo.",
      error: error.message || JSON.stringify(error),
    });
  }
};

// export const getUserList = async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.status(200).json({
//       data: users.map(
//         ({
//           firstName,
//           lastName,
//           email,
//           role,
//           department,
//           phone,
//           permissions,
//           avatar,
//           _id,
//         }) => ({
//           firstName,
//           lastName,
//           email,
//           role,
//           department,
//           phone,
//           permissions,
//           avatar,
//           _id,
//         })
//       ),
//       success: true,
//       code: 200,
//       message: "All users fetched!",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, code: 500, message: error.message });
//   }
// };
