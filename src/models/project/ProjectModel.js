import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
   
    //   type: String,
    //   required: true,
    //   trim: true,
    //   uppercase: true,
    //   match: /^[A-Z0-9]{2,10}$/, // Optional strict project key format
    // },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["kanban", "scrum", "bug-tracking", "general"],
      default: "general",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["private", "workspace", "public"],
      default: "public",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectTemplate",
     
    },
  },
  { timestamps: true }
);

/** Unique key within a workspace */
ProjectSchema.index({ workspace: 1, key: 1 }, { unique: true });

/** Slug generator */
ProjectSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    let slug = baseSlug;
    let count = 1;

    const Project = mongoose.models.Project || mongoose.model("Project");
    while (await Project.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
  next();
});

export const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
