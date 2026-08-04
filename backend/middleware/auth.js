const jwt = require('jsonwebtoken');
const User = require('../models/Admin');

const protect = async (req, res, next) => {
  if (process.env.DISABLE_AUTH === 'true') {
    try {
      const fallbackUser = await User.findOne({}).sort({ createdAt: 1 });
      req.user = { id: process.env.DEFAULT_USER_ID || fallbackUser?._id?.toString() || null };
      return next();
    } catch (error) {
      return next(error);
    }
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = protect;
