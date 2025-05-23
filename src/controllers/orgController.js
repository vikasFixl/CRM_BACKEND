import Org from "../models/OrgModel.js";
import User from "../models/userModel.js";
import {BillingPlan} from "../models/BillingPlanModel.js"
import crypto from "crypto";
import mongoose from "mongoose";
import {OrganizationBilling} from "../models/OranizationBillingPlanModel.js"
import { RolePermission } from "../models/RolePermission.js";

// import { OrganizationInvite } from "../../models/organisationmodel/OragnizationInviteModel.js";
// import { InviteEmailTemplate } from "../../utils/Emailtemplates.js";
// import { sendEmail } from "../../utils/helperfuntions/SendEmail.js";
// Assuming the 'User' model exists and the user is related to the org

export const createOrganization = async (req, res) => {
  try {
   
    const userId = req.user.userId;
    // Destructure the request body to get organization details
    const { name, contactEmail, contactPhone, address, city, state, country } =
      req.body;

      if(!name || !contactEmail || !contactPhone || !address || !city || !state || !country){
        return res.status(400).json({ message: "All fields are required" });
      }
    console.log("req.body", req.body);
    // check if name alreadytaken

    const existingOrg = await Org.findOne({ name });
    if (existingOrg) {
      return res
        .status(409)
        .json({ message: "Organization name already taken" });
    }

    // If no billing plan is provided, default to the Free Plan ID
    const billing = await BillingPlan.findOne({ name: "Free Plan" });
    console.log("bilingfound", billing);
    const planIdToUse = billing ? billing._id : null;

    // Fetch the billing plan based on the plan ID (Free Plan or any provided plan)
    const billingPlan = await BillingPlan.findById(planIdToUse);

    if (!billingPlan) {
      return res.status(404).json({ message: "Billing plan not found" });
    }

    // Set the modules based on the selected billing plan's features
    const modules = billingPlan.features;

    // Create the new organization object
    const newOrganization = new Org({
      name,
      billingPlan: planIdToUse, // Set the billing plan (Free Plan or any provided plan)
      modules, // Set modules from the billing plan
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      country,
      createdBy: userId,
      updatedBy: userId,
      isActive: true, // Mark the organization as active by default
    });

    // Save the new organization to the database
    const savedOrganization = await newOrganization.save();
    console.log("savedorganization", savedOrganization);

    // Now create the OrganizationBilling entry
    const newOrganizationBilling = new OrganizationBilling({
      organizationId: savedOrganization._id, // Link to the created organization
      billingPlanId: planIdToUse, // Billing Plan linked to the organization
      subscriptionStartDate: new Date(), // Subscription starts now
      subscriptionEndDate: null, // Subscription end date will be set later, or null for free plans
      paymentStatus: "trialing", // Default status for trial plans
      autoRenew: true, // Default auto-renew for subscription
      paymentMethod: {
        type: "trialing",
      },
     trialEndDate: billingPlan.trialDays > 0
  ? new Date(
      new Date().setDate(new Date().getDate() + billingPlan.trialDays)
    )
  : null
 // Calculate trial end date
 ,
      createdBy: savedOrganization._id, // Created by user
      updatedBy: savedOrganization._id, // Same user as creator
    });

    // Save the OrganizationBilling entry
    await newOrganizationBilling.save();

    // Optionally, add the new organization ID to the user's record (if relevant)
    // const user = await User.findById(userId);
    // console.log("user found", user);
    // Assuming 'user' is the User model, 'savedOrganization' is the newly created organization,
    // and RolePermission is your role-based schema that maps roles to permissions.

    if (savedOrganization) {
      // Default or dynamically set role (you can adjust this logic as needed)
      const defaultRole = "OrgAdmin"; // Default role, can be changed based on logic

      // Fetch permissions for the selected role
      const rolePermissions = await RolePermission.findOne({
        role: defaultRole,
      });
      console.log("rolePermissions", rolePermissions);
      // If no role permissions are found, use default permissions
      const permissions = rolePermissions ? rolePermissions.permissions : []; // Assuming permissions is an array in your RolePermission schema

      console.log("permissions", permissions);

      // Create the organization object to push into the user's organizations array
      const organizationObject = {
        org: savedOrganization._id,
        role: defaultRole, // Role can be dynamically set or passed
        permissions: permissions, // Attach the fetched permissions
      };
      console.log("organizationObject", organizationObject);

      // push user to organisations users
      await Org.findByIdAndUpdate(savedOrganization._id, {
        $push: {
          users: {
            userId: userId,
            role: defaultRole,
            joinedAt: new Date(),
          },
        },
      });

      // Push the organization object into the user's organizations array
      // user.organizations.push(organizationObject);
      await User.findByIdAndUpdate(userId, {
        $push: { organizations: organizationObject },
      });
    }

    console.log("newOrganizationBilling", newOrganizationBilling);

    // Respond with the created organization and billing details
    return res.status(201).json({
      message: "Organization and Billing created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creating organization and billing",
      error: error.message,
    });
  }
};

export const AddUserToOrganization = async (req, res) => {
  try {
    const { organizationId, userId, role } = req.body;

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
      createdBy: req.user.userId, // ensures only the creator can access/modify
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

    // add that user to organization users array
    organization.users.push({
      userId: userId,
      eid: user.eid,
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

export const getAllOrganizationsUsers = async (req, res) => {
  try {
    const userId = req.user.userId;
    Console.log("userId", userId);
    console.log("Fetching users for organization created by:", userId);

    const organization = await Organization.findOne({
      createdBy: userId,
    }).populate({
      path: "users.userId",
      select: "firstName lastName email phone role jobTitle", // optional fields
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
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

export const UpdateOrganizationUser = async (req, res) => {
  try {
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to update organization user" });
  }
};

export const getAllOrganizations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all organizations where the user is in the `users` array
    const organizations = await Org.find({
      createdBy: userId,
    }).select("-password").populate("billingPlan").populate("users.userId", "firstName lastName email phone role jobTitle,eid") // Populate the nested userId inside users array

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

export const CreateInvite = async (req, res) => {
  try {
    const { email, role } = req.body || {};
    const orgId = req.params.orgId;
    const invitedBy = req.user._id;

    // Validate org

    if (req.body == "" || req.body == undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const organization = await Organization.findOne({
      _id: orgId,
      createdBy: req.user.id, // ensures only the creator can access/modify
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
      status: "pending",
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
      invitedBy,
      status: "pending",
    });

    await invite.save();
    // Construct join link
    const INVITE_LINK = `https://localhost:5000/accept-invite?token=${token}`;

    // create template
    const html = await InviteEmailTemplate(
      organization.name,
      role,
      email,
      INVITE_LINK
    ); // Don't pass values yet

    // send invite

    // await sendEmail(email, "You're invited!", `Click here to join: ${inviteLink}`);
    try {
      await sendEmail(email, "You're invited!", html);
    } catch (error) {
      return res.status(500).json({ message: "Failed to send invite." });
    }

    console.log("Invite link:", INVITE_LINK); // for testing/dev

    return res.status(200).json({
      message: "Invite created successfully.",
      INVITE_LINK, // Return for dev; remove in prod
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    return res
      .status(500)
      .json({ message: "Failed to create invite.", error: error.message });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;
    console.log("token", token);
    const invite = await OrganizationInvite.findOne({
      token,
      expiresAt: { $gt: new Date() }, // only accept if not expired
      status: "pending", // ensure invite hasn't already been accepted
    });

    const existingUser = await User.findOne({ email: invite.email });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User does not exist on the platform." });
    }
    console.log("invite", invite);
    const rolePermissions = await RolePermission.findOne({ role: invite.role });
    console.log("rolePermissions", rolePermissions);
    const org = await Organization.findByIdAndUpdate(invite.orgId, {
      $push: {
        users: {
          userId: existingUser._id,
          role: invite.role,
          joinedAt: new Date(),
        },
      },
    });
    console.log("org", org);

    const user = await User.findByIdAndUpdate(existingUser._id, {
      $push: {
        organizations: {
          org: invite.orgId,
          role: invite.role,
          permissions: rolePermissions?.permissions || [],
        },
      },
    });

    console.log("user", user);
    // Set token to null (or delete the document entirely)
    console.log("runnninf");
    invite.status = "accepted";
    await invite.save(); // or await OrganizationInvite.deleteOne({ _id: invite._id });

    console.log("almost done");

    res.status(200).json({ message: "Successfully joined the organization." });
  } catch (error) {
    console.error("Error in acceptInvite:", error); // Add this
    res.status(500).json({
      message: "Internal server error in acceptInvite",
      error: error.message,
    });
  }
};

export const getOrganizationInvite = async (req, res) => {
  try {
    const { id } = req.body;
    const invite = await OrganizationInvite.find({orgId: id});

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
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
