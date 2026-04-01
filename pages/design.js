/* ============================================================
   design.js — 空間設計ページ専用JS
   ============================================================ */

/* ---- ヘッダースクロール ---- */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ---- モバイルナビ ---- */
const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('mainNav');

navToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
    mainNav.classList.remove('open');
  }
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* ---- スクロールフェードイン ---- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(
  '.design-header, .design-carousel, .design-desc-block, .design-point'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 3) * 0.1}s`;
  revealObserver.observe(el);
});

/* ---- スムーズスクロール ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
