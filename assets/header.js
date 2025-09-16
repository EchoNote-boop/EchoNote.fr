document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header.header');
  const current = header?.dataset.current || '';
  const map = { home: '/index.html', blog: '/blog/index.html' };
  const active = document.querySelector(`.menu a[href="${map[current]}"]`);
  active && active.classList.add('is-active');

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
});