import mongoose from "mongoose";
import ClientModel from "../models/ClientModel.js";
import { clientSchema } from "../validations/client/clientValidation.js";

export const createClient = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
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
    const client = await ClientModel.findById(id);
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
    const startIndex = (Number(page) - 1) * LIMIT ; // get the starting index of every page
    const total = await ClientModel.countDocuments({ orgId: orgId });
    const clients = await ClientModel.find({ orgId: orgId })
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

// exports.updateClient = async (req, res) => {
//   const { id: _id } = req.params;
//   const client = req.body;
//   if (!mongoose.Types.ObjectId.isValid(_id))
//     return res.status(404).send("No client with that id");

//   const updatedClient = await ClientModel.findByIdAndUpdate(
//     _id,
//     { ...client, _id },
//     { new: true }
//   );
//   res.json({
//     data: updatedClient,
//     code: 201,
//     success: true,
//     message: "Client updated successfully!",
//   });
// };

export const deleteClient = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("invalid id");
  await ClientModel.findByIdAndRemove(id);
  res.json({
    code: 201,
    success: true,
    message: "Client deleted successfully",
  });
};

export const getClientsByUser = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    if (!searchQuery) {
      return res.status(400).json({ message: "Missing userId in searchQuery." });
    }

    const clients = await ClientModel.find({ userId: searchQuery, deleted: { $ne: true } }) // optional: soft-delete support
      .select("firstName lastName email phone clientFirmName") // only return needed fields
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({ data: clients });
  } catch (error) {
    console.error("Error in getClientsByUser:", error);
    res.status(500).json({ message: "Failed to fetch clients." });
  }
};

