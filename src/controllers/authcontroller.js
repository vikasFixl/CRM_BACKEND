import User from "../models/userModel.js";
import qrcode from "qrcode";
import { authenticator } from "otplib";
import { OrgMember } from "../models/OrganisationMemberSchema.js";
import bcrypt from "bcrypt";
import { generateOrgToken,generateGlobalToken } from "../utils/generatetoken.js";
import { Session } from "../models/sessionModel.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const frontendUrl = process.env.FRONTEND_URL;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const generate2FAQr = async (req, res) => {
  
  const user=await User.findById(req.user.userId).select("+twoFAEnabled +twoFASecret");
   // Assume user is already authenticated (via session or token)

  if (user.twoFAEnabled) {
    return res.status(400).json({ message: '2FA already enabled.' });
  }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, 'cubicel-crm', secret);
  const qrImageUrl = await qrcode.toDataURL(otpauth);

  user.twoFASecret = secret;
  await user.save();

  res.json({ qrImageUrl });
};

export const verify2FASetup = async (req, res) => {
  const { otp } = req.body;
 
  
   const user=await User.findById(req.user.userId).select("+twoFAEnabled +twoFASecret");

  if (!user.twoFASecret) return res.status(400).json({ message: 'No secret found in session.' });

  const isValid = authenticator.verify({ token: otp, secret: user.twoFASecret });

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid OTP.' });
  }

  // Save 2FA config to user
  user.twoFAEnabled = true;
  user.twoFASecret = secret;
  await user.save();


  res.json({ message: '2FA setup successful.' });
};



export const verify2FALogin = async (req, res) => {
  const { otp, userId } = req.body;
//   const userId = req.session.pending2FAUserId;

  if (!userId) return res.status(400).json({ message: 'No pending 2FA session.' });

  const user = await User.findById(userId).populate("currentOrganization", "_id name contactEmail");

  const isValid = authenticator.verify({ token: otp, secret: user.twoFASecret });
  if (!isValid) return res.status(401).json({ message: 'Invalid OTP.' });

 

  // Check active sessions
  const activeSessions = await Session.find({ user: user._id, isActive: true }).sort({ createdAt: 1 });
  if (activeSessions.length >= 5) {
    return res.status(409).json({ message: "Too many active sessions." });
  }

  const accessToken = generateGlobalToken(user);
  const { exp } = jwt.decode(accessToken);

  await Session.create({ user: user._id, token: accessToken, isActive: true });

  let orgToken = null;
  const member = await OrgMember.findOne({
    userId: user._id,
    organizationId: user.currentOrganization?._id,
    status: "active"
  }).populate("role");

  if (member && member.role) {
    const orgPayload = {
      userId: user._id,
      orgId: member.organizationId,
      employeeId: member.employeeId,
      role: member.role.role,
      permissions: member.role.permissions,
    };
    orgToken = generateOrgToken(orgPayload);
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

  req.session.userId = user._id;

  return res.status(200).json({
    message: `2FA Login successful`,
    success: true,
    code: 200,
    data: responseData,
    orgtoken: orgToken,
    token: accessToken,
    exp: exp * 1000,
  });
};


// pasword less login
export const sendLoginOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = expires;
  await user.save();

  await sendEmail(email, 'Your OTP', `Your login OTP is ${otp}`);

  res.json({ message: 'OTP sent to email successfully.' });
};

// verify the password less login 
export const verifyLoginOTP = async (req, res) => {
  const { otp, email } = req.body;


 
  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if(!user.otp || user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP has expired.' });
  if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
  
user.otp = null;
user.otpExpires = null;
await user.save();

  res.json({ message: 'logged in successfully'})
};

