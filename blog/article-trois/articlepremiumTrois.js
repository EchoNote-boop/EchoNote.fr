// EchoNote — micro-interactions UI (no lib)
(function () {
  const body = document.body;
  if (!body.classList.contains('echonote-article')) return;

  // Barre de progression lecture
  const bar = document.createElement('div');
  bar.className = 'echoprog';
  document.body.appendChild(bar);
  const updateBar = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = scrolled + '%';
  };
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .section-premium, .related-card, .meta-card, .e-figure').forEach(el => io.observe(el));

  // Copy button feedback
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-card') || btn.parentElement;
      const code = pre.querySelector('code');
      if (!code) return;
      navigator.clipboard.writeText(code.innerText).then(() => {
        const prev = btn.textContent;
        btn.textContent = 'Copié !';
        setTimeout(() => btn.textContent = prev, 1400);
      });
    });
  });
})();