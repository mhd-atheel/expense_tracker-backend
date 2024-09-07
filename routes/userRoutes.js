const express = require('express');
const { signup, login, verifyOTP, getAllUsers, forgotPassword, resetPassword } = require('../controller/userController');
const router = express.Router();



router.post('/signup',signup),
router.post('/login',login),
router.post('/verify-otp',verifyOTP),
router.get('/users',getAllUsers),
router.post('/forgot-password',forgotPassword),
router.post('/reset-password',resetPassword),



module.exports = router