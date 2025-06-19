import mongoose from "mongoose";

const taxRateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "GST", "Service Tax"
    rate: { type: Number, required: true }, // e.g., 5, 18
    description: { type: String }, // Optional: tax description
    isEnabled: { type: Boolean, default: true }, // Soft-delete support
  },

);

const taxSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      default: null,
      
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    isGlobal: { type: Boolean, default: false }, // true = global tax
    taxRates: {
      type: [taxRateSchema],
      validate: [(v) => v.length > 0, "At least one tax rate is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TaxRates = mongoose.model("TaxRates", taxSchema);
export default TaxRates;
