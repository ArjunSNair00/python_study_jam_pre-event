/**
 * TinkerHub Python Study Jam - Interactive Cyber Matrix Particle Canvas
 * Renders floating Python syntax tokens, connected constellations, and energy pulses.
 */

class ParticleCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.tokenParticles = [];
    this.pulses = [];
    this.mouse = { x: -1000, y: -1000, radius: 140 };

    this.tokens = [
      'def', 'class', 'import', 'lambda', 'async', 'await', 
      'for i in range():', 'return True', 'while stuck:', 'try:',
      'except:', 'print("🚀")', 'yield', '[x**2]', '{ "peer": 1 }',
      'f"Hello {name}"', 'self', 'None', 'with open():'
    ];

    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    this.tokenParticles = [];

    const count = Math.min(Math.floor((this.width * this.height) / 16000), 70);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(0, 242, 254, ' : 'rgba(168, 85, 247, '
      });
    }

    const tokenCount = Math.min(Math.floor(this.width / 120), 18);
    for (let i = 0; i < tokenCount; i++) {
      this.tokenParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        text: this.tokens[Math.floor(Math.random() * this.tokens.length)],
        alpha: Math.random() * 0.4 + 0.15,
        fontSize: Math.floor(Math.random() * 5 + 11)
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  triggerShockwave(x = this.width / 2, y = this.height / 2) {
    this.pulses.push({
      x,
      y,
      radius: 10,
      maxRadius: Math.max(this.width, this.height) * 0.8,
      speed: 18,
      alpha: 0.8
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Pulses / Shockwaves
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.radius += p.speed;
      p.alpha *= 0.94;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(0, 242, 254, ${p.alpha})`;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      if (p.alpha < 0.01 || p.radius >= p.maxRadius) {
        this.pulses.splice(i, 1);
      }
    }

    // 2. Draw Connected Constellations
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse interaction
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouse.radius) {
        const force = (this.mouse.radius - dist) / this.mouse.radius;
        p.x -= (dx / dist) * force * 3;
        p.y -= (dy / dist) * force * 3;
      }

      // Draw point
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + '0.7)';
      this.ctx.fill();

      // Connect near neighbors
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cdist < 110) {
          const alpha = (1 - cdist / 110) * 0.22;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }

    // 3. Draw Floating Python Code Tokens
    this.ctx.font = '12px "JetBrains Mono", monospace';
    for (let t of this.tokenParticles) {
      t.x += t.vx;
      t.y += t.vy;

      if (t.x < -100) t.x = this.width + 50;
      if (t.x > this.width + 100) t.x = -50;
      if (t.y < -50) t.y = this.height + 30;
      if (t.y > this.height + 50) t.y = -30;

      this.ctx.font = `${t.fontSize}px "JetBrains Mono", monospace`;
      this.ctx.fillStyle = `rgba(0, 242, 254, ${t.alpha})`;
      this.ctx.fillText(t.text, t.x, t.y);
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  window.particleCanvas = new ParticleCanvas('bg-canvas');
});
