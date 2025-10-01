import Org from "../models/OrgModel.js";
import User from "../models/userModel.js";
import { BillingPlan } from "../models/BillingPlanModel.js";
import crypto from "crypto";
import mongoose, { mongo } from "mongoose";
import { OrganizationBilling } from "../models/OranizationBillingPlanModel.js";
import { RolePermission } from "../models/RolePermission.js";
import { v4 as uuidv4 } from "uuid";
import { generateOrgAccessToken, setAccessCookieOnly } from "../utils/generatetoken.js";
import { OrganizationInvite } from "../models/OrganisationInviteModel.js";
import { sendEmail } from "../../config/nodemailer.config.js";
import { InviteEmailTemplate } from "../utils/helperfuntions/emailtemplate.js";
import jwt from "jsonwebtoken";
import { OrgMember } from "../models/OrganisationMemberSchema.js";
import { ROLES } from "../enums/role.enums.js";
import { uploadImageToCloudinary } from "../utils/helperfuntions/uploadimage.js";
import { paginateQuery } from "../utils/pagination.js";
import { BillingHistory } from "../models/BillingHistory.js";


// import Employee from "../models/employeeModel.js";

const generateEmployeeId = () => {
  const short = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char hex
  return `EMP_${short}`; // like EMP_1F2A9C
};
const isProd = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

export const createOrganization = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      contactEmail,
      contactPhone,
      contactName,
      address,
      orgCity,
      orgState,
      orgCountry,
    } = req.body;

    // ✅ Basic field validation
    const requiredFields = {
      name,
      contactEmail,
      contactPhone,
      contactName,
      address,
      orgCountry,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === "") {
        return res.status(400).json({ message: `${key} is required` });
      }
    }

    // check if name has number 
    if (name.match(/\d/)) {
      return res.status(400).json({ message: "Organization name cannot contain numbers" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const normalizedName = name.trim().toLowerCase();
    const existingOrg = await Org.findOne({ name: normalizedName });
    if (existingOrg) {
      return res
        .status(409)
        .json({ message: "Organization name already taken" });
    }

    // ✅ Fetch FREE plan
    const freePlan = await BillingPlan.findOne({ code: "FREE" });
    if (!freePlan) return res.status(404).json({ message: "FREE billing plan not found" });

    const org = new Org({
      name: name.trim().toLowerCase(),
      contactEmail,
      contactPhone,
      contactName,
      address,
      orgCity,
      orgState,
      orgCountry,
      billingPlan: freePlan._id,
      modules: freePlan.modules,
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
    });

    // ✅ Upload logo if image exists
    if (req.files?.image) {
      const cloudinaryResponse = await uploadImageToCloudinary({
        file: req.files.image,
        folder: "organization/avatar",
      });

      newOrg.OrgLogo = {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    const savedOrg = await org.save();
    // After creating the organization and fetching the FREE plan
    const newOrgBilling = new OrganizationBilling({
      organizationId: savedOrg._id,
      billingPlanId: freePlan._id,

      planSnapshot: {
        name: freePlan.name,
        code: freePlan.code,
        planType: freePlan.planType,
        price: 0, // Free plan price
        billingCycle: freePlan.pricing[0]?.billingCycle || "monthly",
        currency: freePlan.pricing[0]?.currency || "USD",
        features: freePlan.features.map(f => f.title),
        limits: freePlan.limits,
      },
      subscriptionStartDate: new Date(),
      trialEndDate: freePlan.trialDays
        ? new Date(Date.now() + freePlan.trialDays * 24 * 60 * 60 * 1000)
        : null,
  
      autoRenew: true,
      paymentMethods: [
        {
          type: "other",
          isDefault: true,
        },
      ],
      createdBy: savedOrg._id,
      updatedBy: savedOrg._id,
    });

    const savedOrgBilling = await newOrgBilling.save();


    // ✅ Link currentBilling to org
    savedOrg.currentBilling = savedOrgBilling._id;
    await savedOrg.save();



    // ✅ Assign OrgAdmin Role
    const orgAdminRole = await RolePermission.findOne({ role: "OrgAdmin" });
    if (!orgAdminRole) {
      return res.status(500).json({ message: "OrgAdmin role not found" });
    }

    const employeeId = generateEmployeeId(savedOrg._id);

    const orgMember = new OrgMember({
      userId,
      employeeId,
      organizationId: savedOrg._id,
      role: orgAdminRole._id,
    });

    await orgMember.save();

    let payload = {
      userId,
      orgId: savedOrg._id,
      employeeId,
      role: orgAdminRole.role,
      permissions: orgAdminRole.permissions,
    }
    let orgtoken = generateOrgAccessToken(payload, req.headers["user-agent"], req.ip);

    setAccessCookieOnly(res, orgtoken);

    user.currentOrganization = savedOrg._id;
    await user.save();



    return res.status(201).json({
      message: "Organization created with FREE plan successfully",
      orgId: savedOrg._id,
      employeeId,
      orgtoken,
    });
  } catch (error) {
    console.error("Organization creation failed:", error);
    return res.status(500).json({
      message: "Error creating organization and billing",
      error: error.message,
    });
  }
};

// switchOrgController.js
export const switchOrg = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = req.body.orgId;
    // const employeeId = req.orgUser.employeeId;

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ message: "No orgId provided" });
    }
    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a member of this organization
    const member = await OrgMember.findOne({
      userId: userId,
      organizationId: orgId,
      status: "active",
    })
      .populate("role") // populate role name + permissions
      .lean();

    console.log("member", member);
    if (!member) {
      return res
        .status(403)
        .json({ message: "User not part of this organization" });
    }
    let payload = {
      userId,
      orgId,
      employeeId: member.employeeId,
      role: member.role?.role,
      permissions:
        member.permissionsOverride?.length > 0
          ? member.permissionsOverride
          : member.role?.permissions || [],
    }
    // Optionally: Update user's current active org info in DB if needed
    let orgtoken = generateOrgAccessToken(payload, req.headers["user-agent"], req.ip);

    setAccessCookieOnly(res, orgtoken);
    // 🧹 Clear the new-named cookies
    res.clearCookie('_fxl_WSP', {  // clear workspace otken
      httpOnly: isProd,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
    });
    res.clearCookie('_fxl_PRJ', {  // clear proeject token 
      httpOnly: isProd,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
    });
    res.clearCookie('_fxl_TEA', {  // clear team token 
      httpOnly: isProd,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
    });

    user.currentOrganization = orgId;
    await user.save();


    return res.status(200).json({
      message: "Organization switched successfully",
      token: orgtoken

    })
  } catch (err) {
    console.error("Switch Org Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const filter = {
      userId,
      status: "active",
    };

    // Use your custom pagination utility
    const result = await paginateQuery(OrgMember, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: "organizationId",
        select:
          "name OrgLogo.url isActive contactEmail contactName contactPhone",
      },
      lean: true,
    });

    const data = result.data.map((member) => ({
      memberId: member._id, // For identification in frontend updates
      orgId: member.organizationId?._id,
      orgName: member.organizationId?.name,
      logo: member.organizationId?.OrgLogo?.url || null,
      orgActive: member.organizationId?.isActive,
      orgEmail: member.organizationId?.contactEmail,
      orgContact: member.organizationId?.contactName,
      orgPhone: member.organizationId?.contactPhone,
      joinedAt: member.createdAt,
      employeeId: member.employeeId,
    }));

    return res.status(200).json({
      message: "Organizations fetched successfully",
      data,
      success: true,
      code: 200,
      pageinfo: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
      }

    });
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return res.status(500).json({
      message: "Failed to fetch organizations",
      success: false,
      code: 500,
      error: error.message,
    });
  }
};

export const getAllUserInOrg = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;

    const {
      page = 1,
      limit = 10,
      role, // Optional filter
      status, // Optional filter: active/inactive
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const query = {
      organizationId: orgId,
    };

    // Optional filters
    if (role) query["role.role"] = role;
    if (status) query.status = status;
    else query.status = "active"; // Default

    // Step 1: Fetch filtered members
    const members = await OrgMember.find(query)
      .populate("userId", "firstName lastName email phone")
      .populate("role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Step 2: Exclude OrgAdmin
    const filteredMembers = members.filter(
      (member) => member.role?.role !== "OrgAdmin"
    );

    const users = filteredMembers.map((member) => {
      const useCustom =
        member.hasCustomPermission ||
        (member.permissionsOverride && member.permissionsOverride.length > 0);

      return {
        memberId: member._id,
        orgId: member.organizationId,
        orgName: member.organizationId?.name,
        Logo: member.organizationId?.OrgLogo?.url,
        orgActive: member.organizationId?.isActive,
        orgEmail: member.organizationId?.contactEmail,
        orgContact: member.organizationId?.contactName,
        orgPhone: member.organizationId?.contactPhone,
        joinedAt: member.createdAt,
        employeeId: member.employeeId,
        email: member.userId?.email,
        phone: member.userId?.phone,
        name: member.userId?.firstName + " " + member.userId?.lastName,

        role: member.role?.role,

        permissions: useCustom
          ? member.permissionsOverride
          : member.role?.permissions || [],
      };
    });

    // Step 3: Count total documents (excluding OrgAdmin)
    const allMatchingMembers = await OrgMember.find(query)
      .populate("role")
      .lean();
    const total = allMatchingMembers.filter(
      (m) => m.role?.role !== "OrgAdmin"
    ).length;

    return res.status(200).json({
      message: "Organization users fetched successfully",
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllUserInOrg:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrganizationBYId = async (req, res) => {
  try {
    const organizationId = req.params.id;
    const currentLoggedUserId = req.user.userId;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // 1. Fetch the organization
    const organization = await Org.findById(organizationId).lean();

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // 2. Fetch all members for the org and populate user + role
    const members = await OrgMember.find({ organizationId })
      .populate({
        path: "userId",
        select: "firstName lastName email phone  OrgLogo",
      })
      .populate({
        path: "role",
        select: "role", // adjust as needed
      })
      .lean();

    // 3. Check if current user is the creator
    const isOwner = organization.createdBy.toString() === currentLoggedUserId;

    // 4. Build sanitized org response
    const customOrg = {
      id: organization._id,
      OrgLogo: organization.OrgLogo,
      name: organization.name,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      contactName: organization.contactName,
      address: organization.address,
      orgCity: organization.orgCity,
      orgState: organization.orgState,
      orgCountry: organization.orgCountry,
      timezone: organization.timezone,
      modules: organization.modules,
      users: members.map((m) => ({
        id: m.userId._id,
        firstName: m.userId.firstName,
        lastName: m.userId.lastName,
        email: m.userId.email,
        phone: m.userId.phone,

        OrgLogo: m.userId.OrgLogo,
        employeeId: m.employeeId,
        role: m.role?.role || "N/A",
        joinedAt: m.joinedAt,
      })),
    };

    // 5. If owner, include billing plan
    if (isOwner) {
      const billingPlan = await BillingPlan.findById(
        organization.billingPlan
      ).lean();
      customOrg.billingPlan = billingPlan
        ? {
          id: billingPlan._id,
          name: billingPlan.name,
          price: billingPlan.price,
          features: billingPlan.features,
          maxUsers: billingPlan.maxUsers,
          billingCycle: billingPlan.billingCycle,
          maxStorageGB: billingPlan.maxStorageGB,
          trialDays: billingPlan.trialDays,
          permissions: billingPlan.permissions,
        }
        : null;
    }

    return res.status(200).json({
      message: "Organization fetched successfully",
      organization: customOrg,
      isOwner,
    });
  } catch (error) {
    console.error("Error in getOrganizationBYId:", error);
    return res.status(500).json({ error: "Failed to get organization" });
  }
};

export const UpdateOrganizationUser = async (req, res) => {
  try {
    const { memberId } = req.params;
    const orgId = req.orgUser.orgId; // extracted from auth middleware
    const { Role, overridePermissions, custom } = req.body;

    // first fidn org member
    const member = await OrgMember.findOne({
      _id: memberId,
      organizationId: orgId,
    }).populate("role", "role permissions");
    if (!member) {
      return res.status(404).json({ message: "User is not part of org " });
    }
    // console.log("memberexist", member);
    // ✅ 1. Prevent Org Creator from changing their own role
    const organization = await Org.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (
      organization.createdBy.toString() === member?.userId.toString() &&
      member.role?.role === "OrgAdmin"
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Org Admin cannot change their own role" });
    }

    const currentRole = member.role?.role;
    const isRoleChanged = currentRole !== Role;
    console.log("isRoleChanged", isRoleChanged);
    let updates = {};

    // ✅ 3. Handle role change
    if (isRoleChanged) {
      const newRole = await RolePermission.findOne({
        role: Role,
        isCustom: custom,
      });

      if (!newRole) {
        return res.status(404).json({ message: "Target role not found" });
      }

      if (newRole.role === "SuperAdmin" || newRole.role === "OrgAdmin") {
        return res
          .status(403)
          .json({ message: "Forbidden: Cannot assign this role" });
      }

      updates.role = newRole._id;
      updates.permissionsOverride = []; // Reset custom perms
      updates.hasCustomPermission = false;
    }

    // ✅ 4. Handle custom permission override (only if role not changed)
    if (
      !isRoleChanged &&
      Array.isArray(overridePermissions) &&
      overridePermissions.length > 0
    ) {
      updates.permissionsOverride = overridePermissions;

      updates.hasCustomPermission = true;
    }

    // ✅ 5. Apply updates and save
    Object.assign(member, updates);
    await member.save();
    const permission = member.hasCustomPermission ? member.permissionsOverride : member.permissions
    console.log(member)
    const formateddata = {
      memberId: member._id,
      role: member.role?.role,

      permissions: permission,
      hasCustomPermission: member.hasCustomPermission
    }

    return res.status(200).json({
      message: `Member role ${isRoleChanged ? "updated" : "retained"
        } as '${Role}' ${!isRoleChanged ? "with custom permissions" : ""}`,
      formateddata,
    });
  } catch (error) {
    console.error("UpdateOrganizationUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a user from an organization

export const DeleteOrganizationUser = async (req, res) => {
  try {
    const { memberId } = req.params; // User ID to be removed
    const orgId = req.orgUser.orgId; // From authenticated org user

    if (!memberId) {
      return res.status(400).json({ message: " ID is required" });
    }

    // Find membership document for user and org
    const membership = await OrgMember.findOne({
      _id: memberId,
      organizationId: orgId,
    });
    if (!membership) {
      return res.status(403).json({
        message: "User does not belong to this organization",
      });
    }

    // Delete membership
    await OrgMember.deleteOne({ _id: membership._id });

    return res.status(200).json({
      message: "User removed from organization successfully",
    });
  } catch (error) {
    console.error("Error removing user from organization:", error);
    return res.status(500).json({
      message: "Internal server error while removing user from organization",
    });
  }
};

// export const getAllOrganizations = async (req, res) => {export const CreateInvite = async (req, res) => {
export const CreateInvite = async (req, res) => {
  try {
    const { email, role } = req.body || {};
    const orgId = req.orgUser.orgId;
    const { userId } = req.user;

    if (!email || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent assigning SuperAdmin via invite
    if (role === ROLES.SUPER_ADMIN) {
      return res
        .status(403)
        .json({ message: "You are not allowed to assign SuperAdmin role." });
    }

    const useronplatform = await User.findOne({ email });
    if (!useronplatform) {
      return res
        .status(400)
        .json({ message: "User does not exist on the platform" });
    }

    const organization = await Org.findById(orgId);
    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization not found || you are not the creator" });
    }

    const roleExists = await RolePermission.findOne({ role });
    if (!roleExists) {
      return res.status(400).json({ message: "Invalid role." });
    }
    //check if user already exits
    // Check if user is already in the org (via Member collection)
    const existingMember = await OrgMember.findOne({
      userId: useronplatform._id,
      organizationId: orgId,
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already in this organization." });
    }

    const token = crypto.randomBytes(64).toString("hex");

    const invite = await OrganizationInvite.create({
      email,
      role,
      orgId: organization._id,
      token,
      invitedBy: userId,
      status: "pending",
    });

    await invite.save();

    // Construct join link
    const INVITE_LINK = `${frontendUrl}/accept-invite?token=${token}`;
    console.log("INVITE_LINK", INVITE_LINK);
    const html = await InviteEmailTemplate(
      organization.name,
      role,
      email,
      INVITE_LINK
    );

    // Send reset email (mocked)
    console.log("Invite link:", INVITE_LINK); // for testing/dev
    try {
      await sendEmail(email, "Organization Invite", html);
      return res.status(200).json({
        success: true,
        message: "Invite sent successfully.",
      });
    } catch (error) {
      await OrganizationInvite.findByIdAndDelete(invite._id);
      return res.status(500).json({ error: "Failed to send invite email" });
    }
  } catch (error) {
    console.log(error, "email error");
    return res.status(500).json({ error: "Server error" });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    // console.log("token", token);

    // 1. Find invite by token & check it's still valid (not expired & pending)
    const invite = await OrganizationInvite.findOne({
      token,
      expiresAt: { $gt: new Date() },
      status: "pending",
    });

    // console.log("invite", invite);
    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invalid or expired invite token." });
    }

    // 2. Find the user by email from the invite
    let existingUser = await User.findOne({ email: invite.email });
    // console.log("existingUser", existingUser);
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User does not exist on the platform." });
    }

    // 3. Find the organization by orgId in the invite
    const organization = await Org.findById(invite.orgId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }
    console.log("organization", organization);
    // 4. Check if user already in org using member
    const alreadyMember = await OrgMember.findOne({
      userId: existingUser._id,
      organizationId: organization._id,
    });
    // console.log("alreadyMember", alreadyMember);
    if (alreadyMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this organization." });
    }

    // 5. Find role permissions
    const roles = await RolePermission.findOne({ role: invite.role });
    // console.log("roles", roles);
    const employeeId = generateEmployeeId(organization._id);

    const newmember = await OrgMember.create({
      userId: existingUser._id,
      organizationId: organization._id,
      employeeId: employeeId,
      role: roles._id,
      status: "active",
    });

    existingUser.currentOrganization = organization._id;
    await existingUser.save();
    // console.log("newmember", newmember);
    await newmember.save();
    console.log("after update", existingUser);

    // 8. Mark invite as accepted
    invite.status = "accepted";
    invite.expiresAt = null;
    invite.token = "";
    // console.log("aftertoken", invite);
    await invite.save();

    return res
      .status(200)
      .json({ message: "Successfully joined the organization." });
  } catch (error) {
    console.error("Error in acceptInvite:", error);
    return res.status(500).json({
      message: "Internal server error in acceptInvite",
      error: error.message,
    });
  }
};

export const declineInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await OrganizationInvite.findOne({ token });

    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invite not found or already invalidated." });
    }

    // Invalidate the invite by clearing token and expiration
    invite.token = null;
    invite.expiresAt = null;
    invite.status = "rejected"; // Optionally mark status as expired

    await invite.save();

    return res
      .status(200)
      .json({ message: "Invite declined and invalidated successfully." });
  } catch (error) {
    console.error("Error in declineInvite:", error);
    return res.status(500).json({
      message: "Internal server error in declineInvite",
      error: error.message,
    });
  }
};

export const getOrganizationInvite = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;

    const invitations = await OrganizationInvite.find({
      orgId: new mongoose.Types.ObjectId(orgId),
    });

    if (!invitations.length) {
      return res
        .status(404)
        .json({ message: "No invitations found for this org" });
    }
    res
      .status(200)
      .json({ message: "Invite fetched successfully.", invitations });
  } catch (error) {
    console.error("Error in fetching invite:", error); // Add this
    res.status(500).json({
      message: "Internal server error in fetching invite",
      error: error.message,
    });
  }
};

export const UpdateOrgDetails = async (req, res) => {
  try {

    const {
      name,
      contactEmail,
      contactPhone,
      contactName,
      address,
      orgCountry
    } = req.body
    const orgId = req.orgUser.orgId;

    let organization = await Org.exists({ _id: orgId });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    const org = await Org.findByIdAndUpdate(orgId, {
      name,
      contactEmail,
      contactPhone,
      contactName,
      address,
      orgCountry
    })

    await org.save();
    console.log("organization", organization);

    res.status(200).json({ message: "Organization details updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: "failed to update organization details" })
  }
}

