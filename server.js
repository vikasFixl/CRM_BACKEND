import express from "express";

import bodyParser from "body-parser";
import path from "path";

import paypal from "paypal-rest-sdk";
import cors from "cors";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

import fileUpload from "express-fileupload";
import { connectDB } from "./config/db.config.js";

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
import BillingRoutes from "./src/routes/HRM/BillingRoute.js"
import RoleRoutes from "./src/routes/rolepermissionroute.js"

// PayPal config
paypal.configure({
  mode: "sandbox",
  client_id:
    "AaWQSsw8-Pf15jr3lZZ2gcGjn3XZHk9_OdJgDI5AKODcy18_Gw-3pOVHOxVTNwfWLj5jFOLzmeHiDSf7",
  client_secret:
    "EFl7mXSY6pm8Z-cWHdJaEGKkZspJl7kOLDmixxyvaylsSrrunpdC8u9YZWO0bHKBWfLwOdNhtld-0L0w",
});

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(
  {
    origin:  "http://localhost:5173",
    credentials: true
  }
));
app.use(express.json());
app.use(cookieParser());

// ✅ Active route
app.use("/api/auth", userRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/billingplan", BillingRoutes);
app.use("/api/role", RoleRoutes);
/**
 * 
app.use("/api/invoice", invoiceRoutes);
app.use("/api/purchase", purchesRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/firm", firmRoutes);
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

async function startServer() {
  try {
    await connectDB(); // Wait for DB connection
    app.listen(PORT, () => {
      console.log(`✅ Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Exit process on DB failure
  }
}

startServer();
app.get("/", (req, res) => {
  res.send("server running");
})

// Global error handlers
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
});

process.on("uncaughtException", (err, origin) => {
  console.log("Uncaught Exception at:", origin, "error:", err);
});
