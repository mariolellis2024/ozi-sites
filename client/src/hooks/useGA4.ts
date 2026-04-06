import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

let ga4Loaded = false;

/**
 * Loads GA4 script dynamically and initializes tracking.
 * Only runs on public pages (not /admin/*).
 */
export function useGA4() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Load GA4 on mount
  useEffect(() => {
    // Never track admin pages
    if (location.pathname.startsWith('/admin')) return;

    fetch('/api/settings/public/analytics')
      .then(r => r.json())
      .then(data => {
        if (!data.ga4?.measurement_id) return;
        const mid = data.ga4.measurement_id;

        if (ga4Loaded) return;
        ga4Loaded = true;

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', mid, {
          send_page_view: true,
          // Enhanced measurement is enabled in GA4 admin, but we configure extras
          cookie_flags: 'SameSite=None;Secure',
        });

        // Load gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${mid}`;
        document.head.appendChild(script);
      })
      .catch(() => { /* silently fail */ });
  }, []);

  // Track page views on route change (SPA navigation)
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    if (!window.gtag) return;
    if (prevPath.current === location.pathname) return;

    prevPath.current = location.pathname;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname,
    });
  }, [location.pathname]);
}

/**
 * Track custom GA4 events. Call from onClick handlers etc.
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) return;
  // Never fire on admin pages
  if (window.location.pathname.startsWith('/admin')) return;
  window.gtag('event', eventName, params);
}

// ====== Pre-built tracking helpers ======

/** CTA button click */
export const trackCTA = (ctaText: string, section: string) =>
  trackEvent('cta_click', { cta_text: ctaText, section, page_path: window.location.pathname });

/** Purchase modal opened */
export const trackModalOpen = () =>
  trackEvent('modal_open', { modal_type: 'purchase', page_path: window.location.pathname });

/** Purchase modal closed */
export const trackModalClose = () =>
  trackEvent('modal_close', { modal_type: 'purchase', page_path: window.location.pathname });

/** Payment method selected (Pix or Card link clicked) */
export const trackPaymentSelect = (method: 'pix' | 'card') =>
  trackEvent('payment_select', { payment_method: method, page_path: window.location.pathname });

/** FAQ item toggled */
export const trackFAQ = (question: string, action: 'open' | 'close') =>
  trackEvent('faq_toggle', { question, action, page_path: window.location.pathname });

/** YouTube video facade clicked (video loaded) */
export const trackVideoPlay = (videoId: string) =>
  trackEvent('video_start', { video_id: videoId, video_provider: 'youtube', page_path: window.location.pathname });

/** Section became visible (scroll tracking) */
export const trackSectionView = (sectionId: string) =>
  trackEvent('section_view', { section_id: sectionId, page_path: window.location.pathname });

/** Navigation link clicked */
export const trackNavClick = (linkText: string, linkHref: string) =>
  trackEvent('nav_click', { link_text: linkText, link_href: linkHref });

/** Mobile menu toggled */
export const trackMobileMenu = (action: 'open' | 'close') =>
  trackEvent('mobile_menu', { action });

/** External link clicked */
export const trackOutboundClick = (url: string, linkText: string) =>
  trackEvent('click', { link_url: url, link_text: linkText, outbound: true });

/** Generate lead (when user clicks any purchase/CTA) */
export const trackLead = (source: string) =>
  trackEvent('generate_lead', { source, page_path: window.location.pathname });
