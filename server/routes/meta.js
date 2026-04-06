import { Router } from 'express';
import crypto from 'crypto';
import pool from '../config/db.js';

const router = Router();

/**
 * Hash a value with SHA-256 (for PII: email, phone, name, etc.)
 */
function sha256(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

/**
 * POST /api/meta/event — Server-side proxy for Meta Conversions API
 * 
 * Receives browser event data and forwards to Meta Graph API
 * with enriched server-side parameters (IP, UA) for deduplication.
 * 
 * No auth required — this is called from public pages.
 */
router.post('/event', async (req, res) => {
  try {
    // Get Meta config from DB
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'meta'");
    if (rows.length === 0 || !rows[0].value?.pixel_id || !rows[0].value?.access_token) {
      return res.json({ success: false, reason: 'meta_not_configured' });
    }

    const { pixel_id, access_token } = rows[0].value;

    const {
      event_name,
      event_id,
      event_source_url,
      fbp,
      fbc,
      external_id,
      user_data: clientUserData,
      custom_data,
    } = req.body;

    if (!event_name || !event_id) {
      return res.status(400).json({ error: 'event_name and event_id are required' });
    }

    // Build user_data with server-enriched fields
    const user_data = {
      client_ip_address: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
      client_user_agent: req.headers['user-agent'],
    };

    // Add browser identifiers (not hashed)
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;
    if (external_id) user_data.external_id = external_id;

    // Hash PII if provided (email, phone, name)
    if (clientUserData) {
      if (clientUserData.em) user_data.em = sha256(clientUserData.em);
      if (clientUserData.ph) user_data.ph = sha256(clientUserData.ph.replace(/\D/g, ''));
      if (clientUserData.fn) user_data.fn = sha256(clientUserData.fn);
      if (clientUserData.ln) user_data.ln = sha256(clientUserData.ln);
      if (clientUserData.ct) user_data.ct = sha256(clientUserData.ct);
      if (clientUserData.st) user_data.st = sha256(clientUserData.st);
      if (clientUserData.zp) user_data.zp = sha256(clientUserData.zp);
      if (clientUserData.country) user_data.country = sha256(clientUserData.country);
    }

    // Build event payload
    const eventPayload = {
      data: [{
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        action_source: 'website',
        event_source_url: event_source_url || undefined,
        user_data,
        ...(custom_data ? { custom_data } : {}),
      }],
    };

    // Send to Meta Graph API
    const url = `https://graph.facebook.com/v21.0/${pixel_id}/events?access_token=${encodeURIComponent(access_token)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta CAPI] Error:', JSON.stringify(result));
      return res.status(response.status).json({ success: false, error: result });
    }

    res.json({ success: true, events_received: result.events_received });
  } catch (err) {
    console.error('[Meta CAPI] Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
