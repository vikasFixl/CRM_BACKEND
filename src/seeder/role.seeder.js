import mongoose from "mongoose";
import { connectDB } from "../../config/db.config.js";
import { RolePermission } from "../models/RolePermission.js"; // Adjust if your export differs
import { ROLES } from "../enums/role.enums.js";
import { rolepermission } from "../utils/role-permission.js";
import dotenv from "dotenv";

dotenv.config({path:'../../.env'});
// console.log(process.env.Mongo_URI);
const seedRoles = async () => {
  console.log("🌱 Seeding roles started...");
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const roleName of Object.values(ROLES)) {
      const permissions = rolepermission[roleName] || [];

      const update = {
        
        role: roleName,
        permissions: permissions.map(({ module, actions }) => ({
          module,
          actions,
        })),
      };

      // 🛡️ Use upsert to update if exists, or insert if not
      await RolePermission.findOneAndUpdate(
        { role: roleName },
        update,
        {
          session,
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`✅ Role '${roleName}' seeded/updated.`);
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
