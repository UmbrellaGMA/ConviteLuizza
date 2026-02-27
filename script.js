/**
 * Convite Mágico - Luizza
 * Rapunzel-themed interactive invitation
 * Vanilla ES6+ | No frameworks
 */

;(function () {
  'use strict';

  /* ============================================
     SPARKLE PARTICLE SYSTEM
     ============================================ */
  class SparkleSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.maxParticles = 40;
      this.animationId = null;
      this.isRunning = false;

      this._resize = this._resize.bind(this);
      this._loop = this._loop.bind(this);

      window.addEventListener('resize', this._resize);
      this._resize();
    }

    _resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.ctx.scale(dpr, dpr);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this._loop();
    }

    stop() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    _createParticle() {
      const gold = Math.random() > 0.4;
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        color: gold
          ? `rgba(212, 175, 55, VAR_OPACITY)`
          : `rgba(200, 162, 255, VAR_OPACITY)`,
        life: Math.random() * 200 + 100,
        maxLife: 0,
      };
    }

    _loop() {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Add particles
      while (this.particles.length < this.maxParticles) {
        const p = this._createParticle();
        p.maxLife = p.life;
        this.particles.push(p);
      }

      // Update and draw
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;

        // Twinkle
        p.opacity += 0.008 * p.opacityDir;
        if (p.opacity >= 0.8 || p.opacity <= 0.1) p.opacityDir *= -1;

        // Fade near end of life
        const lifeFactor = Math.min(p.life / 30, 1);
        const drawOpacity = p.opacity * lifeFactor;

        if (p.life <= 0 || p.x < -10 || p.x > this.width + 10 || p.y < -10 || p.y > this.height + 10) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = drawOpacity;
        this.ctx.fillStyle = p.color.replace('VAR_OPACITY', '1');
        this.ctx.shadowBlur = p.size * 3;
        this.ctx.shadowColor = p.color.replace('VAR_OPACITY', '0.6');

        // Draw a 4-point star
        this._drawStar(p.x, p.y, p.size);

        this.ctx.restore();
      }

      this.animationId = requestAnimationFrame(this._loop);
    }

    _drawStar(x, y, r) {
      this.ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const outerX = x + Math.cos(angle) * r;
        const outerY = y + Math.sin(angle) * r;
        const innerAngle = angle + Math.PI / 4;
        const innerX = x + Math.cos(innerAngle) * r * 0.35;
        const innerY = y + Math.sin(innerAngle) * r * 0.35;

        if (i === 0) {
          this.ctx.moveTo(outerX, outerY);
        } else {
          this.ctx.lineTo(outerX, outerY);
        }
        this.ctx.lineTo(innerX, innerY);
      }
      this.ctx.closePath();
      this.ctx.fill();
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this._resize);
    }
  }

  /* ============================================
     ENVELOPE INTERACTION
     ============================================ */
  class EnvelopeController {
    constructor() {
      this.envelopeBtn = document.getElementById('envelope-btn');
      this.envelopeScene = document.getElementById('envelope-scene');
      this.invitationScene = document.getElementById('invitation-scene');
      this.lightBurst = document.getElementById('light-burst');
      this.invitationCard = document.getElementById('invitation-card');
      this.isOpened = false;

      this._handleClick = this._handleClick.bind(this);
      this.envelopeBtn.addEventListener('click', this._handleClick);
    }

    _handleClick() {
      if (this.isOpened) return;
      this.isOpened = true;

      // Step 1: Open flap
      this.envelopeBtn.classList.add('is-opening');
      this.envelopeBtn.setAttribute('aria-expanded', 'true');

      // Step 2: Light burst after flap opens
      setTimeout(() => {
        this.lightBurst.classList.add('is-active');
      }, 500);

      // Step 3: Transition to invitation scene
      setTimeout(() => {
        this.envelopeScene.classList.add('is-hidden');
        this.invitationScene.removeAttribute('hidden');

        // Start invitation sparkles
        if (window.__sparkleSystem2) {
          window.__sparkleSystem2.start();
        }

        // Step 4: Slide card in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.invitationCard.classList.add('is-visible');
            // Trigger section fade-ins
            this._initSectionObserver();
          });
        });
      }, 1400);

      // Clean up envelope sparkles
      setTimeout(() => {
        if (window.__sparkleSystem1) {
          window.__sparkleSystem1.destroy();
        }
      }, 2000);
    }

    _initSectionObserver() {
      const sections = document.querySelectorAll('.fade-section');

      // Reduced motion check
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        sections.forEach(s => s.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      sections.forEach((section) => observer.observe(section));
    }
  }

  /* ============================================
     PARALLAX (subtle)
     ============================================ */
  class ParallaxController {
    constructor() {
      this.lanterns = document.querySelectorAll('.lantern');
      this.ticking = false;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      this._handleScroll = this._handleScroll.bind(this);
      window.addEventListener('scroll', this._handleScroll, { passive: true });
    }

    _handleScroll() {
      if (this.ticking) return;
      this.ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        this.lanterns.forEach((lantern, i) => {
          const speed = 0.02 + i * 0.008;
          lantern.style.transform = `translateY(${scrollY * speed}px)`;
        });
        this.ticking = false;
      });
    }
  }

  /* ============================================
     MUTE / UNMUTE CONTROLLER
     ============================================ */
  class MuteController {
    constructor() {
      this.video = document.getElementById('bg-video');
      this.btn = document.getElementById('btn-mute');
      if (!this.video || !this.btn) return;

      this.iconMuted = this.btn.querySelector('.btn-mute__icon--muted');
      this.iconPlaying = this.btn.querySelector('.btn-mute__icon--playing');
      this.isMuted = true;

      this.btn.addEventListener('click', () => this._toggle());
    }

    _toggle() {
      this.isMuted = !this.isMuted;
      this.video.muted = this.isMuted;

      if (this.isMuted) {
        this.iconMuted.style.display = 'block';
        this.iconPlaying.style.display = 'none';
        this.btn.setAttribute('aria-label', 'Ativar som do vídeo');
      } else {
        this.iconMuted.style.display = 'none';
        this.iconPlaying.style.display = 'block';
        this.btn.setAttribute('aria-label', 'Silenciar som do vídeo');
      }
    }
  }

  /* ============================================
     GIFT MODAL CONTROLLER
     ============================================ */
  class GiftModalController {
    constructor() {
      this.overlay = document.getElementById('gifts-modal');
      this.openBtn = document.getElementById('gifts-open-btn');
      this.closeBtn = document.getElementById('gifts-modal-close');
      if (!this.overlay || !this.openBtn) return;

      this.openBtn.addEventListener('click', () => this._open());
      this.closeBtn.addEventListener('click', () => this._close());
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this._close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.overlay.classList.contains('is-open')) {
          this._close();
        }
      });
    }

    _open() {
      this.overlay.removeAttribute('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.overlay.classList.add('is-open');
        });
      });
      document.body.style.overflow = 'hidden';
    }

    _close() {
      this.overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => {
        this.overlay.setAttribute('hidden', '');
      }, 350);
    }
  }

  /* ============================================
     RSVP FORM CONTROLLER
     ============================================ */
  class RSVPController {
    constructor() {
      this.form = document.getElementById('rsvp-form');
      this.companionsList = document.getElementById('companions-list');
      this.addBtn = document.getElementById('add-companion-btn');
      if (!this.form) return;

      this.companionCount = 0;
      this.WHATSAPP_NUMBER = '5513974102237';

      this.declineBtn = document.getElementById('btn-decline');

      this.addBtn.addEventListener('click', () => this._addCompanion());
      this.form.addEventListener('submit', (e) => this._handleSubmit(e));
      if (this.declineBtn) {
        this.declineBtn.addEventListener('click', () => this._handleDecline());
      }
    }

    _addCompanion() {
      this.companionCount++;
      const id = this.companionCount;

      const entry = document.createElement('div');
      entry.className = 'rsvp-form__companion-entry';
      entry.dataset.companionId = id;

      entry.innerHTML = `
        <div class="rsvp-form__field rsvp-form__field--name">
          <label for="companion-name-${id}" class="rsvp-form__label">Nome</label>
          <input
            type="text"
            id="companion-name-${id}"
            class="rsvp-form__input companion-name"
            placeholder="Nome do acompanhante"
            required
          />
        </div>
        <div class="rsvp-form__field rsvp-form__field--age">
          <label for="companion-age-${id}" class="rsvp-form__label">Idade</label>
          <input
            type="number"
            id="companion-age-${id}"
            class="rsvp-form__input companion-age"
            placeholder="Idade"
            min="0"
            max="120"
            required
          />
        </div>
        <button
          type="button"
          class="rsvp-form__remove-btn"
          aria-label="Remover acompanhante"
          title="Remover"
        >&times;</button>
      `;

      // Remove button
      entry.querySelector('.rsvp-form__remove-btn').addEventListener('click', () => {
        entry.style.opacity = '0';
        entry.style.transform = 'translateY(-10px)';
        setTimeout(() => entry.remove(), 200);
      });

      this.companionsList.appendChild(entry);

      // Focus the new name input
      entry.querySelector('.companion-name').focus();
    }

    _handleSubmit(e) {
      e.preventDefault();

      const guestName = document.getElementById('guest-name').value.trim();
      const guestAge = document.getElementById('guest-age').value.trim();

      if (!guestName || !guestAge) return;

      // Build companion list
      const companions = [];
      const entries = this.companionsList.querySelectorAll('.rsvp-form__companion-entry');
      entries.forEach((entry) => {
        const name = entry.querySelector('.companion-name').value.trim();
        const age = entry.querySelector('.companion-age').value.trim();
        if (name && age) {
          companions.push({ name, age });
        }
      });

      // Build personalized message
      let message = `Olá! Estou confirmando presença no aniversário da Luizza dia 13/03/2025.\n\n`;
      message += `*Convidado(a) principal:*\n`;
      message += `Nome: ${guestName}\n`;
      message += `Idade: ${guestAge} anos\n`;

      if (companions.length > 0) {
        message += `\n*Acompanhantes (${companions.length}):*\n`;
        companions.forEach((c, i) => {
          message += `${i + 1}. ${c.name} - ${c.age} anos\n`;
        });
      }

      message += `\nTotal de pessoas: ${1 + companions.length}`;

      // Encode and open WhatsApp
      const encoded = encodeURIComponent(message);
      const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encoded}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    _handleDecline() {
      const guestName = document.getElementById('guest-name').value.trim() || 'Convidado';
      const message = `Olá! Infelizmente não vou poder ir ao aniversário da Luizza dia 13/03/2025.\n\nNome: ${guestName}\n\nDesejo muitas felicidades!`;
      const encoded = encodeURIComponent(message);
      const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encoded}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /* ============================================
     INIT
     ============================================ */
  function init() {
    // Start envelope sparkles
    window.__sparkleSystem1 = new SparkleSystem('sparkle-canvas');
    window.__sparkleSystem1.start();

    // Prepare invitation sparkles (starts on card reveal)
    window.__sparkleSystem2 = new SparkleSystem('sparkle-canvas-2');
    window.__sparkleSystem2.maxParticles = 25;

    // Initialize envelope interaction
    new EnvelopeController();

    // Initialize parallax
    new ParallaxController();

    // Initialize mute button
    new MuteController();

    // Initialize gift modal
    new GiftModalController();

    // Initialize RSVP form
    new RSVPController();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
