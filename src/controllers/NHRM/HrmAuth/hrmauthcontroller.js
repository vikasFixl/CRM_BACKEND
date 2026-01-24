import jwt from "jsonwebtoken";
import User from "../../../models/userModel.js"
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import { AppError } from "../../../middleweare/errorhandler.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import logger from "../../../../config/logger.js";
import { generateHrmTokens, setHrmTokenCookies } from "../../../utils/generatetoken.js";
import { Onboarding } from "../../../models/NHRM/employeeManagement/onboarding.js";

export const HrmLogin = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError("Email and password are required", 400);
    }

    // 1. Find centralized user
    const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
        isDeleted: false
    }).select("+password");

    logger.info(user)
    //   if(user.isSuspended){
    //     throw new AppError("account suspended contact support",500)
    //   }
    if (!user) {
        throw new AppError("account not found", 401);
    }

    // 2. Match password ONCE (centralized)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    // 3. Fetch HRM employee profiles
    const profiles = await EmployeeProfile.find({
        email: user.email,
    }).populate("organizationId", "name");



    if (!profiles.length) {
        throw new AppError("No HRM access found for this user", 403);
    }


    // 4. Single-org → direct HRM login
    if (profiles.length === 1) {
        const onboarding = await Onboarding.findOne({
            employeeId: profiles[0]._id,
            organizationId: profiles[0].organizationId
        });
        if (!onboarding) {
            return res.status(200).json({
                loginType: "ONBOARDING_PENDING",
                onboardingStatus: "NotStarted",
                redirectTo: "/hrm/onboarding/start"
            });
        }
        const { accessToken, refreshToken } = generateHrmTokens(user, profiles[0]);

        setHrmTokenCookies(res, accessToken, refreshToken)

        return res.status(200).json({
            loginType: "DIRECT",
            employee: {
                employeeId: profiles[0]._id,
                employeeCode: profiles[0].employeeCode,
                role: profiles[0].role,
                organizationId: profiles[0].organizationId._id,
                organizationName: profiles[0].organizationId.name
            }
        });
    }

    // 5. Multi-org → issue TEMP token for org selection
    const tempToken = jwt.sign(
        {
            userId: user._id,
            purpose: "HRM_ORG_SELECTION"
        },
        process.env.TEMP_JWT_SECRET,
        { expiresIn: "5m" }
    );

    return res.status(200).json({
        loginType: "MULTI_ORG",
        tempToken,
        organizations: profiles.map(p => ({
            employeeId: p._id,
            employeeCode: p.employeeCode,
            role: p.role,
            organizationId: p.organizationId._id,
            organizationName: p.organizationId.name
        }))
    });
});
/**
 * POST /hrm/auth/select-org
 * Headers: Authorization: Bearer TEMP_TOKEN
 * Body: { organizationId }
 */
export const HrmSelectOrg = asyncWrapper(async (req, res) => {
    const { organizationId } = req.body;

    if (!organizationId) {
        throw new AppError("Organization ID is required", 400);
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new AppError("Authorization token missing", 401);
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
        payload = jwt.verify(token, process.env.TEMP_JWT_SECRET);
    } catch (err) {
        throw new AppError("Invalid or expired session", 401);
    }

    if (payload.purpose !== "HRM_ORG_SELECTION") {
        throw new AppError("Invalid token purpose", 403);
    }

    // 1. Verify employee belongs to selected org
    const profile = await EmployeeProfile.findOne({
        userId: payload.userId,
        organizationId,
        isActive: true,
        deletedAt: null
    }).populate("organizationId", "name");

    if (!profile) {
        throw new AppError("Access denied for selected organization", 403);
    }

    // 2. Generate FINAL HRM token
    const hrmToken = generateHrmToken({ _id: payload.userId }, profile);

    return res.status(200).json({
        token: hrmToken,
        employee: {
            employeeId: profile._id,
            employeeCode: profile.employeeCode,
            role: profile.role,
            organizationId: profile.organizationId._id,
            organizationName: profile.organizationId.name
        }
    });
});
