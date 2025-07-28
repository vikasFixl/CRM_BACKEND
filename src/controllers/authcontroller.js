import User from "../models/userModel.js";
import qrcode from "qrcode";
import { authenticator } from "otplib";
import { OrgMember } from "../models/OrganisationMemberSchema.js";
import { generateOrgAccessToken, generateRefreshToken, setTokenCookies, verifyRefreshToken } from "../utils/generatetoken.js";
import { Session } from "../models/sessionModel.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import jwt from "jsonwebtoken";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
function getDeviceAndLocation(req) {
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);

    return {
        userAgent,
        ip,
        location: geo
            ? `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}`
            : 'Unknown Location',
        deviceId: uuidv4(), // should come from frontend as UUID
        deviceType: `${result.browser.name} on ${result.os.name}`,
    };
}



const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const generate2FAQr = async (req, res) => {

    const user = await User.findById(req.user.userId).select("+twoFAEnabled +twoFASecret");
    // Assume user is already authenticated (via session or token)

    if (user.twoFAEnabled) {
        return res.status(400).json({ message: '2FA already enabled.' });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'cubicel-crm', secret);
    const qrImageUrl = await qrcode.toDataURL(otpauth);

    // Generate and display QR code in the terminal
    qrcode.toString(otpauth, { type: 'terminal', small: true }, (err, url) => {
        if (err) {
            console.error('Error generating QR code:', err);
            return;
        }

        console.log('Scan the following QR code with your authenticator app:');
        console.log(url);
    });


    user.twoFASecret = secret;
    await user.save();

    res.json({ qrImageUrl });
};

export const verify2FASetup = async (req, res) => {
    const { otp } = req.body;


    const user = await User.findById(req.user.userId).select("+twoFAEnabled +twoFASecret");

    if (!user.twoFASecret) return res.status(400).json({ message: 'No secret found in session.' });
    console.log(user.twoFASecret);
    const secret = user.twoFASecret
    console.log(otp)
    const isValid = authenticator.verify({ token: otp, secret });


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
    const { otp, uid } = req.body;

    const { userAgent, ip, location, deviceId, deviceType } = getDeviceAndLocation(req);

    if (!uid) return res.status(400).json({ message: 'User id is required.' });

    const user = await User.findById(uid).populate("currentOrganization", "_id name contactEmail").select("+twoFAEnabled +twoFASecret");

    if (!user.twoFASecret) return res.status(400).json({ message: 'cannot use this method try paswordless  login' });

    const secret = user.twoFASecret
    const isValid = authenticator.verify({ token: otp, secret });
    if (!isValid) return res.status(401).json({ message: 'Invalid OTP.' });



    // Check active sessions
    const activeSessions = await Session.find({ user: user._id, isActive: true }).sort({ createdAt: 1 });
    if (activeSessions.length >= 5) {
        return res.status(409).json({ message: "Too many active sessions." });
    }

    const accessToken = generateRefreshToken(user);

    const decoded = jwt.decode(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresInDays = (decoded.exp - nowInSeconds) / (60 * 60 * 24); // seconds → days
    await Session.create({
        user: user._id,
        jwtToken: accessToken,
        deviceId,
        deviceType,
        ip,
        location,
        userAgent,
        expiresAt,
        expiresIn: expiresInDays
    });


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
        orgToken = generateOrgAccessToken(orgPayload, userAgent, ip);
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

    setTokenCookies(res, orgToken, accessToken); // org token is named as access token

    return res.status(200).json({
        message: `2FA Login successful`,
        success: true,
        code: 200,
        data: responseData,

    });
};


// pasword less login
export const sendLoginOTP = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // in milliseconds


    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    // await sendEmail(email, 'Your OTP', `Your login OTP is ${otp}`);

    res.json({ message: 'OTP sent to email successfully.', otp });
};

// verify the password less login 
export const verifyLoginOTP = async (req, res) => {
    const { otp, email } = req.body;
    const { userAgent, ip, location, deviceId, deviceType } = getDeviceAndLocation(req);


    const user = await User.findOne({ email }).select('+otp +otpExpires +isSuspended');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.isSuspended) {
        return res.status(400).json({ message: "This account is suspended. Contact admin." });
    }

    if (user.loginAttempts >= 5) {
        return res.status(400).json({
            message: "Too many login attempts. Please reset your password.",
        });
    }

    if (!user.otp || user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP has expired.' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });

    user.otp = null;
    user.otpExpires = null;
    await user.save();
    // Check active sessions
    const activeSessions = await Session.find({ user: user._id, isActive: true }).sort({ createdAt: 1 });
    if (activeSessions.length >= 5) {
        return res.status(409).json({ message: "Too many active sessions." });
    }

    const accessToken = generateRefreshToken(user);

    const decoded = jwt.decode(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresInDays = (decoded.exp - nowInSeconds) / (60 * 60 * 24); // seconds → days
    await Session.create({
        user: user._id,
        jwtToken: accessToken,
        deviceId,
        deviceType,
        ip,
        location,
        userAgent,
        expiresAt,
        expiresIn: expiresInDays
    });


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
        orgToken = generateOrgAccessToken(orgPayload, userAgent, ip);
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
    return res.status(200).json({
        message: `otp Login successful`,
        success: true,
        code: 200,
        data: responseData,

    });
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies._fxl_9X8Y7Z;
        if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) return res.status(401).json({ message: 'Invalid refresh token' });

        // 2️⃣ Ensure user still valid
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid refresh token' });

        // 3️⃣ Re-issue pair
        const ua = req.headers['user-agent'] || '';
        const ip = req.ip || req.connection?.remoteAddress || '';
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
                orgToken = generateOrgAccessToken(orgPayload, ua, ip);
            }
        }

        const newRefresh = generateRefreshToken(user);

        setTokenCookies(res, orgToken, newRefresh);
        res.status(200).json({ message: 'Tokens refreshed' });
    } catch (err) {
        // clear cookies on any failure
        res.clearCookie('_fxl_1A2B3C');
        res.clearCookie('_fxl_9X8Y7Z');
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
}
