import { Router } from 'express';
import crypto from 'crypto';
import pool from '../config/db.js';

const router = Router();

/**
 * SHA-256 hash for Meta PII normalization
 */
function sha256(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

/**
 * Normalize phone number for Meta CAPI (E.164-like)
 * "11 99999-9999" → "5511999999999"
 * "+55 11 99999-9999" → "5511999999999"
 */
function normalizePhone(phone) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  // If it starts with 55 and has 12-13 digits, it's already correct
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  // If 10-11 digits (DDD + number), prepend 55
  if (digits.length >= 10 && digits.length <= 11) return '55' + digits;
  return digits;
}

/**
 * Remove accents from string (for city names etc.)
 */
function removeAccents(str) {
  if (!str) return null;
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Split full name into first name and last name
 * "João da Silva" → { fn: "joão", ln: "da silva" }
 */
function splitName(fullName) {
  if (!fullName) return { fn: null, ln: null };
  const parts = fullName.trim().split(/\s+/);
  const fn = parts[0] || null;
  const ln = parts.length > 1 ? parts.slice(1).join(' ') : null;
  return { fn, ln };
}

/**
 * POST /api/cakto/webhook — Receives Cakto webhook events
 * 
 * Events: purchase_approved, pix_generated, checkout_abandonment,
 *         purchase_refunded, chargeback
 * 
 * No auth middleware — validates via `secret` field in payload.
 */
router.post('/webhook', async (req, res) => {
  try {
    const { secret, event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // 1. Validate secret
    const { rows: settingsRows } = await pool.query("SELECT value FROM settings WHERE key = 'cakto'");
    const caktoConfig = settingsRows[0]?.value;
    if (!caktoConfig?.webhook_secret) {
      console.warn('[Cakto] Webhook received but no secret configured');
      return res.status(200).json({ ok: true, reason: 'not_configured' });
    }

    if (secret !== caktoConfig.webhook_secret) {
      console.warn('[Cakto] Invalid secret');
      return res.status(403).json({ error: 'Invalid secret' });
    }

    // 2. Extract fields
    const caktoId = data.id || null;
    const refId = data.refId || null;
    const customer = data.customer || {};
    const address = customer.address || {};
    const payment = data.payment || {};
    const offer = data.offer || {};

    // Tracking params (Cakto returns them from the checkout URL)
    const sck = data.sck || null;
    const utmSource = data.utm_source || null;
    const utmMedium = data.utm_medium || null;
    const utmCampaign = data.utm_campaign || null;
    const utmContent = data.utm_content || null;
    const utmTerm = data.utm_term || null;
    const src = data.src || null;

    // Status mapping
    let status = 'unknown';
    if (event === 'purchase_approved') status = 'approved';
    else if (event === 'pix_generated') status = 'pending';
    else if (event === 'checkout_abandonment') status = 'abandoned';
    else if (event === 'purchase_refunded') status = 'refunded';
    else if (event === 'chargeback') status = 'chargeback';

    // 3. Idempotent insert (skip if cakto_id already exists)
    if (caktoId) {
      const { rows: existing } = await pool.query('SELECT id FROM sales WHERE cakto_id = $1', [caktoId]);
      if (existing.length > 0) {
        console.log(`[Cakto] Duplicate webhook ignored: ${caktoId}`);
        return res.json({ ok: true, reason: 'duplicate' });
      }
    }

    // 4. Insert sale
    const { rows: insertedRows } = await pool.query(
      `INSERT INTO sales (
        cakto_id, ref_id, event, status,
        customer_name, customer_email, customer_phone, customer_doc,
        address_street, address_number, address_complement, address_neighborhood,
        address_city, address_state, address_zip, address_country,
        payment_method, payment_amount, payment_currency, payment_installments,
        offer_id, offer_name,
        sck, utm_source, utm_medium, utm_campaign, utm_content, utm_term, src,
        raw_payload
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
      ) RETURNING id`,
      [
        caktoId, refId, event, status,
        customer.name || null, customer.email || null, customer.phone || null, customer.docNumber || customer.document || null,
        address.street || null, address.number || null, address.complement || null, address.neighborhood || null,
        address.city || null, address.state || null, address.zipCode || null, address.country || 'BR',
        payment.method || payment.type || null, data.amount || payment.amount || null, data.currency || payment.currency || 'BRL', payment.installments || 1,
        offer.id || null, offer.name || null,
        sck, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, src,
        JSON.stringify(req.body),
      ]
    );

    const saleId = insertedRows[0].id;
    console.log(`[Cakto] Sale #${saleId} created: ${event} (sck: ${sck || 'none'})`);

    // 5. For approved purchases: SCK lookup + Meta sync
    if (event === 'purchase_approved' && sck) {
      // Find the visit by SCK
      const { rows: visitRows } = await pool.query(
        'SELECT id, ip, user_agent, fbp, fbc, created_at FROM visits WHERE sck = $1 ORDER BY created_at DESC LIMIT 1',
        [sck]
      );

      if (visitRows.length > 0) {
        const visit = visitRows[0];

        // Update visit as purchased
        await pool.query(
          'UPDATE visits SET purchased = true, purchase_data = $1, purchased_at = NOW() WHERE id = $2',
          [JSON.stringify({
            order_id: caktoId,
            email: customer.email,
            phone: customer.phone,
            first_name: splitName(customer.name).fn,
            last_name: splitName(customer.name).ln,
            city: address.city,
            state: address.state,
            zip: address.zipCode,
            country: address.country || 'BR',
            amount: data.amount || payment.amount,
            method: payment.method || payment.type,
          }), visit.id]
        );

        // Link sale to visit
        await pool.query('UPDATE sales SET visit_id = $1 WHERE id = $2', [visit.id, saleId]);

        // Check if within 7-day Meta window
        const visitAge = Date.now() - new Date(visit.created_at).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (visitAge <= sevenDays) {
          // Send Meta CAPI Purchase event
          try {
            const metaResult = await sendMetaPurchase({
              visit,
              customer,
              address,
              amount: data.amount || payment.amount,
              currency: data.currency || payment.currency || 'BRL',
              sck,
            });

            if (metaResult) {
              await pool.query('UPDATE sales SET meta_synced = true, meta_synced_at = NOW() WHERE id = $1', [saleId]);
              console.log(`[Cakto] Meta Purchase synced for sale #${saleId}`);
            }
          } catch (metaErr) {
            console.error('[Cakto] Meta sync error:', metaErr.message);
          }
        } else {
          console.log(`[Cakto] Visit too old for Meta sync (${Math.round(visitAge / 86400000)}d), skipping`);
        }
      } else {
        console.log(`[Cakto] No visit found for sck: ${sck}`);
      }
    }

    // Always respond 200 quickly
    res.json({ ok: true, sale_id: saleId });
  } catch (err) {
    console.error('[Cakto] Webhook error:', err);
    // Still return 200 to prevent Cakto retries on our errors
    res.status(200).json({ ok: false, error: 'Internal error' });
  }
});

/**
 * Send Meta CAPI Purchase event with enriched data
 */
async function sendMetaPurchase({ visit, customer, address, amount, currency, sck }) {
  // Get Meta config
  const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'meta'");
  if (!rows.length || !rows[0].value?.pixel_id || !rows[0].value?.access_token) {
    console.log('[Cakto] Meta not configured, skipping Purchase event');
    return false;
  }

  const { pixel_id, access_token } = rows[0].value;
  const { fn, ln } = splitName(customer.name);
  const phone = normalizePhone(customer.phone);

  // Build user_data with ALL parameters for max EMQ
  const user_data = {
    client_ip_address: visit.ip,
    client_user_agent: visit.user_agent,
  };

  // Browser IDs (NOT hashed)
  if (visit.fbp) user_data.fbp = visit.fbp;
  if (visit.fbc) user_data.fbc = visit.fbc;
  if (sck) user_data.external_id = sck;

  // PII (SHA-256 hashed, normalized)
  if (customer.email) user_data.em = sha256(customer.email);
  if (phone) user_data.ph = sha256(phone);
  if (fn) user_data.fn = sha256(fn);
  if (ln) user_data.ln = sha256(ln);
  if (address.city) user_data.ct = sha256(removeAccents(address.city));
  if (address.state) user_data.st = sha256(address.state);
  if (address.zipCode) user_data.zp = sha256(address.zipCode.replace(/\D/g, ''));
  if (address.country) user_data.country = sha256((address.country || 'br'));

  const eventId = crypto.randomUUID();

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      user_data,
      custom_data: {
        value: parseFloat(amount) || 0,
        currency: currency || 'BRL',
        content_name: 'purchase',
      },
    }],
  };

  const url = `https://graph.facebook.com/v21.0/${pixel_id}/events?access_token=${encodeURIComponent(access_token)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('[Cakto → Meta] CAPI error:', JSON.stringify(result));
    return false;
  }

  console.log(`[Cakto → Meta] Purchase sent (event_id: ${eventId}, events_received: ${result.events_received})`);
  return true;
}

export default router;
