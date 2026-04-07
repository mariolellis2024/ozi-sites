import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Hardcoded fallbacks (only used if template not yet saved in DB)
const FALLBACK_INDEX = {
  seo_title: 'Alanis | A Área de Membros do Futuro',
  seo_description: 'A plataforma que transforma conteúdo em máquina de crescimento.',
  hero_title: 'A área de membros que transforma as suas aulas em <span class="accent">uma máquina de dinheiro.</span>',
  hero_subtitle: 'Enquanto áreas de membros "estilo Netflix" confundem seus alunos e matam seu faturamento, a Alanis guia cada aluno pelo caminho certo, com 6 fontes de receita extras, engajamento por IA e um sistema viral que cresce sozinho.',
  hero_image: '/images/hero-1.webp',
  cta_text: 'Quero Minha Plataforma Própria →',
  pix_link: 'https://pay.cakto.com.br/eenyazw',
  pix_price: 'R$ 297,00',
  pix_detail: 'pagamento único — sua pra sempre',
  card_link: 'https://pay.cakto.com.br/33wcy9w_791231',
  card_price: '12x R$ 57,78',
  card_detail: 'no cartão',
};

const FALLBACK_OBRIGADO = {
  title: 'Alô, parabéns!',
  subtitle: 'Sua compra foi <span class="accent">confirmada</span>.',
  message: 'Por favor, clique no botão abaixo e crie sua conta com o <strong style="color:#FFFFFF;">mesmo e-mail usado na compra</strong>.',
  cta_text: 'Acessar Área de Membros',
  cta_link: 'https://app.alanis.digital/#/cadastro',
};

/** Fetch page template from DB, fall back to hardcoded if not saved yet */
async function getTemplate() {
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'page_template'");
    if (rows.length > 0 && rows[0].value?.content_index) {
      return {
        content_index: rows[0].value.content_index,
        content_obrigado: rows[0].value.content_obrigado,
      };
    }
  } catch { /* fall through */ }
  return { content_index: FALLBACK_INDEX, content_obrigado: FALLBACK_OBRIGADO };
}

// ======== ADMIN (protected) ========

// GET /api/pages — list all pages
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, slug, status, palette_id, base_template_id, created_at, updated_at FROM pages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/pages — create page
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, slug, base_template_id, palette_id } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
    if (!cleanSlug) return res.status(400).json({ error: 'Slug inválido' });

    const reserved = ['admin', 'obrigado', 'api'];
    if (reserved.includes(cleanSlug)) return res.status(400).json({ error: 'Slug reservado' });

    // Clone content from selected base template, or fallback to legacy template
    let contentIndex, contentObrigado;
    if (base_template_id) {
      const { rows: btRows } = await pool.query('SELECT content_index, content_obrigado FROM base_templates WHERE id = $1', [base_template_id]);
      if (btRows.length > 0) {
        contentIndex = btRows[0].content_index;
        contentObrigado = btRows[0].content_obrigado;
      }
    }
    if (!contentIndex) {
      const template = await getTemplate();
      contentIndex = template.content_index;
      contentObrigado = template.content_obrigado;
    }

    const paletteValue = palette_id || 'mint';
    const templateIdValue = base_template_id || null;

    const { rows } = await pool.query(
      'INSERT INTO pages (name, slug, content_index, content_obrigado, palette_id, base_template_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, cleanSlug, JSON.stringify(contentIndex), JSON.stringify(contentObrigado), paletteValue, templateIdValue]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Slug já existe' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/pages/:id — get page details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pages WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Página não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /api/pages/:id — update page
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, slug, status, palette_id, content_index, content_obrigado } = req.body;

    const { rows: current } = await pool.query('SELECT * FROM pages WHERE id = $1', [req.params.id]);
    if (current.length === 0) return res.status(404).json({ error: 'Página não encontrada' });

    const updatedName = name || current[0].name;
    const updatedSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-') : current[0].slug;
    const updatedStatus = status || current[0].status;
    const updatedPalette = palette_id || current[0].palette_id || 'mint';
    const updatedIndex = content_index ? JSON.stringify(content_index) : JSON.stringify(current[0].content_index);
    const updatedObrigado = content_obrigado ? JSON.stringify(content_obrigado) : JSON.stringify(current[0].content_obrigado);

    const { rows } = await pool.query(
      'UPDATE pages SET name=$1, slug=$2, status=$3, palette_id=$4, content_index=$5, content_obrigado=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [updatedName, updatedSlug, updatedStatus, updatedPalette, updatedIndex, updatedObrigado, req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug já existe' });
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// DELETE /api/pages/:id — delete page
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM pages WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Página não encontrada' });
    res.json({ message: 'Página deletada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ======== PUBLIC ========

// GET /api/p/:slug — public page index content
router.get('/p/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, slug, palette_id, content_index, content_obrigado FROM pages WHERE slug = $1 AND status = 'active'",
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Página não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
