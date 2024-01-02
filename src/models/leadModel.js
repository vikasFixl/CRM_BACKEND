const mongoose = require("mongoose");
const LeadSchema = new mongoose.Schema(
  {
    clientFName: { type: String },
    clientLName: { type: String },
    clientEmail: { type: String },
    clientPhone: { type: String },
    clientAddress: {
      lineOne: { type: String },
      lineTwo: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      code: { type: String },
    },
    timezone: { type: String },
    stage: { type: String },
    stageHistory: [{
      stageName: { type: String },
      days: { type: Number },
      startDate: { type: String },
      endDate: { type: String }
    }],
    currency: { type: String },
    estimatedWorth: { type: String },
    createdDate: { type: String },
    title: { type: String },
    closureDate: { type: String },
    pipeline: {
      department: { type: String },
      userType: { type: String },
    },
    leadManager: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
      managerName: {type: String}
    },
    assignedTo: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: { type: String }
    },
    status: { type: String },
    orgDetails: {
      orgName: { type: String },
      orgEmail: { type: String },
      orgPhone: { type: String },
      orgAddress: {
        orgLineOne: { type: String },
        orgLineTwo: { type: String },
        orgCountry: { type: String },
        orgState: { type: String },
        orgCity: { type: String },
        orgCode: { type: String },
      },
    },
    description: { type: String },
    delete: {
      type: Boolean,
      default: false,
    },
    randomLeadId: { type: Number },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firm: {
      firmName: { type: String },
      firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" }
    },
    firmName: { type: String }
  },
  {
    timestamps: true,
  }
);

LeadSchema.pre("save", async function (next) {
  try {
    const orgId = this.orgId;
    const org = await mongoose.model("ORG").findById(orgId);
    if (org && org.orgLeadStages && org.orgLeadStages.length > 0) {
      this.stageHistory = org.orgLeadStages.map((stage, index) => ({
        stageName: stage?.stageName,
        days: stage?.days,
        startDate: index === 0 ? new Date().toISOString() : '',
        endDate: '',
      }));
    } else {
      this.stageHistory = [];
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("LEAD", LeadSchema);
