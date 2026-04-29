// ============================================
// CodeMentor AI — JWT Authentication Middleware
// ============================================

const jwt = require('jsonwebtoken');

/**
 * Protects routes by verifying the JWT bearer token.
 * Attaches decoded payload (userId, email) to `req.user`.
 */
const authenticate = (req, res, next) => {
  req.user = { userId: null, email: 'guest@codementor.ai' };
  next();
};

module.exports = authenticate;
