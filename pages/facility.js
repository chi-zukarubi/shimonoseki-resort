/* ============================================================
   facility.js — FACILITYページ専用 JS
   機能: ヘッダースクロール / アンカーナビハイライト /
         モバイルナビ / スクロールフェードイン
   ============================================================ */

/* ---- 1. ヘッダー: スクロールで背景変化 ---- */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ---- 2. モバイルナビ ---- */
const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('mainNav');
const facilityNav = document.querySelector('.facility-anchor-nav');
const facilityToggle = document.querySelector('.facility-nav-toggle');

function updateFacilityNavTop() {
  if (!facilityNav || !header) return;
  const topValue = `${header.offsetHeight}px`;
  facilityNav.style.setProperty('--facility-nav-top', topValue);
}

window.addEventListener('load', updateFacilityNavTop);
window.addEventListener('resize', updateFacilityNavTop);

navToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

facilityToggle?.addEventListener('click', () => {
  facilityNav?.classList.toggle('open');
  const expanded = facilityNav?.classList.contains('open') ? 'true' : 'false';
  facilityToggle.setAttribute('aria-expanded', expanded);
});

document.addEventListener('click', (e) => {
  if (mainNav && navToggle && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
    mainNav.classList.remove('open');
  }
  if (facilityNav && facilityToggle && !facilityNav.contains(e.target) && !facilityToggle.contains(e.target)) {
    facilityNav.classList.remove('open');
    facilityToggle.setAttribute('aria-expanded', 'false');
  }
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

facilityNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    facilityNav.classList.remove('open');
    facilityToggle?.setAttribute('aria-expanded', 'false');
  });
});

/* ---- 3. スムーズスクロール（アンカーリンク） ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const headerHeight = header?.offsetHeight || 72;
      const anchorNav = document.querySelector('.facility-anchor-nav');
      const navHeight = anchorNav ? anchorNav.offsetHeight : 48;
      const offset = headerHeight + navHeight + 10;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- 4. アンカーナビ: スクロール位置に応じてハイライト ---- */
const sections = ['pool', 'sauna', 'restaurant', 'kids', 'terrace', 'shop'];
const fanLinks  = document.querySelectorAll('.fan-inner a');

function updateFanNav() {
  const scrollY  = window.scrollY + 160; // オフセット考慮
  let current = '';

  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section && section.offsetTop <= scrollY) {
      current = id;
    }
  });

  fanLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('fan-active', href === current);
  });
}

window.addEventListener('scroll', updateFanNav, { passive: true });
updateFanNav(); // 初期実行

/* ---- 5. スクロール連動フェードイン ---- */
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

// revealクラスが付いている要素を監視
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 0.12}s`;
  revealObserver.observe(el);
});

// 各施設カードにも自動でrevealを付与
document.querySelectorAll(
  '.kids-item, .shop-card, .fac-badge, .sub-facility-title'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 3) * 0.1}s`;
  revealObserver.observe(el);
});

// セクション見出しにもフェードイン
document.querySelectorAll(
  '.fac-label-wrap, .fac-desc-block, .fac-img-main, .fac-img-equal, .fac-img-cafe'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});
