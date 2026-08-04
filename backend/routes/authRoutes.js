const express = require('express');
const { loginAdmin, changePassword } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginAdmin);
router.put('/change-password', protect, changePassword);

module.exports = router;
