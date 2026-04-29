// ============================================
// CodeMentor AI — Query History Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getHistory, getQuery, deleteQuery } = require('../controllers/queryController');
const authenticate = require('../middleware/auth');

// All query routes require authentication
router.get('/history', authenticate, getHistory);
router.get('/:id', authenticate, getQuery);
router.delete('/:id', authenticate, deleteQuery);

module.exports = router;
