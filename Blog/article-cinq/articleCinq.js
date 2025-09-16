const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if(motionOK){
  const revealEls = document.querySelectorAll('.article-body p, .section-title, .fig-pro, .quote-pro, .note-pro, .code-pro, .related-card');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.transition='transform 500ms var(--ease), opacity 600ms var(--ease)';
        e.target.style.transform='translateY(0)';
        e.target.style.opacity='1';
        io.unobserve(e.target);
      }
    });
  },{threshold:.08});
  revealEls.forEach(el=>{el.style.opacity='0';el.style.transform='translateY(14px)';io.observe(el);});
}

document.querySelectorAll('.code-pro').forEach(block=>{
  const btn = block.querySelector('.btn-copy') || (()=>{const b=document.createElement('button');b.className='btn-copy';b.textContent='Copier';block.appendChild(b);return b;})();
  btn.addEventListener('click',()=>{
    const text = block.innerText.replace('Copier','').trim();
    navigator.clipboard.writeText(text).then(()=>{
      const old = btn.textContent;btn.textContent='Copié !';
      setTimeout(()=>btn.textContent=old,1400);
    });
  });
});