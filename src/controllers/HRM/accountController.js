const SubAccount = require("../../models/HRM/subAccount");
const Account = require('../../models/HRM/account'); // Adjust the import paths as needed

const createSingleAccount = async (req, res) => {
  try {
    const { name, account_id } = req.body;

    // Create a new SubAccount document
    const createdAccount = new SubAccount({
      name,
      account: account_id, // Assuming 'account' is a reference to an Account model
    });

    // Save the new SubAccount document to the database
    await createdAccount.save();
    res.status(200).json(createdAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
};


// const Debit = require('../models/debit'); // Adjust the import paths as needed
// const Credit = require('../models/credit'); // Adjust the import paths as needed

const getAllAccount = async (req, res) => {
  if (req.query.query === "tb") {
    try {
      // Retrieve data from your Mongoose models and calculate the trial balance.
      // Customize this part based on your Mongoose schemas and data structure.

      const allAccounts = await Account.find().sort({ id: 'asc' }).populate({
        path: 'subAccounts',
        // populate: {
        //   path: 'debits credits',
        //   match: { status: true }, // Apply the "status" filter here
        // },
      });

      // Calculate the trial balance
      const trialBalance = [];
      allAccounts.forEach((account) => {
        account.subAccounts.forEach((subAccount) => {
          const totalDebit = subAccount.debits.reduce((acc, debit) => acc + debit.amount, 0);
          const totalCredit = subAccount.credits.reduce((acc, credit) => acc + credit.amount, 0);
          trialBalance.push({
            account: account.name,
            subAccount: subAccount.name,
            totalDebit,
            totalCredit,
            balance: totalDebit - totalCredit,
          });
        });
      });

      // Separate debits and credits and calculate the total debit and credit
      const debits = trialBalance.filter((item) => item.balance > 0);
      const credits = trialBalance.filter((item) => item.balance < 0);
      const totalDebit = debits.reduce((acc, debit) => acc + debit.balance, 0);
      const totalCredit = credits.reduce((acc, credit) => acc + credit.balance, 0);

      // Check if total debit equals total credit
      const match = totalDebit === totalCredit;

      res.json({ match, totalDebit, totalCredit, debits, credits });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "bs") {
    try {
      // Retrieve data from your Mongoose models and calculate the balance sheet.
      // Customize this part based on your Mongoose schemas and data structure.

      const allAccounts = await Account.find().sort({ id: 'asc' }).populate({
        path: 'subAccounts',
        populate: {
          path: 'debits credits',
          match: { status: true }, // Apply the "status" filter here
        },
      });

      // Calculate the balance sheet
      const balanceSheet = [];
      allAccounts.forEach((account) => {
        account.subAccounts.forEach((subAccount) => {
          const totalDebit = subAccount.debits.reduce((acc, debit) => acc + debit.amount, 0);
          const totalCredit = subAccount.credits.reduce((acc, credit) => acc + credit.amount, 0);
          balanceSheet.push({
            account: account.type,
            subAccount: subAccount.name,
            totalDebit,
            totalCredit,
            balance: totalDebit - totalCredit,
          });
        });
      });

      // Separate assets, liabilities, and equity and calculate the totals
      const assets = balanceSheet.filter((item) => item.account === "Asset" && item.balance !== 0);
      const liabilities = balanceSheet.filter((item) => item.account === "Liability" && item.balance !== 0);
      const equity = balanceSheet.filter((item) => item.account === "Owner's Equity" && item.balance !== 0);

      const totalAsset = assets.reduce((acc, asset) => acc + asset.balance, 0);
      const totalLiability = liabilities.reduce((acc, liability) => acc + liability.balance, 0);
      const totalEquity = equity.reduce((acc, equityItem) => acc + equityItem.balance, 0);

      // Check if total asset equals total liability + total equity
      const match = totalAsset === (totalLiability + totalEquity);

      res.json({ match, totalAsset, totalLiability, totalEquity, assets, liabilities, equity });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "is") {
    try {
      // Retrieve data from your Mongoose models and calculate the income statement.
      // Customize this part based on your Mongoose schemas and data structure.

      const allAccounts = await Account.find().sort({ id: 'asc' }).populate({
        path: 'subAccounts',
        populate: {
          path: 'debits credits',
          match: { status: true }, // Apply the "status" filter here
        },
      });

      // Calculate the income statement
      const incomeStatement = [];
      allAccounts.forEach((account) => {
        account.subAccounts.forEach((subAccount) => {
          const totalDebit = subAccount.debits.reduce((acc, debit) => acc + debit.amount, 0);
          const totalCredit = subAccount.credits.reduce((acc, credit) => acc + credit.amount, 0);
          incomeStatement.push({
            id: subAccount.id,
            account: account.name,
            subAccount: subAccount.name,
            totalDebit,
            totalCredit,
            balance: totalDebit - totalCredit,
          });
        });
      });

      // Separate revenue and expense and calculate the totals
      const revenue = incomeStatement.filter((item) => item.account === "Revenue" && item.balance !== 0).map((item) => ({
        ...item,
        balance: -item.balance,
      }));
      const expense = incomeStatement.filter((item) => item.account === "Expense" && item.balance !== 0).map((item) => ({
        ...item,
        balance: -item.balance,
      }));

      const totalRevenue = revenue.reduce((acc, revenueItem) => acc + revenueItem.balance, 0);
      const totalExpense = expense.reduce((acc, expenseItem) => acc + expenseItem.balance, 0);
      const profit = totalRevenue + totalExpense;

      res.json({ totalRevenue, totalExpense, profit, revenue, expense });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "sa") {
    try {
      // Retrieve sub-accounts from your Mongoose models.
      // Customize this part based on your Mongoose schemas and data structure.

      const allSubAccount = await SubAccount.find().sort({ id: 'asc' }).populate('account', 'name type');

      res.json(allSubAccount);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "ma") {
    try {
      // Retrieve main accounts from your Mongoose models.
      // Customize this part based on your Mongoose schemas and data structure.

      const allMainAccount = await Account.find().sort({ id: 'asc' });

      res.json(allMainAccount);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Default case: Retrieve all accounts and sub-accounts.
      // Customize this part based on your Mongoose schemas and data structure.

      const allAccounts = await Account.find().sort({ id: 'asc' }).populate({
        path: 'subAccounts',
        populate: {
          path: 'debits credits',
        },
      });

      res.json(allAccounts);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

const getSingleAccount = async (req, res) => {
  try {
    const singleAccount = await SubAccount.findById(req.params.id)
      // .populate('debit')
      // .populate('credit')
      // .exec();

    if (!singleAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Calculate balance from total debit and credit
    const totalDebit = singleAccount.debit.reduce((acc, debit) => acc + debit.amount, 0);
    const totalCredit = singleAccount.credit.reduce((acc, credit) => acc + credit.amount, 0);
    const balance = totalDebit - totalCredit;

    // Add the balance to the single account object
    singleAccount.balance = balance;

    res.json(singleAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error.message);
  }
};

const updateSingleAccount = async (req, res) => {
  try {
    const accountId = req.params.id;

    // Define the updates you want to apply to the account
    const updates = {
      name: req.body.name,
      // Assuming you want to connect to a new account based on account_id
      account: req.body.account_id,
    };

    const updatedAccount = await SubAccount.findByIdAndUpdate(accountId, updates, {
      new: true, // To get the updated account data
    });

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error.message);
  }
};

const deleteSingleAccount = async (req, res) => {
  try {
    const accountId = req.params.id;

    // Define the updates to mark the account as deleted
    const updates = {
      status: req.body.status, // Assuming you want to update the status
    };

    const deletedSubAccount = await SubAccount.findByIdAndUpdate(accountId, updates, {
      new: true, // To get the updated account data
    });

    if (!deletedSubAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json(deletedSubAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error.message);
  }
};

module.exports = {
  createSingleAccount,
  getAllAccount,
  getSingleAccount,
  updateSingleAccount,
  deleteSingleAccount,
};
