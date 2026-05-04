// ============================================
// CodeMentor AI — AI Processing Routes
// ============================================

const express = require('express');
const router = express.Router();
const { processCode } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

// AI routes use optional auth — works for guests, records user if logged in
router.post('/', optionalAuth, processCode);

module.exports = router;
