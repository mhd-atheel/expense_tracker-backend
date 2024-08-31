const express = require('express');
const {dashboard } = require('../controller/dashboardController');
const router = express.Router();




router.get('/get-dashboard/:id',dashboard),





module.exports = router