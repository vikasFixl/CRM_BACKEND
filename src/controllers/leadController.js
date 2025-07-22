import { Lead } from "../models/leadModel.js";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStageSchema,
} from "../validations/lead/leadValidation.js";
import mongoose from "mongoose";
import ActivityModel from "../models/activityModel.js";
import ClientModel from "../models/ClientModel.js"
import { paginateQuery } from "../utils/pagination.js";
// Create a new lead
export const createLead = async (req, res, next) => {
  /* ----------------------------------------------------------
   * 1.  Destructure context (already injected by auth/tenant MW)
   * ---------------------------------------------------------- */
  const {
    user: { userId, email: loggedInEmail },
    orgUser: { orgId, employeeId },
  } = req;

  /* ----------------------------------------------------------
   * 2.  Validate body once and early-exit on failure
   * ---------------------------------------------------------- */
  const parsed = createLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    // Map Zod issues to a flat list – client can decide how to display
    const errors = parsed.error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({ message: "Validation error", errors });
  }

  const {
    title,
    description,
    firm,
    contact,
    source,
    sourceDetails,
    stage,
    estimatedValue,
    currency,
    assignedTo,
    assignedAt,
    nextAction,
    nextActionDate,
    priority,
    interactions = [],
    notes = [],
    tags = [],
    customFields,
  } = parsed.data;

  /* ----------------------------------------------------------
   * 3.  Idempotency / duplicate checks
   * ---------------------------------------------------------- */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 3a. Title must be unique inside the org
    const titleExists = await Lead.exists(
      { title, organization: orgId, isActive: true },
      { session }
    );
    if (titleExists)
      return res.status(409).json({ message: "Lead name already taken" });

    // 3b. Active client (email OR phone) inside the org
    if (contact.email || contact.phone) {
      const orClause = [];
      if (contact.email) orClause.push({ "contact.email": contact.email });
      if (contact.phone) orClause.push({ "contact.phone": contact.phone });

      const duplicateClient = await Lead.exists(
        {
          organization: orgId,
          isActive: true,
          $or: orClause,
        },
        { session }
      );
      if (duplicateClient)
        return res.status(409).json({
          message:
            "A lead with this  contact email/phone already exists in your organization",
        });
    }

    /* ----------------------------------------------------------
     * 4.  Build document
     * ---------------------------------------------------------- */
    const lead = await Lead.create(
      [
        {
          title,
          description,
          contact,
          source,
          firm,
          sourceDetails,
          stage,
          estimatedValue,
          currency,
          organization: orgId,
          owner: userId,
          assignedTo: assignedTo ?? userId,
          assignedAt: assignedAt ?? new Date(),
          nextAction,
          nextActionDate,
          priority,
          interactions: interactions.map((i) => ({
            ...i,
            participants: [
              ...(i.participants || []),
              { userId, role: "creator" },
            ],
          })),
          notes,
          tags,
          customFields,
          stageHistory: [{ stage, enteredAt: new Date() }],
        },
      ],
      { session }
    );

    /* ----------------------------------------------------------
     * 5.  Audit trail
     * ---------------------------------------------------------- */
    await ActivityModel.create(
      [
        {
          orgId,
          activityDesc: `Lead "${title}" created by ${loggedInEmail} (empId: ${employeeId})`,
          activity: "create",
          module: "lead",
          entityId: lead[0]._id,
          userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    /* ----------------------------------------------------------
     * 6.  Response
     * ---------------------------------------------------------- */
    return res.status(201).json({
      message: "Lead created successfully",
      code: 201,
      success: true,
      lead: lead[0],
    });
  } catch (err) {
    await session.abortTransaction();
    next(err); // Central error handler will log & respond
  } finally {
    session.endSession();
  }
};
export const getAllLeads = async (req, res, next) => {
  const orgId = req.orgUser?.orgId;
  if (!orgId) return res.status(400).json({ message: "Org id required" });

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
/**
 * GET /leads/:id
 * Fetch a single lead by its MongoDB _id.
 * - Validates the id format
 * - Ensures the lead is not soft-deleted
 * - Populates referenced documents (org, firm, assigned user)
 * - Returns lean JSON for performance
 */


export const getLeadById = async (req, res, next) => {
  const { id } = req.params;

  /* ---------- 1. Basic guardrails ---------- */
  if (!id)
    return res.status(400).json({ message: "Lead id is required" });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid id", code: 400, success: false });

  /* ---------- 2. Query & population ---------- */
  try {
    const lead = await Lead.findOne({ _id: id, isActive: true })
      .populate("organization", "name")   // org name only
      .populate("firm", "FirmName email")         // optional firm name
      .populate("owner", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .lean();                           // plain JS object, faster

    if (!lead)
      return res.status(404).json({ message: "Lead not found or deleted" });

    /* ---------- 3. Success ---------- */
    return res.status(200).json({
      message: "Lead fetched successfully",
      code: 200,
      success: true,
      lead,
    });
  } catch (err) {
    // Pass to central error handler
    next(err);
  }
};
export const updateLead = async (req, res, next) => {
  const { id } = req.params;
  const {
    user: { userId, email: loggedInEmail },
    orgUser: { orgId, employeeId },
  } = req;

  /* ---------- guards ---------- */
  if (!id) return res.status(400).json({ message: "Lead id is required" });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid id" });

  const parsed = updateLeadSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.errors.map((e) => e.message),
    });

  const update = parsed.data;

  try {
    /* ---------- atomic update ---------- */
    const lead = await Lead.findOneAndUpdate(
      { _id: id, organization: orgId, isActive: true },
      update,
      {
        new: true,
        runValidators: true,
        lean: true,
      }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    /* ---------- stage change side-effect ---------- */
    if (update.stage && update.stage !== lead.stage) {
      const last = lead.stageHistory[lead.stageHistory.length - 1];
      if (last && !last.exitedAt) last.exitedAt = new Date();
      lead.stageHistory.push({ stage: update.stage, enteredAt: new Date() });
      lead.probability = lead.calculateProbability();
      await Lead.updateOne(
        { _id: lead._id },
        {
          stageHistory: lead.stageHistory,
          probability: lead.probability,
        }
      );
    }

    /* ---------- audit ---------- */
    await ActivityModel.create({
      orgId,
      userId,
      activity: "update",
      module: "lead",
      entityId: id,
      activityDesc: `Lead updated by ${loggedInEmail} (empId: ${employeeId})`,
    });

    res.status(200).json({
      message: "Lead updated successfully",
      code: 200,
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLeadStage = async (req, res, next) => {
  /* ---------- 1. Context ---------- */
  const {
    user: { userId, email: loggedInEmail },
    orgUser: { orgId, employeeId },
  } = req;
  const { id } = req.params;

  /* ---------- 2. Validation ---------- */
  if (!id) return res.status(400).json({ message: "Lead id required" });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid id" });

  const parsed = updateLeadStageSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.errors,
    });

  const { stage: newStage, reason, createClient } = parsed.data;

  /* ---------- 3. Update (with client creation) ---------- */
  try {
    const lead = await Lead.findOne({
      _id: id,
      organization: orgId,
      isActive: true,
    });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (lead.stage === newStage)
      return res.status(409).json({ message: "Stage unchanged" });

    const updates = {
      stage: newStage,
      probability: lead.calculateProbability(),
    };

    /* stageHistory */
    const last = lead.stageHistory[lead.stageHistory.length - 1];
    if (last && !last.exitedAt) last.exitedAt = new Date();
    updates.$push = {
      stageHistory: { stage: newStage, enteredAt: new Date(), reason },
    };

    /* auto-create client on Closed-Won */
    let createdClientId;
    if (newStage === "Closed-Won" && createClient) {
      const existing = await ClientModel.exists({
        orgId,
        firmId: lead.firm,
        email: lead.contact.email,
        deleted: false,
      });
      if (existing) return res.status(409).json({ message: "Client already exists" });
      const client = await ClientModel.create({
        clientFirmName: lead.contact.company || lead.contact.name,
        firstName: lead.contact.name?.split(" ")[0] || "",
        lastName: lead.contact.name?.split(" ").slice(1).join(" ") || "",
        email: lead.contact.email,
        phone: lead.contact.phone,
        orgId,
        firmId: lead.firm,
      });
      createdClientId = client._id.toString();

    }

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: id, organization: orgId },
      updates,
      { new: true, runValidators: true, lean: true }
    );

    /* ---------- audit ---------- */
    await ActivityModel.create({
      orgId,
      userId,
      activity: "update",
      module: "lead",
      entityId: id,
      activityDesc: `Stage moved to ${newStage}${createdClientId ? " & client created" : ""}`,
    });

    return res.status(200).json({
      message: `${createdClientId ? "Lead & client" : "Lead"} updated successfully`,
      code: 200,
      success: true,
      updatedLead,
    });
  } catch (err) {
    next(err);
  }
};
export const getLeadStageHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.orgUser?.orgId;

    /* ---------- guards ---------- */
    if (!id)
      return res.status(400).json({ message: "Lead id is required" });

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id", code: 400, success: false });

    /* ---------- fetch ---------- */
    const lead = await Lead.findOne(
      { _id: id, organization: orgId, isActive: true },
      { stageHistory: 1, _id: 0 } // project only stageHistory
    ).lean();

    if (!lead)
      return res.status(404).json({ message: "Lead not found", code: 404, success: false });

    /* ---------- response ---------- */
    return res.status(200).json({
      message: "Stage history fetched successfully",
      code: 200,
      success: true,
      stageHistory: lead.stageHistory,
    });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteLeads = async (req, res, next) => {
  try {
    const { leadIds } = req.body;
    const orgId = req.orgUser.orgId;
    const { userId, email: loggedInEmail } = req.user;
    const { employeeId } = req.orgUser;

    /* ---------- 1. Input guard ---------- */
    if (!Array.isArray(leadIds) || leadIds.length === 0)
      return res.status(400).json({ message: "leadIds must be a non-empty array" });

    /* ---------- 2. Sanitise & validate IDs ---------- */
    const objectIds = leadIds
      .filter(mongoose.isValidObjectId)
      .map(id => new mongoose.Types.ObjectId(id));

    if (objectIds.length !== leadIds.length)
      return res.status(400).json({ message: "One or more leadIds are invalid" });

    /* ---------- 3. Bulk write ---------- */
    const bulkOps = objectIds.map(id => ({
      updateOne: {
        filter: { _id: id, organization: orgId, isActive: true },
        update: { $set: { isActive: false, deletedAt: new Date() } },
      },
    }));

    const result = await Lead.bulkWrite(bulkOps);

    if (result.modifiedCount === 0)
      return res.status(404).json({ message: "No matching leads found" });

    /* ---------- 4. Single audit record ---------- */
    await ActivityModel.create({
      orgId,
      userId,
      activity: "delete",
      module: "lead",
      activityDesc: `${result.modifiedCount} lead(s) soft-deleted by ${loggedInEmail} (empId: ${employeeId})`,
    });

    /* ---------- 5. Response ---------- */
    return res.status(200).json({
      message: "Leads deleted successfully",
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
};

// export const getAllDeletedLead = async (req, res) => {
//   try {
//     const orgId = req.orgUser?.orgId;
//     const { page = 1, limit = 10 } = req.query;
//     if (!orgId) {
//       return res.status(400).json({
//         message: "Organization ID is required.",
//         success: false,
//         code: 400,
//       });
//     }
//     const query = { orgId, deleted: true };

//     const options = {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       sort: { updatedAt: -1 },
//       select: {
//         _id: 1,
//         LeadId: 1,
//         stage: 1,
//         status: 1,
//         priority: 1,
//         leadScore: 1,
//         title: 1,
//         description: 1,
//       },
//     };
//     const result = await paginateQuery(Lead, query, options);

//     let lead = result.data.map((lead) => {
//       return {
//         _id: lead._id,
//         LeadId: lead.LeadId,
//         stage: lead.stage,
//         status: lead.status,
//         priority: lead.priority,
//         leadScore: lead.leadScore,
//         title: lead.title,
//         description: lead.description,
//       };
//     });
//     return res.status(200).json({
//       message: "Soft-deleted leads fetched successfully",
//       success: true,
//       code: 200,
//       lead,
//       pagination: {
//         total: result.total,
//         page: result.page,
//         limit: result.limit,
//         totalPages: result.totalPages,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllDeletedLead:", error);
//     return res.status(500).json({
//       success: false,
//       code: 500,
//       message: "Internal server error.",
//     });
//   }
// };

export const restoreLead = async (req, res, next) => {
  const { id } = req.params;
  const {
    user: { userId, email: loggedInEmail },
    orgUser: { orgId, employeeId },
  } = req;

  /* ---------- guards ---------- */
  if (!id) return res.status(400).json({ message: "Lead id is required" });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid id", code: 400, success: false });

  /* ---------- atomic restore ---------- */
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: id, organization: orgId, isActive: false }, // only soft-deleted
      { isActive: true, deletedAt: null },
      { new: true, lean: true }
    );

    if (!lead)
      return res.status(404).json({ message: "Lead not found or already active", code: 404 });

    /* ---------- audit ---------- */
    await ActivityModel.create({
      orgId,
      userId,
      activity: "restore",
      module: "lead",
      entityId: lead._id,
      activityDesc: `Lead restored by ${loggedInEmail} (empId: ${employeeId})`,
    });

    res.status(200).json({
      message: "Lead restored successfully",
      code: 200,
      success: true,
      data: { id: lead._id, isActive: lead.isActive },
    });
  } catch (err) {
    next(err);
  }
};

export const getLeadsByStageAndFirm = async (req, res, next) => {
  try {
    const orgId = req.orgUser?.orgId;
    if (!orgId) return res.status(400).json({ message: "Org id required" });

    /* ---------- extract & validate params ---------- */
    const { stage, firmId: firm } = req.query;
    if (!stage)
      return res.status(400).json({ message: "Stage is required", success: false });

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    /* ---------- build filter ---------- */
    const filter = { organization: orgId, isActive: true, stage };
    if (firm && mongoose.isValidObjectId(firm)) filter.firm = firm;

    /* ---------- counts & slice ---------- */
    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const leads = await Lead
      .find(filter)
      .populate("firm", "firmName")
      .populate("assignedTo", "name email")
      .select(
        "_id leadId title stage probability priority estimatedValue contact.name contact.email contact.company firmId assignedTo assignedAt createdAt"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    /* ---------- response ---------- */
    return res.status(200).json({
      message: `Leads for stage ${stage}` + (firm ? ` and firm ${firm}` : ""),
      success: true,
      code: 200,
      leads,
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
    next(err);
  }
};

// export const updateLeadStatus = async (req, res, next) => {
//   /* ---------- 1. Context ---------- */
//   const {
//     user: { userId, email: loggedInEmail },
//     orgUser: { orgId, employeeId },
//   } = req;

//   const { id } = req.params;
//   const { status, reason } = req.body ?? {};

//   /* ---------- 2. Fast guards ---------- */
//   if (!id) return res.status(400).json({ message: "Lead id is required" });
//   if (!mongoose.isValidObjectId(id))
//     return res.status(400).json({ message: "Invalid id" });
//   if (!STATUS_ENUM.includes(status))
//     return res.status(400).json({ message: "Invalid status" });

//   /* ---------- 3. Atomic update ---------- */
//   try {
//     const lead = await Lead.findOneAndUpdate(
//       {
//         _id: id,
//         organization: orgId,
//         isActive: true,
//         status: { $ne: status }, // prevent redundant updates
//       },
//       {
//         status,
//         $push: {
//           stageHistory: {
//             stage: status, // treat status change as stage history entry
//             enteredAt: new Date(),
//             reason,
//           },
//         },
//       },
//       { new: true, runValidators: true, lean: true }
//     );

//     if (!lead)
//       return res.status(409).json({ message: "Lead already has this status or was not found" });

//     /* ---------- 4. Audit ---------- */
//     await ActivityModel.create({
//       orgId,
//       userId,
//       activity: "update",
//       module: "lead",
//       entityId: lead._id,
//       activityDesc: `Status changed to ${status} by ${loggedInEmail} (empId: ${employeeId})${reason ? ` – ${reason}` : ""}`,
//     });

//     /* ---------- 5. Response ---------- */
//     return res.status(200).json({
//       message: "Lead status updated successfully",
//       code: 200,
//       success: true,
//       data: { id: lead._id, status: lead.status },
//     });
//   } catch (err) {
//     next(err);
//   }
// };