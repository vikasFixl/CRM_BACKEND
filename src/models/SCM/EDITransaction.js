import mongoose, { Schema } from "mongoose";

const EDITransactionSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ["850", "855", "856", "810"],
      required: true,
    },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String, trim: true },
    status: { type: String, trim: true, default: "created" },
    payload: { type: Schema.Types.Mixed },
    direction: { type: String, enum: ["outbound", "inbound"], required: true },
  },
  { timestamps: true }
);

EDITransactionSchema.index({ organizationId: 1, createdAt: -1 });
EDITransactionSchema.index({ organizationId: 1, documentType: 1 });

export const EDITransaction = mongoose.model("SCMEDITransaction", EDITransactionSchema);

