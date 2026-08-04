const express = require('express');
const protect = require('../middleware/auth');
const { createMilkEntry, getMilkEntries, updateMilkEntry, deleteMilkEntry } = require('../controllers/milkController');

const router = express.Router();

router.post('/', protect, createMilkEntry);
router.get('/', protect, getMilkEntries);
router.put('/:id', protect, updateMilkEntry);
router.delete('/:id', protect, deleteMilkEntry);

module.exports = router;
