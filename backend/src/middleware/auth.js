// ============================================
// CodeMentor AI — JWT Authentication Middleware
// ============================================

const jwt = require('jsonwebtoken');

/**
 * Protects routes by verifying the JWT bearer token.
 * Attaches decoded payload to `req.user` with `id` and `email`.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-me');
    // Normalize: JWT payload has 'userId', expose as both 'id' and 'userId' for compatibility
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
};

module.exports = authenticate;
