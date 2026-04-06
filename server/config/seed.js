import pool from './db.js';
import bcrypt from 'bcryptjs';

const SUPER_ADMIN_EMAIL = 'mariolellis@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Free2026@';

export async function seed() {
  try {
    // Create admin_users table
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

    // Check if super admin exists
    const { rows } = await pool.query('SELECT id FROM admin_users WHERE email = $1', [SUPER_ADMIN_EMAIL]);

    if (rows.length === 0) {
      const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
      await pool.query(
        'INSERT INTO admin_users (email, password, role) VALUES ($1, $2, $3)',
        [SUPER_ADMIN_EMAIL, hash, 'super_admin']
      );
      console.log('✅ Super admin created:', SUPER_ADMIN_EMAIL);
    } else {
      console.log('✅ Super admin already exists');
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
}
