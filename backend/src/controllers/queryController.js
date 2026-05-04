// ============================================
// CodeMentor AI — Query History Controller
// ============================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/query/history
 * Retrieve query history.
 * - Authenticated users see their own queries.
 * - Guests see all queries without a userId (anonymous queries).
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filter: logged-in users see their queries, guests see anonymous queries
    const where = userId ? { userId } : { userId: null };

    const [queries, total] = await Promise.all([
      prisma.query.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          code: true,
          language: true,
          action: true,
          response: true,
          createdAt: true,
        },
      }),
      prisma.query.count({ where }),
    ]);

    res.json({
      queries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch query history.' });
  }
};

/**
 * GET /api/query/:id
 * Retrieve a single query by ID.
 */
exports.getQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    // If logged in, only show their queries; if guest, only show anonymous queries
    const where = userId ? { id, userId } : { id, userId: null };

    const query = await prisma.query.findFirst({ where });

    if (!query) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    res.json({ query });
  } catch (err) {
    console.error('Query fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch query.' });
  }
};

/**
 * DELETE /api/query/:id
 * Delete a single query by ID.
 */
exports.deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const where = userId ? { id, userId } : { id, userId: null };
    const query = await prisma.query.findFirst({ where });

    if (!query) {
      return res.status(404).json({ error: 'Query not found or access denied.' });
    }

    await prisma.query.delete({ where: { id } });

    res.json({ message: 'Query deleted successfully.' });
  } catch (err) {
    console.error('Query delete error:', err);
    res.status(500).json({ error: 'Failed to delete query.' });
  }
};
