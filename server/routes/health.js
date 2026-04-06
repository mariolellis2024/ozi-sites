import { Router } from 'express';
import { testConnection } from '../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const dbOk = await testConnection();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbOk ? 'connected' : 'disconnected',
    },
  });
});

export default router;
