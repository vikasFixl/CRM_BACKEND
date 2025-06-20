import Org from "../models/OrgModel.js";
import User from "../models/userModel.js";
import { BillingPlan } from "../models/BillingPlanModel.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { OrganizationBilling } from "../models/OranizationBillingPlanModel.js";
import { RolePermission } from "../models/RolePermission.js";
import { v4 as uuidv4 } from "uuid";
import { generateOrgToken } from "../utils/generatetoken.js";
import { OrganizationInvite } from "../models/OrganisationInviteModel.js";
import { sendEmail } from "../../config/nodemailer.config.js";
import { InviteEmailTemplate } from "../utils/helperfuntions/emailtemplate.js";
import jwt from "jsonwebtoken";
import { OrgMember } from "../models/OrganisationMemberSchema.js";
import { ROLES } from "../enums/role.enums.js";
import { uploadImageToCloudinary } from "../utils/helperfuntions/uploadimage.js";
import { paginateQuery } from "../utils/pagination.js";

// import { InviteEmailTemplate } from "../../utils/Emailtemplates.js";
// import { sendEmail } from "../../utils/helperfuntions/SendEmail.js";

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

    // ✅ Validate required fields
    if (
      !name ||
      !contactEmail ||
      !contactPhone ||
      !contactName ||
      !orgCountry ||
      !address ||
      !orgCity ||
      !orgState ||
      !orgCountry ||
      !contactName
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // ✅ Check for duplicate organization
    const existingOrg = await Org.findOne({ name });
    if (existingOrg) {
      return res
        .status(409)
        .json({ message: "Organization name already taken" });
    }

    // ✅ Fetch Free billing plan
    const billingPlan = await BillingPlan.findOne({ name: "Free Plan" });
    if (!billingPlan) {
      return res.status(404).json({ message: "Billing plan not found" });
    }

    // ✅ Create new organization
    const newOrg = new Org({
      name,
      billingPlan: billingPlan._id,
      modules: billingPlan.features,
      contactEmail,
      contactPhone,
      contactName,
      address,
      orgCity,
      orgState,

      orgCountry,
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
    });
    if (req.files && req.files.image) {
      const { image } = req.files;

      const cloudinaryResponse = await uploadImageToCloudinary({
        file: image,
        folder: "organization/avatar", // or any dynamic folder
        // only if replacing
      });

      // console.log(cloudinaryResponse, "cloudinaryResponse");
      newOrg.OrgLogo = {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    const savedOrg = await newOrg.save();

    // ✅ Create billing record
    const newBilling = new OrganizationBilling({
      organizationId: savedOrg._id,
      billingPlanId: billingPlan._id,
      subscriptionStartDate: new Date(),
      paymentStatus: "trialing",
      autoRenew: true,
      paymentMethod: { type: "trialing" },
      trialEndDate: billingPlan.trialDays
        ? new Date(Date.now() + billingPlan.trialDays * 24 * 60 * 60 * 1000)
        : null,
      createdBy: savedOrg._id,
      updatedBy: savedOrg._id,
    });

    await newBilling.save();

    const role = "OrgAdmin";

    const OrgAdminRole = await RolePermission.findOne({ role });
    // console.log(OrgAdminRole);

    const employeeId = generateEmployeeId(savedOrg._id);

    // add user to organization member schema
    const orgmember = new OrgMember({
      userId,
      employeeId,
      organizationId: savedOrg._id,
      role: OrgAdminRole._id,
    });

    await orgmember.save();
    // ✅ OPTIONAL: Return org-scoped JWT token
    const orgtoken = generateOrgToken({
      userId,
      orgId: savedOrg._id,
      employeeId,
      role: OrgAdminRole.role,
      permissions: OrgAdminRole.permissions,
    });

    // set user curret org
    user.currentOrganization = savedOrg._id;
    await user.save();
    const { exp } = jwt.decode(orgtoken);

    return res.status(201).json({
      message: "Organization and Billing created successfully",
      orgId: savedOrg._id,
      employeeId,
      orgtoken: orgtoken,
      expiresAt: exp * 1000,
    });
  } catch (error) {
    console.error("Org creation failed:", error);

    return res.status(500).json({
      message: "Error creating organization and billing",
      error: error.message,
    });
  }
};
// switchOrgController.js
export const switchOrg = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT
    const orgId = req.body.orgId;

    if (!orgId) {
      return res.status(400).json({ message: "No orgId provided" });
    }
    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a member of this organization
    const member = await OrgMember.findOne({
      userId,
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

    // Optionally: Update user's current active org info in DB if needed

    // Generate new token scoped to the selected org
    const orgtoken = generateOrgToken({
      userId,
      orgId,
      employeeId: member.employeeId,
      role: member.role?.role,
      permissions:
        member.permissionsOverride?.length > 0
          ? member.permissionsOverride
          : member.role?.permissions || [],
    });
    user.currentOrganization = orgId;
    await user.save();

    const { exp } = jwt.decode(orgtoken);

    return res.status(200).json({
      orgtoken,
      expat: exp * 1000, // optional: expiration in ms
    });
  } catch (err) {
    console.error("Switch Org Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const AddUserToOrganization = async (req, res) => {
//   try {
//     const { userId, role, jobTitle } = req.body;
//     const organizationId = req.orgUser.orgId;
//     const loggedinuser = req.user.userId;
//     // ✅ Validate ObjectIds
//     if (!mongoose.isValidObjectId(organizationId)) {
//       return res.status(400).json({ message: "Invalid organizationId" });
//     }
//     if (!mongoose.isValidObjectId(userId)) {
//       return res.status(400).json({ message: "Invalid userId" });
//     }

//     // ✅ No object needed in findById
//     const organization = await Org.findOne({
//       _id: organizationId,
//       createdBy: loggedinuser, // ensures only the creator can access/modify
//     });
//     if (!organization) {
//       return res
//         .status(404)
//         .json({ message: "Organization not found || you are not the creator" });
//     }

//     const user = await User.findById(userId).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.role === "SuperAdmin") {
//       return res.status(400).json({ message: "You can't add SuperAdmin" });
//     }
//     const employeeId = generateEmployeeId(organizationId);
//     // add that user to organization users array
//     organization.users.push({
//       userId: userId,
//       employeeId,
//       role: role,
//       joinedAt: new Date(),
//     });

//     await organization.save();

//     // ✅ Check if user is already in the organization
//     const alreadyExists = user.organizations.some(
//       (org) => org.org.toString() === organizationId
//     );
//     if (alreadyExists) {
//       return res
//         .status(400)
//         .json({ message: "User already belongs to this organization" });
//     }

//     const rolePermissions = await RolePermission.findOne({ role });
//     if (!rolePermissions) {
//       return res.status(404).json({ message: "Role not found" });
//     }

//     const permissions = rolePermissions ? rolePermissions.permissions : [];
//     console.log("permissions", permissions);

//     // ✅ Add organization entry to user
//     const organizationObject = {
//       org: organization._id,
//       role: role,
//       employeeId,
//       token: generateOrgToken({
//         userId,
//         orgId: organization._id,
//         employeeId,
//         role,
//         permissions,
//       }),
//       jobTitle: jobTitle,

//       permissions: permissions,
//     };

//     user.organizations.push(organizationObject);
//     await user.save();

//     return res.status(200).json({
//       message: "User added to organization successfully",
//       user,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Error adding user to organization",
//       error: error.message,
//     });
//   }
// };

// returns all the organizations that the user is part of

// return all user in org

export const getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.userId; // assuming this is set by auth middleware
    // fetch user org form the member model
    const { page = 1, limit = 10 } = req.query;

    const filter = {
      userId,
      status: "active",
    };

    const result = await paginateQuery(OrgMember, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    // Populate user and role info manually after pagination
    const populatedData = await Promise.all(
      result.data.map(async (member) => {
        const full = await OrgMember.findById(member._id)

          .populate("organizationId")
          .populate("role")
          .lean();

        return {
          orgId: full.organizationId._id,
          orgName: full.organizationId.name,
          Logo: full.organizationId.OrgLogo?.url,
          orgActive: full.organizationId.isActive,
          orgEmail: full.organizationId.contactEmail,
          orgContact: full.organizationId.contactName,
          orgPhone: full.organizationId.contactPhone,
          joinedAt: full.createdAt,
          employeeId: full.employeeId,
          role: full.role?.role,
          permissions:
            full.permissionsOverride?.length > 0
              ? full.permissionsOverride
              : full.role?.permissions || [],
        };
      })
    );

    // console.log("memberships", memberships);
    // const organizations = memberships.map((member) => ({
    //   orgId: member.organizationId._id,
    //   orgName: member.organizationId.name,
    //   Logo: member.organizationId.OrgLogo?.url,
    //   orgActive: member.organizationId.isActive,
    //   orgEmail: member.organizationId.contactEmail,
    //   orgcontact: member.organizationId.contactName,
    //   orgPhone: member.organizationId.contactPhone,
    //   joinedAt: member.createdAt,
    //   employeeId: member.employeeId,
    //   role: member.role.role,
    //   permissions:
    //     member.permissionsOverride?.length > 0
    //       ? member.permissionsOverride
    //       : member.role.permissions, // use override if exists
    // }));

    res.status(200).json({
      message: "Organizations fetched successfully",
      success: true,
      code: 200,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit: result.limit,
      data: populatedData,
    });
  } catch (error) {
    res.status(500).json({
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
    const { page = 1, limit = 10 } = req.query;

    // Step 1: Base filter (before populating roles)
    const paginated = await paginateQuery(
      OrgMember,
      { organizationId: orgId, status: "active" },
      { page, limit, sort: { createdAt: -1 } }
    );

    // Step 2: Populate userId and role fields after pagination
    const populatedMembers = await Promise.all(
      paginated.data.map((member) =>
        OrgMember.findById(member._id)
          .populate("userId", "firstName lastName email phone")
          .populate("role")
          .lean()
      )
    );

    // Step 3: Filter out OrgAdmin members
    const nonAdminMembers = populatedMembers.filter(
      (member) => member.role?.role !== "OrgAdmin"
    );

    // Step 4: Construct enriched user data
    const enrichedUsers = nonAdminMembers.map((member) => {
      const useCustom =
        member.hasCustomPermission ||
        (member.permissionsOverride && member.permissionsOverride.length > 0);

      return {
        orgId: member.organizationId,
        orgName: member.organizationId?.name,
        Logo: member.organizationId?.OrgLogo?.url,
        orgActive: member.organizationId?.isActive,
        orgEmail: member.organizationId?.contactEmail,
        orgcontact: member.organizationId?.contactName,
        orgPhone: member.organizationId?.contactPhone,
        joinedAt: member.createdAt,
        employeeId: member.employeeId,
        role: member.role?.role,
        permissions: useCustom
          ? member.permissionsOverride
          : member.role?.permissions || [],
        user: member.userId, // Contains firstName, lastName, email, phone
      };
    });

    return res.status(200).json({
      message: "Organization users fetched successfully (excluding OrgAdmins)",
      success: true,
      code: 200,
      data: enrichedUsers,
      page: Number(page),
      limit: Number(limit),
      total: paginated.total,
      totalPages: paginated.totalPages,
    });
  } catch (error) {
    console.error("Error in getOrgUsersExcludingOrgAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      code: 500,
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
    const { userId } = req.params;
    const orgId = req.orgUser.orgId; // securely extracted from auth middleware
    const { Role, overridePermissions } = req.body;
    console.log(orgId, userId, Role, overridePermissions);

    // Find member
    // Find member using userId + orgId
    const member = await OrgMember.findOne({
      userId,
      organizationId: orgId,
    }).populate("role", "role");
    if (!member) {
      return res
        .status(404)
        .json({ error: "you are not part of this organization" });
    }

    console.log("member", member);
    let updates = {};
    const isRoleChanged = member.role?.role !== Role;
    console.log("isRoleChanged", isRoleChanged);

    // ✅ 1. Handle role change
    if (isRoleChanged) {
      const newRole = await RolePermission.findOne({ role: Role });
      console.log("newRole", newRole);
      if (!newRole) return res.status(404).json({ error: "Role not found" });

      if (newRole.name === "SuperAdmin") {
        return res
          .status(403)
          .json({ error: "Forbidden: Cannot assign SuperAdmin role" });
      }

      updates.role = newRole._id;
      updates.permissionsOverride = []; // Clear override
      updates.hasCustomPermission = false;
    }

    // ✅ 2. Apply override permissions ONLY if role is not changed
    if (
      !isRoleChanged &&
      Array.isArray(overridePermissions) &&
      overridePermissions.length > 0
    ) {
      updates.permissionsOverride = overridePermissions;
      updates.hasCustomPermission = true;
    }

    // ✅ 3. Apply updates and save
    Object.assign(member, updates);
    await member.save();

    return res
      .status(200)
      .json({
        message: `member role updated to ${Role} successfully ${
          isRoleChanged ? "" : "with custom permisisons"
        }`,
        member,
      });
  } catch (error) {
    console.error("updateOrgMember error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a user from an organization

export const DeleteOrganizationUser = async (req, res) => {
  try {
    const { id } = req.params; // User ID to be removed
    const orgId = req.orgUser.orgId; // From authenticated org user

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find membership document for user and org
    const membership = await OrgMember.findOne({
      userId: id,
      organizationId: orgId,
    });
    if (!membership) {
      return res.status(403).json({
        error: "User does not belong to this organization",
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
      error: "Internal server error while removing user from organization",
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
    const existingUser = await User.findOne({ email: invite.email });
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
    // console.log("newmember", newmember);
    await newmember.save();

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
