const mongoose = require('mongoose');

const totalOfExpensesSchema = new mongoose.Schema({
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  }
});

const TotalOfExpenses = mongoose.model('TotalOfExpenses', totalOfExpensesSchema);

module.exports = TotalOfExpenses;
