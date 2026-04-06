import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import pagesRouter from './routes/pages.js';
import settingsRouter from './routes/settings.js';
import uploadRouter from './routes/upload.js';
import metaRouter from './routes/meta.js';
import trackingRouter from './routes/tracking.js';
import templatesRouter from './routes/templates.js';
import caktoRouter from './routes/cakto.js';
import salesRouter from './routes/sales.js';
import { seed } from './config/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/meta', metaRouter);
app.use('/api/track', trackingRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/cakto', caktoRouter);
app.use('/api/sales', salesRouter);
app.use('/api', uploadRouter);

// Serve React static build
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Seed database then start server
seed().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Alanis server running on port ${PORT}`);
  });
});
