import mongoose from "mongoose";
import { connectDB } from "../../config/db.config.js";
import { RolePermission } from "../models/RolePermission.js"; // Adjust if your export differs
import { ROLES, ROLE_SCOPES_MAP } from "../enums/role.enums.js";
import { rolepermission } from "../utils/role-permission.js";

import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
console.log(process.env.Mongo_URI);

const seedRoles = async () => {
  console.log("🌱 Seeding roles started...");
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await RolePermission.deleteMany({});
    for (const role of Object.values(ROLES)) {
      const permissions = rolepermission[role] || [];
      const scope = ROLE_SCOPES_MAP[role] || ROLE_SCOPE.ORGANIZATION;

      const permissionDoc = {
        role,
        name: role,
        scope,
        isCustom: false,
        permissions: permissions.map(({ module, actions }) => ({
          module,
          actions,
        })),
      };

      // 🛡️ Use upsert to update if exists, or insert if not
      await RolePermission.findOneAndUpdate(
        { role: role },
        permissionDoc, // Use permissionDoc instead of undefined 'update'
        {
          session,
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`✅ Role '${role}' seeded/updated.`); // Use role instead of roleName
    }

    await session.commitTransaction();
    session.endSession();
    console.log("✅ Role seeding completed.");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error seeding roles:", error.message);
    process.exit(1); // Exit with failure
  } finally {
    mongoose.disconnect(); // Ensure mongoose connection is closed
  }
};


seedRoles();