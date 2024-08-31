const express = require('express');
const {createExpense, getAllExpenses, getExpensesById, updateExpense, deleteExpense } = require('../controller/expensesController');
const router = express.Router();



router.post('/create-expense',createExpense),
router.get('/get-all-expenses',getAllExpenses),
router.get('/get-expenses',getExpensesById),
router.put('/update-expenses/:id',updateExpense),
router.delete('/delete-expense/:id',deleteExpense),




module.exports = router