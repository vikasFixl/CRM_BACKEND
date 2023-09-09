const Org = require("../models/OrgModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getOrgData = async (req, res) => {
  try {
    const data = await Org.findById(req.params.id);
    if (data === null) {
      res.json({
        success: true,
        message: "Data not found.",
        status: 200,
      });
    } else if (data.length === 0) {
      res.json({
        success: true,
        message: "Org data not found.",
        status: 200,
      });
    } else {
      res.json({
        data: data,
        success: true,
        message: "Org Data.",
        status: 200,
      });
    }
  } catch (err) {
    // console.log(err);
    res.json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};
exports.getOrgDeprt = async (req, res) => {
  try {
    const data = await Org.findById(req.params.id);
    if (data === null) {
      res.json({
        success: true,
        message: "Data not found.",
        status: 200,
      });
    } else if (data.length === 0) {
      res.json({
        success: true,
        message: "Org data not found.",
        status: 200,
      });
    } else {
      res.json({
        data: data.orgDept,
        success: true,
        message: "Org Data.",
        status: 200,
      });
    }
  } catch (err) {
    res.json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};
exports.updateOrgData = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Org.findById(id);
    if (data === null) {
      res.json({
        success: true,
        status: 404,
        message: "Org not found!",
      });
    } else {
      const updatedData = req.body;
      const options = { new: true };
      await Org.findByIdAndUpdate(id, updatedData, options);
      res.json({
        success: true,
        status: 201,
        message: "Org Updated Successfully.",
      });
    }
  } catch (err) {
    res.json({
      message: "Something went wrong!",
      status: 400,
      success: false,
    });
  }
};
exports.addOrg = async (req, res) => {
  try {
    // const url = req.protocol + '://' + req.get('host')
    const data = req.body;
    const emailChk = req.body.orgEmail;
    const chkEmail = await Org.findOne({ orgEmail: emailChk });
    console.log("chkEmail", chkEmail);
    if (!chkEmail) {
      try {
        const org = new Org({
          orgName: data.orgName,
          orgEmail: data.orgEmail,
          orgPhone: data.orgPhone,
        });
        try {
          const updatedUser = await User.findOneAndUpdate(
            { email: emailChk },
            { $set: { orgId: org._id } },
            { new: true } // This option returns the updated document
          );
        
          if (updatedUser) {
            console.log("Updated user:", updatedUser);
            // Handle success here
          } else {
            console.log("User not found.");
            // Handle the case where the user was not found
          }
        } catch (error) {
          console.error("Error updating user:", error);
        }
        
        await org.save();
        // await user.save();
        res.json({
          data: org,
          success: true,
          message: "Org saved successfully",
          status: 201,
        });
      } catch (err) {
        console.log(err);
        res.json({
          message: "Someting went wrong!!!",
          status: 400,
          success: false,
        });
      }
    } else {
      res.json({
        message: `Org with ${emailChk} already in DB.`,
        status: 400,
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Someting went wrong!",
      status: 400,
      success: false,
    });
  }
};
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await Org.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password credentials" });
    }
    const accessToken = jwt.sign(
      { orgId: existingUser._id },
      existingUser.orgName,
      existingUser.orgEmail,
      {
        expiresIn: "1d",
      }
    );
    await User.findByIdAndUpdate(existingUser._id, { accessToken });
    res.status(200).json({
      data: {
        id: existingUser._id,
        email: existingUser.orgEmail,
        Name: existingUser.orgName,
        phone: existingUser.phone,
      },
      success: true,
      code: 200,
      message: "You have logged in successfully",
      token: accessToken,
    });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

exports.logo = async (req, res) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    const _id = req.params.id;
    const image = await Org.findByIdAndUpdate(
      _id,
      { orgLogo: url + "/public/org/" + req.file.filename },
      {
        new: true,
      }
    );
    res.status(201).json({
      orgLogo: image.path,
      code: 201,
      success: true,
      message: "logo Updated successfully!",
    });
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong! " });
  }
};
