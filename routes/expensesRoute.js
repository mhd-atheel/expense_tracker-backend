const express = require('express');
const {createExpense } = require('../controller/expensesController');
const router = express.Router();



router.post('/create-expense',createExpense),




module.exports = router