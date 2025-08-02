const supportOrgSessionSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true }, // hash of JWT
  supportAgent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  impersonatedOrgUser: { type: Schema.Types.ObjectId, ref: 'User' },
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
});
