import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateRefreshToken, generateSupportAgentToken, generateSupportOrgToken, setrefreshTokenCookies, setSupportAgentTokenCookie, setSupportOrgTokenCookie } from "../../utils/generatetoken.js";
import Org from "../../models/OrgModel.js";
import { SupportOrgSession } from "../../models/superadmin/supportorgsession.js";
import { set } from "mongoose";

export const supportAgentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the support agent user
        const user = await User.findOne({ email, userType: 'supportAgent' })
        if (!user) return res.status(404).json({ message: 'Support agent not found' });
        logger.info(user)
        // 2. Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // 3. Create JWT for agent
        const refreshToken = generateRefreshToken(user);
        const supporttoken = generateSupportAgentToken(user, req.headers['user-agent'], req.ip);
        setSupportAgentTokenCookie(res, supporttoken);
        setrefreshTokenCookies(res, refreshToken);




        // 5. Response
        return res.status(200).json({
            message: ' logged in successfully',
            user: {
                _id: user._id,
                name: user.firstName + " " + user.lastName,
                email: user.email,
                userType: user.userType,
                phone: user.phone,
                avatar: user.avatar
            }
        });

    } catch (error) {
        logger.error('Error in supportAgentLogin:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
export const supportOrgLogin = async (req, res) => {
    try {
        const agentId = req.support.supportAgentId
        const { email, token } = req.body;
        if (!email || !token) {
            return res.status(400).json({ message: 'Email and token are required' });
        }

        // 1️⃣ Find support agent by email
        const supportAgent = await User.findOne({ _id: agentId, userType: 'supportAgent' });
        if (!supportAgent) {
            return res.status(404).json({ message: 'Support agent not found' });
        }

        // find the organization to 
        const org = await Org.findOne({ contactEmail: email })
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        // 2️⃣ Find active session with this token
        const session = await SupportOrgSession.findOne({
            tokenHash: token,
            revoked: false,
            expiresAt: { $gt: Date.now() } // If using hashing, replace with tokenHash comparison
        })

        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired session token' });
        }

        // 3️⃣ Generate Support Org JWT (short-lived, e.g., 1 hour)
        const supportorgtoken = generateSupportOrgToken(supportAgent._id, org._id, req.headers['user-agent'], req.ip);
        setSupportOrgTokenCookie(res, supportorgtoken);

        // update the support session 
        session.supportorgtoken = supportorgtoken;
        await session.save();


        // 4️⃣ Send token + minimal info back
        return res.status(200).json({
            message: 'Support org login successful',
        });

    } catch (error) {
        logger.error('Error in supportOrgLogin:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

