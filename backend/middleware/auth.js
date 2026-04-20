const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Handle localized demo mode token
    if (token === 'Bearer demo-mode-active') {
      req.user = { id: 'demo-user-id', username: 'Demo User', email: 'demo@paisawasool.com' };
      return next();
    }

    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
