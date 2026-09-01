const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.user) {
    // Already authenticated via Passport session
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized. No token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret');
    const user = await User.findById(decoded.id).select('-oauthProviders');
    if (!user) return res.status(401).json({ error: 'User not found.' });
    if (user.isBanned) return res.status(403).json({ error: 'Account suspended.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { protect };
