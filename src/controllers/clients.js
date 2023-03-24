const mongoose = require("mongoose");

const ClientModel = require("../models/ClientModel.js");

exports.getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await ClientModel.findById(id);
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

exports.getClients = async (req, res) => {
  const { page } = req.query;
  const { orgId } = req.params;
  try {
    const LIMIT = 10;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    const total = await ClientModel.countDocuments({ orgId: orgId });
    const clients = await ClientModel.find({ orgId: orgId })
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    res.json({
      data: clients,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.createClient = async (req, res) => {
  const client = req.body;
  try {
    const newClient = new ClientModel(client);
    const data = await newClient.save();
    res.status(201).json({
      data: data,
      success: true,
      code: 201,
      message: "Client added successfully!!",
    });
  } catch (error) {
    res.status(409).json(error.message);
  }
};

exports.updateClient = async (req, res) => {
  const { id: _id } = req.params;
  const client = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No client with that id");

  const updatedClient = await ClientModel.findByIdAndUpdate(
    _id,
    { ...client, _id },
    { new: true }
  );
  res.json(updatedClient);
};

exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Client with that id");

  await ClientModel.findByIdAndRemove(id);

  res.json({ message: "Client deleted successfully" });
};

exports.getClientsByUser = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const clients = await ClientModel.find({ userId: searchQuery });

    res.json({ data: clients });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
