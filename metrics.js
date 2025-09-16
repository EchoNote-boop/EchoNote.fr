(function () {
  // ========= CONFIG =========
  const MEASUREMENT_ID = 'G-9G7WGJHBHB'; // <-- remplace par ton ID GA4
  const isLocal = ['localhost','127.0.0.1'].includes(location.hostname);
  const CONSENT_KEY = 'consent_analytics';
  const DEBUG = !!(location.search.includes('debug') || sessionStorage.getItem('metrics_debug'));

  // ========= STATE =========
  const queue = [];
  let analyticsEnabled = false;
  let gtagReady = false;

  function log(...args){ if (DEBUG) console.log('[metrics]', ...args); }

  // ========= GA LOADER =========
  function loadGA() {
    if (gtagReady) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    s.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', MEASUREMENT_ID, {
        anonymize_ip: true,
        send_page_view: true
      });
      gtagReady = true;
      flush();
      log('GA4 loaded');
    };
    document.head.appendChild(s);
  }

  function flush() {
    if (!analyticsEnabled || !gtagReady) return;
    while (queue.length) {
      const {name, params} = queue.shift();
      gtag('event', name, params || {});
    }
  }

  function enableAnalytics() {
    if (analyticsEnabled) return;
    analyticsEnabled = true;
    loadGA();
    flush();
  }

  // ========= PUBLIC EVENT API =========
  function sendEvent(name, params={}) {
    const payload = {
      ...params,
      page: location.pathname || '/',
    };
    if (analyticsEnabled && gtagReady) {
      gtag('event', name, payload);
    } else {
      queue.push({name, params: payload});
    }
    log('event', name, payload);
  }
  window.EN = window.EN || {};
  window.EN.event = sendEvent;
  window.EN.debug = DEBUG;

  // ========= CONSENT WIRING =========
  function checkConsentAndInit() {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (isLocal || saved === 'granted') enableAnalytics();
  }
  document.addEventListener('consent:analytics', enableAnalytics);
  checkConsentAndInit();

  // ========= HELPERS =========
  function datasetParams(el) {
    // remonte tous les data-* utiles
    const d = el?.dataset || {};
    // Mapping explicite des clés connues + tout le reste
    const allowList = ['plan','location','to','pos','cta','feature','slug','title','section','percent','query','domain','question','status','article'];
    const out = {};
    for (const k of allowList) if (d[k] != null) out[k] = d[k];
    // Ajoute href si lien
    if (el?.tagName === 'A' && el.href) {
      try {
        const u = new URL(el.href);
        out.href = el.href;
        out.domain = d.domain || u.hostname;
        out.outbound = (u.hostname !== location.hostname);
      } catch {}
    }
    return out;
  }

  // ========= CLICK TRACKING (data-event="...") =========
  function wireClickEvents(root=document) {
    root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-event]');
      if (!el) return;
      const name = el.dataset.event;
      if (!name) return;
      sendEvent(name, datasetParams(el));
      // cas spécial: outbound
      if (name === 'outbound_click' && el.tagName === 'A' && el.target !== '_blank') {
        // optionnel: délai pour laisser partir l’event
        // e.preventDefault();
        // setTimeout(() => location.href = el.href, 120);
      }
    }, {capture:true});
  }

  // ========= SCROLL DEPTH (25/50/75/100) =========
  function wireScrollDepth() {
    const marks = [25,50,75,100];
    const fired = new Set();
    function onScroll() {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const docH = Math.max(h.scrollHeight, document.body.scrollHeight);
      const winH = window.innerHeight || h.clientHeight;
      const pct = Math.round(((scrollTop + winH) / docH) * 100);
      for (const m of marks) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          sendEvent('scroll_depth', { percent: String(m) });
        }
      }
      if (fired.size === marks.length) window.removeEventListener('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    // première évaluation
    onScroll();
  }

  // ========= SECTION VIEW (50% visible) =========
  function wireSectionViews() {
    const els = document.querySelectorAll('[data-section]');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      for (const it of entries) {
        if (it.isIntersecting && it.intersectionRatio >= 0.5) {
          const el = it.target;
          sendEvent('section_view', { section: el.dataset.section });
          obs.unobserve(el); // 1 fois par section
        }
      }
    }, {threshold: [0.5]});
    els.forEach(el => obs.observe(el));
  }

  // ========= FAQ OPEN (details[data-event="faq_open"]) =========
  function wireFAQ() {
    // compatible <details> ou tout élément avec data-event="faq_open"
    document.addEventListener('toggle', (e) => {
      const el = e.target;
      if (el?.dataset?.event === 'faq_open' && el.open) {
        sendEvent('faq_open', datasetParams(el));
      }
    }, true);
    // fallback sur click
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-event="faq_open"]');
      if (!el) return;
      // déclenche sur ouverture supposée
      sendEvent('faq_open', datasetParams(el));
    }, true);
  }

  // ========= NEWSLETTER SUBMIT (form[data-event="newsletter_submit"]) =========
  function wireNewsletter() {
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.event === 'newsletter_submit') {
        const email = form.querySelector('input[type="email"]')?.value || '';
        sendEvent('newsletter_submit', { status: 'submitted', email_hash: hashEmail(email) });
      }
    }, true);
  }
  // hash ultra-simple (à remplacer si besoin par SHA-256 côté serveur)
  function hashEmail(s) {
    try {
      s = (s || '').trim().toLowerCase();
      let h = 0;
      for (let i=0;i<s.length;i++) h = ((h<<5)-h) + s.charCodeAt(i) | 0;
      return String(h);
    } catch { return ''; }
  }

  // ========= ARTICLE OPEN (au chargement si data-article/slug) =========
  function fireArticleOpenIfAny() {
    const root = document.querySelector('[data-article]') || document.querySelector('[data-slug]');
    if (!root) return;
    const params = datasetParams(root);
    params.article = params.article || params.slug || document.title || '';
    sendEvent('article_open', params);
  }

  // ========= INIT =========
  document.addEventListener('DOMContentLoaded', () => {
    wireClickEvents();
    wireScrollDepth();
    wireSectionViews();
    wireFAQ();
    wireNewsletter();
    fireArticleOpenIfAny();
    log('wired');
  });
})();
