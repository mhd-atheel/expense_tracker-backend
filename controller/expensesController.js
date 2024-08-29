const Expenses = require("../models/expensesModel");

const createExpense =async(req,res)=>{
    try {
        const { type, category, amount,description,date,userId} = req.body;

    
        const newExpenses = new Expenses({
            type, category, amount,description,date,userId
        });
      
          await newExpenses.save();
    
        res.status(200).json(newExpenses);
    

    } catch (error) {
        res.status(500).json(error);

    }
}


module.exports = {
    createExpense
}