import pool from './db.js';

export async function seed() {
  try {
    // Ensure admin_users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'super_admin',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Ensure pages table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        content_index JSONB DEFAULT '{}',
        content_obrigado JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Ensure settings table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Seed page template if not exists
    const { rows: tmpl } = await pool.query("SELECT id FROM settings WHERE key = 'page_template'");
    if (tmpl.length === 0) {
      const defaultTemplate = {
        content_index: {
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
        },
        content_obrigado: {
          title: 'Alô, parabéns!',
          subtitle: 'Sua compra foi <span class="accent">confirmada</span>.',
          message: 'Por favor, clique no botão abaixo e crie sua conta com o <strong style="color:#FFFFFF;">mesmo e-mail usado na compra</strong>.',
          cta_text: 'Acessar Área de Membros',
          cta_link: 'https://app.alanis.digital/#/cadastro',
        },
      };
      await pool.query(
        "INSERT INTO settings (key, value) VALUES ('page_template', $1)",
        [JSON.stringify(defaultTemplate)]
      );
      console.log('✅ Page template seeded');
    }

    console.log('✅ Database tables ready');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
}
