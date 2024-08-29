const express = require('express');
const { signup, login, verifyOTP, getAllUsers } = require('../controller/userController');
const router = express.Router();



router.post('/signup',signup),
router.post('/login',login),
router.post('/verify-otp',verifyOTP),
router.get('/users',getAllUsers),



module.exports = router