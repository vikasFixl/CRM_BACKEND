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
import transporter from "../../config/nodemailer.config.js";


// import { InviteEmailTemplate } from "../../utils/Emailtemplates.js";
// import { sendEmail } from "../../utils/helperfuntions/SendEmail.js";
// Assuming the 'User' model exists and the user is related to the org

const generateEmployeeId = () => {
  const short = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char hex
  return `EMP_${short}`; // like EMP_1F2A9C
};

export const createOrganization = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, contactEmail, contactPhone, contactName,address, orgCity, orgState, orgCountry } =
      req.body;

    // ✅ Validate required fields
    if (
      !name ||
      !contactEmail ||
      !contactPhone ||
      !address ||
      !orgCity ||
      !orgState ||
      !orgCountry||
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
          role,
          permissions,
          employeeId,
          token: orgtoken,
        },
      },
    });

    // console.log("orgtoken", orgtoken);
    // console.log("employeeId", employeeId);
const isProd = process.env.NODE_ENV === "production";

res.cookie("orgtoken", orgtoken, {
  httpOnly: isProd,
  secure: isProd,
  sameSite: "None",
  maxAge: 1000 * 60 * 60 * 24, // 1 day
});

return res.status(201).json({
  message: "Organization and Billing created successfully",
  orgId: savedOrg._id,
  employeeId,
  token: orgtoken,
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
    const userId = req.user.userId; // from base login token (global JWT)
    const orgId = req.body.orgId;

    if (!orgId) {
      return res.status(400).json({ message: "no orgId provided" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

   
    const orgRecord = user.organizations.find(
      (o) => o.org.toString() === orgId
    );
    console.log("orgRecord", orgRecord);
    if (!orgRecord) {
      return res
        .status(403)
        .json({ message: "User not part of this organization" });
    }

    const orgtoken = generateOrgToken({
      userId,
      orgId,
      employeeId: orgRecord.employeeId,
      role: orgRecord.role,
      permissions: orgRecord.permissions,
    });

    const token = orgtoken;
     const isProd = process.env.NODE_ENV === "production";
    res.cookie("orgtoken", token, {
      secure: isProd,
      httpOnly: isProd,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Switch Org Error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const AddUserToOrganization = async (req, res) => {
  try {
    const { userId, role, jobTitle } = req.body;
    const organizationId = req.orgUser.orgId;
    const loggedinuser = req.user.userId;
    // ✅ Validate ObjectIds
    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({ message: "Invalid organizationId" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // ✅ No object needed in findById
    const organization = await Org.findOne({
      _id: organizationId,
      createdBy: loggedinuser, // ensures only the creator can access/modify
    });
    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization not found || you are not the creator" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "SuperAdmin") {
      return res.status(400).json({ message: "You can't add SuperAdmin" });
    }
    const employeeId = generateEmployeeId(organizationId);
    // add that user to organization users array
    organization.users.push({
      userId: userId,
      employeeId,
      role: role,
      joinedAt: new Date(),
    });

    await organization.save();

    // ✅ Check if user is already in the organization
    const alreadyExists = user.organizations.some(
      (org) => org.org.toString() === organizationId
    );
    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "User already belongs to this organization" });
    }

    const rolePermissions = await RolePermission.findOne({ role });
    if (!rolePermissions) {
      return res.status(404).json({ message: "Role not found" });
    }

    const permissions = rolePermissions ? rolePermissions.permissions : [];
    console.log("permissions", permissions);

    // ✅ Add organization entry to user
    const organizationObject = {
      org: organization._id,
      role: role,
      employeeId,
      token: generateOrgToken({
        userId,
        orgId: organization._id,
        employeeId,
        role,
        permissions,
      }),
      jobTitle: jobTitle,

      permissions: permissions,
    };

    console.log("organizationObject", organizationObject);
    user.organizations.push(organizationObject);
    await user.save();

    return res.status(200).json({
      message: "User added to organization successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error adding user to organization",
      error: error.message,
    });
  }
};

// gets organization user details (specifix organization)
export const getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgid = req.params.orgId;
    if (!orgid) {
      return res.status(400).json({ message: "no orgId provided" });
    }
    // console.log("userId", userId);
    // console.log("Fetching users for organization created by:", userId);

    const organization = await Org.findOne({
      createdBy: userId,
      _id: orgid,
    }).populate({
      path: "users.userId",
      select: "firstName lastName email phone  jobTitle", // optional fields
    });

    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization not found || you are not the owner" });
    }

    res.status(200).json({
      message: "Organization users fetched successfully",
      users: organization.users,
    });
  } catch (error) {
    console.error("Error in getAllOrganizationsUsers:", error);
    res.status(500).json({ error: "Failed to get organization users" });
  }
};

export const getOrganizationBYId = async (req, res) => {
  try {
    const organizationId = req.params.orgId;
    const organization = await Org.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.status(200).json({ message: "Organization fetched successfully", organization });
  } catch (error) {
    console.error("Error in getOrganizationBYId:", error);
    res.status(500).json({ error: "Failed to get organization" });
  }
}

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

export const getAllOrganizations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all organizations where the user is in the `users` array
    const organizations = await Org.find({
      createdBy: userId,
    })
      .select("-password")
      .populate("billingPlan")
      .populate(
        "users.userId",
        "firstName lastName email phone role jobTitle,eid"
      ); // Populate the nested userId inside users array

    if (!organizations || organizations.length === 0) {
      return res
        .status(404)
        .json({ message: "No organizations found for this user." });
    }

    res.status(200).json({
      message: "Organizations fetched successfully.",
      organizations,
    });
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// todo inivte schema
export const CreateInvite = async (req, res) => {
  try {
    const { email, role } = req.body || {};
    const orgId = req.orgUser.orgId;
    const {invitedBy, firstName,email:invitedByEmail,userId } = req.user;


    
    // Validate org

    if (req.body == "" || req.body == undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const organization = await Org.findOne({
      _id: orgId,
     // ensures only the creator can access/modify
    });

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

    // Check for existing pending invite
    const existingInvite = await OrganizationInvite.findOne({
      email,
    orgId,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ message: "An invite for this user already exists." });
    }

    // Generate a secure token
    const token = crypto.randomBytes(64).toString("hex");
    console.log("token", token);

    // Save the invite
    const invite = await OrganizationInvite.create({
      email,
      role,
      orgId,
      token,
      invitedBy:userId,
      status: "pending",
    });

    await invite.save();
    // Construct join link
    const INVITE_LINK = `https://localhost:5173/accept-invite?token=${token}`;

   
    
   
const htmlcontent=`
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; margin:0; padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 20px;">
              <tr>
                <td style="color:#333333; font-size: 24px; font-weight: bold; padding-bottom: 20px;">
                  You're Invited to Join ${organization.name}!
                </td>
              </tr>
              <tr>
                <td style="color:#555555; font-size: 16px; line-height: 1.5; padding-bottom: 10px;">
                  Hello <strong>${email}</strong>,
                </td>
              </tr>
              <tr>
                <td style="color:#555555; font-size: 16px; line-height: 1.5; padding-bottom: 10px;">
                  You have been invited to join the organization <strong>${organization.name}</strong> as a <strong>${role}</strong>.
                </td>
              </tr>
              <tr>
                <td style="color:#555555; font-size: 16px; line-height: 1.5; padding-bottom: 20px;">
                  To accept the invitation and get started, please click the link below:
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <a href="${INVITE_LINK}" target="_blank" style="background-color:#007bff; color:#ffffff; padding: 12px 20px; text-decoration:none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Accept Invitation
                  </a>
                </td>
              </tr>
              <tr>
                <td style="color:#555555; font-size: 14px; line-height: 1.5; padding-bottom: 10px;">
                  If you did not expect this invitation, you can safely ignore this email.
                </td>
              </tr>
              <tr>
                <td style="color:#999999; font-size: 12px; text-align: center; padding-top: 30px;">
                  &copy; ${new Date().getFullYear()} ${organization.name}. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`


const mailOptions = {
      from: `${firstName} <${`${invitedByEmail}`}>`,
      to: email,
      subject: `${firstName} sent an invitation to join CRM ✔`,
      text: "You have been invited to join CRM.",
      html: htmlcontent,
    };


   
    // await sendEmail(email, "You're invited!", `Click here to join: ${inviteLink}`);
  await   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).json({ error: error.message,message: "Failed to send email." });
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
        res.status(200).json({ message: "Invite sent successfully.",token });
      }
    })

    console.log("Invite link:", INVITE_LINK); // for testing/dev

   
  } catch (error) {
    console.error("Error creating invite:", error);
    return res
      .status(500)
      .json({ message: "Failed to create invite.", error: error.message });
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
      return res.status(404).json({ message: "Invalid or expired invite token." });
    }

    // 2. Find the user by email from the invite
    const existingUser = await User.findOne({ email: invite.email });
    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist on the platform." });
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
      return res.status(400).json({ message: "User is already a member of this organization." });
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
    const organizationObject={
       org: organization._id,
      role: invite.role,
      employeeId,
      token: generateOrgToken({
        userId: existingUser._id,
        orgId: organization._id,
        employeeId,
        role:invite.role,
        permissions,
      }),
      

      permissions: permissions,
      jobTitle:invite.role
    }
    existingUser.organizations.push(organizationObject);
    await existingUser.save();

    // 8. Mark invite as accepted
    invite.status = "accepted";
    invite.expiresAt = null;
    await invite.save();

    console.log("User successfully added to organization and invite accepted.");

    return res.status(200).json({ message: "Successfully joined the organization." });
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
      return res.status(404).json({ message: "Invite not found or already invalidated." });
    }

    // Invalidate the invite by clearing token and expiration
    invite.token = null;
    invite.expiresAt = null;
    invite.status = "rejected"; // Optionally mark status as expired

    await invite.save();

    return res.status(200).json({ message: "Invite declined and invalidated successfully." });
  } catch (error) {
    console.error("Error in declineInvite:", error);
    return res.status(500).json({ message: "Internal server error in declineInvite", error: error.message });
  }
};


export const getOrganizationInvite = async (req, res) => {
  try {
    const { id } = req.body;
    const invite = await OrganizationInvite.find({ orgId: id });

    if (!invite) {
      return res.status(404).json({ message: "no inivitation found" });
    }
    res.status(200).json({ message: "Invite fetched successfully.", invite });
  } catch (error) {
    console.error("Error in fetching invite:", error); // Add this
    res.status(500).json({
      message: "Internal server error in fetching invite",
      error: error.message,
    });
  }
};
