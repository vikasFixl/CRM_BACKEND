import mongoose from "mongoose";
import ClientModel from "../models/ClientModel.js";
import {
  clientSchema,
  updateClientSchema,
} from "../validations/client/clientValidation.js";
import ActivityModel from "../models/activityModel.js";
import { paginateQuery } from "../utils/pagination.js";

/**
 * POST /clients
 * Create a new client inside a transaction.
 * – scopes uniqueness to (orgId, firmId, email)
 * – single round-trip with bulkWrite
 * – single audit entry
 */


export const createClient = async (req, res, next) => {
  const { orgId, employeeId } = req.orgUser;
  const { userId, email: loggedInEmail } = req.user;

  /* ---------- validation ---------- */
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.errors.map((e) => e.message),
    });

  const clientData = parsed.data;

  /* ---------- transaction ---------- */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* ---------- duplicate check scoped to org+firm+email ---------- */
    const exists = await ClientModel.exists(
      {
        orgId,
        firmId: clientData.firmId,
        email: clientData.email,
        deleted: false,
      },
      { session }
    );
    if (exists) {
      await session.abortTransaction();
      return res.status(409).json({ message: "Client already exists for this email in the firm" });
    }

    /* ---------- create ---------- */
    const [client] = await ClientModel.create([{ ...clientData, orgId }], { session });

    await ActivityModel.create(
      [
        {
          orgId,
          userId,
          activity: "create",
          module: "client",
          entityId: client._id,
          activityDesc: `Client created by ${loggedInEmail} (empId: ${employeeId})`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      message: "Client created successfully!",
      success: true,
      code: 200,
       client,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const getClientById = async (req, res, next) => {
  const { id } = req.params;
  const { orgId } = req.orgUser;

  /* ---------- guards ---------- */
  if (!id) return res.status(400).json({ message: "Client ID required" });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid client ID" });

  try {
    /* ---------- fetch client (scoped to org) ---------- */
    const client = await ClientModel.findOne({ _id: id, orgId, deleted: false }).populate("firmId","firmName email FirmLogo").populate("orgId","name contactEmail OrgLogo")
    if (!client) {
      return res.status(404).json({ message: "Client not found or deleted" });
    }

    res.status(200).json({
      message: "Client fetched successfully",
      success: true,
      code: 200,
       client,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * GET /clients/deleted
 * Paginated list of SOFT-DELETED clients scoped to the logged-in org.
 * Same optional filters as /clients: ?name & ?email
 */


export const getClients = async (req, res, next) => {
  try {
    const orgId = req.orgUser?.orgId;
   
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
    console.log(filter);
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

export const updateClient = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const parsed = updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log("Validation error:", parsed.error);
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const clientData = parsed.data;
  

   

    const userId = req.user.userId;
    const orgId = req.orgUser.orgId;
    const empid = req.orgUser.employeeId;
    const loggedinuserEmail = req.user.email;

    // ✅ Validate client ID
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({
        message: "No client found with that ID",
        success: false,
        code: 404,
      });
    }

    // ✅ Update client
    const updatedClient = await ClientModel.findOneAndUpdate(
      { _id, orgId }, // ✅ Match client ID + org ownership
      { ...clientData }, // ✅ Apply updates
      { new: true } // ✅ Return the updated doc
    );

    if (!updatedClient) {
      return res.status(404).json({
        message: "Client not found",
        success: false,
        code: 404,
      });
    }

    // ✅ Optional: Log the update activity
    const activity = new ActivityModel({
      activityDesc: `Client updated by ${loggedinuserEmail} with empid ${empid}`,
      userId,
      orgId,
      activity: "update",
      module: "client",
      entityId: updatedClient._id,
    });

    await activity.save();

    res.status(200).json({
      data: updatedClient,
      code: 200,
      success: true,
      message: "Client updated successfully!",
    });
  } catch (error) {
    console.error("updateClient error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const MoveClientToTrash = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgUser.orgId;
    const userId = req.user.userId;
    const empid = req.orgUser.employeeId;
    const loggedinuserEmail = req.user.email;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("Invalid client ID");
    }

    // ✅ Soft delete: set delete = true
    const updatedClient = await ClientModel.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    // ✅ Log the activity
    const activity = new ActivityModel({
      activityDesc: `Client moved to trash by ${loggedinuserEmail} with empid ${empid}`,
      userId,
      orgId,
      activity: "delete",
      module: "client",
      entityId: updatedClient._id,
    });

    await activity.save();

    res.json({
      code: 200,
      success: true,
      message: "Client moved to trash successfully",
    });
  } catch (err) {
    console.error("MoveClientToTrash error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getClientsByUser = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    if (!searchQuery) {
      return res
        .status(400)
        .json({ message: "Missing userId in searchQuery." });
    }

    const clients = await ClientModel.find({
      userId: searchQuery,
      deleted: { $ne: true },
    }) // optional: soft-delete support
      .select("firstName lastName email phone clientFirmName") // only return needed fields
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({ data: clients });
  } catch (error) {
    console.error("Error in getClientsByUser:", error);
    res.status(500).json({ message: "Failed to fetch clients." });
  }
};



export const restoreClient = async (req, res, next) => {
  const { id } = req.params;
  const {
    user: { userId, email: loggedInEmail },
    orgUser: { orgId, employeeId },
  } = req;

  /* ---------- guards ---------- */
  if (!id) return res.status(400).json({ message: "Client ID required" });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid client ID" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* ---------- fetch client (scoped to org) ---------- */
    const client = await ClientModel.findOne(
      { _id: id, orgId, deleted: true },
      null,
      { session }
    );
    if (!client) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Client not found or already active" });
    }

    /* ---------- restore ---------- */
    client.deleted = false;
    await client.save({ session });

    /* ---------- audit log ---------- */
    await ActivityModel.create(
      [
        {
          orgId,
          userId,
          activity: "restore",
          module: "client",
          entityId: client._id,
          activityDesc: `Client restored by ${loggedInEmail} (empId: ${employeeId})`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({
      message: "Client restored successfully",
      success: true,
      data: client,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};