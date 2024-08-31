const expenses = require("../models/expensesModel");
const Expenses = require("../models/expensesModel");
const TotalOfExpenses = require("../models/TotalExpenses");
const mongoose = require("mongoose");

const createExpense = async (req, res) => {
  try {
    const { type, category, amount, description, date, userId } = req.body;

    const newExpenses = new Expenses({
      type,
      category,
      amount,
      description,
      date,
      userId,
    });

    await newExpenses.save();

    let totalExpenses = await TotalOfExpenses.findOne({ userId });

    if (!totalExpenses) {
      // If there is no total record, create a new one
      totalExpenses = await TotalOfExpenses.create({
        userId,
        total: type === "Income" ? amount : -amount,
      });
    } else {
      // Update the total based on the type of the expense
      if (type === "Income") {
        totalExpenses.total += amount;
      } else if (type === "Outcome") {
        totalExpenses.total -= amount;
      }

      await totalExpenses.save();
    }
    res.status(200).json({
      status: "success",
      expenses: newExpenses,
      total: totalExpenses.total,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expense = await Expenses.find();
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getExpensesById = async (req, res) => {
  try {
    const { id, type, page = 1, limit = 10, sort = "asc" } = req.query; // Destructure query params with default values

    // Validate required fields
    if (!id || !type) {
      return res.status(400).json({ error: "ID and type are required." });
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Determine sorting order
    const sortOrder = sort === "asc" ? 1 : -1;

    // Find the total count of documents that match the criteria
    const totalCount = await Expenses.countDocuments({
      userId: id,
      type: type,
    });

    // Find expenses with pagination and sorting
    const expenses = await Expenses.find({ userId: id, type: type })
      .sort({ createdAt: sortOrder }) // Adjust the field for sorting as per your model's fields
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Calculate the count of documents on the current page
    const currentPageCount = expenses.length;

    // Check if no expenses were found
    if (currentPageCount === 0) {
      return res.status(404).json({ status: "Items not found" });
    }

    // Send response with data, total count, current page, total pages, and current page count
    res.status(200).json({
      expenses,
      totalCount,
      currentPageCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
    });
  } catch (error) {
    // Handle possible errors
    res.status(500).json({ error: "An error occurred" });
  }
};



const updateExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // Expense ID
    const { type, category, amount, description, date, userId } = req.body;

    // Validate required fields
    if (!id || !type || !category || !amount || !description || !date || !userId) {
      return res.status(400).json({ status: "fail", message: "All fields are required." });
    }

    // Find the existing expense
    const existingExpense = await Expenses.findById(id).session(session);
    if (!existingExpense) {
      return res.status(404).json({ status: "fail", message: "Expense not found." });
    }

    // Check if the userId matches
    if (existingExpense.userId.toString() !== userId) {
      return res.status(403).json({ status: "fail", message: "Unauthorized to update this expense." });
    }

    // Calculate the difference in amount based on the previous and new data
    let amountDifference = 0;
    if (existingExpense.type === "Income" && type === "Income") {
      amountDifference = amount - existingExpense.amount;
    } else if (existingExpense.type === "Outcome" && type === "Outcome") {
      amountDifference = -(amount - existingExpense.amount);
    } else if (existingExpense.type === "Income" && type === "Outcome") {
      amountDifference = -(existingExpense.amount + amount);
    } else if (existingExpense.type === "Outcome" && type === "Income") {
      amountDifference = existingExpense.amount + amount;
    }

    // Update the expense
    existingExpense.type = type;
    existingExpense.category = category;
    existingExpense.amount = amount;
    existingExpense.description = description;
    existingExpense.date = date;

    await existingExpense.save({ session });

    // Find the total expenses record for the user
    const totalExpenses = await TotalOfExpenses.findOne({ userId }).session(session);
    if (!totalExpenses) {
      throw new Error("Total expenses record not found for the user.");
    }

    // Update the total expenses
    totalExpenses.total += amountDifference;
    await totalExpenses.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      expenses: existingExpense,
      total: totalExpenses.total,
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ status: "error", message: error.message });
  }
};




const deleteExpense = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // Expense ID to delete
    const { userId } = req.body; // User ID to verify ownership

    // Validate required fields
    if (!id || !userId) {
      return res.status(400).json({ status: "fail", message: "Expense ID and User ID are required." });
    }

    // Find the existing expense
    const existingExpense = await Expenses.findById(id).session(session);
    if (!existingExpense) {
      return res.status(404).json({ status: "fail", message: "Expense not found." });
    }

    // Check if the userId matches
    if (existingExpense.userId.toString() !== userId) {
      return res.status(403).json({ status: "fail", message: "Unauthorized to delete this expense." });
    }

    // Calculate the amount to adjust in the total expenses
    let adjustmentAmount = 0;
    if (existingExpense.type === "Income") {
      adjustmentAmount = -existingExpense.amount;
    } else if (existingExpense.type === "Outcome") {
      adjustmentAmount = existingExpense.amount;
    }

    // Delete the expense
    await Expenses.findByIdAndDelete(id).session(session);

    // Find the total expenses record for the user
    const totalExpenses = await TotalOfExpenses.findOne({ userId }).session(session);
    if (!totalExpenses) {
      throw new Error("Total expenses record not found for the user.");
    }

    // Update the total expenses
    totalExpenses.total += adjustmentAmount;
    await totalExpenses.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "Expense deleted successfully.",
      total: totalExpenses.total,
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ status: "error", message: error.message });
  }
};






module.exports = {
  createExpense,
  getAllExpenses,
  getExpensesById,
  updateExpense,
  deleteExpense
};
