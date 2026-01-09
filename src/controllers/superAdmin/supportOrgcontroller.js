import Firm from "../../models/FirmModel.js";
import { Lead } from "../../models/leadModel.js";
import Org from "../../models/OrgModel.js";
import ClientModel from "../../models/ClientModel.js";

// GET organization details
export const getOrganization = async (req, res) => {
  try {
    const sorgId=req.supportorg.orgId;
    const impersonatedBy=req.supportorg.impersonatedBy;
    const agentId=req.support.supportAgentId;

    if(impersonatedBy!==agentId) return res.status(403).json({ message: "token was impersonated" });
    const org = await Org.findById(sorgId).populate("billingPlan")
    if (!org) return res.status(404).json({ message: "Organization not found" });

    res.status(200).json({ organization: org });
  } catch (error) {
    logger.error("Error fetching organization:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getFirms = async (req, res) => {
  try {
    const sorgId = req.supportorg.orgId;
    const impersonatedBy = req.supportorg.impersonatedBy;
    const agentId = req.support.supportAgentId;

    if (impersonatedBy !== agentId) {
      return res.status(403).json({ message: 'token was impersonated' });
    }

    // --- Pagination parameters ---
    const page = parseInt(req.query.page, 10) || 1;        // default page 1
    const limit = parseInt(req.query.limit, 10) || 10;     // default 10 docs per page
    const skip = (page - 1) * limit;

    // --- Optional filters ---
    const filter = { orgId: sorgId };

    // --- Query execution ---
    const totalDocs = await Firm.countDocuments(filter);
    const firms = await Firm
      .find(filter)
      .sort({ _id: 1 })          // stable order – adjust as needed
      .skip(skip)
      .limit(limit)
      .lean();                   // optional: plain JS objects

    // --- Response ---
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      firms,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocs,
        limit,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    logger.error('Error fetching firms:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export const getLeads = async (req, res, next) => {
  /* 1. Impersonation guard */
    const sorgId       = req.supportorg?.orgId;
    const impersonatedBy = req.supportorg?.impersonatedBy;
    const agentId      = req.support?.supportAgentId;

    if (impersonatedBy !== agentId) {
      return res.status(403).json({ message: 'token was impersonated' });
    }

  /* ---------- organization id ---------- */
  const orgId = sorgId;

  /* ---------- query params ---------- */
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const {
    stage,
    firm,
    contactName,
    includeDeleted = "false", // toggle soft-deleted
  } = req.query;

  /* ---------- build filter ---------- */
  const filter = { organization: orgId };

  const showDeleted = includeDeleted === "true";
  filter.isActive = !showDeleted; // true = active, false = deleted

  if (stage) filter.stage = stage;
  if (firm && mongoose.isValidObjectId(firm)) filter.firm = firm;
  if (contactName) filter["contact.name"] = { $regex: contactName, $options: "i" };

  /* ---------- counts & slice ---------- */
  const total = await Lead.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;

  const leads = await Lead
    .find(filter)
    .populate("firm", "firmName")
    .populate("assignedTo", "name email")
    .select(
      "leadId title stage probability priority estimatedValue contact.name contact.email contact.company firmId assignedTo assignedAt createdAt isActive deletedAt"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return res.status(200).json({
    message: showDeleted ? "Deleted leads fetched" : "Leads fetched successfully",
    success: true,
    code: 200,
    data: leads,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};
export const getClients = async (req, res, next) => {
  try {
    /* 1. Impersonation guard */
    const sorgId       = req.supportorg?.orgId;
    const impersonatedBy = req.supportorg?.impersonatedBy;
    const agentId      = req.support?.supportAgentId;

    if (impersonatedBy !== agentId) {
      return res.status(403).json({ message: 'token was impersonated' });
    }

    /* ---------- organization id ---------- */
    const orgId = sorgId;
   
    /* ---------- query params ---------- */
    const page  = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ) || 10, 1), 100);
    const skip  = (page - 1) * limit;

    const { name, email,deleted=false} = req.query;

    /* ---------- build filter ---------- */
    const filter = { orgId};

    if (name) {
      filter.$or = [
        { firstName:   { $regex: name, $options: "i" } },
        { lastName:    { $regex: name, $options: "i" } },
        { clientFirmName: { $regex: name, $options: "i" } },
      ];
    }
    if (email) filter.email = { $regex: email, $options: "i" };

    if(deleted){
      filter.deleted = deleted
    }
    // logger.info(filter);
    /* ---------- counts & slice ---------- */
    const total      = await ClientModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const clients = await ClientModel
      .find(filter)
      .populate("firmId","firmName email FirmLogo").populate("orgId","name contactEmail OrgLogo")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      message: ` clients fetched successfully`,
      success: true,
      code: 200,
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ message:"Server error" ,error: err.message });
  

  }
};

