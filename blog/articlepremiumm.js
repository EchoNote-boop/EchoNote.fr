// Progression lecture
(function(){
  const bar = document.createElement('div');
  bar.className = 'article-progress';
  document.body.appendChild(bar);
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = (h.scrollTop / max) * 100;
    bar.style.width = pct + '%';
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// Révélations
(function(){
  const els = document.querySelectorAll('.reveal, h2, .related-card, blockquote, figure, pre');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold:.12, rootMargin:'-40px' });
  els.forEach(el=> io.observe(el));
})();

// Hover magnet sur CTA
(function(){
  const cta = document.querySelector('.btn-cta');
  if(!cta) return;
  const strength = 6;
  cta.addEventListener('mousemove', (e)=>{
    const r = cta.getBoundingClientRect();
    const x = ((e.clientX - r.left)/r.width - .5) * strength;
    const y = ((e.clientY - r.top)/r.height - .5) * strength;
    cta.style.transform = `translate(${x}px, ${y}px)`;
  });
  cta.addEventListener('mouseleave', ()=> cta.style.transform = '');
})();

// Bouton copier
(function(){
  document.querySelectorAll('.btn-copy').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const pre = btn.closest('pre');
      if(!pre) return;
      const text = pre.innerText;
      navigator.clipboard.writeText(text).then(()=>{
        const old = btn.textContent;
        btn.textContent = 'Copié!';
        setTimeout(()=> btn.textContent = old, 1200);
      });
    });
  });
})();
