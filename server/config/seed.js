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

    // Ensure visits table exists (server-side tracking)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id BIGSERIAL PRIMARY KEY,
        sck VARCHAR(20) NOT NULL,
        page_id INTEGER,
        slug VARCHAR(255),
        utm_source VARCHAR(255),
        utm_medium VARCHAR(255),
        utm_campaign VARCHAR(255),
        utm_content VARCHAR(255),
        utm_term VARCHAR(255),
        src VARCHAR(255),
        xcod VARCHAR(255),
        fbclid VARCHAR(512),
        gclid VARCHAR(512),
        ip VARCHAR(45),
        user_agent TEXT,
        referrer TEXT,
        fbp VARCHAR(255),
        fbc VARCHAR(512),
        purchased BOOLEAN DEFAULT FALSE,
        purchase_data JSONB,
        purchased_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Indexes for visits (idempotent)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_visits_sck ON visits(sck)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_visits_page_id ON visits(page_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_visits_page_created ON visits(page_id, created_at DESC)`);

    // Geo columns for IP-based geolocation (ip-api.com)
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_city VARCHAR(100)`);
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_state VARCHAR(50)`);
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_zip VARCHAR(20)`);
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_country VARCHAR(10)`);
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_isp VARCHAR(255)`);
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_lat DECIMAL(10,7)`);
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_lon DECIMAL(10,7)`);
    await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS geo_source VARCHAR(10) DEFAULT 'ip'`);

    // Ensure events table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id BIGSERIAL PRIMARY KEY,
        sck VARCHAR(20) NOT NULL,
        page_id INTEGER,
        event_type VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Indexes for events (idempotent)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_sck ON events(sck)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_page_id ON events(page_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_page_type ON events(page_id, event_type)`);

    // visit_id column for linking events to specific visits
    await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS visit_id BIGINT`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_visit_id ON events(visit_id)`);

    // Ensure page_templates table exists (saved page models)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content_index JSONB DEFAULT '{}',
        content_obrigado JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Ensure sales table exists (Cakto webhook data)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id BIGSERIAL PRIMARY KEY,
        cakto_id VARCHAR(255) UNIQUE,
        ref_id VARCHAR(100),
        event VARCHAR(50) NOT NULL,
        status VARCHAR(50),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_doc VARCHAR(20),
        address_street VARCHAR(255),
        address_number VARCHAR(20),
        address_complement VARCHAR(100),
        address_neighborhood VARCHAR(100),
        address_city VARCHAR(100),
        address_state VARCHAR(10),
        address_zip VARCHAR(20),
        address_country VARCHAR(10) DEFAULT 'BR',
        payment_method VARCHAR(50),
        payment_amount DECIMAL(10,2),
        payment_currency VARCHAR(10) DEFAULT 'BRL',
        payment_installments INTEGER DEFAULT 1,
        offer_id VARCHAR(100),
        offer_name VARCHAR(255),
        sck VARCHAR(20),
        utm_source VARCHAR(255),
        utm_medium VARCHAR(255),
        utm_campaign VARCHAR(255),
        utm_content VARCHAR(255),
        utm_term VARCHAR(255),
        src VARCHAR(255),
        meta_synced BOOLEAN DEFAULT FALSE,
        meta_synced_at TIMESTAMP,
        visit_id BIGINT,
        raw_payload JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_sck ON sales(sck)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_event ON sales(event)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at DESC)`);

    // Gender detection columns (IBGE API) + split name
    await pool.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(100)`);
    await pool.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_last_name VARCHAR(150)`);
    await pool.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS gender VARCHAR(30)`);
    await pool.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS gender_source VARCHAR(10) DEFAULT 'ibge'`);

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
