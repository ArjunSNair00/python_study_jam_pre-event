/**
 * TinkerHub CE Karunagappally — "Syntax to Solutions"
 * Audio engine: soundtrack playback (lazy-loaded) + lightweight UI cues.
 *
 * Design rules:
 *  - The 4.5 MB soundtrack is not downloaded until someone actually asks for it.
 *  - Playback state is always reported truthfully (playing / paused / blocked /
 *    unavailable) so the toolbar never lies about what the browser is doing.
 *  - Autoplay is only attempted from a user gesture; rejections are handled.
 */

(function () {
  'use strict';

  class SoundEngine {
    constructor() {
      this.audioEl = new Audio();
      this.audioEl.preload = 'none';
      this.audioEl.loop = true;
      this.audioEl.volume = 0.55;
      this.audioEl.src = 'assets/soundtrack.mp3';

      this.ctx = null;
      this.masterGain = null;

      this.muted = false;
      this.available = true;
      this.wantsMusic = false;
      this.status = 'idle'; // idle | loading | playing | paused | blocked | unavailable
      this.onStateChange = null;

      this.audioEl.addEventListener('playing', () => {
        this.setStatus('playing');
      });
      this.audioEl.addEventListener('pause', () => {
        if (this.status === 'playing') this.setStatus('paused');
      });
      this.audioEl.addEventListener('error', () => {
        // Missing or undecodable file: be honest, don't fake a playing state.
        this.available = false;
        this.wantsMusic = false;
        this.setStatus('unavailable');
        console.warn('Soundtrack unavailable:', this.audioEl.error);
      });
    }

    setStatus(status) {
      if (this.status === status) return;
      this.status = status;
      if (typeof this.onStateChange === 'function') {
        this.onStateChange({
          status: this.status,
          muted: this.muted,
          available: this.available
        });
      }
    }

    /** Lazily create the Web Audio graph (only after a user gesture). */
    initWebAudio() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }

    async resumeContext() {
      this.initWebAudio();
      if (this.ctx && this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch (err) {
          /* ignore — cues simply stay silent */
        }
      }
    }

    /**
     * Start (or resume) the soundtrack.
     * @param {{restart?: boolean}} options
     * @returns {Promise<boolean>} whether audio is actually running
     */
    async playMusic(options) {
      const restart = Boolean(options && options.restart);
      this.wantsMusic = true;

      if (!this.available) {
        this.setStatus('unavailable');
        return false;
      }

      if (this.muted) {
        this.wantsMusic = false;
        return false;
      }

      this.audioEl.muted = this.muted;

      if (restart) {
        try {
          this.audioEl.currentTime = 0;
        } catch (err) {
          /* not seekable yet — play() will start at 0 anyway */
        }
      }

      if (!this.audioEl.paused && !restart) {
        this.setStatus('playing');
        return true;
      }

      try {
        this.setStatus('loading');
        await this.audioEl.play();
        this.setStatus('playing');
        return true;
      } catch (err) {
        // Typically NotAllowedError (autoplay policy) or NotSupportedError.
        this.setStatus(this.available ? 'blocked' : 'unavailable');
        console.warn('Soundtrack could not start:', err && err.name ? err.name : err);
        return false;
      }
    }

    pauseMusic() {
      if (!this.audioEl.paused) {
        this.audioEl.pause();
      }
      if (this.status === 'playing') this.setStatus('paused');
    }

    /** Resume only when the user has asked for sound. */
    resumeMusic() {
      if (!this.wantsMusic || this.muted || !this.available) return Promise.resolve(false);
      return this.playMusic();
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      this.audioEl.muted = this.muted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(
          this.muted ? 0 : 0.5,
          this.ctx.currentTime,
          0.05
        );
      }
      if (typeof this.onStateChange === 'function') {
        this.onStateChange({
          status: this.status,
          muted: this.muted,
          available: this.available
        });
      }
      return this.muted;
    }

    toggleMute() {
      return this.setMuted(!this.muted);
    }

    // --- UI cues -------------------------------------------------------
    playWhoosh() {
      this.synth({
        type: 'sine',
        from: 420,
        to: 120,
        gain: 0.08,
        duration: 0.22
      });
    }

    playGlitch() {
      this.synth({
        type: 'sawtooth',
        from: 170,
        to: 80,
        gain: 0.09,
        duration: 0.2,
        steps: [170, 80, 300]
      });
    }

    playFanfare() {
      if (this.muted) return;
      this.resumeContext();
      if (!this.ctx) return;
      const notes = [392, 523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        this.synth({
          type: 'triangle',
          from: freq,
          to: freq,
          gain: 0.06,
          duration: 0.42,
          delay: index * 0.08
        });
      });
    }

    playKeyClick() {
      this.synth({
        type: 'square',
        from: 1150 + Math.random() * 300,
        to: 900,
        gain: 0.012,
        duration: 0.03
      });
    }

    synth(options) {
      if (this.muted || !this.available) return;
      this.resumeContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime + (options.delay || 0);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = options.type || 'sine';
      if (Array.isArray(options.steps)) {
        options.steps.forEach((freq, i) => {
          osc.frequency.setValueAtTime(freq, t + i * 0.05);
        });
      } else {
        osc.frequency.setValueAtTime(options.from, t);
        if (options.to !== options.from) {
          osc.frequency.exponentialRampToValueAtTime(options.to, t + options.duration);
        }
      }

      gain.gain.setValueAtTime(options.gain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + options.duration);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + options.duration + 0.02);
    }
  }

  window.soundEngine = new SoundEngine();
})();
