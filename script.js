/* Portfolio Rizki Badrur Ramadhan - JavaScript Vanilla */
'use strict';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Menu mobile (hamburger) */
function initMenu() {
  const burger = $('#burger'), menu = $('#menu');
  const setOpen = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
}

/* 2. Navbar berubah + tombol back to top */
function initScroll() {
  const nav = $('#nav'), top = $('#top');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    top.classList.toggle('show', scrollY > 500);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
}

/* 3. Scroll reveal */
function initReveal() {
  const items = $$('.reveal, .card, .skill');
  items.forEach(el => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) return items.forEach(el => el.classList.add('in'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  items.forEach(el => io.observe(el));
}

/* 4. Efek mengetik di hero */
function initTyping() {
  const el = $('#typing');
  const words = ['Student', 'Beginner Developer', 'Tech Enthusiast'];
  if (reduceMotion) { el.textContent = words.join(' \u2022 '); return; }
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 40 : 90);
  })();
}

/* 5. Titik level skill */
function initSkills() {
  $$('.dots').forEach(d => {
    const level = +d.dataset.l;
    for (let i = 0; i < 3; i++) d.insertAdjacentHTML('beforeend', `<i class="${i < level ? 'on' : ''}"></i>`);
  });
}

/* 6. Kartu project interaktif (klik untuk menyorot) */
function initCards() {
  $$('.card:not(.empty)').forEach(card => {
    const toggle = () => {
      const was = card.classList.contains('open');
      $$('.card.open').forEach(c => c.classList.remove('open'));
      card.classList.toggle('open', !was);
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
}

/* 7. Background jaringan (canvas) */
function initNetwork() {
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let w, h, nodes = [];
  const resize = () => {
    w = cv.width = innerWidth; h = cv.height = innerHeight;
    const count = Math.min(60, Math.floor(w * h / 24000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    nodes.forEach((a, i) => {
      if (!reduceMotion) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
      }
      ctx.fillStyle = 'rgba(212,175,55,.55)';
      ctx.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(212,175,55,${.16 * (1 - d / 140)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); /* garis siku seperti jalur circuit */
        }
      }
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  };
  addEventListener('resize', () => { resize(); if (reduceMotion) draw(); });
  resize(); draw();
}

/* Foto profil: jika foto belum ada, tampil placeholder inisial */
function initPhoto() {
  const box = $('#photo'), img = $('img', box);
  const fail = () => box.classList.add('no-photo');
  img.addEventListener('error', fail);
  if (img.complete && img.naturalWidth === 0) fail();
}

/* 8. Tahun otomatis di footer */
function initYear() { $('#year').textContent = new Date().getFullYear(); }

document.addEventListener('DOMContentLoaded', () => {
  initMenu(); initScroll(); initSkills(); initReveal();
  initTyping(); initCards(); initNetwork(); initYear(); initPhoto();
});
