const express = require('express');
const protect = require('../middleware/auth');
const { getDashboard, getMonthlyReport, createMonthlyRate, getMonthlyRates } = require('../controllers/reportController');

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.get('/monthly-report', protect, getMonthlyReport);
router.post('/monthly-rate', protect, createMonthlyRate);
router.get('/monthly-rate', protect, getMonthlyRates);

module.exports = router;
