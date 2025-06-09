import express from "express";
import * as firmController from "../controllers/firm.js";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import AWS from "@aws-sdk/client-s3";
import {isAuthenticated} from "../middleweare/middleware.js";
import {checkPermission} from "../middleweare/orgmiddleware.js";
import {authenticateOrgToken} from "../middleweare/orgmiddleware.js";
const Router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: "AKIAXLHG4KUVTUGY2JWI",
  secretAccessKey: "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",
});

const storage = multerS3({
  s3: s3,
  bucket: "crmfirmupload",
  key: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Math.random() + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
//withmiddlware



// Create firm
Router.route("/create").post(isAuthenticated,authenticateOrgToken(),checkPermission("firm", "CREATE_FIRM"),firmController.createFirm);

// Delete firm by id
Router.route("/delete/:id").delete(isAuthenticated,authenticateOrgToken(),checkPermission("firm", "DELETE_FIRM"),firmController.deleteFirm);

// Get single firm by orgId and id
Router.route("/getFirm/:orgId/:id").get(isAuthenticated,authenticateOrgToken(),checkPermission("firm", "VIEW_FIRM"),firmController.getFirm);

// Get single firm by orgId and id (invoice recurring)
Router.route("/getFirmforinvoicerecurring/:orgId/:id").get(isAuthenticated,authenticateOrgToken(),checkPermission("firm", "VIEW_FIRM"),firmController.getFirm);

// Get all firms for orgId
Router.route("/getAllFirm/:orgId").get(isAuthenticated,authenticateOrgToken(),checkPermission("firm", "VIEW_FIRM"),firmController.getAllFirm);

// Get firm list for orgId
Router.route("/getFirmList/:orgId").get(isAuthenticated,authenticateOrgToken(),checkPermission("firm", "VIEW_FIRM"),firmController.getFirmList);

// Update firm by id
Router.route("/update/:id").patch(isAuthenticated,authenticateOrgToken(),checkPermission("firm", "UPDATE_FIRM"),firmController.updateFirm);

// Upload logo for firm by id
Router.route("/insertlogo/:id").patch(upload.single("logo"), firmController.logo);

export default Router;
