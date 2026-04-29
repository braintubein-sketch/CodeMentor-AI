// ============================================
// CodeMentor AI — AI Processing Routes
// ============================================

const express = require('express');
const router = express.Router();
const { processCode } = require('../controllers/aiController');
const authenticate = require('../middleware/auth');

// All AI routes require authentication
router.post('/', authenticate, processCode);

module.exports = router;
