// ============================================
// CodeMentor AI — Query History Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getHistory, getQuery, deleteQuery } = require('../controllers/queryController');
const { optionalAuth } = require('../middleware/auth');

// Query routes use optional auth — guests see global queries, users see their own
router.get('/history', optionalAuth, getHistory);
router.get('/:id', optionalAuth, getQuery);
router.delete('/:id', optionalAuth, deleteQuery);

module.exports = router;
