import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/track/visit — Register a new page visit
 * Public endpoint (no auth). Browser sends SCK + UTMs, server adds IP/UA.
 */
router.post('/visit', async (req, res) => {
  try {
    const {
      sck, page_id, slug,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      src, xcod, fbclid, gclid,
      referrer, fbp, fbc,
    } = req.body;

    if (!sck) return res.status(400).json({ error: 'sck is required' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const user_agent = req.headers['user-agent'] || '';

    await pool.query(
      `INSERT INTO visits (sck, page_id, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, xcod, fbclid, gclid, ip, user_agent, referrer, fbp, fbc)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [sck, page_id || null, slug || null, utm_source || null, utm_medium || null, utm_campaign || null, utm_content || null, utm_term || null, src || null, xcod || null, fbclid || null, gclid || null, ip, user_agent, referrer || null, fbp || null, fbc || null]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[Track] Visit error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/track/event — Register a user action
 * Public endpoint. Types: modal_open, pix_click, card_click
 */
router.post('/event', async (req, res) => {
  try {
    const { sck, page_id, event_type, metadata } = req.body;

    if (!sck || !event_type) {
      return res.status(400).json({ error: 'sck and event_type are required' });
    }

    await pool.query(
      `INSERT INTO events (sck, page_id, event_type, metadata) VALUES ($1,$2,$3,$4)`,
      [sck, page_id || null, event_type, metadata ? JSON.stringify(metadata) : '{}']
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[Track] Event error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /api/track/stats-all — Aggregated stats for all pages
 * Admin only. Returns compact stats per page for the admin list.
 */
router.get('/stats-all', authMiddleware, async (_req, res) => {
  try {
    // Visits per page
    const { rows: visitRows } = await pool.query(`
      SELECT page_id, COUNT(*)::int AS total_visits
      FROM visits
      WHERE page_id IS NOT NULL
      GROUP BY page_id
    `);

    // Events per page per type
    const { rows: eventRows } = await pool.query(`
      SELECT page_id, event_type, COUNT(*)::int AS count
      FROM events
      WHERE page_id IS NOT NULL
      GROUP BY page_id, event_type
    `);

    // Build stats map
    const stats = {};
    for (const row of visitRows) {
      stats[row.page_id] = {
        total_visits: row.total_visits,
        modal_open: 0,
        pix_click: 0,
        card_click: 0,
      };
    }

    for (const row of eventRows) {
      if (!stats[row.page_id]) {
        stats[row.page_id] = { total_visits: 0, modal_open: 0, pix_click: 0, card_click: 0 };
      }
      if (row.event_type in stats[row.page_id]) {
        stats[row.page_id][row.event_type] = row.count;
      }
    }

    res.json(stats);
  } catch (err) {
    console.error('[Track] Stats-all error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /api/track/stats/:pageId — Detailed stats for a single page
 * Admin only.
 */
router.get('/stats/:pageId', authMiddleware, async (req, res) => {
  try {
    const pageId = parseInt(req.params.pageId);

    const [visitResult, eventResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM visits WHERE page_id = $1`, [pageId]),
      pool.query(
        `SELECT event_type, COUNT(*)::int AS count FROM events WHERE page_id = $1 GROUP BY event_type`,
        [pageId]
      ),
    ]);

    const eventMap = {};
    for (const row of eventResult.rows) {
      eventMap[row.event_type] = row.count;
    }

    const totalVisits = visitResult.rows[0]?.total || 0;

    res.json({
      total_visits: totalVisits,
      modal_open: eventMap.modal_open || 0,
      pix_click: eventMap.pix_click || 0,
      card_click: eventMap.card_click || 0,
      purchases: (await pool.query(`SELECT COUNT(*)::int AS total FROM visits WHERE page_id = $1 AND purchased = true`, [pageId])).rows[0]?.total || 0,
    });
  } catch (err) {
    console.error('[Track] Stats error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
