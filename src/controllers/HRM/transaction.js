const { getPagination } = require("../../utils/query");

const Transaction = require('../../models/HRM/transaction'); // Import your Mongoose model for Transaction here

const createSingleTransaction = async (req, res) => {
  try {
    // Convert the date to a specific format (assuming your date is in ISO format)
    const date = new Date(req.body.date);

    const newTransaction = new Transaction({
      date: date,
      debit_id: req.body.debit_id,
      credit_id: req.body.credit_id,
      particulars: req.body.particulars,
      amount: parseFloat(req.body.amount),
    });

    // Save the new transaction to the database
    const createdTransaction = await newTransaction.save();

    return res.status(200).json(createdTransaction);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllTransaction = async (req, res) => {
  try {
    if (req.query.query === "info") {
      // You can use Mongoose aggregation framework to calculate aggregations
      const aggregations = await Transaction.aggregate([
        {
          $match: { status: true },
        },
        {
          $group: {
            _id: null,
            idCount: { $sum: 1 },
            amountSum: { $sum: "$amount" },
          },
        },
      ]);

      const result = {
        _count: {
          id: aggregations[0]?.idCount || 0,
        },
        _sum: {
          amount: aggregations[0]?.amountSum || 0,
        },
      };

      return res.json(result);
    } else if (req.query.query === "all") {
      // Retrieve all transactions from the database
      const allTransaction = await Transaction.find()
        .sort({ id: 'asc' })
        .populate('debit', 'name')
        .populate('credit', 'name');

      return res.json(allTransaction);
    } else if (req.query.query === "inactive") {
      const { skip, limit } = getPagination(req.query);
      // Use Mongoose queries to filter transactions based on date and status
      const startdate = new Date(req.query.startdate);
      const enddate = new Date(req.query.enddate);

      const [aggregations, allTransaction] = await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              date: {
                $gte: startdate,
                $lte: enddate,
              },
              status: false,
            },
          },
          {
            $group: {
              _id: null,
              idCount: { $sum: 1 },
              amountSum: { $sum: "$amount" },
            },
          },
        ]),
        Transaction.find({
          date: {
            $gte: startdate,
            $lte: enddate,
          },
          status: false,
        })
          .sort({ id: 'desc' })
          .skip(Number(skip))
          .limit(Number(limit))
          .populate('debit', 'name')
          .populate('credit', 'name'),
      ]);

      const result = {
        aggregations: {
          _count: {
            id: aggregations[0]?.idCount || 0,
          },
          _sum: {
            amount: aggregations[0]?.amountSum || 0,
          },
        },
        allTransaction,
      };

      return res.json(result);
    } else if (req.query.query === "search") {
      // Search for transactions based on transaction ID
      const transactionId = Number(req.query.transaction);

      const allTransaction = await Transaction.find({
        id: transactionId,
      })
        .sort({ id: 'desc' })
        .populate('debit', 'name')
        .populate('credit', 'name');

      return res.json(allTransaction);
    } else {
      const { skip, limit } = getPagination(req.query);
      // Use Mongoose queries to filter transactions based on date and status
      const startdate = new Date(req.query.startdate);
      const enddate = new Date(req.query.enddate);

      const [aggregations, allTransaction] = await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              date: {
                $gte: startdate,
                $lte: enddate,
              },
              status: true,
            },
          },
          {
            $group: {
              _id: null,
              idCount: { $sum: 1 },
              amountSum: { $sum: "$amount" },
            },
          },
        ]),
        Transaction.find({
          date: {
            $gte: startdate,
            $lte: enddate,
          },
          status: true,
        })
          .sort({ id: 'desc' })
          .skip(Number(skip))
          .limit(Number(limit))
          .populate('debit', 'name')
          .populate('credit', 'name'),
      ]);

      const result = {
        aggregations: {
          _count: {
            id: aggregations[0]?.idCount || 0,
          },
          _sum: {
            amount: aggregations[0]?.amountSum || 0,
          },
        },
        allTransaction,
      };

      return res.json(result);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getSingleTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const singleTransaction = await Transaction
      .findById(transactionId)
      .populate('debit', 'name')
      .populate('credit', 'name')
      .exec();

    if (!singleTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(singleTransaction);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// TODO: update account as per transaction
const updateSingleTransaction = async (req, res) => {
  try {
    // Convert the incoming data to a specific format.
    const date = new Date(req.body.date).toISOString().split("T")[0];

    // Define the data for updating the transaction
    const updateData = {
      date: new Date(date),
      particulars: req.body.particulars,
      type: "transaction",
      related_id: 0,
      amount: parseFloat(req.body.amount),
    };

    // Find the transaction by ID and update it
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Check if the transaction exists
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // TO DO: Update transaction account

    return res.json(updatedTransaction);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// delete and update account as per transaction
const deleteSingleTransaction = async (req, res) => {
  try {
    // Find the transaction by ID and update its status to 'deleted'
    const deletedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    // Check if the transaction exists
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json(deletedTransaction);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleTransaction,
  getAllTransaction,
  getSingleTransaction,
  updateSingleTransaction,
  deleteSingleTransaction,
};
