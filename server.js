import express from "express";

import bodyParser from "body-parser";
import path from "path";

import paypal from "paypal-rest-sdk";
import cors from "cors";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import { rateLimit } from "./src/middleweare/ratelimitter.js";
import { connectDB } from "./config/db.config.js";
import { startUserCleanupCron } from "./src/automation/UserDeleteAutomation.js";
import { globalLimiter } from "./src/middleweare/ratelimitter.js";


// const invoiceRoutes = require("./src/routes/invoiceRoute");
// const clientRoutes = require("./src/routes/clientRoute");
// const profileRoutes = require("./src/routes/profileRoute");
// const firmRoutes = require("./src/routes/firmRoute");
// const taxRoutes = require("./src/routes/taxRoutes");
// const orgRoutes = require("./src/routes/orgRoute");
// const productRoutes = require("./src/routes/productRoutes.js");
// const leadRoutes = require("./src/routes/leadRoute");
// const leadActivityRoutes = require("./src/routes/leadActivityRoute");
// const activitRoutes = require("./src/routes/activityRoute.js");

// const searchRoutes = require("./src/routes/searchRoute");
// const roleRoutes = require("./src/routes/roleNpermissionRoute");
// const attendenceRoutes = require("./src/routes/empAttendenceRoute");
// const dedRoutes = require("./src/routes/dedRoute");
// const salRoutes = require("./src/routes/salRoute");
// const employeeRoutes = require("./src/routes/empRoute");
// const vendorRoutes = require("./src/routes/vendorRoutes");
// const purchesRoutes = require("./src/routes/purchesRoute.js");
// const Subscription = require("./src/routes/subscriptionRoute.js");
// const Reminder = require("./src/routes/reminderRoute.js");
// const appRouter = require("./src/routes/HRM/mainRoutes.js");

// ES Module replacements for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, "./.env") });

// ✅ Import only user route
import userRoutes from "./src/routes/userRoute.js";
import orgRoutes from "./src/routes/orgRoute.js";
import BillingRoutes from "./src/routes/HRM/BillingRoute.js";
import RoleRoutes from "./src/routes/rolepermissionroute.js";
import firmRoutes from "./src/routes/firmRoute.js";
import LeadRouter from "./src/routes/leadRoute.js";
import { runWelcomeEmail } from "./src/automation/sendwelcomeEmail.js";

// PayPal config
paypal.configure({
  mode: "sandbox",
  client_id:
    "AaWQSsw8-Pf15jr3lZZ2gcGjn3XZHk9_OdJgDI5AKODcy18_Gw-3pOVHOxVTNwfWLj5jFOLzmeHiDSf7",
  client_secret:
    "EFl7mXSY6pm8Z-cWHdJaEGKkZspJl7kOLDmixxyvaylsSrrunpdC8u9YZWO0bHKBWfLwOdNhtld-0L0w",
});
const isprod=process.env.NODE_ENV === "production";


const app = express();
const PORT = process.env.PORT || 5001;
app.set("trust proxy", isprod); // or true


// File upload configuration
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Max file size: 50MB
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// cors configuration
app.use(
  cors({
    origin:"https://cubicle-crm.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
// parse cookies
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
// request logger middleware
app.use((req, res, next) => {
  console.log(`Request hit: ${req.method} ${req.originalUrl}`);

  if (Object.keys(req.params).length > 0) {
    console.log("Request params:", req.params);
  }

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body:", req.body);
  }

  next();
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});
app.use((req, res, next) => {
  console.log("Client IP:", req.ip);
  next();
});
// ✅ Active route
app.use("/api/auth", globalLimiter, userRoutes);
app.use("/api/organization", globalLimiter, orgRoutes);
app.use("/api/billingplan", BillingRoutes);
app.use("/api/role", RoleRoutes);
app.use("/api/firm", firmRoutes);
app.use("/api/lead", LeadRouter);
/**
 * 
app.use("/api/invoice", invoiceRoutes);
app.use("/api/purchase", purchesRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/taxRates", taxRoutes);
app.use("/api/product", productRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/leadActivity", leadActivityRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/attendence", attendenceRoutes);
app.use("/api/ded", dedRoutes);
app.use("/api/sal", salRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/subscription", Subscription);
app.use("/api/Reminder", Reminder);
app.use("/api/hrm", appRouter);
app.use("/api/activities", activitRoutes);
*/

// Start the server
const startserver= async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server started on port ${PORT}`);
    })
    await connectDB();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}
 
startserver();
startUserCleanupCron(); //background task/cron job
runWelcomeEmail();

// health check route
app.get("/", (req, res) => {
  res.send("server running");
});
// global 404 handler
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
// global error handler

// Global error handlers
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
});

process.on("uncaughtException", (err, origin) => {
  console.log("Uncaught Exception at:", origin, "error:", err);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log("Uncaught Exception Monitor at:", origin, "error:", err);
});
