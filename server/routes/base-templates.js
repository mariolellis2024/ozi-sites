import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/base-templates — list all fixed templates
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM base_templates ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/base-templates/:id/preview/:type — get template content for preview
router.get('/:id/preview/:type', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM base_templates WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Template não encontrado' });

    const type = req.params.type;
    const content = type === 'obrigado' ? rows[0].content_obrigado : rows[0].content_index;

    res.json({ id: rows[0].id, name: rows[0].name, type, content: content || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar preview' });
  }
});

export default router;
