import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/sales — Paginated list of sales
 * Query params: page, limit, status_filter, event_filter
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status || null;
    const eventFilter = req.query.event || null;

    const conditions = [];
    const params = [];

    if (statusFilter) {
      params.push(statusFilter);
      conditions.push(`s.status = $${params.length}`);
    }
    if (eventFilter) {
      params.push(eventFilter);
      conditions.push(`s.event = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*)::int AS total FROM sales s ${where}`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const salesQuery = `
      SELECT s.*, v.slug AS visit_slug, v.ip AS visit_ip, v.fbp AS visit_fbp, v.fbc AS visit_fbc
      FROM sales s
      LEFT JOIN visits v ON v.id = s.visit_id
      ${where}
      ORDER BY s.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const { rows: sales } = await pool.query(salesQuery, [...params, limit, offset]);

    res.json({ sales, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Sales] List error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /api/sales/stats — Aggregated stats
 */
router.get('/stats', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE event = 'purchase_approved')::int AS total_approved,
        COUNT(*) FILTER (WHERE event = 'pix_generated')::int AS total_pix,
        COUNT(*) FILTER (WHERE event = 'checkout_abandonment')::int AS total_abandoned,
        COUNT(*) FILTER (WHERE event = 'purchase_refunded')::int AS total_refunded,
        COUNT(*) FILTER (WHERE meta_synced = true)::int AS total_synced,
        COALESCE(SUM(payment_amount) FILTER (WHERE event = 'purchase_approved'), 0)::numeric AS total_revenue
      FROM sales
    `);

    res.json(rows[0] || {});
  } catch (err) {
    console.error('[Sales] Stats error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
