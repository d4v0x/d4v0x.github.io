/* ═══════════════════════════════════════════════════════════
   d4v0x — main.js  |  GSAP 3.12 animations
   ═══════════════════════════════════════════════════════════ */

/* ── Plugin registration ──────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

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
    this.r  = Math.random() * 1.8 + 0.8;
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = DOT_COLOR + '0.55)';
    ctx.fill();
  };

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.strokeStyle = LINE_COLOR + ((1 - dist / MAX_DIST) * 0.14) + ')';
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
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

/* ── Avatar: floating motion ─────────────────────────── */
gsap.to('.avatar-wrapper', {
  y: -16,
  duration: 3.2,
  ease: 'sine.inOut',
  yoyo: true,
  repeat: -1,
});

/* ── Domain rings rotation (center: 90px 132px) ─────── */
gsap.to('.ring-outer', {
  rotation: 360,
  duration: 14,
  ease: 'none',
  repeat: -1,
  transformOrigin: '90px 132px',
});
gsap.to('.ring-mid', {
  rotation: -360,
  duration: 20,
  ease: 'none',
  repeat: -1,
  transformOrigin: '90px 132px',
});
gsap.to('.ring-inner', {
  rotation: 360,
  duration: 28,
  ease: 'none',
  repeat: -1,
  transformOrigin: '90px 132px',
});

/* ── Infinity glyph gentle float ─────────────────────── */
gsap.to('.infinity-glyph', {
  y: -5,
  opacity: 0.85,
  duration: 2.5,
  ease: 'sine.inOut',
  yoyo: true,
  repeat: -1,
});

/* ── Orbit dots (circular motion around 90, 132) ──────── */
// od1: outer ring r≈82
gsap.timeline({ repeat: -1 })
  .to('.od1', { attr: { cx: 8,   cy: 132 }, duration: 3.5, ease: 'sine.inOut' })
  .to('.od1', { attr: { cx: 90,  cy: 214 }, duration: 3.5, ease: 'sine.inOut' })
  .to('.od1', { attr: { cx: 172, cy: 132 }, duration: 3.5, ease: 'sine.inOut' })
  .to('.od1', { attr: { cx: 90,  cy: 50  }, duration: 3.5, ease: 'sine.inOut' })
  .to('.od1', { attr: { cx: 8,   cy: 132 }, duration: 3.5, ease: 'sine.inOut' });

// od2: mid ring r≈65
gsap.timeline({ repeat: -1, delay: 2 })
  .to('.od2', { attr: { cx: 90,  cy: 67  }, duration: 5, ease: 'sine.inOut' })
  .to('.od2', { attr: { cx: 25,  cy: 132 }, duration: 5, ease: 'sine.inOut' })
  .to('.od2', { attr: { cx: 90,  cy: 197 }, duration: 5, ease: 'sine.inOut' })
  .to('.od2', { attr: { cx: 155, cy: 132 }, duration: 5, ease: 'sine.inOut' })
  .to('.od2', { attr: { cx: 90,  cy: 67  }, duration: 5, ease: 'sine.inOut' });

// od3: inner ring r≈50
gsap.timeline({ repeat: -1, delay: 5 })
  .to('.od3', { attr: { cx: 155, cy: 132 }, duration: 7, ease: 'sine.inOut' })
  .to('.od3', { attr: { cx: 90,  cy: 197 }, duration: 7, ease: 'sine.inOut' })
  .to('.od3', { attr: { cx: 25,  cy: 132 }, duration: 7, ease: 'sine.inOut' })
  .to('.od3', { attr: { cx: 90,  cy: 67  }, duration: 7, ease: 'sine.inOut' })
  .to('.od3', { attr: { cx: 155, cy: 132 }, duration: 7, ease: 'sine.inOut' });

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
