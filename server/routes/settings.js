import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/settings/:key — get a setting (admin)
router.get('/:key', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings WHERE key = $1', [req.params.key]);
    if (rows.length === 0) return res.json({ key: req.params.key, value: {} });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /api/settings/:key — upsert a setting (admin)
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { value } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [req.params.key, JSON.stringify(value)]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/settings/public/analytics — public endpoint for analytics config (no auth)
router.get('/public/analytics', async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'ga4'");
    if (rows.length === 0 || !rows[0].value?.measurement_id) {
      return res.json({ ga4: null });
    }
    res.json({ ga4: rows[0].value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/settings/public/site_config — public endpoint for site branding (no auth)
router.get('/public/site_config', async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'site_config'");
    if (rows.length === 0 || !rows[0].value) {
      return res.json({
        logo_url: '/images/logo.webp',
        favicon_url: '/images/favicon.webp',
        site_title: 'Alanis | A Área de Membros do Futuro',
      });
    }
    res.json(rows[0].value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/settings/public/meta — public endpoint for Meta Pixel ID (no auth, no token exposed)
router.get('/public/meta', async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'meta'");
    if (rows.length === 0 || !rows[0].value?.pixel_id) {
      return res.json({ pixel_id: null });
    }
    // Only expose pixel_id, never the access_token
    res.json({ pixel_id: rows[0].value.pixel_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
