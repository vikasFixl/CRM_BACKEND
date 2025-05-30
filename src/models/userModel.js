import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// Define the predefined permissions for specific roles

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 1 },
    lastName: { type: String, required: true, trim: true, minlength: 1 },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true, minlength: 10 },
    avatar: {
      url: { type: String, trim: true },
      public_id: { type: String, trim: true },
    },

    organizations: [
      {
        org: {
          type: Schema.Types.ObjectId,
          ref: "Organization",
          index: true,
        },
        // help us to log the last logged org
        CurrentActive: { type: Boolean, default: true },
        role: {
          type: String,
          enum: ["OrgAdmin", "Manager", "SupportAgent", "User", "Custom"],
          default: "User",
        },
        employeeId: {
          type: String, // Or Number
          required: true,
        },
        token: {
          type: String,
          required: true,
        },
        permissions:{
          type:[Object],
          
          // default: [],
        },
        jobTitle: { type: String, trim: true }
      },
    ],
    uuid: { type: String, required: true, unique: true, trim: true, immutable: true,select: false },

 
    role: {
      type: String,
      enum: ["SuperAdmin", "User"],
      required: false,
      default: "User",
    },
    // contactInfo: {
    //   address: { type: String, trim: true },
    //   city: { type: String, trim: true },
    //   state: { type: String, trim: true },
    //   zip: { type: String, trim: true },
    //   country: { type: String, trim: true },
    // },
     isSuspended: { type: Boolean, default: false,select: false },
  
    resetPasswordToken: {
      type: String,
      default: null,
     
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
     
      
    },
    hasReceivedWelcomeEmail: {
      type: Boolean,
      default: false,
    },
    isActive: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0, maxLength: 5 ,},
    lockUntil: { type: Date },
    deletedAt: { type: Date,select: false },
    
    isDeleted: { type: Boolean, default: false,select: false },

  },

  { timestamps: true }
);

// Unique email per organization
UserSchema.index({ email: 1, organizations: 1 }, { unique: true });

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
