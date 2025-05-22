const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const transporter = require("../../config/nodemailer.config.js");
const {
  signupSchema,
  updateUserSchema,
} = require("../validations/User/UserValidation.js");
dotenv.config();
//const SECRET = process.env.JWT_SECRET;
const SECRET = "123";
const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT;
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

console.log("at server js",HOST, PORT, USER, PASS);
const User = require("../models/userModel.js");
const Org = require("../models/OrgModel");
const Employee = require("../models/employeeModel");

// hanlde user login
exports.signin = async (req, res) => {
  const { email, password } = req.body || {};

  // Check if email and password are provided
  if (!email || !password)
    return res.status(400).json({ message: "Please enter email and password" });

  try {
    // Find user by email in the database
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    // Compare entered password with hashed password stored in DB
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password credentials" });
    }

    // Generate JWT token with userId, role, and permissions, expires in 1 day
    const accessToken = jwt.sign(
      { userId: user._id, role: [user.role], permissions: user.permissions },
      SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", accessToken, { httpOnly: true });

    // Save generated access token in the user's record
    await User.findByIdAndUpdate(user._id, { accessToken });

    // Handle response differently for Admin users
    if (user.role === "Admin") {
      // Try finding organization by orgEmail matching user's email
      const orgDetails = await Org.findOne({ orgEmail: email });

      if (orgDetails) {
        // Return user info with detailed org info if orgEmail matched
        res.status(200).json({
          data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            department: user.department,
            orgID: orgDetails._id,
            orgEmail: orgDetails.orgEmail,
            orgName: orgDetails.orgName,
            orgPhone: orgDetails.phone,
            orgid: orgDetails._id,
            orgDept: orgDetails.orgDept,
            orgLeadStatus: orgDetails.orgLeadStatus,
            orgLeadStages: orgDetails.orgLeadStages,
          },
          success: true,
          code: 200,
          message: "You have logged in successfully",
          token: accessToken,
        });
      } else {
        // If orgEmail not found, find org by user's orgId and respond
        const orgDetails = await Org.findOne({ _id: user.orgId });
        res.status(200).json({
          data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            permissions: user.permissions,
            department: user.department,
            orgID: orgDetails._id,
            orgName: orgDetails.orgName,
          },
          success: true,
          code: 200,
          message: "You have logged in successfully",
          token: accessToken,
        });
      }
    } else {
      // For non-admin users

      if (user?.orgId) {
        // Find org details by orgId and include them in response
        const orgDetails = await Org.findOne({ _id: user.orgId });
        res.status(200).json({
          data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            permissions: user.permissions,
            department: user.department,
            orgID: orgDetails._id,
            orgName: orgDetails.orgName,
          },
          success: true,
          code: 200,
          message: "You have logged in successfully",
          token: accessToken,
        });
      } else {
        // If user has no orgId, respond with user info only
        res.status(200).json({
          data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            permissions: user.permissions,
            department: user.department,
          },
          success: true,
          code: 200,
          message: "You have logged in successfully",
          token: accessToken,
        });
      }
    }
  } catch (error) {
    // Return error if something unexpected happens
    res.status(404).json({ message: "Something went wrong" });
  }
};

// create new user and new employee record
exports.signup = async (req, res) => {
  try {
    console.log(req.body);
    const result = await signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const data = result.data;
    console.log(data);

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      return res.status(403).json({ message: "User already exist" });
    }

    const emp = new Employee({
      eid: "F" + Math.random(),
      //userid:user._id,
      firstName: data.firstName,
      gender: data.gender,
      dob: data.dob,
      doj: data.doj,
      orgId: data.orgId,
      //dol:req.body.dol,
      designation: data.designation,
      panno: data.panno,
      bankDetails: data.bankDetails,
    });
    await emp.save();
    const user = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone,
      password: data.password,
      // confirmPassword:req.body.confirmPassword,
      orgId: data.orgId,
      permissions: data.permissions,
      eid: emp.eid,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    res.status(201).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      success: true,
      code: 201,
      message: "You have signed up successfully",
      newUser: user,
    });
  } catch (error) {
    console.error(error); // Always log the full error to your server console

    // Check if error.message exists, else fallback to stringified error or generic message
    const errorMessage =
      error?.message || JSON.stringify(error) || "Unknown error";

    res.status(500).json({
      message: "Something went wrong",
      error: errorMessage,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(422).json({ error: "Email is required" });
  }

  try {
    // Verify SMTP connection before sending
    await transporter.verify();

    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(422)
        .json({ error: "User does not exist in our database" });
    }

    // Generate reset token
    const buffer = await new Promise((resolve, reject) => {
      crypto.randomBytes(32, (err, buf) => {
        if (err) reject(err);
        else resolve(buf);
      });
    });
    const token = buffer.toString("hex");

    user.resetToken = token;
    user.expireToken = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send reset email
    const mailOptions = {
      to: user.email,
      from: USER,
      subject: "Password reset request",
      html: `
        <p>You requested for password reset</p>
        <h5>Please click this <a href="https://localhost:5000/reset/${token}">link</a> to reset your password</h5>
        <p>Link not clickable? Copy and paste this URL into your browser:</p>
        <p>https://localhost:5000/reset/${token}</p>
        <p>If this was a mistake, just ignore this email and nothing will happen.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (!info.accepted.includes(user.email)) {
      // Email not accepted by SMTP server
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.json({ message: "Check your email, sent successfully" });
  } catch (error) {
    console.error("Forgot Password error:", error);
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
};

exports.resetPassword = (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try again session expired" });
      }
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword; // bug
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({ message: "password updated success" });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//  get specific user by id
exports.getUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(_id);
    res.status(200).json({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        subRole: user.subRole,
        department: user.department,
        phone: user.phone,
        permissions: user.permissions,
        password: user.password,
        profilePhoto: user.profilePhoto,
      },
      success: true,
      code: 200,
      message: "single user fetch!!",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// get all users
exports.getUserList = async (req, res) => {
  try {
    // Use find to get all users
    const users = await User.find();

    if (!users) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: `No data found`,
      });
    }

    res.status(200).json({
      data: users.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        permissions: user.permissions,
        // Note: Avoid sending sensitive information like passwords in the response
        profilePhoto: user.profilePhoto,
      })),
      success: true,
      code: 200,
      message: "All users fetched!",
    });
  } catch (error) {
    res.status(500).json({ success: false, code: 500, message: error.message });
  }
};

// get organization users
exports.getAllusers = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { email } = req.body; // Get email from request body

    // Fetch the organization using orgId
    const org = await Org.findById(orgId);
    if (!org) {
      return res
        .status(404)
        .json({ message: "Organization not found", data: [] });
    }

    // Check if the requesting email matches the org's admin email
    if (org.orgEmail !== email) {
      return res.status(403).json({
        message: "Not authorized: Only the org owner can access this data",
        data: [],
      });
    }

    // Fetch all users in the org, exclude passwords
    const data = await User.find({ orgId: orgId })
      .select("-password")
      .sort({ _id: -1 });

    res.status(200).json({
      data,
      success: true,
      code: 200,
      message: "All users fetched successfully",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// This function retrieves a list of users from a specific department within a given organization.
// It returns only the users' first names, sorted by most recently created, based on orgId and department provided in the request body.
exports.getUsersByDept = async (req, res) => {
  try {
    const { orgId, department } = req.body;
    const data = await User.find({ orgId: orgId, department: department })
      .select("firstName")
      .sort({ _id: -1 });
    res.status(200).json({
      data: data,
      success: true,
      code: 200,
      message: "all users get here!!",
    });
  } catch (error) {
    res.status(409).json(error.message);
  }
};

// delete user by id
exports.delete = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("   No user with that id. ");
  await User.findByIdAndRemove(_id);

  res.json({ message: "User deleted successfully!" });
};
//update user
exports.updateUser = async (req, res) => {
  const { id: _id } = req.params;
  console.log(req.user);
  if (req.user.userId != _id)
    return res.status(401).json({ message: "Unauthorized" });

  // Check for valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No User with that id.");
  }

  // Validate the update payload using Zod
  const parseResult = updateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parseResult.error.errors,
    });
  }

  try {
    // Only update allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { ...parseResult.data },
      { new: true }
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProfileimage = async (req, res) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    const _id = req.params.id;
    const image = await User.findByIdAndUpdate(
      _id,
      { profilePhoto: url + "/public/user/" + req.file.filename },
      {
        new: true,
      }
    );
    res.status(201).json({
      profilePhoto: image.path,
      code: 201,
      success: true,
      message: "Profile Photo Updated successfully!",
    });
  } catch (error) {
    res.status(400).json({ message: "something went wrong! " });
  }
};

exports.email = async (req, res) => {
  const { userName, from, to, link } = req.body;
  if (!userName || !from || !to || !link)
    return res.status(400).json({ message: "All fields are required" });
  try {
    // create reusable transporter object using the default SMTP transport

    // send mai with defined transport object
    const htmlContent = `
    <div style="width: 100%; color: #000; background: #fff; padding: 2rem; margin-top: 0; display: flex; justify-content: center; align-items: center">
      <div style="width: 40%; margin-left: 25%; border: 1px solid #c8c9ca; padding: 2rem ">
        <div style="text-align: center">
          <h1 style="text-align: center; color: #000; font-weight: 900 ">CRM</h1>
          <p style="font-size: 18px;padding-top: 0; padding: 1rem; border-bottom: 1px solid #c8c9ca">
            ${userName} has invited you to join <span style="font-size: 20px; margin: 0; padding: 0; font-weight: 600 ">CRM</span>
          </p>
          <p style="margin: 1rem auto; margin-top: 1rem; font-size: 13px">
            We're thrilled to invite you to join our 
            <span style="margin: 0; padding: 0; color: blue">CRM</span>,
            designed to supercharge our team collaboration and streamline our workflow.
          </p>
          <a href=${link} style="display: inline-block; color: #fff; background:blue; border-radius: 5px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 1rem auto; padding: 6px 12px ">
            View Invitation
          </a>
          <p style="margin: 1rem auto; font-size: 13px; padding-bottom: 2rem; border-bottom: 1px solid #c8c9ca">
            We believe that by embracing our platform, we can take our
            collaboration and efficiency to new heights. This is an exciting step forward for our team, and we're
            eager to have you on board.
          </p>
          <div style="font-size: 12px; width: 100%; text-align: left">
            <span style="margin: 0; padding: 0; color: #000; font-weight: 600">Note: </span>
            <p style="display: inline "> This invitation was intended for
              <span style="margin: 0; padding: 0; color: blue"; text-decoration: none; font-weight: 600>${to}</span>.
              If you were not expecting this invitation, you can ignore this email.
            </p>
          </div>
          <div style="font-size: 12px; width: 100%; text-align: left; margin-top: 1rem">
            <span style="margin: 0; padding: 0; color: gray; font-weight: 600">Button not working? :</span>
            <p style="display: inline; color: gray">Copy and paste this link to your browser:</p>
            <p style="color: blue, margin-top: 0.5rem">
              <a href=${link} target="_blank">${link}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
`;
    const mailOption = {
      from: `${userName} <${from}>`,
      to: `${to}`,
      subject: `${userName} sent invitation to join CRM ✔`,
      text: "Hello to myself!",
      html: htmlContent,
      // "<p><b>Hello</b> to myself friendly! <button>invitation Accept </button></p>",
    };
    await transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        // return process.exit(1);
        return res
          .status(404)
          .json({ Message: "Error occurred. " + err.message });
      } else {
        return res.status(201).json({ Message: `Invitation sent to: ${to}` });
      }
    });
  } catch (error) {
    return (message = { error: error.message });
  }
};
