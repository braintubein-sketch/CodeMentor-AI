// ============================================
// CodeMentor AI — Express Server Entry Point
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const queryRoutes = require('./routes/query');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// ── API Routes ───────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/query', queryRoutes);

// ── Health Check ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CodeMentor AI Backend running on http://localhost:${PORT}`);
});
