const express = require('express');
const protect = require('../middleware/auth');
const { createCurdEntry, getCurdEntries, updateCurdEntry, deleteCurdEntry } = require('../controllers/curdController');

const router = express.Router();

router.post('/', protect, createCurdEntry);
router.get('/', protect, getCurdEntries);
router.put('/:id', protect, updateCurdEntry);
router.delete('/:id', protect, deleteCurdEntry);

module.exports = router;
