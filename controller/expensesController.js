const Expenses = require("../models/expensesModel");

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

    res.status(200).json(newExpenses);
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
    const { id, type, page = 1, limit = 10, sort = 'asc' } = req.query; // Destructure query params with default values

    // Validate required fields
    if (!id || !type) {
      return res.status(400).json({ error: "ID and type are required." });
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Determine sorting order
    const sortOrder = sort === 'asc' ? 1 : -1;

    // Find the total count of documents that match the criteria
    const totalCount = await Expenses.countDocuments({ userId: id, type: type });

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




module.exports = {
  createExpense,
  getAllExpenses,
  getExpensesById,
};
