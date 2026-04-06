import { Router } from 'express';
import multer from 'multer';
import { Client } from 'minio';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Multer — memory storage (buffer → MinIO)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// MinIO client (lazy init)
let minioClient = null;
const BUCKET = 'ozi-sites';

function getMinioClient() {
  if (minioClient) return minioClient;
  minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });
  return minioClient;
}

async function ensureBucket() {
  const mc = getMinioClient();
  const exists = await mc.bucketExists(BUCKET);
  if (!exists) {
    await mc.makeBucket(BUCKET);
    // Set public read policy
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET}/*`],
      }],
    });
    await mc.setBucketPolicy(BUCKET, policy);
  }
}

// POST /api/upload — upload image to MinIO (admin only)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    await ensureBucket();
    const mc = getMinioClient();

    const ext = path.extname(req.file.originalname) || '.webp';
    const filename = `${uuid()}${ext}`;

    await mc.putObject(BUCKET, filename, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype,
    });

    // Return proxy URL (our server proxies from MinIO)
    const url = `/api/uploads/${filename}`;
    res.json({ url, filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erro no upload' });
  }
});

// GET /api/uploads/:filename — proxy serve from MinIO (public)
router.get('/uploads/:filename', async (req, res) => {
  try {
    const mc = getMinioClient();
    const stat = await mc.statObject(BUCKET, req.params.filename);
    res.setHeader('Content-Type', stat.metaData?.['content-type'] || 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const stream = await mc.getObject(BUCKET, req.params.filename);
    stream.pipe(res);
  } catch (err) {
    if (err.code === 'NotFound' || err.code === 'NoSuchKey') {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    console.error('Serve error:', err);
    res.status(500).json({ error: 'Erro ao servir arquivo' });
  }
});

export default router;
