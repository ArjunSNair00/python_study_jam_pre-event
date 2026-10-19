/**
 * TinkerHub Python Study Jam - Audio Engine
 * Plays the official soundtrack: OneRepublic (requested by user: https://youtu.be/hT_nvWreIhg)
 * Features volume control, smooth crossfading, and punchy UI sound effects.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.audioEl = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentTrackTitle = 'OneRepublic — Counting Stars (YouTube)';
    this.audioSrc = 'assets/soundtrack.mp3';

    this.initAudioElement();
  }

  initAudioElement() {
    if (this.audioEl) return;
    this.audioEl = new Audio();
    this.audioEl.src = this.audioSrc;
    this.audioEl.preload = 'auto';
    this.audioEl.loop = true;
    this.audioEl.volume = 0.65;
  }

  initWebAudio() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  async resume() {
    this.initWebAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioEl) {
      this.audioEl.muted = this.isMuted;
    }
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.7;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  startMusic() {
    this.resume();
    if (this.isMuted) return;

    this.initAudioElement();
    if (this.audioEl) {
      this.audioEl.currentTime = 0;
      this.audioEl.volume = 0.65;
      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
        }).catch(err => {
          console.warn('Audio autoplay blocked by browser, waiting for user click:', err);
        });
      }
    }
  }

  stopMusic() {
    if (this.audioEl) {
      // Smooth fade out
      let vol = this.audioEl.volume;
      const fadeInterval = setInterval(() => {
        if (vol > 0.08) {
          vol -= 0.08;
          this.audioEl.volume = vol;
        } else {
          clearInterval(fadeInterval);
          this.audioEl.pause();
          this.audioEl.currentTime = 0;
          this.audioEl.volume = 0.65;
          this.isPlaying = false;
        }
      }, 40);
    }
  }

  // --- UI SOUND EFFECTS (Crisp Web Audio Synthesizer) ---
  playWhoosh() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playGlitch() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.setValueAtTime(80, t + 0.05);
    osc.frequency.setValueAtTime(320, t + 0.1);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playFanfare() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = t + (idx * 0.08);
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  playKeyClick() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200 + Math.random() * 300, t);

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }
}

// Global instance
window.soundEngine = new SoundEngine();
