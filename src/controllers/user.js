import crypto from "crypto";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../config/nodemailer.config.js";
import {
  generateGlobalToken,
  generateOrgToken,
} from "../utils/generatetoken.js";
import { resetPasswordTemplate } from "../utils/helperfuntions/emailtemplate.js";
import {
  signupSchema,
  updateUserSchema,
} from "../validations/User/UserValidation.js";

import User from "../models/userModel.js";
import Org from "../models/OrgModel.js";
import Employee from "../models/employeeModel.js";

dotenv.config();

// global use variables
const isProd = process.env.NODE_ENV === "production";

const frontendUrl=process.env.FRONTEND_URL

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const login = async (req, res) => {
  const { email, password } = req.body || {};

  // Check if fields are empty
  if (!email.trim() || !password.trim()) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  // Email validation regex

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+isSuspended");
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    if (user.isSuspended == true) {
      return res
        .status(400)
        .json({ message: "this account is suspended contact admin" });
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
    user.lastLogin = new Date();
    user.isDeleted = false;

    user.isActive = true;
    user.deletedAt = null; // Optional audit field

    await user.save();

 

    // ✅ Find the active org entry inside the user's organizations array
    const activeOrgEntry = user.organizations.find(
      (orgEntry) => orgEntry.CurrentActive === true
    );
// console.log("activeOrgEntry", activeOrgEntry);
    let org = null;
    let orgToken = null;
    // ✅ Generate org token using user-org-level fields
    const orgPayload = {
      userId: user._id,
      orgId: activeOrgEntry.org,
      employeeId: activeOrgEntry.employeeId,
      role: activeOrgEntry.role,
      permissions: activeOrgEntry.permissions,
    };
    // console.log("orgPayload", orgPayload);

    if (activeOrgEntry) {
      // Optional: fetch org details if needed
      org = await Org.findById(activeOrgEntry.org)
        .select("name contactEmail _id")
        .lean();

      orgToken = generateOrgToken(orgPayload);

      activeOrgEntry.token = orgToken;
      await user.save();
    }
    
    const accessToken = generateGlobalToken(user);

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

    // const orgtoken=generateOrgToken(userId, orgId, employeeId, role, permissions);

    // res.cookie("token", accessToken, {
    //   httpOnly: isProd, // true in production for security isprod defined at top
    //   secure: isProd, // ensures cookie is only sent over HTTPS
    // sameSite: 'none'

    // ,
    //  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    //     });
    // Decode it to get `exp` (in seconds)
    const { exp } = jwt.decode(accessToken);
    res.status(200).json({
      message: "You have logged in successfully",
      success: true,
      code: 200,
      data: responseData,
      orgtoken: orgToken,
      token: accessToken,
      exp: exp * 1000,
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

    // res.cookie("token", accessToken, {
    //   httpOnly: isProd,
    //   secure: isProd,
    // sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    // Decode it to get `exp` (in seconds)
    const { exp } = jwt.decode(accessToken);
    res.status(201).json({
      message: "You have signed up successfully",
      success: true,
      code: 201,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        token: accessToken,
        exp: exp * 1000,
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
      httpOnly: isProd,
      secure: isProd,
      sameSite: "none",

      maxAge: 0,
    });
    res.cookie("orgtoken", "", {
      httpOnly: isProd,
      secure: isProd,
      sameSite: "none",

      maxAge: 0,
    });

    res.cookie("Token", "", {
      httpOnly: isProd,
      secure: isProd,
      sameSite: "none",

      maxAge: 0,
    });

    // ✅ Clear cookies as well
    res.clearCookie("Token", "", {
      httpOnly: isProd,
      secure: isProd,
      sameSite: "none",

      maxAge: 0,
    });
    res.clearCookie("orgToken", "", {
      httpOnly: isProd,
      secure: isProd,
      sameSite: "none",

      maxAge: 0,
    });
    res.clearCookie("token", "", {
      httpOnly: isProd,
      secure: isProd,
      sameSite: "none",

      maxAge: 0,
    });

    // ⚠️ req.cookies still shows the old token, it won’t change until the next request
    console.log(
      "Token after clearing (still in req.cookies):",
      req.cookies.Token
    );
    console.log(req.cookies.token);

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

    const user = await User.findById(userId).select("-password");

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
      hasReceivedWelcomeEmail: user.hasReceivedWelcomeEmail,
      organizations: user.organizations.map((org) => ({
        org: org.org,
        CurrentActive: org.CurrentActive,
        role: org.role,
        employeeId: org.employeeId,
        // Optional: include limited permissions if needed
        // permissions: org.permissions?.map(p => ({
        //   module: p.module,
        //   actions: p.actions
        // }))
      })),
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


// admin route to view all users

// get all organization users
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

// get users by department
// currently not using in future we can use
// export const getUsersByDept = async (req, res) => {
//   try {
//     const { orgId, department } = req.body;
//     const data = await User.find({ orgId, department })
//       .select("firstName")
//       .sort({ _id: -1 });

//     res.status(200).json({
//       data,
//       success: true,
//       code: 200,
//       message: "Department users fetched",
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
    ).select("-password");
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

// need to implement cloudinary cloud upload
export const updateProfileimage = async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}`;
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No User with that ID.");
    if (!req.file)
      return res.status(400).json({ message: "Please upload a file" });
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

// note email invitation is handlied in org controller

// export const email = async (req, res) => {
//   const { userName, from, to, link } = req.body;
//   if (!userName || !from || !to || !link) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const htmlContent = `
//       <div style="width: 100%; color: #000; background: #fff; padding: 2rem; margin-top: 0; display: flex; justify-content: center; align-items: center">
//         <div style="width: 40%; margin-left: 25%; border: 1px solid #c8c9ca; padding: 2rem">
//           <div style="text-align: center">
//             <h1 style="text-align: center; color: #000; font-weight: 900">CRM</h1>
//             <p style="font-size: 18px; padding: 1rem; border-bottom: 1px solid #c8c9ca">
//               ${userName} has invited you to join <span style="font-size: 20px; font-weight: 600">CRM</span>
//             </p>
//             <p style="margin: 1rem auto; font-size: 13px">
//               We're thrilled to invite you to join our
//               <span style="color: blue">CRM</span>,
//               designed to supercharge our team collaboration and streamline our workflow.
//             </p>
//             <a href="${link}" style="display: inline-block; color: #fff; background: blue; border-radius: 5px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 1rem auto; padding: 6px 12px">
//               View Invitation
//             </a>
//             <p style="margin: 1rem auto; font-size: 13px; padding-bottom: 2rem; border-bottom: 1px solid #c8c9ca">
//               We believe that by embracing our platform, we can take our
//               collaboration and efficiency to new heights. This is an exciting step forward for our team, and we're
//               eager to have you on board.
//             </p>
//             <div style="font-size: 12px; text-align: left">
//               <strong>Note:</strong>
//               <span>This invitation was intended for
//                 <span style="color: blue; font-weight: 600">${to}</span>.
//                 If you were not expecting this invitation, you can ignore this email.
//               </span>
//             </div>
//             <div style="font-size: 12px; text-align: left; margin-top: 1rem">
//               <strong style="color: gray">Button not working? :</strong>
//               <span style="color: gray">Copy and paste this link to your browser:</span>
//               <p><a href="${link}" target="_blank" style="color: blue">${link}</a></p>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;

//     const mailOptions = {
//       from: `${userName} <${from}>`,
//       to: to,
//       subject: `${userName} sent an invitation to join CRM ✔`,
//       text: "You have been invited to join CRM.",
//       html: htmlContent,
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Error occurred. " + err.message });
//       } else {
//         return res.status(201).json({ message: `Invitation sent to: ${to}` });
//       }
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

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
