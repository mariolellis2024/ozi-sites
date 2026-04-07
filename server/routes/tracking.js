import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { lookupGeo } from '../services/geo.js';

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

    const { rows } = await pool.query(
      `INSERT INTO visits (sck, page_id, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, xcod, fbclid, gclid, ip, user_agent, referrer, fbp, fbc)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id`,
      [sck, page_id || null, slug || null, utm_source || null, utm_medium || null, utm_campaign || null, utm_content || null, utm_term || null, src || null, xcod || null, fbclid || null, gclid || null, ip, user_agent, referrer || null, fbp || null, fbc || null]
    );

    const visitId = rows[0].id;

    // Fire-and-forget: geo lookup in background
    lookupGeo(visitId, ip).catch(() => {});

    // page_view event for the timeline (linked to this visit)
    pool.query(
      'INSERT INTO events (sck, page_id, event_type, visit_id) VALUES ($1,$2,$3,$4)',
      [sck, page_id || null, 'page_view', visitId]
    ).catch(() => {});

    res.json({ success: true, visit_id: visitId });


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
    const { sck, page_id, event_type, metadata, visit_id } = req.body;

    if (!sck || !event_type) {
      return res.status(400).json({ error: 'sck and event_type are required' });
    }

    await pool.query(
      `INSERT INTO events (sck, page_id, event_type, metadata, visit_id) VALUES ($1,$2,$3,$4,$5)`,
      [sck, page_id || null, event_type, metadata ? JSON.stringify(metadata) : '{}', visit_id || null]
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
        comprar: 0,
        pix_click: 0,
        card_click: 0,
      };
    }

    for (const row of eventRows) {
      if (!stats[row.page_id]) {
        stats[row.page_id] = { total_visits: 0, comprar: 0, pix_click: 0, card_click: 0 };
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
 * GET /api/track/stats/:pageId — Detailed stats for a single page (unique users)
 * Admin only. All metrics count DISTINCT sck (unique visitors).
 */
router.get('/stats/:pageId', authMiddleware, async (req, res) => {
  try {
    const pageId = parseInt(req.params.pageId);

    const [viewsResult, comprarResult, checkoutResult, purchasesResult] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT sck)::int AS total FROM visits WHERE page_id = $1`, [pageId]),
      pool.query(`SELECT COUNT(DISTINCT sck)::int AS total FROM events WHERE page_id = $1 AND event_type = 'comprar'`, [pageId]),
      pool.query(`SELECT COUNT(DISTINCT sck)::int AS total FROM events WHERE page_id = $1 AND event_type IN ('pix_click', 'card_click')`, [pageId]),
      pool.query(`SELECT COUNT(DISTINCT sck)::int AS total FROM visits WHERE page_id = $1 AND purchased = true`, [pageId]),
    ]);

    res.json({
      total_visits: viewsResult.rows[0]?.total || 0,
      comprar: comprarResult.rows[0]?.total || 0,
      checkout_click: checkoutResult.rows[0]?.total || 0,
      purchases: purchasesResult.rows[0]?.total || 0,
    });
  } catch (err) {
    console.error('[Track] Stats error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /api/track/visits — Paginated list of all visits with their events
 * Admin only. Query params: page (default 1), limit (default 50), slug (optional filter)
 */
router.get('/visits', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const slugFilter = req.query.slug || null;
    const purchasedFilter = req.query.purchased;

    // Build WHERE clause
    const conditions = [];
    const params = [];
    if (slugFilter) {
      params.push(slugFilter);
      conditions.push(`v.slug = $${params.length}`);
    }
    if (purchasedFilter === 'true') {
      conditions.push(`v.purchased = true`);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `SELECT COUNT(*)::int AS total FROM visits v ${where}`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Fetch visits with meta sync status from sales
    const visitQuery = `
      SELECT v.id, v.sck, v.page_id, v.slug, v.utm_source, v.utm_medium, v.utm_campaign,
             v.utm_content, v.utm_term, v.src, v.xcod, v.fbclid, v.gclid,
             v.ip, v.referrer, v.fbp, v.fbc, v.purchased, v.purchase_data, v.purchased_at,
             v.geo_city, v.geo_state, v.geo_zip, v.geo_country, v.geo_isp, v.geo_lat, v.geo_lon, v.geo_source,
             v.created_at,
             s.meta_synced, s.meta_synced_at
      FROM visits v
      LEFT JOIN sales s ON s.visit_id = v.id
      ${where}
      ORDER BY v.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const { rows: visits } = await pool.query(visitQuery, [...params, limit, offset]);

    // Fetch events linked to each visit by visit_id
    const visitIds = visits.map(v => v.id);
    let eventsMap = {};
    if (visitIds.length > 0) {
      const { rows: events } = await pool.query(
        `SELECT visit_id, event_type, created_at FROM events WHERE visit_id = ANY($1) ORDER BY created_at ASC`,
        [visitIds]
      );
      for (const ev of events) {
        if (!eventsMap[ev.visit_id]) eventsMap[ev.visit_id] = [];
        eventsMap[ev.visit_id].push({ type: ev.event_type, at: ev.created_at });
      }
    }

    const result = visits.map(v => ({
      ...v,
      events: eventsMap[v.id] || [],
    }));

    res.json({ visits: result, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Track] Visits list error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
