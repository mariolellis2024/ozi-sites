import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/templates — list all saved templates
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM page_templates ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/templates — save a page as template
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, content_index, content_obrigado } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' });

    const { rows } = await pool.query(
      'INSERT INTO page_templates (name, content_index, content_obrigado) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), content_index || {}, content_obrigado || {}]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar modelo' });
  }
});

// DELETE /api/templates/:id — delete a template
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM page_templates WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar modelo' });
  }
});

// POST /api/templates/:id/restore — create a new page from a template
router.post('/:id/restore', authMiddleware, async (req, res) => {
  try {
    const { rows: tpl } = await pool.query('SELECT * FROM page_templates WHERE id = $1', [req.params.id]);
    if (tpl.length === 0) return res.status(404).json({ error: 'Modelo não encontrado' });

    const { name, slug } = req.body;
    if (!name?.trim() || !slug?.trim()) return res.status(400).json({ error: 'Nome e slug obrigatórios' });

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Check slug uniqueness
    const { rows: existing } = await pool.query('SELECT id FROM pages WHERE slug = $1', [cleanSlug]);
    if (existing.length > 0) return res.status(409).json({ error: 'Slug já existe' });

    const { rows: created } = await pool.query(
      'INSERT INTO pages (name, slug, content_index, content_obrigado) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), cleanSlug, tpl[0].content_index, tpl[0].content_obrigado]
    );

    res.status(201).json(created[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao restaurar modelo' });
  }
});

export default router;
