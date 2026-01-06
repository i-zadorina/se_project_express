const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

const optionalAuth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next();
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (err) {}

  return next();
};

module.exports = optionalAuth;
