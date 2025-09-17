(() => {
  const header = document.querySelector('.en-header');
  const bar = document.querySelector('.en-header__bar');
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (y > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  const input = document.querySelector('.blog-search__input');
  const clear = document.querySelector('.blog-search__clear');
  clear?.addEventListener('click', () => { if (input){ input.value=''; input.focus(); } });
})();