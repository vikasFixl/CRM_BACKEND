import mongoose from "mongoose";
import { generateInviteCode } from "../../utils/helperfuntions/generateInviteCode.js";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      required: true,
      default: generateInviteCode,
     match: /^[a-zA-Z0-9]{6,12}$/  // allows 6–12 chars, mixed case
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional to avoid update errors
    },

    // Optional future-proofing
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    type: {
      type: String,
      enum: [
        "general",
        "engineering",
        "product",
        "design",
        "marketing",
        "sales",
        "support",
        "finance",
        "hr",
        "operations",
        "qa",
        "legal",
        "growth",
        "data",
        "devops",
        "management",
      ],
      default: "general",
    },
  },
  { timestamps: true }
);

/** Indexes */
workspaceSchema.index({ orgId: 1 });
workspaceSchema.index({ orgId: 1, name: 1 }, { unique: true });
workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ isDeleted: 1 });

/** Slug generator */
workspaceSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    let slug = baseSlug;
    let count = 1;

    const Workspace = mongoose.models.Workspace || mongoose.model("Workspace");
    while (await Workspace.exists({ slug, isDeleted: false })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
  next();
});

/** Regenerate invite code method */
workspaceSchema.methods.generateInviteCode = async function () {
  this.inviteCode = generateInviteCode();
  return this.save();
};

/** Export model */
export const Workspace =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
