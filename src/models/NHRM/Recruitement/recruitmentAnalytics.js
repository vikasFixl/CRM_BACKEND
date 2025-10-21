import mongoose from 'mongoose';
const { Schema } = mongoose;

const recruitmentAnalyticsSchema = new Schema({
    jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
    totalApplicants: { type: Number, default: 0 },
    totalInterviews: { type: Number, default: 0 },
    totalOffers: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 },
    averageTimeToHire: { type: Number, default: 0 },
    offerConversionRate: { type: Number, default: 0 },
    hireConversionRate: { type: Number, default: 0 },
    sourceBreakdown: {
        LinkedIn: { type: Number, default: 0 },
        Referral: { type: Number, default: 0 },
        Other: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

recruitmentAnalyticsSchema.index({ jobPosting: 1 });

export const RecruitmentAnalytics = mongoose.model('RecruitmentAnalytics', recruitmentAnalyticsSchema);