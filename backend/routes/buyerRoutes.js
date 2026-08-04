const express = require('express');
const protect = require('../middleware/auth');
const { listBuyers, createBuyer, updateBuyer, deleteBuyer, listSales, createSale, updateSale, deleteSale, getSalesSummary, exportSalesReport } = require('../controllers/buyerController');

const router = express.Router();

router.get('/buyers', protect, listBuyers);
router.post('/buyers', protect, createBuyer);
router.put('/buyers/:id', protect, updateBuyer);
router.delete('/buyers/:id', protect, deleteBuyer);
router.get('/sales', protect, listSales);
router.get('/sales-summary', protect, getSalesSummary);
router.get('/sales-export', protect, exportSalesReport);
router.post('/sales', protect, createSale);
router.put('/sales/:id', protect, updateSale);
router.delete('/sales/:id', protect, deleteSale);

module.exports = router;
