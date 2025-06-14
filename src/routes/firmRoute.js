import express from "express";
import * as firmController from "../controllers/firm.js";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import AWS from "@aws-sdk/client-s3";
import { isAuthenticated } from "../middleweare/middleware.js";
import { checkPermission } from "../middleweare/orgmiddleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
const Router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: "AKIAXLHG4KUVTUGY2JWI",
  secretAccessKey: "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",
});

const storage = multerS3({
  s3: s3,
  bucket: "crmfirmupload",
  key: (req, file, cb) => {
    cb(
      null,
      file.fieldname +
        "-" +
        Math.random() +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });
//withmiddlware

// Create firm
Router.route("/create").post(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("firm", "CREATE_FIRM"),
  firmController.createFirm
);

// Delete firm by id
Router.route("/delete/:id").delete(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("firm", "DELETE_FIRM"),
  firmController.deleteFirm
);

// Get single firm by id
Router.route("/getFirm/:id").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("firm", "VIEW_FIRM"),
  firmController.getFirmbyId
);

// Get all firms for orgId
Router.route("/getAllFirm").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("firm", "VIEW_FIRM"),
  firmController.getAllFirm
);

// Get firm list for orgId
Router.route("/getFirmList").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("firm", "VIEW_FIRM"),
  firmController.getFirmList
);

// Update firm by id
Router.route("/update/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("firm", "EDIT_FIRM"),
  firmController.updateFirm
);
// PATCH /api/firm/restore/:id 
// need to implement restore_firm permission
Router.route("/restore/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  firmController.RestoreFirm
);
// get all delted firms
// need to implement get-all-delted_firm permission
Router.route("/deleted").get(
  isAuthenticated,
  authenticateOrgToken(),
  firmController.getAllDeletedFirm
);

// Upload logo for firm by id
Router.route("/insertlogo/:id").patch(
  upload.single("logo"),
  firmController.logo
);

export default Router;
