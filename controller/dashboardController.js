
const Expenses = require("../models/expensesModel");
const TotalOfExpenses = require("../models/TotalExpenses");
const mongoose = require("mongoose");
const { getCurrentMonthDateRange } = require('../utils/dateRange');


const dashboard = async(req,res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const  userId  = req.params.id;

        const expenses = await Expenses.find({ userId: userId })
        .sort({ date: -1 }) // Sort by `createdAt` in descending order to get the most recent expenses first
        .limit(25) // Limit the results to the last 3 expenses
        .session(session) // Apply the session if using transactions
        .exec();

        const recentExpences = await Expenses.find({ userId: userId })
        .sort({ date: -1 }) // Sort by `createdAt` in descending order to get the most recent expenses first
        .limit(3) // Limit the results to the last 3 expenses
        .session(session) // Apply the session if using transactions
        .exec();

        const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();
        


        if(!expenses){
            return res.status(404).json({ status: "fail", message: "Expense not found." });
        }

        const values = expenses.map(expense => expense.amount);


        const totalExpenses = await TotalOfExpenses.findOne({ userId }).session(session);

        if(!totalExpenses){
            return res.status(404).json({ status: "fail", message: "Expense not found." });
        }

        
        
        const incomeExpensesCurrentMonth = await Expenses.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId.createFromHexString(userId),  // Convert to ObjectId
              type: { $regex: /^Income$/i },  // Case-insensitive match for "Income"
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
            },
          },
        ]);
        

        
          
        const incomeTotalAmount = incomeExpensesCurrentMonth.length > 0 
        ? incomeExpensesCurrentMonth[0].totalAmount 
        : 0;
        
        



          const outcomeExpensesCurrentMonth =await Expenses.aggregate([
            {
              $match: {
                userId: mongoose.Types.ObjectId.createFromHexString(userId),  // Convert to ObjectId
                type: { $regex: /^Outcome$/i },  // Case-insensitive match for "Income"
                date: { $gte: startOfMonth, $lte: endOfMonth },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount'},
              },
            },
          ]);

          const outcomeTotalAmount = outcomeExpensesCurrentMonth.length > 0 ? outcomeExpensesCurrentMonth[0].totalAmount : 0;
          
          


        res.status(200).json(
            {
                 status: "success",
                 values: values,
                 totalIncome: incomeTotalAmount,
                 totaloutCome: outcomeTotalAmount,
                 total: totalExpenses.total,
                 expenses: recentExpences,
            }
        );

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res.status(500).json({ status: "error", message: error.message });
    }
}


module.exports = {
    dashboard
}


