// ===== Purchase Modal =====
const purchaseModal = document.getElementById('purchase-modal');

function openPurchaseModal(e) {
  if (e) e.preventDefault();
  if (!purchaseModal) return;
  purchaseModal.classList.add('active');
  purchaseModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Fire Meta Pixel event
  if (typeof fbq === 'function') fbq('track', 'InitiateCheckout');
}

function closePurchaseModal() {
  if (!purchaseModal) return;
  purchaseModal.classList.remove('active');
  purchaseModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (purchaseModal) {
  purchaseModal.querySelector('.purchase-modal__backdrop').addEventListener('click', closePurchaseModal);
  purchaseModal.querySelector('.purchase-modal__close').addEventListener('click', closePurchaseModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && purchaseModal.classList.contains('active')) closePurchaseModal();
  });
}


// Cache all DOM queries upfront
const navbar = document.getElementById('navbar');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const timelineSection = document.getElementById('section-como-funciona');
const timelineFill = document.querySelector('.timeline-line-fill');
const timelineLine = document.querySelector('.timeline-line');
const faqList = document.querySelector('.faq-list');
const body = document.body;
let viewportH = window.innerHeight;

// Calculate timeline dot boundaries
let tlTop = 0, tlHeight = 0;
function measureTimeline() {
  if (!timelineSection) return;
  const dots = timelineSection.querySelectorAll('.timeline-dot');
  if (dots.length < 2) return;
  const timeline = timelineSection.querySelector('.timeline');
  if (!timeline) return;
  const firstDot = dots[0];
  const lastDot = dots[dots.length - 1];
  const timelineRect = timeline.getBoundingClientRect();
  const firstCenter = firstDot.getBoundingClientRect().top + firstDot.offsetHeight / 2 - timelineRect.top;
  const lastCenter = lastDot.getBoundingClientRect().top + lastDot.offsetHeight / 2 - timelineRect.top;
  tlTop = firstCenter;
  tlHeight = lastCenter - firstCenter;
  // Position the gray background line
  if (timelineLine) {
    timelineLine.style.top = tlTop + 'px';
    timelineLine.style.height = tlHeight + 'px';
  }
  // Constrain the fill line
  if (timelineFill) {
    timelineFill.style.top = tlTop + 'px';
  }
}
// Measure once after layout settles
requestAnimationFrame(() => requestAnimationFrame(measureTimeline));

// Debounced scroll via requestAnimationFrame
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const sy = window.scrollY;
    // Navbar
    navbar.classList.toggle('scrolled', sy > 80);
    // Timeline fill
    if (timelineSection && timelineFill && tlHeight > 0) {
      const rect = timelineSection.getBoundingClientRect();
      if (rect.top < viewportH && rect.bottom > 0) {
        const progress = Math.min(1, Math.max(0, (viewportH - rect.top) / (timelineSection.offsetHeight + viewportH * 0.4)));
        timelineFill.style.height = Math.min(progress * timelineSection.offsetHeight, tlHeight) + 'px';
      }
    }
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

// Cache viewport height on resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { viewportH = window.innerHeight; measureTimeline(); }, 150);
}, { passive: true });

// Mobile menu
hamburger.addEventListener('click', () => {
  body.classList.toggle('menu-open');
  mobileMenu.classList.toggle('active');
});
mobileMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    body.classList.remove('menu-open');
    mobileMenu.classList.remove('active');
  }
});

// Smooth scroll with offset — event delegation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href === '#') return;
  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    const navH = document.querySelector('nav')?.offsetHeight || 80;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navH;
    // Jump close first to force layout, then smooth to exact spot
    window.scrollTo({ top: targetY - 1, behavior: 'instant' });
    requestAnimationFrame(() => {
      const finalY = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: finalY, behavior: 'smooth' });
    });
  }
});

// FAQ accordion — single delegated listener
if (faqList) {
  faqList.addEventListener('click', (e) => {
    const question = e.target.closest('.faq-question');
    if (!question) return;
    const item = question.parentElement;
    const isActive = item.classList.contains('active');
    const active = faqList.querySelector('.faq-item.active');
    if (active) active.classList.remove('active');
    if (!isActive) item.classList.add('active');
  });
}

// Scroll-triggered animations — unobserve after visible
const observer = new IntersectionObserver((entries, obs) => {
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].isIntersecting) {
      entries[i].target.classList.add('visible');
      obs.unobserve(entries[i].target);
    }
  }
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.fade-up,.fade-left,.fade-right').forEach(el => observer.observe(el));



// ===== YouTube Facade — click-to-load =====
const vslFacade = document.getElementById('vslFacade');
if (vslFacade) {
  function loadYouTube() {
    const wrapper = vslFacade.parentElement;
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/OvV-GvWhQ7s?rel=0&autoplay=1';
    iframe.className = 'vsl-player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    wrapper.innerHTML = '';
    wrapper.appendChild(iframe);
  }
  vslFacade.addEventListener('click', loadYouTube, { once: true });
  vslFacade.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadYouTube(); }
  }, { once: true });
}



// ===== META PIXEL — InitiateCheckout Conversion =====
// Intercept CTA clicks, show loading overlay, fire pixel, then navigate
(function () {
  var SELECTORS = '.btn-primary, .btn-dark';
  var DELAY_MS = 1200; // time to let the pixel HTTP request complete
  var overlayActive = false;

  function createOverlay() {
    var el = document.createElement('div');
    el.className = 'fbq-overlay';
    el.innerHTML =
      '<div class="fbq-overlay__spinner"></div>' +
      '<span class="fbq-overlay__text">Iniciando contato…</span>';
    document.body.appendChild(el);
    return el;
  }

  function removeOverlay(el) {
    el.classList.add('removing');
    el.addEventListener('animationend', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      overlayActive = false;
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest(SELECTORS);
    if (!btn || overlayActive) return;

    // Get the destination URL
    var href = btn.getAttribute('href') || btn.closest('a')?.getAttribute('href');
    // Only intercept external / WhatsApp links
    if (!href || href.startsWith('#')) return;

    e.preventDefault();
    e.stopPropagation();
    overlayActive = true;

    // Show overlay
    var overlay = createOverlay();

    // Fire pixel
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout');
    }

    // Wait for pixel to complete, then navigate
    setTimeout(function () {
      window.open(href, '_blank');
      removeOverlay(overlay);
    }, DELAY_MS);
  }, true); // capture phase to beat other listeners
})();
