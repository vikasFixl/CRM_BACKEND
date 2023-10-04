const mongoose = require('mongoose');

const appSettingSchema = new mongoose.Schema(
  {
    company_name: String,
    tag_line: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    footer: String,
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const AppSetting = mongoose.model('AppSetting', appSettingSchema);

module.exports = AppSetting;
