import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 1 },
    lastName: { type: String, trim: true, },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: v =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(v),
        message: () => `Password must be strong: min 8 characters, include upper/lowercase, number & special character`
      }
    },
    phone: { type: String, required: true, trim: true },
    avatar: {
      url: { type: String, trim: true, default: "https://res.cloudinary.com/dnctmzmmx/image/upload/v1750401124/user/rvblg8czxgpg9qtap3rv.webp" },
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
    currentWorkspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
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
    // Fields for 2FA
    twoFAEnabled: { type: Boolean, default: false },
    twoFASecret: { type: String, select: false },
    // Fields for OTP login
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    // Fields for multi-device management
    primaryDevice: { type: String, select: false },
    userType: {
      type: String,
      enum: ["orgUser", "supportAgent", "platformAdmin", "guestUser", "automationBot","auditor","partner","platformstaff"],

      required: true,
      default: "orgUser",
      index: true,
    },
    supportAccess: {
      type: Boolean,
      default: false, // User must explicitly enable this
    },

    supportPasskey: {
      token: { type: String },
      expiresAt: { type: Date, index: { expires: '60s' } },
      createdAt: { type: Date, default: Date.now },
      select: false
    },

  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
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
