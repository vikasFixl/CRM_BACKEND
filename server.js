// server.js

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import { globalLimiter } from "./src/middleweare/ratelimitter.js";
import { createServer } from "http";
import { connectDB } from "./config/db.config.js";
import { startUserCleanupCron } from "./src/automation/UserDeleteAutomation.js";
import { runWelcomeEmail } from "./src/automation/sendwelcomeEmail.js";
import { errorHandler } from "./src/middleweare/errorhandler.js";
import {downgradeExpiredTrials} from "./src/automation/downgradeplan.js"

// Routes
import userRoutes from "./src/routes/userRoute.js";
import orgRoutes from "./src/routes/orgRoute.js";
import BillingRoutes from "./src/routes/BillingRoute.js";
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
import Ticket from "./src/routes/ticket.route.js";
import BillingRouter from "./src/routes/BillingRoute.js"
import SupportRouter from "./src/routes/superadmin/supportagent.js";
import OrgBillingRouter from "./src/routes/orgBillingRoute.js";
import AdminAuth from "./src/routes/superadmin/AuthRouter.js";
import JobRouter from "./src/routes/HRM/recruitemnt/JobPostingRoute.js";
import DepartmentRouter from "./src/routes/HRM/Employee/department.js";
import CandidateRouter from "./src/routes/HRM/recruitemnt/candidateRoute.js";
import OfferRouter from "./src/routes/HRM/recruitemnt/offerRoute.js";
import PositionRouter from "./src/routes/HRM/Employee/positionRoute.js";
import InterviewRouter from "./src/routes/HRM/recruitemnt/interviewRoute.js";
import EmployeeRouter from "./src/routes/HRM/Employee/employeeRoute.js";
import OnboardingRouter from "./src/routes/HRM/Employee/onboardingRoute.js";
import AssetRouter from "./src/routes/HRM/resource/AssetRoute.js";
import AssetAssignmentRouter from "./src/routes/HRM/resource/assetAssignmentroutes.js";
import feedbackRouter from "./src/routes/HRM/performance/feedbackRoute.js";
import goalRouter from "./src/routes/HRM/performance/goalsRoute.js";
import ImprovementRouter from "./src/routes/HRM/performance/improvementRoute.js";
import ApprasialRouter from "./src/routes/HRM/performance/apprasial.js";

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
  // origin: "https://cubicle-crm.vercel.app",
  origin: "https://cubicle-crm-xmal.vercel.app",
  // origin: "https://vikas-frontend-sigma.vercel.app",
  // origin: "http://localhost:5173",
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
app.use("/api/OrgBilling",OrgBillingRouter)
app.use("/api/session", router);
app.use("/api/platform/ticket",Ticket)
app.use("/api/platform/support",SupportRouter)
app.use("/api/platform/billingplan",BillingRouter)
app.use("/api/platform/Auth",AdminAuth)
// hrm routes 
app.use("/api/recruitment/jobs",JobRouter)
app.use("/api/recruitment/candidates", CandidateRouter);
app.use("/api/recruitment/Offers", OfferRouter);
app.use("/api/recruitment/interviews",InterviewRouter);
app.use("/api/organization/positions", PositionRouter);
app.use("/api/organization/departments", DepartmentRouter);
app.use("/api/employees", EmployeeRouter);
// Onboarding / Offboarding
app.use("/api/employees/onboarding", OnboardingRouter);
// app.use("/api/employees/offboarding", OffboardingRouter);

// resouces
app.use("/api/resource/asset", AssetRouter);
app.use("/api/resource/asset-assignment", AssetAssignmentRouter);

// performance
app.use("/api/performance/feedback",feedbackRouter)
app.use("/api/performance/goals",goalRouter)
app.use("/api/performance/improvement",ImprovementRouter)
app.use("/api/performance/appraisal",ApprasialRouter)
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
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Promise Rejection →", reason);
  // exit so we don't continue running in a half-broken state
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception →", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  process.exit(0);
});

// Start server
httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await connectDB();
});
await connectDB();
startUserCleanupCron();
runWelcomeEmail();
downgradeExpiredTrials.start();