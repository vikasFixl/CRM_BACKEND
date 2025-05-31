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
import { sendEmail} from "../../config/nodemailer.config.js"
import { InviteEmailTemplate } from "../utils/helperfuntions/emailtemplate.js";
import jwt from "jsonwebtoken";


// import { InviteEmailTemplate } from "../../utils/Emailtemplates.js";
// import { sendEmail } from "../../utils/helperfuntions/SendEmail.js";


const generateEmployeeId = () => {
  const short = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char hex
  return `EMP_${short}`; // like EMP_1F2A9C
};
const isProd = process.env.NODE_ENV === "production";
const frontendUrl =process.env.FRONTEND_URL;

export const createOrganization = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      contactEmail,
      contactPhone,
      contactName,
      address,
       CurrentActive,
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

    // ✅ Assign OrgAdmin role with permissions
    const role = "OrgAdmin";
    const rolePermissions = await RolePermission.findOne({ role });
    const permissions = rolePermissions ? rolePermissions.permissions : [];
    // console.log("permissions", permissions);

    const employeeId = generateEmployeeId(savedOrg._id);
    // ✅ OPTIONAL: Return org-scoped JWT token
    const orgtoken = generateOrgToken({
      userId,
      orgId: savedOrg._id,
      employeeId,
      role,
      permissions,
    });
    // ✅ Update organization users array
    await Org.findByIdAndUpdate(savedOrg._id, {
      $push: {
        users: {
          userId,
          role,
          employeeId,
          joinedAt: new Date(),
        },
      },
    });

    // ✅ Update user organizations array
    await User.findByIdAndUpdate(userId, {
      $push: {
        organizations: {
          org: savedOrg._id,
          CurrentActive,
          role,
          permissions,
          employeeId,
          token: orgtoken,
        },
      },
    });

    // console.log("orgtoken", orgtoken);
    // console.log("employeeId", employeeId);

    // res.cookie("orgtoken", orgtoken, {
    //   httpOnly: isProd,
    //   secure: isProd,
    //   sameSite: "none",

    //   maxAge: 1000 * 60 * 60 * 24, // 1 day
    // });
const {exp}=jwt.decode(orgtoken)
    return res.status(201).json({
      message: "Organization and Billing created successfully",
      orgId: savedOrg._id,
      employeeId,
      orgtoken: orgtoken,
      expiresAt: exp*1000
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
    const userId = req.user.userId; // from global JWT
    const orgId = req.body.orgId;

    if (!orgId) {
      return res.status(400).json({ message: "No orgId provided" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const orgIndex = user.organizations.findIndex(
      (o) => o.org.toString() === orgId
    );

    if (orgIndex === -1) {
      return res
        .status(403)
        .json({ message: "User not part of this organization" });
    }

    // Set all currentActive to false
    user.organizations.forEach((org) => {
      org.CurrentActive = false;
    });

    // Set currentActive = true for selected org
    user.organizations[orgIndex].CurrentActive = true;

    // Save changes
    await user.save();

    const activeOrg = user.organizations[orgIndex];
// console.log("activeOrg", activeOrg);

    // Generate new token
    const orgtoken = generateOrgToken({
      userId,
      orgId,
      employeeId: activeOrg.employeeId,
      role: activeOrg.role,
      permissions: activeOrg.permissions,
    });
const {exp} = jwt.decode(orgtoken);
    return res.status(200).json({ orgtoken, expat: exp*1000 });
  } catch (err) {
    console.error("Switch Org Error", err);
    res.status(500).json({ message: "Server error" });
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

// get user organizations all (whether he is admin or not)


export const getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // ✅ Get user with embedded org info
    const user = await User.findById(userId).lean();

    if (!user || !user.organizations || user.organizations.length === 0) {
      return res.status(404).json({ message: "No organizations found for this user." });
    }

    // ✅ Extract org IDs
    const orgIds = user.organizations.map((entry) => entry.org);

    // ✅ Fetch full org info from Org collection
    const orgDetails = await Org.find({ _id: { $in: orgIds }, isSuspended: false })
      .select("name contactEmail contactPhone contactName address orgCity orgState orgCountry timezone modules billingPlan isActive createdBy createdAt updatedAt")
      .lean();

    // ✅ Build enriched response combining org metadata + user-specific values
    const enrichedOrgs = user.organizations.map((entry) => {
      const orgInfo = orgDetails.find((org) => org._id.toString() === entry.org.toString());

      if (!orgInfo) return null; // skip suspended or missing orgs

      return {
        orgId: orgInfo._id,
        name: orgInfo.name,
        contactEmail: orgInfo.contactEmail,
        contactPhone: orgInfo.contactPhone,
        location: {
          city: orgInfo.orgCity,
          state: orgInfo.orgState,
          country: orgInfo.orgCountry,
        },
        modules: orgInfo.modules,
        timezone: orgInfo.timezone,
        billingPlan: orgInfo.billingPlan,
        isActive: orgInfo.isActive,
        createdAt: orgInfo.createdAt,
        updatedAt: orgInfo.updatedAt,
        createdBy: orgInfo.createdBy,

        // 🧠 Embedded org-specific user data
        role: entry.role,
        employeeId: entry.employeeId,
        permissions: entry.permissions,
        jobTitle: entry.jobTitle,
        token: entry.token,
        currentActive: entry.CurrentActive,
      };
    }).filter(Boolean); // remove nulls if orgInfo was missing

    res.status(200).json({
      message: "Organizations fetched successfully",
      organizations: enrichedOrgs,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Failed to get organizations" });
  }
};

// return all user in org
export const getAllUserInOrg = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    console.log("orgId", orgId);

    const org = await Org.findById(orgId).lean();
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Filter out Admins
    const nonAdminUsers = org.users.filter(user => user.role !== "OrgAdmin");

    // Fetch user details from User model
    const userIds = nonAdminUsers.map(user => user.userId);

    const users = await User.find({ _id: { $in: userIds } })
      .select("firstName lastName email phone jobTitle")
      .lean();

    // Merge additional org-specific data (like employeeId, joinedAt)
    const enrichedUsers = users.map(user => {
      const orgInfo = nonAdminUsers.find(u => u.userId.toString() === user._id.toString());
      return {
        ...user,
        role: orgInfo.role,
        employeeId: orgInfo.employeeId,
        joinedAt: orgInfo.joinedAt,
      };
    });

    res.status(200).json({ message: "Users fetched successfully", users: enrichedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getOrganizationBYId = async (req, res) => {
  try {
    const organizationId = req.params.id;
    // this is form middlwware
    const owner = req.orgUser.userId;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const organization = await Org.findOne({
      _id: organizationId,
      createdBy: owner,
    }).populate({
      path: "users.userId",
      select: "firstName lastName email phone jobTitle employeeId",
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res
      .status(200)
      .json({ message: "Organization fetched successfully", organization });
  } catch (error) {
    console.error("Error in getOrganizationBYId:", error);
    res.status(500).json({ error: "Failed to get organization" });
  }
};

export const UpdateOrganizationUser = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgUser.orgId; // From auth middleware

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { role, status, permissions } = req.body;

    // Check if there's anything to update
    if (!role && !status) {
      return res.status(400).json({
        error: "At least one of 'role' or 'status' must be provided",
      });
    }

    // Fetch the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user belongs to this org
    const orgEntry = user.organizations.find(
      (orgObj) => orgObj.org.toString() === orgId.toString()
    );

    if (!orgEntry) {
      return res.status(403).json({
        error: "User does not belong to this organization",
      });
    }

    // Handle role update logic
    if (role) {
      orgEntry.role = role;

      if (role === "Custom") {
        if (!Array.isArray(permissions) || permissions.length === 0) {
          return res.status(400).json({
            error: "Permissions are required when role is 'Custom'",
          });
        }

        orgEntry.permissions = permissions;
      } else {
        const rolePermissions = await RolePermission.findOne({ role });
        if (!rolePermissions) {
          return res.status(404).json({ error: "Role not found" });
        }

        orgEntry.permissions = rolePermissions.permissions || [];
      }
    }

    // Update other fields
    if (status) orgEntry.status = status;
    // if (jobTitle) orgEntry.jobTitle = jobTitle;
    // if (contactInfo) orgEntry.contactInfo = contactInfo;

    await user.save();

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      error: "Failed to update organization user",
    });
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

    // Fetch the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user belongs to this organization
    const orgEntry = user.organizations.find(
      (orgObj) => orgObj.org.toString() === orgId.toString()
    );

    if (!orgEntry) {
      return res.status(403).json({
        error: "User does not belong to this organization",
      });
    }

    // Remove org entry from user's organizations array
    await User.findByIdAndUpdate(id, {
      $pull: { organizations: { org: orgId } },
    });

    // Remove user from organization.users array
    const updatedOrg = await Org.findByIdAndUpdate(
      orgId,
      {
        $pull: { users: { userId: id } },
      },
      { new: true }
    );

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

// export const getAllOrganizations = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // Find all organizations where the user is in the `users` array
//     const organizations = await Org.find({
//       createdBy: userId,
//     })
//       .select("-password")
//       .populate("billingPlan");

//     if (!organizations || organizations.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No organizations found for this user." });
//     }

//     res.status(200).json({
//       message: "Organizations fetched successfully.",
//       organizations,
//     });
//   } catch (error) {
//     console.error("Error fetching user organizations:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// todo inivte schema
export const CreateInvite = async (req, res) => {
  try {
    const { email, role } = req.body || {};
    const orgId = req.orgUser.orgId;
    const {  userId } = req.user;
    console.log("orgId", orgId);

    // Validate org

    if (req.body == "" || req.body == undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const useronplatform = await User.findOne({email});
    if(!useronplatform){
      return res.status(400).json({ message: "User does not exists on the platform" });
    }

    const organization = await Org.findOne({
      _id: orgId,
      // ensures only the creator can access/modify
    });

    console.log("organization", organization);
    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization not found || you are not the creator" });
    }
    // Validate role
    const roleExists = await RolePermission.findOne({ role });
    if (!roleExists) {
      return res.status(400).json({ message: "Invalid role." });
    }

    // Check if user is already in the org
    const existingUser = await User.findOne({
      email,
      "organizations.org": orgId,
    });

    console.log("existingUser", existingUser);

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User is already in this organization." });
    }

   

 
    //   email,
    // orgId,
    //   expiresAt: { $gt: new Date() },
    // });

    // if (existingInvite) {
    //   return res
    //     .status(400)
    //     .json({ message: "An invite for this user already exists." });
    // }

    // Generate a secure token
    const token = crypto.randomBytes(64).toString("hex");
    console.log("token", token);

    // Save the invite
    const invite = await OrganizationInvite.create({
      email,
      role,
      orgId: organization._id,
      token,
      invitedBy: userId,
      status: "pending",
    });

    await invite.save();
    console.log("invite", invite);
    // Construct join link
    const INVITE_LINK = `${frontendUrl}/accept-invite?token=${token}`;
 const html= await InviteEmailTemplate(organization.name,role,email,INVITE_LINK);

    // Send reset email (mocked)
    console.log("Invite link:", INVITE_LINK); // for testing/dev
     try {
      await sendEmail(email, "Organization Invite", html);
      return res.status(200).json({
        success: true,
        message: "Invite sent successfully.",
      });
    } catch (error) {
     await  OrganizationInvite.findByIdAndDelete(invite._id);
     
     
      return res.status(500).json({ error: "Failed to send invite email" });
    }
  } catch (error) {
    console.log(error,"email error");
    return res.status(500).json({ error: "Server error" });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("token", token);

    // 1. Find invite by token & check it's still valid (not expired & pending)
    const invite = await OrganizationInvite.findOne({
      token,
      expiresAt: { $gt: new Date() },
      status: "pending",
    });

    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invalid or expired invite token." });
    }

    // 2. Find the user by email from the invite
    const existingUser = await User.findOne({ email: invite.email });
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

    // 4. Check if user already in org.users to avoid duplicates
    const alreadyMember = organization.users.some(
      (userEntry) => userEntry.userId.toString() === existingUser._id.toString()
    );
    if (alreadyMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this organization." });
    }

    // 5. Find role permissions
    const rolePermissions = await RolePermission.findOne({ role: invite.role });
    const permissions = rolePermissions ? rolePermissions.permissions : [];
    const employeeId = generateEmployeeId(organization._id);
    // 6. Add user to organization users array
    organization.users.push({
      userId: existingUser._id,
      role: invite.role,
      employeeId: employeeId,
      joinedAt: new Date(),
    });
    await organization.save();

    // 7. Add organization info to user's organizations array
    const organizationObject = {
      org: organization._id,
      role: invite.role,
      employeeId,
      token: generateOrgToken({
        userId: existingUser._id,
        orgId: organization._id,
        employeeId,
        role: invite.role,
        permissions,
      }),

      permissions: permissions,
      jobTitle: invite.role,
    };
    existingUser.organizations.push(organizationObject);
    await existingUser.save();

    // 8. Mark invite as accepted
    invite.status = "accepted";
    invite.expiresAt = null;
    await invite.save();

    console.log("User successfully added to organization and invite accepted.");

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
    return res
      .status(500)
      .json({
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
      return res.status(404).json({ message: "No invitations found for this org" });
    }
    res.status(200).json({ message: "Invite fetched successfully.", invitations });
  } catch (error) {
    console.error("Error in fetching invite:", error); // Add this
    res.status(500).json({
      message: "Internal server error in fetching invite",
      error: error.message,
    });
  }
};
