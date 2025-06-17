// models/ActivityModel.js
import mongoose from "mongoose";

// Predefined allowed modules and actions
const allowedModules = ["organization", "firm", "lead", "invoice", "client"];
const allowedActivities = ["create", "update", "delete", "view", "assign", "share","restore"];

const ActivitySchema = new mongoose.Schema(
  {
   
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    module: {
      type: String,
      enum: allowedModules,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    activity: {
      type: String,
      enum: allowedActivities,
      required: true,
    },
    activityDesc: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
ActivitySchema.index({ orgId: 1, module: 1, entityId: 1, activity: 1 }, { unique: false });
const ActivityModel = mongoose.model("Activity", ActivitySchema);
export default ActivityModel;
