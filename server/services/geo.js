import pool from '../config/db.js';

/**
 * ip-api.com Geolocation Service
 * 
 * Free tier: 45 requests/minute, HTTP only (no HTTPS).
 * Uses in-memory rate limiting based on X-Rl / X-Ttl headers.
 * All errors are silent — never crashes the app.
 */

// Rate limiter state
let remaining = 45;
let resetAt = 0;

/**
 * Lookup geolocation for an IP and update the visit record.
 * Fire-and-forget — does NOT block the caller.
 * 
 * @param {number} visitId - The visit row ID to update
 * @param {string} ip - IPv4/IPv6 address to lookup
 */
export async function lookupGeo(visitId, ip) {
  try {
    // Skip private/local IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return;
    }

    // Check rate limit
    if (remaining <= 0 && Date.now() < resetAt) {
      return; // Silently skip — rate limited
    }

    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,city,regionName,region,zip,countryCode,isp,lat,lon&lang=pt-BR`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    // Update rate limit from headers
    const rl = response.headers.get('X-Rl');
    const ttl = response.headers.get('X-Ttl');
    if (rl !== null) remaining = parseInt(rl) || 0;
    if (ttl !== null) resetAt = Date.now() + (parseInt(ttl) || 60) * 1000;

    if (response.status === 429) {
      console.warn(`[Geo] Rate limited. Reset in ${ttl || '?'}s`);
      remaining = 0;
      return;
    }

    if (!response.ok) return;

    const data = await response.json();

    if (data.status !== 'success') {
      return; // Query failed (private IP, invalid, etc.)
    }

    // Update visit with geo data
    await pool.query(
      `UPDATE visits SET
        geo_city = $1,
        geo_state = $2,
        geo_zip = $3,
        geo_country = $4,
        geo_isp = $5,
        geo_lat = $6,
        geo_lon = $7,
        geo_source = 'ip'
      WHERE id = $8 AND geo_source IS DISTINCT FROM 'cakto'`,
      [
        data.city || null,
        data.regionName || data.region || null,
        data.zip || null,
        data.countryCode || null,
        data.isp || null,
        data.lat || null,
        data.lon || null,
        visitId,
      ]
    );
  } catch (err) {
    // Silent fail — never crash
    if (err.name !== 'AbortError') {
      console.warn('[Geo] Lookup error (silent):', err.message);
    }
  }
}
