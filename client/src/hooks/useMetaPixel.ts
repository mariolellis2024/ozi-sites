import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

let metaLoaded = false;
let pixelId: string | null = null;

/** Generate a UUID v4 */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Get or create a persistent visitor ID (external_id) */
function getExternalId(): string {
  let id = localStorage.getItem('_meta_ext_id');
  if (!id) {
    id = uuid();
    localStorage.setItem('_meta_ext_id', id);
  }
  return id;
}

/** Read a cookie by name */
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2];
}

/** Capture and persist UTM parameters from URL */
function captureUtms(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const stored = JSON.parse(sessionStorage.getItem('_meta_utms') || '{}');

  // Merge — new URL params override stored
  let updated = false;
  for (const key of utmKeys) {
    const val = params.get(key);
    if (val) { stored[key] = val; updated = true; }
  }
  if (updated) sessionStorage.setItem('_meta_utms', JSON.stringify(stored));
  return stored;
}

/** Get fbc from cookie or fbclid URL param */
function getFbc(): string | undefined {
  const cookie = getCookie('_fbc');
  if (cookie) return cookie;
  // Build fbc from fbclid if present
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    document.cookie = `_fbc=${fbc}; max-age=7776000; path=/; SameSite=Lax`;
    return fbc;
  }
  return undefined;
}

/**
 * Send event to server-side CAPI proxy
 */
async function sendServerEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, any>,
  userData?: Record<string, string>,
) {
  const utms = captureUtms();
  try {
    await fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        fbp: getCookie('_fbp'),
        fbc: getFbc(),
        external_id: getExternalId(),
        user_data: userData,
        custom_data: { ...utms, ...customData },
      }),
    });
  } catch {
    // Silently fail — server CAPI is a backup
  }
}

/**
 * Track a Meta event (dual: browser Pixel + server CAPI)
 */
export function trackMetaEvent(
  eventName: string,
  customData?: Record<string, any>,
  userData?: Record<string, string>,
) {
  if (!pixelId) return;
  if (window.location.pathname.startsWith('/admin')) return;

  const eventId = uuid();
  const utms = captureUtms();
  const mergedData = { ...utms, ...customData };

  // Browser-side pixel
  if (window.fbq) {
    window.fbq('track', eventName, mergedData, { eventID: eventId });
  }

  // Server-side CAPI
  sendServerEvent(eventName, eventId, customData, userData);
}

// ====== Pre-built helpers ======

/** Track Lead event (e.g. when user clicks checkout) */
export function trackMetaLead(source?: string) {
  trackMetaEvent('Lead', { content_name: source || 'checkout' });
}

/** Track ViewContent event */
export function trackMetaViewContent(contentName?: string) {
  trackMetaEvent('ViewContent', { content_name: contentName || document.title });
}

/**
 * Hook: loads Meta Pixel + tracks PageView on route changes.
 * Call once in AppRoutes (alongside useGA4).
 */
export function useMetaPixel() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Load pixel on mount
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    fetch('/api/settings/public/meta')
      .then(r => r.json())
      .then(data => {
        if (!data.pixel_id) return;
        pixelId = data.pixel_id;

        if (metaLoaded) return;
        metaLoaded = true;

        // Initialize fbq
        const f: any = window.fbq = function (...args: any[]) {
          f.callMethod ? f.callMethod(...args) : f.queue.push(args);
        };
        if (!window._fbq) window._fbq = f;
        f.push = f;
        f.loaded = true;
        f.version = '2.0';
        f.queue = [];

        // Init with Advanced Matching (external_id)
        f('init', pixelId, {
          external_id: getExternalId(),
        });

        // Track initial PageView
        const pageViewId = uuid();
        f('track', 'PageView', {}, { eventID: pageViewId });
        sendServerEvent('PageView', pageViewId);

        // Load fbevents.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      })
      .catch(() => { /* silently fail */ });
  }, []);

  // Track PageView on SPA route change
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    if (!pixelId || !window.fbq) return;
    if (prevPath.current === location.pathname) return;

    prevPath.current = location.pathname;

    const eventId = uuid();
    window.fbq('track', 'PageView', {}, { eventID: eventId });
    sendServerEvent('PageView', eventId);
  }, [location.pathname]);
}
