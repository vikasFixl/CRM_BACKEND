const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
//const SECRET = process.env.JWT_SECRET;
const SECRET = "123";
const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT;
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

const User = require("../models/userModel.js");
const Org = require("../models/OrgModel");
const Employee = require("../models/employeeModel");

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password credentials" });
    }
    const accessToken = jwt.sign(
      { userId: user._id, role: [user.role], permissions: user.permissions },
      SECRET,
      {
        expiresIn: "1d",
      }
    );
    await User.findByIdAndUpdate(user._id, { accessToken });
    if (user.role === "Admin") {
      const orgDetails = await Org.findOne({ orgEmail: email });
      console.log(orgDetails);
      if (orgDetails) {
        res.status(200).json({
          data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            // permissions: user.permissions,
            department: user.department,
            // profilePhoto: url + "/public/user/" + req.file.filename,
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
            // profilePhoto: url + "/public/user/" + req.file.filename,
          },
          success: true,
          code: 200,
          message: "You have logged in successfully",
          token: accessToken,
        });
      }
    } else {
      res.status(200).json({
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          permissions: user.userPermissions,
          department: user.department,
        },
        success: true,
        code: 200,
        message: "You have logged in successfully",
        token: accessToken,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

exports.signup = async (req, res) => {
  const { form } = req.body;
  const { email } = req.body;
  console.log("body", req.body);
  try {
    const url = req.protocol + "://" + req.get("host");
    const existingUser = await User.findOne({ email });
    if (req.body.password != req.body.confirmPassword) {
      return res.status(403).json({ message: "Password does not match" });
    }
    else if (existingUser) { return res.status(403).json({ message: "User already exist" }); }

    const emp = new Employee({
      eid: "F" + Math.random(),
      //userid:user._id,
      firstName: req.body.firstName,
      gender: req.body.gender,
      dob: req.body.dob,
      doj: req.body.doj,
      orgId: req.body.orgId,
      //dol:req.body.dol,
      designation: req.body.designation,
      panno: req.body.panno,
      bankDetails: req.body.bankDetails,
    });
    await emp.save();
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      department: req.body.department,
      phone: req.body.phone,
      password: req.body.password,
      // confirmPassword:req.body.confirmPassword,
      orgId: req.body.orgId,
      permissions: req.body.permissions,
      eid: emp.eid,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    res.status(201).json({
      "firstName": user.firstName,
      "lastName": user.lastName,
      "email": user.email,
      "role": user.role,
      success: true,
      code: 201,
      message: "You have signed up successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Something went wrong" });
  }
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  // NODEMAILER TRANSPORT FOR SENDING POST NOTIFICATION VIA EMAIL
  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: true,
    auth: {
      user: USER,
      pass: PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "User does not exist in our database" });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user
        .save()
        .then((result) => {
          transporter.sendMail({
            to: user.email,
            from: process.env.USER,
            subject: "Password reset request",
            html: `
                    <p>You requested for password reset</p>
                    <h5>Please click this <a href="https://localhost:500/reset/${token}">link</a> to reset your password</h5>
                    <p>Link not clickable?, copy and paste the following url in your address bar.</p>
                    <p>https://localhost:5000/reset/${token}</p>
                    <P>If this was a mistake, just ignore this email and nothing will happen.</P>
                    `,
          });
          res.json({ message: "check your email, sent successfully" });
        })
        .catch((err) => console.log(err));
    });
  });
};

exports.resetPassword = (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try again session expired" });
      }
      bcrypt.hash(newPassword, 12).then(() => {
        user.password = hashedpassword;
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
        department: user.department,
        phone: user.phone,
        permissions: user.permissions,
        password: user.password,
      },
      success: true,
      code: 200,
      message: "single user fetch!!",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.getAllusers = async (req, res) => {
  try {
    const { orgId } = req.params;
    const data = await User.find({ orgId: orgId })
      .select("-password")
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

exports.delete = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("   No user with that id. ");
  await User.findByIdAndRemove(_id);

  res.json({ message: "User deleted successfully!" });
};

exports.updateUser = async (req, res) => {
  const { id: _id } = req.params;
  const user = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No User with that id. ");
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { ...user, _id },
    { new: true }
  );
  res.json(updatedUser);
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
  console.log("res", userName);
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "msc.manishchoudhary@gmail.com",
        pass: "zdvgzwmkrxxamwzb",
      },
    });
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
        console.log("Error occurred. " + err.message);
        // return process.exit(1);
        return res
          .status(404)
          .json({ Message: "Error occurred. " + err.message });
      } else {
        console.log("Message sent: %s", info);
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return res.status(201).json({ Message: `Invitation sent to: ${to}` });
      }
    });
  } catch (error) {
    return (message = { error: error.message });
  }
};
