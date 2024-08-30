const express = require('express');
const {createExpense, getAllExpenses, getExpensesById } = require('../controller/expensesController');
const router = express.Router();



router.post('/create-expense',createExpense),
router.get('/get-all-expenses',getAllExpenses),
router.get('/get-expenses',getExpensesById),




module.exports = router