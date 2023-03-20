const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
// const SECRET = process.env.JWT_SECRET;
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
    const accessToken = jwt.sign({ userId: user._id }, {
      expiresIn: "1d",
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    if (user.role === "Admin") {
      const orgDetails = await Org.findOne({ orgEmail: email });
      //console.log(orgDetails);
      res.status(200).json({
        data: {
          orgID: orgDetails._id,
          orgEmail: orgDetails.orgEmail,
          orgName: orgDetails.orgName,
          orgPhone: orgDetails.phone,
          orgid: orgDetails._id,
          role: user.role,
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
  const form = req.body;
  const { email } = req.body;
  try {
    const url = req.protocol + '://' + req.get('host')
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(403).json({ message: "User already exist" });
    const emp=new Employee({
        eid:"F"+Math.random(),
        //userid:user._id,
        gender:req.body.gender,
        dob:req.body.dob,
        doj:req.body.doj,
        //dol:req.body.dol,
        designation:req.body.designation,
        panno:req.body.panno,
        bankDetails:req.body.bankDetails
    })
    await emp.save();
    const user = new User({
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
      role:req.body.role,
      department:req.body.department,
      phone:req.body.phone,
      password:req.body.password,
      permissions:req.body.permissions,
      profilePhoto:url + '/public/user/' + req.file.filename,
      eid:emp.eid
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    res.status(201).json({
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
    const userAll = await User.find({}).select("-password").sort({ _id: -1 });
    res.status(200).json({
      data: userAll,
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

exports.updateProfileimage=async(req,res)=>{
  try {
    const url = req.protocol + '://' + req.get('host')
    const _id=req.params.id;
    const image=await User.findByIdAndUpdate(_id,{profilePhoto:url + '/public/user/' + req.file.filename},{
      new:true
    })
    res.status(201).json({
      "profilePhoto":image.path,
      code: 201,
      success: true,
      message: "Profile Photo Updated successfully!",
    })
  } catch (error) {
    res.status(400).json({ message: "something went wrong! " });
  }
}
