const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    module: { type: [String], require: true },
    entityId: { type: [String], require: false },
    activity: { type: String, require: false },
    activityDesc: { type: String, require: false },
    createdDate: { type: String, require: true },
    createdTime: { type: String, require: true },
    userId: { type: String, require: false }
  },
);
const ActivityModel = mongoose.model("ActivityModel", ActivitySchema);

module.exports = ActivityModel;
