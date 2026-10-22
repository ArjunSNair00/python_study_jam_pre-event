/**
 * TinkerHub CE Karunagappally — decorative particle constellation.
 *
 * Performance / accessibility behaviour:
 *  - Respects prefers-reduced-motion (draws one static frame, no loop).
 *  - Stops the animation loop when the tab is hidden or the canvas is offscreen.
 *  - Caps the frame rate, scales for devicePixelRatio and debounces resizes.
 */

(function () {
  'use strict';

  const TOKENS = [
    'def', 'class', 'import', 'lambda', 'async', 'await',
    'for i in range():', 'return True', 'while stuck:', 'try:',
    'except:', 'print("🚀")', 'yield', '[x**2]', '{ "peer": 1 }',
    'f"Hello {name}"', 'self', 'None', 'with open():'
  ];

  const TARGET_FPS = 30;
  const FRAME_MS = 1000 / TARGET_FPS;

  class ParticleCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas || !this.canvas.getContext) return;

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      if (!this.ctx) return;

      this.particles = [];
      this.tokenParticles = [];
      this.pulses = [];
      this.mouse = { x: -1000, y: -1000, radius: 130 };

      this.dpr = 1;
      this.width = 0;
      this.height = 0;
      this.rafId = 0;
      this.lastFrame = 0;
      this.running = false;
      this.visible = !document.hidden;

      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = this.motionQuery.matches;

      this.resize();
      this.initParticles();
      this.bindEvents();

      if (this.reducedMotion) {
        this.drawStatic();
      } else {
        this.start();
      }
    }

    resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = width;
      this.height = height;
      this.dpr = dpr;

      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    initParticles() {
      this.particles = [];
      this.tokenParticles = [];

      const isSmall = this.width < 700;
      const count = Math.min(
        Math.floor((this.width * this.height) / (isSmall ? 26000 : 18000)),
        isSmall ? 28 : 64
      );

      for (let i = 0; i < count; i += 1) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          radius: Math.random() * 1.6 + 0.7,
          color: Math.random() > 0.42 ? '34, 227, 242' : '168, 85, 247'
        });
      }

      const tokenCount = this.width < 700 ? 6 : Math.min(Math.floor(this.width / 130), 14);
      for (let i = 0; i < tokenCount; i += 1) {
        this.tokenParticles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          text: TOKENS[Math.floor(Math.random() * TOKENS.length)],
          alpha: Math.random() * 0.12 + 0.05,
          fontSize: Math.floor(Math.random() * 4) + 11
        });
      }
    }

    bindEvents() {
      let resizeFrame = 0;
      window.addEventListener('resize', () => {
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          resizeFrame = 0;
          this.resize();
          this.initParticles();
          if (this.reducedMotion) this.drawStatic();
        });
      });

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('pointermove', (event) => {
          this.mouse.x = event.clientX;
          this.mouse.y = event.clientY;
        }, { passive: true });

        window.addEventListener('pointerleave', () => {
          this.mouse.x = -1000;
          this.mouse.y = -1000;
        }, { passive: true });
      }

      document.addEventListener('visibilitychange', () => {
        this.visible = !document.hidden;
        if (this.reducedMotion) return;
        if (this.visible) this.start();
        else this.stop();
      });

      const onMotionChange = (event) => {
        this.reducedMotion = event.matches;
        if (this.reducedMotion) {
          this.stop();
          this.drawStatic();
        } else {
          this.start();
        }
      };
      if (typeof this.motionQuery.addEventListener === 'function') {
        this.motionQuery.addEventListener('change', onMotionChange);
      }
    }

    start() {
      if (this.running || this.reducedMotion) return;
      this.running = true;
      this.lastFrame = 0;
      this.rafId = requestAnimationFrame((time) => this.animate(time));
    }

    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }

    triggerShockwave(x, y) {
      if (this.reducedMotion || !this.ctx) return;
      this.pulses.push({
        x: typeof x === 'number' ? x : this.width / 2,
        y: typeof y === 'number' ? y : this.height / 2,
        radius: 8,
        maxRadius: Math.max(this.width, this.height) * 0.7,
        speed: 16,
        alpha: 0.55
      });
    }

    drawStatic() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = 'rgba(34, 227, 242, 0.35)';
      for (const particle of this.particles) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.font = '12px "Fira Code", monospace';
      this.ctx.fillStyle = 'rgba(34, 227, 242, 0.08)';
      for (const token of this.tokenParticles) {
        this.ctx.fillText(token.text, token.x, token.y);
      }
    }

    animate(time) {
      if (!this.running) return;

      // Frame limiter: decorative work should not compete with the trailer.
      if (this.lastFrame && time - this.lastFrame < FRAME_MS) {
        this.rafId = requestAnimationFrame((t) => this.animate(t));
        return;
      }
      this.lastFrame = time;

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      this.drawPulses(ctx);
      this.drawParticles(ctx);
      this.drawTokens(ctx);

      this.rafId = requestAnimationFrame((t) => this.animate(t));
    }

    drawPulses(ctx) {
      for (let i = this.pulses.length - 1; i >= 0; i -= 1) {
        const pulse = this.pulses[i];
        pulse.radius += pulse.speed;
        pulse.alpha *= 0.94;

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 227, 242, ${pulse.alpha.toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (pulse.alpha < 0.01 || pulse.radius >= pulse.maxRadius) {
          this.pulses.splice(i, 1);
        }
      }
    }

    drawParticles(ctx) {
      const limit = 110;

      for (let i = 0; i < this.particles.length; i += 1) {
        const particle = this.particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -10) particle.x = this.width + 10;
        if (particle.x > this.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = this.height + 10;
        if (particle.y > this.height + 10) particle.y = -10;

        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.01 && dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          particle.x -= (dx / dist) * force * 2.5;
          particle.y -= (dy / dist) * force * 2.5;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, 0.55)`;
        ctx.fill();

        for (let j = i + 1; j < this.particles.length; j += 1) {
          const other = this.particles[j];
          const cdx = particle.x - other.x;
          const cdy = particle.y - other.y;
          const cdist = Math.hypot(cdx, cdy);

          if (cdist < limit) {
            const alpha = ((1 - cdist / limit) * 0.16).toFixed(3);
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(34, 227, 242, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    drawTokens(ctx) {
      for (const token of this.tokenParticles) {
        token.x += token.vx;
        token.y += token.vy;

        if (token.x < -120) token.x = this.width + 40;
        if (token.x > this.width + 120) token.x = -40;
        if (token.y < -40) token.y = this.height + 30;
        if (token.y > this.height + 40) token.y = -30;

        ctx.font = `${token.fontSize}px "Fira Code", monospace`;
        ctx.fillStyle = `rgba(34, 227, 242, ${token.alpha})`;
        ctx.fillText(token.text, token.x, token.y);
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.particleCanvas = new ParticleCanvas('bg-canvas');
  });
})();
