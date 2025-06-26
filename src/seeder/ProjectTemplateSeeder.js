// seed/projectTemplatesSeeder.js

import mongoose from "mongoose";
import { ProjectTemplate } from "../models/project/ProjectTemplateModel.js";
import {Templates} from '../utils/projecttemplates.js'

import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://cubicle_crm:crm123@cluster0.gkuhyji.mongodb.net/CRMpROD",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
};



const seedTemplates = async () => {
  try {
    await connectDB();

    for (const template of Templates) {
      const exists = await ProjectTemplate.findOne({ name: template.name });
      if (!exists) {
        await ProjectTemplate.create(template);
        console.log(`✅ Seeded: ${template.name}`);
      } else {
        console.log(`⚠️ Already exists: ${template.name}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding templates:", err);
    process.exit(1);
  }
};

seedTemplates();
