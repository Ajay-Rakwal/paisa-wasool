const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Admin authentication middleware.
 * Verifies JWT and checks that the user has admin role.
 */
module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
