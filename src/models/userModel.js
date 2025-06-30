import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 1 },
    lastName: { type: String, required: true, trim: true, minlength: 1 },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true, minlength: 10,required: true },
    avatar: {
      url: { type: String, trim: true ,default:"https://res.cloudinary.com/dnctmzmmx/image/upload/v1750401124/user/rvblg8czxgpg9qtap3rv.webp"},
      public_id: { type: String, trim: true },
    },

    uuid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
      select: false,
    },

    // System-wide role (if needed, not organization specific)
    Globalrole: {
      type: String,
      enum: ["SuperAdmin", "None"],
      default: "None",
    },
    currentOrganization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      default: null,
    },
    isSuspended: { type: Boolean, default: false, select: false },

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    hasReceivedWelcomeEmail: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0, maxLength: 5 },
    lockUntil: { type: Date },
    deletedAt: { type: Date, select: false },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
