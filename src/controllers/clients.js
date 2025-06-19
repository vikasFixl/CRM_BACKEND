import mongoose from "mongoose";
import ClientModel from "../models/ClientModel.js";
import {
  clientSchema,
  updateClientSchema,
} from "../validations/client/clientValidation.js";
import ActivityModel from "../models/activityModel.js";

export const createClient = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const userId = req.user.userId;
    const empid = req.orgUser.employeeId;
    const loggedinuserEmail = req.user.email;
    const client = clientSchema.safeParse(req.body);
    if (!client.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: client.error.errors.map((e) => e.message),
      });
    }
    const {
      clientFirmName,
      firstName,
      lastName,
      website,
      email,
      phone,
      address,
      contactPerson,

      taxId,
      tinNo,
      cinNo,

      firmId,
    } = client.data;

    const data = await ClientModel.findOne({ email });
    console.log(data, "data");
    if (data) {
      res.status(400).json({
        code: 400,
        success: false,
        message: `Client already registered with ${email}.`,
      });
    } else {
      const newClient = new ClientModel({
        clientFirmName,
        firstName,
        lastName,
        website,
        email,
        phone,
        address,
        contactPerson,
        taxId,
        tinNo,
        cinNo,
        orgId,
        firmId,
      });
      await newClient.save();
      const activity = new ActivityModel({
        activityDesc: `Client created by ${loggedinuserEmail} with empid ${empid}`,
        userId,
        orgId,
        activity: "create",
        module: "client",
        entityId: newClient._id,
      });
      await activity.save();
      res.status(201).json({
        code: 201,
        success: true,
        message: "Client created successfully!",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: err,
      code: 400,
      success: false,
    });
  }
};

export const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid id" });
    }
    const client = await ClientModel.find({ _id: id, deleted: false });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({
      data: client,
      success: true,
      code: 200,
      message: "fetch client by id successfully!!",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getClients = async (req, res) => {
  const { page } = req.query || 1;
  const orgId = req.orgUser.orgId;
  try {
    const LIMIT = 10;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    const total = await ClientModel.countDocuments({
      orgId: orgId,
      deleted: false,
    });
    const clients = await ClientModel.find({ orgId: orgId, deleted: false })
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    res.json({
      total,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
      data: clients,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const parsed = updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
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

export const getALLdeletedClient = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const clients = await ClientModel.find({
      orgId: orgId,
      deleted: true,
    }).sort({ createdAt: -1 });
    console.log(clients);
    res.status(200).json({
      message: "deleted clients fetched successfully",
      code: 200,
      success: true,
      total: clients.length,
      data: clients,
    });
  } catch (error) {}
};

export const RestoreClient = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgUser.orgId;
    const userId = req.user.userId;
    const empid = req.orgUser.employeeId;
    const loggedinuserEmail = req.user.email;

    // ✅ Validate Mongo ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid client ID", success: false });
    }

    // ✅ Correct usage: only 3 arguments
    const updatedClient = await ClientModel.findByIdAndUpdate(
      id,
      { deleted: false }, // or whatever your field is — delete or deleted
      { new: true }
    );

    if (!updatedClient) {
      return res
        .status(404)
        .json({ message: "Client not found", success: false });
    }

    // ✅ Optional: log restore activity
    const activity = new ActivityModel({
      activityDesc: `Client restored by ${loggedinuserEmail} with empid ${empid}`,
      userId,
      orgId,
      activity: "restore",
      module: "client",
      entityId: updatedClient._id,
    });

    await activity.save();

    res.status(200).json({
      message: "Client restored successfully",
      code: 200,
      success: true,
      data: updatedClient,
    });
  } catch (error) {
    console.error("RestoreClient error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
