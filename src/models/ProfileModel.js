const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: Number, required: true },
  businessName: { type: String, required: true },
  contactAddress: { type: String, required: true },
  paymentDetails: { type: String },
  logo: { type: String, required: true },
  website: { type: String, required: true },
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
