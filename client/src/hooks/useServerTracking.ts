import { useEffect, useRef } from 'react';

/** Characters for SCK generation (A-Z a-z 0-9) */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Generate an 8-char alphanumeric SCK */
function generateSck(): string {
  let result = '';
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 8; i++) {
    result += CHARS[arr[i] % CHARS.length];
  }
  return result;
}

/** Get or create the SCK from cookie */
function getSck(): string {
  const match = document.cookie.match(/(?:^|; )_sck=([^;]+)/);
  if (match) return match[1];

  const sck = generateSck();
  document.cookie = `_sck=${sck}; max-age=2592000; path=/; SameSite=Lax`;
  return sck;
}

/** Read a cookie by name */
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match?.[1];
}

/** Capture all UTMs + tracking params from URL and persist in sessionStorage */
function captureParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'xcod', 'fbclid', 'gclid'];
  const stored: Record<string, string> = JSON.parse(sessionStorage.getItem('_track_params') || '{}');

  let updated = false;
  for (const key of keys) {
    const val = params.get(key);
    if (val) { stored[key] = val; updated = true; }
  }
  if (updated) sessionStorage.setItem('_track_params', JSON.stringify(stored));
  return stored;
}

/** Get all stored tracking params */
export function getTrackingParams(): Record<string, string> {
  return JSON.parse(sessionStorage.getItem('_track_params') || '{}');
}

/** Get the current SCK */
export function getCurrentSck(): string {
  return getSck();
}

/**
 * Build a checkout URL with SCK + all UTMs appended as query params
 */
export function getCheckoutUrl(baseUrl: string): string {
  if (!baseUrl) return baseUrl;
  try {
    const url = new URL(baseUrl);
    const sck = getSck();
    const params = getTrackingParams();

    url.searchParams.set('sck', sck);
    for (const [key, value] of Object.entries(params)) {
      if (value && value.trim()) url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    // If URL parsing fails, append as query string manually
    const sck = getSck();
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}sck=${sck}`;
  }
}

/**
 * Track a server-side event (modal_open, pix_click, card_click)
 */
export function trackServerEvent(eventType: string, pageId?: number, metadata?: Record<string, any>) {
  const sck = getSck();
  fetch('/api/track/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sck, page_id: pageId, event_type: eventType, metadata }),
  }).catch(() => {});
}

/**
 * Hook: registers a visit when a public landing page mounts.
 * Call once per page component (Home).
 */
export function useServerTracking(pageId?: number, slug?: string) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track public pages, not admin or obrigado
    if (window.location.pathname.startsWith('/admin')) return;
    if (window.location.pathname.includes('/obrigado')) return;
    if (tracked.current) return;
    tracked.current = true;

    const sck = getSck();
    const params = captureParams();
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');

    fetch('/api/track/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sck,
        page_id: pageId,
        slug: slug || window.location.pathname.replace('/', ''),
        ...params,
        referrer: document.referrer || undefined,
        fbp,
        fbc,
      }),
    }).catch(() => {});
  }, [pageId, slug]);
}
