import crypto from "crypto";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../config/nodemailer.config.js";
import logger from "../../config/logger.js";
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
import twilio from 'twilio';
import { SupportOrgSession } from "../models/superadmin/supportorgsession.js";
import { AppError } from "../middleweare/errorhandler.js";
import { asyncWrapper } from "../middleweare/middleware.js";
// Initialize Twilio client
const accountSid = process.env.TWILLO_ACCOUNTSID;
const authToken = process.env.TWILLO_AUTHTOKEN;
const twilioPhone = process.env.TWILLO_MOBILE_NUMBER;
const client = twilio(accountSid, authToken);

dotenv.config();
// Helper to extract device info and location
function getDeviceAndLocation(req) {
  const userAgent = req.headers['user-agent'];
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.info("ip", ip);
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


const sendSmsOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: phoneNumber
    });
  } catch (err) {
    logger.error('Twilio SMS Error:', err);
    throw new Error('Failed to send SMS');
  }
};
const verifyPhoneExistence = async (phone) => {
  try {
    await client.lookups.v2.phoneNumbers(phone)
      .fetch({ fields: 'line_type_intelligence' });
    return true;
  } catch (err) {
    if (err.status === 404) {
      return false;
    }
    throw err; // Re-throw other errors
  }
};
export const login =asyncWrapper( async (req, res) => {
  const { email, password } = req.body || {};
  const { userAgent, ip, location, deviceId, deviceType } = getDeviceAndLocation(req);
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
      userType: "orgUser"
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
    // if (!user.emailVerified) {
    //     return res.status(400).json({ message: "Email not verified" });
    //   }

    //   if (!user.phoneVerified) {
    //     return res.status(400).json({ message: "Phone not verified" });
    //   }
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

    // Check if there's already a session from the same IP
    const existingSession = await Session.findOne({
      user: user._id,
      ip: ip,
      isActive: true,
    });

    if (existingSession) {
      // Update the existing session
      existingSession.jwtToken = accessToken;
      existingSession.deviceType = deviceType;
      existingSession.location = location;
      existingSession.userAgent = userAgent;
      existingSession.expiresAt = expiresAt;
      existingSession.expiresIn = expiresInDays;
      await existingSession.save();
    } else {
      // Check total active sessions
      const activeSessions = await Session.find({ user: user._id, isActive: true }).sort({ createdAt: 1 });

      if (activeSessions.length >= 500) {
        return res.status(409).json({ message: "Too many active sessions. Please log out from another device." });
      }

      // Create new session
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
    }

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
      orgToken,
      code: 200,
      data: responseData,
      exp: expiresAt.getTime(),
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}
)


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
    const existingUser = await User.findOne({ email: data.email, isDeleted: false, phone: data.phone });
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

      // logger.info(cloudinaryResponse, "cloudinaryResponse");
      user.avatar = {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    await user.save();

    const accessToken = generateRefreshToken(user);


    setTokenCookies(res, null, accessToken);
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
      httpOnly: isProd,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
    });

    res.clearCookie('_fxl_9X8Y7Z', {  // refresh
      httpOnly: isProd,
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
    logger.info("resetUrl", resetUrl);

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
    logger.info(error, "email error");
    return res.status(500).json({ error: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { password, token } = req.body;
  // logger.info(token);
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(422)
        .json({ message: "Password reset link expired.generate new link" });

    // logger.info( "before update", user);
    user.password = password;
    user.loginAttempts = 0;
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    // logger.info( "after update", user);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    logger.info(err);
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
    logger.info(user);

    // Soft delete the user
    user.isDeleted = true;

    user.isActive = false;
    user.deletedAt = new Date(); // Optional audit field

    await user.save();

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    logger.error("Error in soft delete:", error);
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

    logger.info(parseResult);
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
    const _id = req.user.userId;

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
    logger.error(error);
    return res.status(500).json({
      message: "Something went wrong while updating profile photo.",
      error: error.message || JSON.stringify(error),
    });
  }
};

export const enableSupportAccess = async (req, res) => {
  try {
    const id = req.user.userId;
    const orgId = req.orgUser.orgId

    // 1. Find user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Remove any existing session for this supportAgent + org
    await SupportOrgSession.deleteMany({
      userId: id,
      orgId: orgId
    });
    // 2. Generate a JWT token
    const payload = {
      userId: user._id,
      supportAccess: true,
    };
    const options = {
      expiresIn: '30m', // ✅ Now 30 minutes
    };
    const secret = process.env.JWT_SUPPORT_SECRET; // Ensure you have a JWT_SECRET environment variable
    const token = jwt.sign(payload, secret, options);
    const now = Date.now();
    // 4. Save in SupportOrgSession collection
    const newSession = await SupportOrgSession.create({
      tokenHash: token, // Ideally hash before storing
      userId: user._id,

      orgId: orgId,
      createdAt: new Date(),
      expiresAt: new Date(now + 30 * 60 * 1000), // ✅ 30 minutes from now
      revoked: false
    });
    // 5. (Optional) Update user document
    user.supportAccess = true;
    user.supportPasskey = {
      token: token,
      createdAt: new Date(),
      expiresAt: new Date(now + 30 * 60 * 1000) // ✅ same 30 minutes
    };

    await user.save();

    // 6. Send response
    return res.status(200).json({
      message: 'Support access enabled. Share this token with the support agent.',
      passkey: token,
      expiresIn: '30 minutes',
      sessionId: newSession._id
    });
  } catch (error) {
    logger.error('Error enabling support access:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { otp, type } = req.body; // 'email' or 'phone'

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const user = await User.findOne({
      _id: req.user.userId,
      otp: hashedOtp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    if (type === 'email') user.emailVerified = true;
    else if (type === 'phone') user.phoneVerified = true;
    else return res.status(400).json({ message: 'Invalid type' });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully.`,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const sendVerificationOtp = async (req, res) => {
  try {
    const { type } = req.body; // 'email' or 'phone'
    const user = await User.findById(req.user.userId).select("otp otpExpires email phone phoneVerified emailVerified isActive");
    logger.info(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['email', 'phone'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be "email" or "phone".' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Store OTP in DB
    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // expires in 10 mins
    await user.save();

    // Mock sending message
    if (type === 'email') {
      // Uncomment this if real email sending is enabled
      // await sendEmail({ to: user.email, subject: 'Your Verification OTP', text: `Your OTP is ${otp}` });

      return res.status(200).json({
        message: `Email OTP sent successfully.`,
        debugOtp: otp, // Remove in production
      });
    } else {
      // Uncomment this if real SMS sending is enabled
      // await sendSMS(user.contactPhone, `Your OTP is ${otp}.`);
      // Ensure the number is in E.164 format
      const formattedPhone = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
      await sendSmsOTP(formattedPhone, otp);

      return res.status(200).json({
        message: `Phone OTP sent successfully.`,
        debugOtp: otp, // Remove in production
      });
    }
  } catch (err) {
    logger.error('OTP Send Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getSupportsession = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const session = await SupportOrgSession.findOne({ UserId: user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    return res.status(200).json({ message: "no active support session ", session });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
export const revokeaccess = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.supportAccess = false;
    const session = await SupportOrgSession.findOneAndDelete({ userId: user._id });
   
  
    return res.status(200).json({ message: "Access revoked" });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
