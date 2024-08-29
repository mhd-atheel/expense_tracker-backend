const mongoose = require("mongoose");

const expensesSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    cetegory: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: { 
      type: String,
      required: true 
    },
    date: { 
      type: Date, 
      required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
  },
  { timestamps: true }
);

const expenses = mongoose.model("Expenses", expensesSchema);

module.exports = expenses;
