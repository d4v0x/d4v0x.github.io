/* ═══════════════════════════════════════════════════════════
   d4v0x — main.js  |  GSAP 3.12 animations
   ═══════════════════════════════════════════════════════════ */

/* ── Plugin registration ──────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── Black-hole state (shared between particle system & HollowPurple) ── */
window._bh = { state: 'normal', tx: 0, ty: 0 };

/* ── Particles background (page-level) ─────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PARTICLE_COUNT = 55;
  const MAX_DIST       = 145;
  const DOT_COLOR      = 'rgba(99,102,241,';
  const LINE_COLOR     = 'rgba(99,102,241,';

  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.55;
    this.vy = (Math.random() - 0.5) * 0.55;
    this.r     = Math.random() * 1.8 + 0.8;
    this.baseR = this.r;
    this.alpha = 1;
    this.homeX  = this.x;  this.homeY  = this.y;
    this.homeVx = this.vx; this.homeVy = this.vy;
  }

  Particle.prototype.update = function() {
    const bh = window._bh;

    if (!bh || bh.state === 'normal') {
      /* ── Normal free-roam ── */
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
      this.r = this.baseR; this.alpha = 1;
      /* keep home in sync so return always goes back to last free position */
      this.homeX = this.x; this.homeY = this.y;
      this.homeVx = this.vx; this.homeVy = this.vy;

    } else if (bh.state === 'absorbing') {
      /* ── Black-hole pull + spiral ── */
      const dx   = bh.tx - this.x;
      const dy   = bh.ty - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx   = dx / dist, ny = dy / dist;
      /* gravity: stronger as closer */
      const pull = Math.min(0.9, 14 / (dist + 1));
      this.vx += nx * pull;
      this.vy += ny * pull;
      /* tangential kick → spiral inward */
      this.vx += (-ny) * 0.13;
      this.vy += ( nx) * 0.13;
      /* speed cap */
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > 9) { this.vx *= 9 / spd; this.vy *= 9 / spd; }
      this.x += this.vx;
      this.y += this.vy;
      /* fade & shrink as they reach center */
      const t    = Math.max(0, Math.min(1, dist / 72));
      this.alpha = t;
      this.r     = this.baseR * t;

    } else if (bh.state === 'returning') {
      /* ── Exponential spring back to home ── */
      this.x += (this.homeX - this.x) * 0.055;
      this.y += (this.homeY - this.y) * 0.055;
      /* restore velocity to original slow value so normal resumes calmly */
      this.vx += (this.homeVx - this.vx) * 0.09;
      this.vy += (this.homeVy - this.vy) * 0.09;
      this.alpha += (1 - this.alpha) * 0.06;
      this.r      = this.baseR * this.alpha;
    }
  };

  Particle.prototype.draw = function() {
    if (this.alpha < 0.02 || this.r < 0.05) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = DOT_COLOR + (0.55 * this.alpha).toFixed(2) + ')';
    ctx.fill();
  };

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); init(); });
  resize();
  init();
  loop();
})();

/* ── Typing content (bilingual) ──────────────────────── */
const roles = {
  en: [
    'CyberSecurity Analyst',
    'Web & API Pentester',
    'Red Teamer',
    'CTF Player',
    'Sr. Security Consultant',
  ],
  es: [
    'Analista de Ciberseguridad',
    'Pentester Web & API',
    'Red Teamer',
    'Jugador CTF',
    'Consultor Senior de Seguridad',
  ],
};

let roleIndex   = 0;
let typingTimer = null;

function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);
  const lang     = document.documentElement.dataset.lang || 'en';
  const list     = roles[lang];
  const fullText = list[roleIndex % list.length];
  const el       = document.getElementById('typingText');
  roleIndex++;

  let i = 0;
  el.textContent = '';

  function type() {
    el.textContent = fullText.slice(0, i);
    i++;
    if (i <= fullText.length) {
      typingTimer = setTimeout(type, 54);
    } else {
      typingTimer = setTimeout(erase, 1900);
    }
  }

  function erase() {
    const cur = el.textContent;
    if (cur.length > 0) {
      el.textContent = cur.slice(0, -1);
      typingTimer = setTimeout(erase, 30);
    } else {
      typingTimer = setTimeout(startTyping, 360);
    }
  }

  type();
}

/* ── Language toggle ──────────────────────────────────── */
function setLang(lang) {
  document.documentElement.dataset.lang = lang;
  localStorage.setItem('d4v0x-lang', lang);

  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang] || el.textContent;
  });

  // Restart typing in new language
  roleIndex = 0;
  startTyping();
}

document.getElementById('langToggle').addEventListener('click', () => {
  const current = document.documentElement.dataset.lang || 'en';
  setLang(current === 'en' ? 'es' : 'en');
});

// Apply saved preference
const savedLang = localStorage.getItem('d4v0x-lang');
if (savedLang && savedLang !== 'en') setLang(savedLang);

/* ── Nav: shrink on scroll ────────────────────────────── */
const nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 'top -60',
  onEnter:     () => nav.classList.add('scrolled'),
  onLeaveBack: () => nav.classList.remove('scrolled'),
});

/* ── Hero entrance timeline ───────────────────────────── */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });

heroTl
  .to('.nav',             { opacity: 1, y: 0, duration: 0.5 }, 0)
  .from('.nav',           { y: -20 },                          0)
  .to('.avatar-wrapper',  { opacity: 1, x: 0, duration: 0.9 }, 0.2)
  .from('.avatar-wrapper',{ x: -40 },                          0.2)
  .to('.hero-greeting',   { opacity: 1, x: 0, duration: 0.45 }, 0.55)
  .from('.hero-greeting', { x: 30 },                            0.55)
  .to('.glitch-wrapper',  { opacity: 1, x: 0, duration: 0.55 }, 0.68)
  .from('.glitch-wrapper',{ x: 30 },                            0.68)
  .to('.hero-alias',      { opacity: 1, x: 0, duration: 0.4 }, 0.82)
  .from('.hero-alias',    { x: 30 },                           0.82)
  .to('.typing-wrapper',  { opacity: 1, duration: 0.4 },       0.95)
  .to('.hero-socials',    { opacity: 1, y: 0, duration: 0.45 }, 1.05)
  .from('.hero-socials',  { y: 12 },                            1.05)
  .to('.btn-cv',          { opacity: 1, y: 0, duration: 0.4 }, 1.15)
  .from('.btn-cv',        { y: 10 },                           1.15)
  .to('.scroll-indicator',{ opacity: 1, duration: 0.4 },       1.35)
  .call(startTyping,      null,                                 1.1);

/* ── Timeline section header ─────────────────────────── */
gsap.to('#timeline .section-header', {
  opacity: 1,
  y: 0,
  duration: 0.7,
  ease: 'power2.out',
  scrollTrigger: { trigger: '#timeline .section-header', start: 'top 85%' },
});
gsap.from('#timeline .section-header', {
  y: 30,
  scrollTrigger: { trigger: '#timeline .section-header', start: 'top 85%' },
});

/* ── Timeline items: alternating slide-in ────────────── */
gsap.utils.toArray('.tl-item').forEach((item) => {
  const xOffset = item.classList.contains('tl-r') ? 50 : -50;

  gsap.fromTo(item,
    { opacity: 0, x: xOffset },
    {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  gsap.fromTo(item.querySelector('.tl-node'),
    { scale: 0 },
    {
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
      delay: 0.15,
    }
  );
});

/* ── Contact section ─────────────────────────────────── */
gsap.to('#contact .section-header', {
  opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
  scrollTrigger: { trigger: '#contact .section-header', start: 'top 85%' },
});
gsap.from('#contact .section-header', {
  y: 25,
  scrollTrigger: { trigger: '#contact .section-header', start: 'top 85%' },
});

gsap.utils.toArray('.contact-card').forEach((card, i) => {
  gsap.fromTo(card,
    { opacity: 0, y: 30, scale: 0.96 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.55,
      ease: 'power3.out',
      delay: i * 0.08,
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    }
  );
});

/* ── Periodic glitch trigger ─────────────────────────── */
setInterval(() => {
  const name = document.querySelector('.hero-name');
  if (!name) return;
  gsap.timeline()
    .to(name, { x: -4, duration: 0.06 })
    .to(name, { x:  3, duration: 0.06 })
    .to(name, { x: -2, duration: 0.05 })
    .to(name, { x:  0, duration: 0.05 });
}, 7000);

/* ══════════════════════════════════════════════════════════
   HOLLOW PURPLE — Gojo's energy core easter egg
   ══════════════════════════════════════════════════════════ */
(function HollowPurple() {
  'use strict';

  /* ── Canvas setup ─────────────────────────────────────── */
  const canvas = document.getElementById('core-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const SIZE = 420;
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const CX = SIZE / 2, CY = SIZE / 2;

  /* ── Helpers ─────────────────────────────────────────── */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function getR(iv)  { return 140 + iv * 58; }  // radius grows with intensity

  /* ── State machine ────────────────────────────────────── */
  const coreState     = { intensity: 0 };
  let   currentState  = 'idle';
  let   isAbsorbing   = false;   // true while black-hole effect is active
  let   dwellTimer    = null;    // 2-second timer before absorb triggers

  /* ── Char split ───────────────────────────────────────── */
  function splitChars(selector) {
    document.querySelectorAll(selector).forEach(el => {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      const text = el.textContent;
      el.textContent = '';
      [...text].forEach(ch => {
        const s = document.createElement('span');
        s.className   = 'char';
        s.textContent = ch === ' ' ? '\u00a0' : ch;
        el.appendChild(s);
      });
    });
  }
  splitChars('.hero-greeting, .hero-name, .alias-slash, .alias-handle');

  /* ── Black-hole animations ────────────────────────────── */
  const CHAR_SEL = '.hero-greeting .char, .hero-name .char, .alias-slash .char, .alias-handle .char';

  function absorbAll() {
    if (isAbsorbing) return;
    isAbsorbing = true;

    /* point particles toward nucleus (fixed canvas → viewport coords) */
    const cr = coreEl.getBoundingClientRect();
    window._bh = {
      state: 'absorbing',
      tx: cr.left + cr.width  / 2,
      ty: cr.top  + cr.height / 2,
    };

    /* animate each char toward nucleus center */
    const chars = [...document.querySelectorAll(CHAR_SEL)];
    gsap.killTweensOf(chars);
    chars.forEach(ch => {
      const r  = ch.getBoundingClientRect();
      const dx = window._bh.tx - (r.left + r.width  / 2);
      const dy = window._bh.ty - (r.top  + r.height / 2);
      gsap.to(ch, {
        x: dx, y: dy,
        scale: 0, opacity: 0,
        duration: rnd(0.50, 0.95),
        ease: 'power2.in',
        delay: Math.random() * 0.30,
        overwrite: 'auto',
      });
    });
  }

  function restoreAll() {
    if (!isAbsorbing) return;
    isAbsorbing = false;

    /* switch particles to spring-return mode */
    window._bh = { state: 'returning', tx: window._bh.tx, ty: window._bh.ty };
    /* after ~2 s they're close enough to home → resume normal */
    setTimeout(() => { if (window._bh.state === 'returning') window._bh.state = 'normal'; }, 2000);

    /* spring chars back to their natural positions */
    const chars = [...document.querySelectorAll(CHAR_SEL)];
    gsap.killTweensOf(chars);
    gsap.to(chars, {
      x: 0, y: 0, scale: 1, opacity: 1,
      duration: 0.85,
      ease: 'power3.out',
      stagger: { amount: 0.25, from: 'center' },
      overwrite: 'auto',
    });
  }

  /* ── Mouse / state control ────────────────────────────── */
  const coreEl = document.getElementById('energy-core');

  function cancelDwell() {
    if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; }
  }

  function setState(state) {
    if (state === currentState) return;
    currentState = state;

    if (state !== 'active') cancelDwell();

    const iv = { idle: 0, hover: 0.5, active: 1 }[state];
    gsap.to(coreState, {
      intensity: iv,
      duration:  state === 'active' ? 0.30 : 0.65,
      ease:      state === 'active' ? 'power3.in' : 'power2.inOut',
      overwrite: 'auto',
    });

    if (state === 'active' && !dwellTimer && !isAbsorbing) {
      dwellTimer = setTimeout(() => {
        dwellTimer = null;
        if (currentState === 'active') absorbAll();
      }, 2000);
    }
    if (state === 'idle') restoreAll();
  }

  let mRafId = null;
  coreEl.addEventListener('mousemove', e => {
    if (mRafId) return;
    mRafId = requestAnimationFrame(() => {
      mRafId = null;
      const r   = coreEl.getBoundingClientRect();
      const dx  = e.clientX - (r.left + r.width  / 2);
      const dy  = e.clientY - (r.top  + r.height / 2);
      const rad = Math.min(r.width, r.height) / 2;
      const d   = Math.sqrt(dx * dx + dy * dy);
      if      (d < rad * 0.22) setState('active');  // smaller core zone
      else if (d < rad * 0.72) setState('hover');
      else                     setState('idle');
    });
  });
  coreEl.addEventListener('mouseleave', () => { cancelDwell(); setState('idle'); });

  /* ═══════════════════════════════════════════════════════
     RENDERING
     Canvas draws everything: soft dark sphere body (gradient
     fading to alpha=0 at edge = no hard border) + plasma
     tendrils with bright-head → fading-trail effect.
     ═══════════════════════════════════════════════════════ */

  /* ── Sphere body ─────────────────────────────────────── */
  function drawSphere(iv) {
    const R  = getR(iv);

    // Outer atmospheric corona
    const corona = ctx.createRadialGradient(CX, CY, R * 0.6, CX, CY, R * 1.5);
    corona.addColorStop(0,   `rgba(90, 15,190,${0.08 + iv * 0.15})`);
    corona.addColorStop(0.5, `rgba(40,  5,100,${0.04 + iv * 0.08})`);
    corona.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, R * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = corona;
    ctx.fill();

    // Dark sphere body — MUST end at alpha=0 so no hard circle edge
    const body = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
    body.addColorStop(0,    `rgba(22, 4, 65, ${0.75 + iv * 0.18})`);
    body.addColorStop(0.50, `rgba(10, 2, 38, ${0.80 + iv * 0.12})`);
    body.addColorStop(0.80, `rgba( 4, 0, 16, ${0.62})`);
    body.addColorStop(0.93, `rgba( 2, 0,  8, ${0.22})`);
    body.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
  }

  /* ── Plasma Tendril System ───────────────────────────── */
  /*
   * Each tendril:
   *   - has a "head" that wanders inside the sphere via random walk
   *   - stores a trail of the last N positions
   *   - drawn head-to-tail with bright→transparent + wide→thin
   *   - blue tendrils bias left, red bias right, purple free
   */

  function makeTendril(ox, oy, color, sideX) {
    return {
      ox, oy,              // origin (near center)
      color,               // [r, g, b]
      sideX,               // -1 = pull left, +1 = pull right, 0 = free
      hx: ox, hy: oy,      // head position
      vx: rnd(-1.5, 1.5),
      vy: rnd(-1.5, 1.5),
      trail: [],
      age: Math.floor(rnd(0, 60)),
    };
  }

  function resetTendril(td) {
    td.hx  = td.ox + rnd(-8, 8);
    td.hy  = td.oy + rnd(-8, 8);
    td.vx  = rnd(-2, 2);
    td.vy  = rnd(-2, 2);
    td.trail = [];
    td.age = 0;
  }

  function updateTendril(td, iv) {
    td.age++;

    // Random acceleration (turbulence)
    td.vx += rnd(-0.45, 0.45);
    td.vy += rnd(-0.45, 0.45);

    // Occasional sharp kick for electrical snapping
    if (Math.random() < 0.04 + iv * 0.06) {
      td.vx += rnd(-2.5, 2.5);
      td.vy += rnd(-2.5, 2.5);
    }

    // Weak side bias (blue → left, red → right)
    if (td.sideX !== 0) td.vx += td.sideX * (0.05 + iv * 0.08);

    // Speed cap
    const spd    = Math.sqrt(td.vx * td.vx + td.vy * td.vy);
    const maxSpd = 2.8 + iv * 2.2;
    if (spd > maxSpd) { td.vx *= maxSpd / spd; td.vy *= maxSpd / spd; }

    td.hx += td.vx;
    td.hy += td.vy;

    // Sphere boundary push-back
    const R    = getR(iv);
    const maxD = R * (0.70 + iv * 0.18);
    const dx   = td.hx - td.ox;
    const dy   = td.hy - td.oy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxD) {
      const nx = dx / dist, ny = dy / dist;
      td.hx    = td.ox + nx * maxD;
      td.hy    = td.oy + ny * maxD;
      const dot = td.vx * nx + td.vy * ny;
      td.vx   -= 2 * dot * nx * 0.55;
      td.vy   -= 2 * dot * ny * 0.55;
    }

    // Record trail
    td.trail.unshift({ x: td.hx, y: td.hy });
    const maxLen = Math.floor(22 + iv * 55);
    if (td.trail.length > maxLen) td.trail.pop();

    // Reset after lifetime
    if (td.age > 140 + Math.floor(rnd(0, 80))) resetTendril(td);
  }

  function drawTendril(td, iv, baseAlpha, baseWidth) {
    if (td.trail.length < 2) return;
    const [r, g, b] = td.color;
    const alpha = baseAlpha * (0.55 + iv * 0.45);
    const width = baseWidth * (0.7 + iv * 1.0);

    for (let i = 0; i < td.trail.length - 1; i++) {
      const frac = 1 - i / (td.trail.length - 1); // 1 at head, 0 at tail
      const a    = alpha * Math.pow(frac, 1.5);
      const w    = Math.max(0.3, width * frac);
      if (a < 0.01) break;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
      ctx.lineWidth   = w;
      ctx.lineCap     = 'round';
      ctx.moveTo(td.trail[i].x,     td.trail[i].y);
      ctx.lineTo(td.trail[i + 1].x, td.trail[i + 1].y);
      ctx.stroke();
    }

    // Glowing dot at head
    if (td.trail.length > 0) {
      const headA = alpha * 0.95;
      const headR = 0.8 + iv * 2.0;
      ctx.beginPath();
      ctx.arc(td.trail[0].x, td.trail[0].y, headR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${headA})`;
      ctx.shadowBlur  = 10 + iv * 12;
      ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  /* Create tendrils — blue (left), red (right), purple (active) */
  const blueTendrils   = Array.from({ length: 5 }, () =>
    makeTendril(CX - 12, CY, [80, 160, 255], -1)
  );
  const redTendrils    = Array.from({ length: 5 }, () =>
    makeTendril(CX + 12, CY, [255, 80, 100], +1)
  );
  const purpleTendrils = Array.from({ length: 4 }, () =>
    makeTendril(CX, CY, [200, 100, 255], 0)
  );

  /* Stagger initial ages so they don't all reset simultaneously */
  [...blueTendrils, ...redTendrils, ...purpleTendrils].forEach((td, i) => {
    td.age = i * 22;
  });

  /* ── Purple collision core ────────────────────────────── */
  function drawCore(iv) {
    const pR    = 18 + iv * 75;
    const alpha = 0.25 + iv * 0.65;

    // Outer purple nebula
    const outer = ctx.createRadialGradient(CX, CY, 0, CX, CY, pR * 1.6);
    outer.addColorStop(0,   `rgba(170, 70,255,${alpha * 0.55})`);
    outer.addColorStop(0.4, `rgba(110, 30,200,${alpha * 0.28})`);
    outer.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, pR * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = outer;
    ctx.fill();

    // Inner white-hot core
    const inner = ctx.createRadialGradient(CX, CY, 0, CX, CY, pR * 0.50);
    inner.addColorStop(0,    `rgba(255,245,255,${0.08 + iv * 0.86})`);
    inner.addColorStop(0.28, `rgba(230,140,255,${0.05 + iv * 0.65})`);
    inner.addColorStop(0.70, `rgba(160, 55,255,${0.02 + iv * 0.32})`);
    inner.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, pR * 0.50, 0, Math.PI * 2);
    ctx.fillStyle = inner;
    ctx.fill();
  }

  /* ── Internal lightning ──────────────────────────────── */
  function drawInternalLightning(iv) {
    if (iv < 0.08) return;
    const R     = getR(iv);
    const count = Math.floor(2 + iv * 5);

    for (let n = 0; n < count; n++) {
      if (Math.random() > 0.28 + iv * 0.55) continue; // stochastic per bolt

      const a1 = rnd(0, Math.PI * 2);
      const a2 = a1 + rnd(0.7, 2.9);
      const x1 = CX + Math.cos(a1) * rnd(4, R * 0.78);
      const y1 = CY + Math.sin(a1) * rnd(4, R * 0.78);
      const x2 = CX + Math.cos(a2) * rnd(4, R * 0.78);
      const y2 = CY + Math.sin(a2) * rnd(4, R * 0.78);

      const segs = 4 + Math.floor(rnd(0, 6));
      const pts  = [{ x: x1, y: y1 }];
      for (let s = 1; s < segs; s++) {
        const f = s / segs;
        pts.push({
          x: x1 + (x2 - x1) * f + rnd(-22, 22),
          y: y1 + (y2 - y1) * f + rnd(-22, 22),
        });
      }
      pts.push({ x: x2, y: y2 });

      const roll       = Math.random();
      const [r, g, b]  = roll < 0.38
        ? [155, 85, 255]    // purple
        : roll < 0.68
          ? [75, 145, 255]  // blue
          : [255, 70, 100]; // red

      const alpha = (0.18 + iv * 0.72) * (0.5 + Math.random() * 0.5);
      ctx.save();
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth   = 0.6 + Math.random() * (1.0 + iv * 1.5);
      ctx.lineCap     = 'round';
      ctx.shadowBlur  = 8 + iv * 16;
      ctx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.8})`;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Escape arcs — lightning that exits the sphere ───── */
  const escapeArcs = [];

  function spawnEscapeArc(R, iv) {
    const angle    = rnd(0, Math.PI * 2);
    const sx       = CX + Math.cos(angle) * (R * rnd(0.78, 0.95));
    const sy       = CY + Math.sin(angle) * (R * rnd(0.78, 0.95));
    const outAngle = angle + rnd(-0.5, 0.5);
    const len      = rnd(18, 48 + iv * 90);
    const segs     = 3 + Math.floor(rnd(0, 4));

    const pts = [{ x: sx, y: sy }];
    for (let s = 1; s <= segs; s++) {
      const f = s / segs;
      pts.push({
        x: sx + Math.cos(outAngle) * len * f + rnd(-10, 10),
        y: sy + Math.sin(outAngle) * len * f + rnd(-10, 10),
      });
    }

    // Color: blue left hemisphere, red right, purple mix at active
    const isLeft   = Math.cos(angle) < 0;
    const roll     = Math.random();
    const [r,g,b]  = (iv > 0.45 && roll < iv * 0.5)
      ? [190, 90, 255]             // purple dominant at active
      : isLeft
        ? [80, 160, 255]           // blue
        : [255, 75, 105];          // red

    escapeArcs.push({
      pts,
      life:  1,
      decay: rnd(0.10, 0.22),      // fast flash
      r, g, b,
      width: rnd(0.7, 1.8 + iv),
      alpha: rnd(0.55, 0.95),
    });
  }

  function updateDrawEscapeArcs(R, iv) {
    // Spawn new arcs based on intensity
    const chance = 0.022 + iv * 0.20;
    if (Math.random() < chance) spawnEscapeArc(R, iv);

    for (let i = escapeArcs.length - 1; i >= 0; i--) {
      const arc = escapeArcs[i];
      arc.life -= arc.decay;
      if (arc.life <= 0) { escapeArcs.splice(i, 1); continue; }

      const baseA = arc.alpha * arc.life;
      ctx.save();
      ctx.lineCap    = 'round';
      ctx.shadowBlur = 10 + iv * 14;
      ctx.shadowColor = `rgba(${arc.r},${arc.g},${arc.b},${baseA * 0.8})`;

      for (let j = 0; j < arc.pts.length - 1; j++) {
        const frac = 1 - j / (arc.pts.length - 1); // bright at origin, fades outward
        const a    = baseA * Math.pow(frac, 1.3);
        if (a < 0.01) break;
        ctx.strokeStyle = `rgba(${arc.r},${arc.g},${arc.b},${a})`;
        ctx.lineWidth   = arc.width * frac * arc.life;
        ctx.beginPath();
        ctx.moveTo(arc.pts[j].x,     arc.pts[j].y);
        ctx.lineTo(arc.pts[j+1].x,   arc.pts[j+1].y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /* ── Burst particles (gravity trigger) ───────────────── */
  const burst = [];

  function spawnBurst() {
    for (let i = 0; i < 42; i++) {
      const angle   = rnd(0, Math.PI * 2);
      const speed   = rnd(0.8, 4.5);
      const palette = [
        [200,110,255], [90,145,255], [255,75,115],
        [248,205,255], [135,55,255],
      ];
      const [r, g, b] = palette[Math.floor(rnd(0, palette.length))];
      burst.push({
        x: CX, y: CY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life:  1,
        decay: rnd(0.012, 0.026),
        size:  rnd(1.0, 3.5),
        r, g, b,
      });
    }
  }

  function drawBurst() {
    for (let i = burst.length - 1; i >= 0; i--) {
      const p  = burst[i];
      p.x     += p.vx; p.y += p.vy;
      p.vx    *= 0.97; p.vy *= 0.97;
      p.life  -= p.decay;
      if (p.life <= 0) { burst.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.life.toFixed(2)})`;
      ctx.fill();
    }
  }

  /* ── Main render loop ─────────────────────────────────── */
  let startTime   = null;
  let lastStateSt = 'idle';

  function render(ts) {
    if (!startTime) startTime = ts;
    const t  = (ts - startTime) / 1000;
    const iv = coreState.intensity;

    // Burst on first active frame
    if (lastStateSt !== currentState) {
      if (currentState === 'active') spawnBurst();
      lastStateSt = currentState;
    }

    ctx.clearRect(0, 0, SIZE, SIZE);

    // 1. Soft dark sphere body (gradient → alpha=0 at edge)
    drawSphere(iv);

    // 2. Blue plasma tendrils (visible at idle)
    blueTendrils.forEach(td => {
      updateTendril(td, iv);
      drawTendril(td, iv, 0.75, 2.2);
    });

    // 3. Red plasma tendrils (visible at idle)
    redTendrils.forEach(td => {
      updateTendril(td, iv);
      drawTendril(td, iv, 0.75, 2.2);
    });

    // 4. Purple tendrils — appear at hover, aggressive at active
    if (iv > 0.15) {
      const purpleIv = Math.max(0, (iv - 0.15) / 0.85);
      purpleTendrils.forEach(td => {
        updateTendril(td, iv);
        drawTendril(td, purpleIv, 0.90, 3.0);
      });
    }

    // 5. Internal lightning (visible from low intensity, chaotic at active)
    drawInternalLightning(iv);

    // 6. Purple collision core (always visible, expands at active)
    drawCore(iv);

    // 7. Escape arcs — bolts that shoot OUT of the sphere boundary
    updateDrawEscapeArcs(getR(iv), iv);

    // 8. Burst particles
    drawBurst();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

})(); /* end HollowPurple */

/* ── Social buttons: magnetic hover (GSAP) ─────────────── */
(function socialHover() {
  document.querySelectorAll('.social-btn').forEach(btn => {
    let rect = null;

    btn.addEventListener('mouseenter', () => {
      rect = btn.getBoundingClientRect();
      gsap.to(btn, {
        scale: 1.08,
        filter: 'drop-shadow(0 0 7px rgba(99,102,241,0.55))',
        duration: 0.20,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    btn.addEventListener('mousemove', e => {
      if (!rect) return;
      const mx = e.clientX - rect.left - rect.width  / 2;
      const my = e.clientY - rect.top  - rect.height / 2;
      gsap.to(btn, {
        x: mx * 0.14,
        y: my * 0.14,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    btn.addEventListener('mouseleave', () => {
      rect = null;
      gsap.to(btn, {
        x: 0, y: 0, scale: 1,
        filter: 'drop-shadow(0 0 0px rgba(99,102,241,0))',
        duration: 0.55,
        ease: 'elastic.out(1, 0.55)',
        overwrite: 'auto',
      });
    });
  });
})();
