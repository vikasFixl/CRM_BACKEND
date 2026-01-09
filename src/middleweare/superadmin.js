import { SupportOrgSession } from "../models/superadmin/supportorgsession.js";
import { verifySupportAgentToken, verifySupportOrgToken } from "../utils/generatetoken.js";

export const verifySupportoken = async (req, res, next) => {
    try {
        const token = req.cookies?.support_token;
        if (!token) {
            return res.status(401).json({ message: 'No support token found' });
        }


        const decoded = verifySupportAgentToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid support org token' });
        }


        req.support = {


            // Token is valid — store details for later use
            supportAgentId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        }


        next();

    } catch (error) {
        logger.error('Error verifying support org token:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
export const verifySupporOrgtoken = async (req, res, next) => {
    try {
        const token = req.cookies?.support_org_token;
        if (!token) {
            return res.status(401).json({ message: 'No support org token found' });
        }


        const decoded = verifySupportOrgToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid support org token' });
        }

        const session = await SupportOrgSession.findOne({
            supportorgtoken: token,
            revoked: false,
            expiresAt: { $gt: Date.now() } // If using hashing, replace with tokenHash comparison
        })
        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired session token' });
        }
        req.supportorg = {
            // Token is valid — store details for later use
            orgId: decoded.orgId,
            impersonatedBy: decoded.impersonatedBy,

        }


        next();

    } catch (error) {
        logger.error('Error verifying support org token:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};