import mongoose from "mongoose";
import { connectDB } from "../../config/db.config.js";
import { RolePermission } from "../models/RolePermission.js"; // Adjust if your export differs
import { ROLES } from "../enums/role.enums.js";
import { rolepermission } from "../utils/role-permission.js";

const seedRoles = async () => {
  console.log("🌱 Seeding roles started...");
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Deleting all roles...");
    await RolePermission.deleteMany({}, { session });
    console.log("✅ All roles deleted.");

    for (const roleName of Object.values(ROLES)) {
      const exists = await RolePermission.findOne({ role: roleName }).session(
        session
      );
      if (exists) {
        console.log(`⚠️ Role '${roleName}' already exists. Skipping...`);
        continue;
      }

      // Use the permissions array from rolepermission config
      const permissions = rolepermission[roleName] || [];

      // Construct new RolePermission doc
      const newRole = new RolePermission({
        role: roleName,
        permissions: permissions.map(({ module, actions }) => ({
          module,
          actions,
        })),
      });

      await newRole.save({ session });
      console.log(`✅ Role '${roleName}' created.`);
    }

    await session.commitTransaction();
    session.endSession();
    console.log("✅ Role seeding completed.");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error seeding roles:", error.message);
  }
};

seedRoles();
