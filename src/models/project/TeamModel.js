import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    membersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ Indexes
TeamSchema.index({ workspaceId: 1, name: 1 }, { unique: true });
TeamSchema.index({ slug: 1 }, { unique: true });
TeamSchema.index({ isDeleted: 1 });

/** Slug Generator */
TeamSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    let slug = baseSlug;
    let count = 1;

    const Team = mongoose.models.Team || mongoose.model("Team");
    while (await Team.exists({ slug, isDeleted: false })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
  next();
});

export const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
