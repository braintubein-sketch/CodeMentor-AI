// ============================================
// CodeMentor AI — Authentication Routes
// ============================================

const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected route
router.get('/me', authenticate, me);

module.exports = router;
