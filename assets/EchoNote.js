(function(){
  // Google Analytics 4 initialization
  // TODO: set GA ID
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');

  function track(eventName, params){
    params = params || {};
    if(window.gtag){
      gtag('event', eventName, params);
    }
  }

  function estimateReadingTime(text){
    var words = text.trim().split(/\s+/).length;
    var wpm = 200;
    return Math.ceil(words / wpm);
  }

  function copyToClipboard(text){
    if(navigator.clipboard){
      navigator.clipboard.writeText(text);
    } else {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var blogLink = document.querySelector('a[href="/blog/index.html"]') || document.querySelector('a[href*="blog"]');
    if(blogLink){
      blogLink.addEventListener('click', function(){
        track('nav_blog_click', {category:'navigation', label:'header_nav_blog'});
      });
    }
  });

  window.EchoNote = {
    track: track,
    estimateReadingTime: estimateReadingTime,
    copyToClipboard: copyToClipboard
  };
})();
(function BlogNavFix(){
  const DEBUG_NAV = true;

  function log(type, ...args){
    if(!DEBUG_NAV) return;
    console[type]('[BlogNavFix]', ...args);
  }

  function resolveBlogPath(){
    try {
      var url = new URL('./blog/index.html', window.location.origin + window.location.pathname);
      return url.pathname;
    } catch (e){
      return '/blog/index.html';
    }
  }

  function isUsableHref(href){
    if(!href) return false;
    var bad = ['#', 'javascript:void(0)', 'javascript:;'];
    return bad.indexOf(href.trim().toLowerCase()) === -1;
  }

  function trackBlogClick(){
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'nav_blog_click', {
          event_category: 'navigation',
          event_label: 'header_nav_blog'
        });
      }
    } catch (_) {
      // ignore
    }
  }

  function attach(el){
    if(!el) return false;
    var targetUrl = resolveBlogPath();

    if(!isUsableHref(el.getAttribute('href'))){
      el.setAttribute('href', targetUrl);
    }

    if(el.__blogNavPatched) return true;
    el.__blogNavPatched = true;

    el.addEventListener('click', function(ev){
      try {
        trackBlogClick();
        var href = el.getAttribute('href') || '';
        var isDirect = href.indexOf('/blog/index.html') !== -1;
        if(!isDirect){
          ev.preventDefault();
          window.location.assign(targetUrl);
        }
      } catch (err){
        log('error', 'navigation error', err);
        window.location.href = targetUrl;
      }
    }, {passive:false});

    log('info', 'attached to', el);
    return true;
  }

  function findBlogLink(root){
    root = root || document;
    var el = root.querySelector('#nav-blog');
    if(el) return el;
    el = root.querySelector('[data-nav="blog"]');
    if(el) return el;
    el = root.querySelector('a[href*="blog"]');
    if(el) return el;
    var anchors = root.querySelectorAll('a');
    for(var i=0;i<anchors.length;i++){
      var text = (anchors[i].textContent || anchors[i].innerText || '').trim().toLowerCase();
      if(text === 'blog') return anchors[i];
    }
    return null;
  }

  function boot(){
    var link = findBlogLink();
    if(attach(link)) return;
    log('warn', 'blog link not found yet, observing…');
    var mo = new MutationObserver(function(){
      var dynamicLink = findBlogLink();
      if(attach(dynamicLink)){
        mo.disconnect();
      }
    });
    mo.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
(function(){
  const header = document.querySelector('.en-header');
  if(!header) return;
  const onScroll = () => {
    if(window.scrollY > 8){
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();