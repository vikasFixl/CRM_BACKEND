const mongoose = require('mongoose');

const awardHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    award: { type: mongoose.Schema.Types.ObjectId, ref: 'Award' },
    awardedDate: Date,
    comment: String,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const AwardHistory = mongoose.model('AwardHistory', awardHistorySchema);

module.exports = AwardHistory;
