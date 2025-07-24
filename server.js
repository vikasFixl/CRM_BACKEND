// server.js

import express from "express";
import geoip from 'geoip-lite';
import bodyParser from "body-parser";
import path, { dirname } from "path";
import paypal from "paypal-rest-sdk";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import { rateLimit, globalLimiter } from "./src/middleweare/ratelimitter.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.config.js";
import { startUserCleanupCron } from "./src/automation/UserDeleteAutomation.js";
import jwt from "jsonwebtoken";
import { runWelcomeEmail } from "./src/automation/sendwelcomeEmail.js";
import { errorHandler } from "./src/middleweare/errorhandler.js";

// Routes
import userRoutes from "./src/routes/userRoute.js";
import orgRoutes from "./src/routes/orgRoute.js";
import BillingRoutes from "./src/routes/HRM/BillingRoute.js";
import RoleRoutes from "./src/routes/rolepermissionroute.js";
import firmRoutes from "./src/routes/firmRoute.js";
import LeadRouter from "./src/routes/leadRoute.js";
import InvoiceRouter from "./src/routes/invoiceRoute.js";
import ClientRouter from "./src/routes/clientRoute.js";
import ActivityRouter from "./src/routes/activityRoute.js";
import TaxRouter from "./src/routes/taxRoutes.js";
import WorkspaceRouter from "./src/routes/project/Workspaceroute.js";
import ProjectRouter from "./src/routes/project/projectroute.js";
import TaskRouter from "./src/routes/project/task.route.js";
import ProjectMemberRouter from "./src/routes/project/projectMembe.js";
import RolePermissionRouter from "./src/routes/rolepermissionroute.js";
import BoardRouter from "./src/routes/project/boardroute.js";
import WorkflowRouter from "./src/routes/project/workflowroute.js";
import DocumentRouter from "./src/routes/project/documentroute.js";
import router from "./src/routes/sessionroute.js";
import TeamRouter from "./src/routes/project/teamroute.js";
import ProjectTemplateRouter from "./src/routes/project/projecttemplate.route.js";
import { sendToUser } from "./config/socket.handler.js";
import { initSocket } from "./config/socket.js";
import otplib from "otplib"
import qrcode from "qrcode"
// Generate a secret key
// Generate a secret key
const secret = otplib.authenticator.generateSecret();

// Create provisioning URI
const provisioningUri = otplib.authenticator.keyuri('vikasbaplawat1@gmail.com', 'Cubicle-Crm', secret);

// Generate and display QR code in the terminal
qrcode.toString(provisioningUri, { type: 'terminal', small: true }, (err, url) => {
  if (err) {
    console.error('Error generating QR code:', err);
    return;
  }

  console.log('Scan the following QR code with your authenticator app:');
  // console.log(url);
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, "./.env") });

// PayPal config
paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

const isProd = process.env.NODE_ENV === "production";
const app = express();
const httpServer = createServer(app);
initSocket(httpServer)

const PORT = process.env.PORT || 5001;
app.set("trust proxy", isProd);

// Middlewares
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  // origin: "https://cubicle-crm.vercel.app",
  origin: "http://localhost:51",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Request logger
app.use((req, res, next) => {
  console.log(`Request hit: ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.params).length) console.log("Params:", req.params);
  if (req.body && Object.keys(req.body).length) console.log("Body:", req.body);
  console.log("Client IP:", req.ip);
  next();
});

// Routes
app.use("/api/auth", globalLimiter, userRoutes);
app.use("/api/organization", globalLimiter, orgRoutes);
app.use("/api/billingplan", BillingRoutes);
app.use("/api/role", RoleRoutes);
app.use("/api/firm", firmRoutes);
app.use("/api/lead", LeadRouter);
app.use("/api/invoice", InvoiceRouter);
app.use("/api/client", ClientRouter);
app.use("/api/activities", ActivityRouter);
app.use("/api/taxRates", TaxRouter);
app.use("/api/workspace", WorkspaceRouter);
app.use("/api/project", ProjectRouter);
app.use("/api/task", TaskRouter);
app.use("/api/projects", ProjectMemberRouter);
app.use("/api/board", BoardRouter);
app.use("/api/role-permission", RolePermissionRouter);
app.use("/api/workflow", WorkflowRouter);
app.use("/api/documents", DocumentRouter);
app.use("/api/teams", TeamRouter);
app.use("/api/project-templates", ProjectTemplateRouter);
app.use("/api/session", router);

app.get('/notify/:userId', (req, res) => {
  const userId = req.params.userId;

  sendToUser(userId, {
    title: 'New Alert',
    body: 'Hello from /notify!',
  });

  res.send(`Notification sent to user_${userId}`);
});





// Health check & 404
app.get("/", (req, res) => res.send("Server running"));

app.all("*", (req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Global error handlers
app.use(errorHandler);
process.on("unhandledRejection", (reason, p) => console.log("Unhandled Rejection:", reason));
process.on("uncaughtException", (err) => console.log("Uncaught Exception:", err));
process.on("uncaughtExceptionMonitor", (err) => console.log("Uncaught Exception Monitor:", err));

// Start server
httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await connectDB();
  startUserCleanupCron();
  runWelcomeEmail();
});