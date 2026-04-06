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

export default router;
