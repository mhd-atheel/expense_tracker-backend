const express = require('express');
const {createExpense, getAllExpenses } = require('../controller/expensesController');
const router = express.Router();



router.post('/create-expense',createExpense),
router.get('/get-all-expenses',getAllExpenses),




module.exports = router