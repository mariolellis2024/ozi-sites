import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/retention/track
 * Public endpoint (rate-limited). Receives video retention segments from the frontend.
 * Body: { slug, videoId, segments: number[], duration, sck }
 */
router.post('/track', async (req, res) => {
  try {
    const { slug, videoId, segments, duration, sck } = req.body;

    if (!slug || !videoId || !Array.isArray(segments) || !duration || !sck) {
      return res.status(400).json({ error: 'slug, videoId, segments[], duration, and sck are required' });
    }

    // Limit segments to valid range 0-99
    const validSegments = segments.filter(s => typeof s === 'number' && s >= 0 && s < 100);
    if (validSegments.length === 0) {
      return res.json({ success: true }); // Nothing to track
    }

    const key = `${slug}_${videoId}`;
    const { rows } = await pool.query('SELECT id, data FROM video_retention WHERE key = $1', [key]);

    if (rows.length > 0) {
      const data = rows[0].data || {};
      const viewers = data.viewers || {};

      // Merge segments for this viewer (SCK)
      const userEntry = viewers[sck] || { segments: [], lastSeen: 0 };
      const mergedSegments = [...new Set([...userEntry.segments, ...validSegments])].sort((a, b) => a - b);
      viewers[sck] = { segments: mergedSegments, lastSeen: Date.now() };

      await pool.query(
        'UPDATE video_retention SET data = $1, updated_at = NOW() WHERE key = $2',
        [JSON.stringify({ ...data, slug, videoId, viewers, duration: Math.max(data.duration || 0, duration) }), key]
      );
    } else {
      await pool.query(
        'INSERT INTO video_retention (key, data) VALUES ($1, $2)',
        [key, JSON.stringify({
          slug, videoId, duration,
          viewers: {
            [sck]: {
              segments: [...new Set(validSegments)].sort((a, b) => a - b),
              lastSeen: Date.now(),
            },
          },
        })]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Retention track error:', error);
    res.status(500).json({ error: 'Failed to track retention' });
  }
});

/**
 * POST /api/retention/sync
 * Admin-only. Aggregates raw viewer data into retention curves.
 * Computes: segments[], engagementScore, dropOffPoints, uniqueViewers.
 */
router.post('/sync', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM video_retention');
    let processed = 0;

    for (const entry of rows) {
      const data = entry.data || {};
      const viewers = data.viewers || {};
      const viewerIds = Object.keys(viewers);

      if (viewerIds.length === 0) continue;

      const uniqueViewers = viewerIds.length;
      const duration = data.duration || 0;

      // Compute retention curve: for each of 100 segments,
      // what percentage of viewers watched that segment?
      const segmentCounts = new Array(100).fill(0);
      for (const uid of viewerIds) {
        const userSegments = viewers[uid].segments || [];
        for (const seg of userSegments) {
          if (seg >= 0 && seg < 100) {
            segmentCounts[seg]++;
          }
        }
      }

      // Convert to percentage + timestamp labels
      const segments = segmentCounts.map((count, i) => {
        const secondsPerSegment = duration / 100;
        const positionSeconds = i * secondsPerSegment;
        const minutes = Math.floor(positionSeconds / 60);
        const seconds = Math.floor(positionSeconds % 60);
        return {
          position: i,
          value: Math.round((count / uniqueViewers) * 100),
          timestamp: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        };
      });

      // Engagement score (average retention)
      const totalRetention = segments.reduce((sum, s) => sum + s.value, 0);
      const engagementScore = Math.round(totalRetention / segments.length);

      // Detect drop-off points (retention drops > 15%)
      const dropOffPoints = [];
      for (let i = 1; i < segments.length; i++) {
        const drop = segments[i - 1].value - segments[i].value;
        if (drop > 15) {
          dropOffPoints.push({
            position: i,
            severity: drop > 30 ? 'critical' : 'warning',
            timestamp: segments[i].timestamp,
            drop,
          });
        }
      }

      await pool.query(
        'UPDATE video_retention SET data = $1, updated_at = NOW() WHERE key = $2',
        [JSON.stringify({
          ...data,
          segments,
          engagementScore,
          dropOffPoints,
          uniqueViewers,
          videoDuration: duration,
          syncStatus: 'ok',
          lastSyncedAt: Date.now(),
        }), entry.key]
      );
      processed++;
    }

    res.json({ success: true, processed });
  } catch (error) {
    console.error('Retention sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * GET /api/retention/cache
 * Admin-only. Returns aggregated retention data.
 * Query params: slug (required), videoId (optional)
 * If videoId is omitted, returns data for the first video on that slug.
 */
router.get('/cache', authMiddleware, async (req, res) => {
  try {
    const { slug, videoId } = req.query;

    if (!slug) {
      return res.status(400).json({ error: 'slug is required' });
    }

    let rows;
    if (videoId) {
      const key = `${slug}_${videoId}`;
      ({ rows } = await pool.query('SELECT data FROM video_retention WHERE key = $1', [key]));
    } else {
      // Search by slug prefix — get the most recent entry
      ({ rows } = await pool.query(
        "SELECT data FROM video_retention WHERE key LIKE $1 ORDER BY updated_at DESC LIMIT 1",
        [`${slug}_%`]
      ));
    }

    if (rows.length === 0) {
      return res.json({ noData: true, message: 'Nenhum dado de retenção disponível ainda.' });
    }

    const data = rows[0].data || {};

    // If not synced yet
    if (data.syncStatus !== 'ok' || !data.segments || data.segments.length === 0) {
      const viewerCount = Object.keys(data.viewers || {}).length;
      return res.json({
        noData: true,
        message: viewerCount > 0
          ? `${viewerCount} viewer(s) registrado(s). Clique em "Sincronizar" para gerar o gráfico.`
          : 'Nenhum dado de retenção disponível ainda.',
      });
    }

    res.json({
      source: 'internal',
      engagementScore: data.engagementScore || 0,
      videoDuration: data.videoDuration || 0,
      segments: data.segments || [],
      dropOffPoints: data.dropOffPoints || [],
      cachedAt: data.lastSyncedAt,
      uniqueViewers: data.uniqueViewers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get retention data' });
  }
});

export default router;
