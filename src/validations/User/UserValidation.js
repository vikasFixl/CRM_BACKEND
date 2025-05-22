const z = require("zod");

module.exports.signupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string(),
  department: z.string().optional(),
  phone: z.string().optional(),
  orgId: z.string().optional(),
  permissions: z.array(z.string()).optional(),

  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dob: z.string().optional(),
  doj: z.string().optional(),
  designation: z.string().optional(),
  panno: z.string().optional(),
  bankDetails: z.object({
    accountNo: z.string(),
    ifsc: z.string(),
  }).optional(),
});

// And for updateUserSchema (uncommented and exported)
module.exports.updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(["active", "inactive", "deleted"]).optional(),
});
