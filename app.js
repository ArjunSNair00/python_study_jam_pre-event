/**
 * TinkerHub CE Karunagappally — "Syntax to Solutions"
 * Presentation controller: cover ⇄ trailer, Day 3 track, media centre,
 * curriculum dialog, soundtrack controls and keyboard shortcuts.
 *
 * Everything is progressive: if an element or a media file is missing, the
 * controller degrades quietly instead of throwing.
 */

(function () {
  'use strict';

  const TRACKS = {
    full: {
      duration: 31.5,
      badge: '3-Day trailer',
      badgeClass: 'track-tag tag-full',
      status: '3-day trailer · 31s',
      switchLabel: 'Switch to Day 3 video',
      switchShort: 'Day 3 video',
      scenes: [
        { scene: 1, start: 0, end: 5.2, title: 'Scene 1 · The syntax wall' },
        { scene: 2, start: 5.2, end: 10.4, title: 'Scene 2 · Three days, one arc' },
        { scene: 3, start: 10.4, end: 15.6, title: 'Scene 3 · Online essentials' },
        { scene: 4, start: 15.6, end: 20.8, title: 'Scene 4 · Function Junction' },
        { scene: 5, start: 20.8, end: 26.0, title: 'Scene 5 · Mentor & toolkit' },
        { scene: 6, start: 26.0, end: 31.5, title: 'Scene 6 · Ready to jam' }
      ]
    },
    day3: {
      duration: 26.5,
      badge: 'Day 3 offline video',
      badgeClass: 'track-tag tag-day3',
      status: 'Day 3 offline session · 27s',
      switchLabel: 'Switch to 3-Day trailer',
      switchShort: '3-Day trailer',
      scenes: [
        { scene: 1, start: 0, end: 5.2, title: 'Day 3 · The offline finale' },
        { scene: 2, start: 5.2, end: 10.4, title: 'Day 3 · Inside the maker lab' },
        { scene: 3, start: 10.4, end: 15.6, title: 'Day 3 · The code swap challenge' },
        { scene: 4, start: 15.6, end: 20.8, title: 'Day 3 · Mentor guidance' },
        { scene: 5, start: 20.8, end: 26.5, title: 'Day 3 · See you at campus' }
      ]
    }
  };

  const VIDEOS = {
    day3: {
      src: 'day3_offline_session.mp4',
      poster: 'assets/day3_offline-1200.webp',
      tab: 'tab-vsw-day3',
      title: 'Day 3: Function Junction — the offline session (1080p MP4)',
      desc: 'Dedicated video for the October 22 in-person collaborative maker lab at CE Karunagappally campus. Features the team code swap mechanics, mentor guidance, and checklist.',
      downloadLabel: 'Download Day 3 MP4',
      size: '3.4 MB',
      fileName: 'day3_offline_session.mp4'
    },
    full: {
      src: 'tinkerhub_python_studyjam.mp4',
      poster: 'assets/poster-900.webp',
      tab: 'tab-vsw-full',
      title: 'Syntax to Solutions — 3-Day hype trailer (1080p MP4)',
      desc: 'High-impact 31-second trailer covering the full 3-day arc: Day 1 Snake Bytes, Day 2 Logic Unlocked, and Day 3 Function Junction. Crisp transitions and a synth soundtrack.',
      downloadLabel: 'Download 3-Day Trailer MP4',
      size: '3.5 MB',
      fileName: 'tinkerhub_python_studyjam.mp4'
    }
  };

  const state = {
    mode: 'cover',
    activeTrack: 'full',
    running: false,
    paused: false,
    pausedForHidden: false,
    ended: false,
    elapsed: 0,
    currentScene: 0,
    lastTimestamp: 0,
    rafId: 0,
    openModal: null,
    modalType: null,
    lastFocus: null,
    trailerWasRunning: false,
    trailerOpener: null
  };

  const el = {};

  function cacheElements() {
    const ids = [
      'view-cover', 'view-trailer', 'track-full', 'track-day3',
      'btn-mode-toggle', 'mode-text', 'btn-day3-trailer', 'btn-audio-toggle',
      'audio-icon', 'audio-state-text', 'btn-fullscreen', 'btn-video-center',
      'header-status-text',
      'trailer-progress-container', 'trailer-progress', 'trailer-progress-fill',
      'trailer-track-badge', 'trailer-time-display', 'trailer-stage-title',
      'btn-switch-trailer-track', 'btn-trailer-pause',
      'btn-hero-play-trailer', 'btn-hero-play-day3', 'btn-hero-explore-curriculum',
      'btn-quick-watch-mp4',
      'btn-replay-trailer', 'btn-trailer-to-cover', 'btn-switch-to-day3-now',
      'btn-replay-day3', 'btn-switch-to-full-trailer', 'btn-day3-to-cover',
      'video-center-modal', 'native-mp4-player', 'mp4-video-src', 'mp4-error',
      'vmb-title', 'vmb-desc', 'btn-download-active-mp4', 'btn-download-alt-mp4',
      'curriculum-modal', 'btn-modal-start-trailer', 'btn-modal-start-day3',
      'pane-poster', 'pane-day3', 'pane-terminal', 'code-typewriter'
    ];

    ids.forEach((id) => {
      const key = id.replace(/-([a-z0-9])/g, (_, chr) => chr.toUpperCase());
      el[key] = document.getElementById(id);
    });

    el.visualTabs = Array.from(document.querySelectorAll('.vtab'));
    el.videoTabs = Array.from(document.querySelectorAll('.vsw-tab'));
    el.panes = {
      poster: el.panePoster,
      day3: el.paneDay3,
      terminal: el.paneTerminal
    };
    el.scenesFull = Array.from(document.querySelectorAll('#track-full .trailer-scene'));
    el.scenesDay3 = Array.from(document.querySelectorAll('#track-day3 .trailer-scene'));
  }

  // ---------------------------------------------------------------- helpers
  function on(element, type, handler, options) {
    if (element) element.addEventListener(type, handler, options);
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ------------------------------------------------------------- audio UI
  function renderAudioState(payload) {
    const engine = window.soundEngine;
    const info = payload || (engine ? {
      status: engine.status,
      muted: engine.muted,
      available: engine.available
    } : null);
    if (!info || !el.btnAudioToggle) return;

    const { status, muted, available } = info;
    const soundOn = status === 'playing' || status === 'loading';
    let text = 'Sound off';
    let icon = '🔈';

    if (!available) {
      text = 'Unavailable';
      icon = '🔇';
    } else if (muted) {
      text = 'Muted';
      icon = '🔇';
    } else if (status === 'loading') {
      text = 'Loading…';
      icon = '⏳';
    } else if (status === 'blocked') {
      text = 'Press to allow';
      icon = '🔈';
    } else if (status === 'playing') {
      text = 'OneRepublic ♫';
      icon = '🔊';
    }

    if (el.audioStateText) el.audioStateText.textContent = text;
    if (el.audioIcon) el.audioIcon.textContent = icon;

    el.btnAudioToggle.setAttribute('aria-pressed', String(soundOn));
    el.btnAudioToggle.setAttribute(
      'aria-label',
      !available
        ? 'Soundtrack unavailable'
        : `${muted ? 'Unmute' : 'Mute'} soundtrack (M)`
    );
    el.btnAudioToggle.title = !available
      ? 'The soundtrack file could not be loaded'
      : `${muted ? 'Unmute' : 'Mute'} soundtrack (M)`;
    el.btnAudioToggle.disabled = !available;
  }

  async function handleAudioToggle() {
    const engine = window.soundEngine;
    if (!engine || !engine.available) return;

    const isOn = engine.status === 'playing' || engine.status === 'loading';

    if (isOn) {
      engine.pauseMusic();
      engine.setMuted(true);
    } else {
      engine.setMuted(false);
      await engine.playMusic();
    }

    if (window.soundEngine) window.soundEngine.playKeyClick();
  }

  // ---------------------------------------------------------------- modals
  function focusableIn(container) {
    return Array.from(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'
    )).filter((node) => node.offsetWidth > 0 || node.offsetHeight > 0);
  }

  function openModal(modal, type) {
    if (!modal || state.openModal) return;

    state.openModal = modal;
    state.modalType = type;
    state.lastFocus = document.activeElement;
    state.trailerWasRunning = state.running && !state.paused;

    if (state.trailerWasRunning) pauseTrailer('modal');

    if (window.particleCanvas) window.particleCanvas.stop();

    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const target = modal.querySelector('.modal-close') || focusableIn(modal)[0];
    if (target) target.focus({ preventScroll: true });
  }

  function closeModal() {
    const modal = state.openModal;
    if (!modal) return;

    if (modal.contains(document.activeElement)) {
      // Move focus out before hiding the dialog.
      if (state.lastFocus && document.contains(state.lastFocus)) {
        state.lastFocus.focus({ preventScroll: true });
      } else if (el.btnModeToggle) {
        el.btnModeToggle.focus({ preventScroll: true });
      }
    }

    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');
    state.openModal = null;

    if (state.modalType === 'video') {
      if (el.nativeMp4Player) el.nativeMp4Player.pause();
    }

    document.body.classList.remove('modal-open');

    if (window.particleCanvas) window.particleCanvas.start();

    if (state.trailerWasRunning && state.mode === 'trailer') {
      resumeTrailer();
    }
    state.trailerWasRunning = false;
    state.modalType = null;
  }

  function openCurriculum() {
    openModal(el.curriculumModal, 'curriculum');
    if (window.soundEngine) window.soundEngine.playWhoosh();
  }

  async function openVideoCenter() {
    if (state.openModal) return;
    openModal(el.videoCenterModal, 'video');
    selectVideoTab('day3');
    if (window.soundEngine) window.soundEngine.playWhoosh();
  }

  // ---------------------------------------------------------- video centre
  function selectVideoTab(track) {
    const video = VIDEOS[track] || VIDEOS.day3;
    const player = el.nativeMp4Player;
    if (!player) return;

    el.videoTabs.forEach((tab) => {
      const active = tab.dataset.video === track;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    const panel = document.getElementById('video-panel');
    if (panel) panel.setAttribute('aria-labelledby', video.tab);

    if (player.getAttribute('src') !== video.src || player.error) {
      player.pause();
      player.setAttribute('preload', 'metadata');
      player.poster = video.poster;
      player.src = video.src;
      player.load();
    } else {
      player.poster = video.poster;
    }

    if (el.mp4Error) el.mp4Error.classList.add('is-hidden');

    if (el.vmbTitle) el.vmbTitle.textContent = video.title;
    if (el.vmbDesc) el.vmbDesc.textContent = video.desc;

    if (el.btnDownloadActiveMp4) {
      el.btnDownloadActiveMp4.href = video.src;
      el.btnDownloadActiveMp4.setAttribute('download', video.fileName);
      el.btnDownloadActiveMp4.innerHTML = `⬇ ${video.downloadLabel} <span class="file-size">(${video.size})</span>`;
    }

    const alternate = VIDEOS[track === 'full' ? 'day3' : 'full'];
    if (el.btnDownloadAltMp4 && alternate) {
      el.btnDownloadAltMp4.href = alternate.src;
      el.btnDownloadAltMp4.setAttribute('download', alternate.fileName);
      el.btnDownloadAltMp4.innerHTML = `⬇ ${alternate.downloadLabel} <span class="file-size">(${alternate.size})</span>`;
    }
  }

  function showVideoError() {
    const player = el.nativeMp4Player;
    if (!player) return;
    // Browsers emit an error when the src is intentionally cleared (e.g. while
    // switching tabs) — that is not a real failure, so don't surface it.
    if (!player.getAttribute('src') || player.networkState === 0) return;
    if (el.mp4Error) el.mp4Error.classList.remove('is-hidden');
    player.setAttribute('preload', 'none');
  }

  // --------------------------------------------------------------- trailer
  function configureTrack(trackName) {
    const track = TRACKS[trackName];
    if (!track) return;

    const showDay3 = trackName === 'day3';

    if (el.trackFull) {
      el.trackFull.classList.toggle('is-hidden', showDay3);
    }
    if (el.trackDay3) {
      el.trackDay3.classList.toggle('is-hidden', !showDay3);
    }

    if (el.trailerTrackBadge) {
      el.trailerTrackBadge.textContent = track.badge;
      el.trailerTrackBadge.className = track.badgeClass;
    }
    if (el.btnSwitchTrailerTrack) {
      el.btnSwitchTrailerTrack.setAttribute('aria-label', track.switchLabel);
      const longLabel = el.btnSwitchTrailerTrack.querySelector('.switch-long');
      const shortLabel = el.btnSwitchTrailerTrack.querySelector('.switch-short');
      if (longLabel) longLabel.textContent = track.switchLabel;
      if (shortLabel) shortLabel.textContent = track.switchShort;
    }
    if (el.headerStatusText) {
      el.headerStatusText.textContent = state.running || state.paused ? track.status : 'Presentation cover';
    }
  }

  function updatePauseButton() {
    const button = el.btnTrailerPause;
    if (!button) return;

    if (state.ended) {
      button.textContent = '↺';
      button.setAttribute('aria-label', 'Replay trailer');
      button.setAttribute('aria-pressed', 'false');
      button.title = 'Replay trailer (P)';
      button.disabled = false;
      return;
    }

    if (state.paused) {
      button.textContent = '▶';
      button.setAttribute('aria-label', 'Resume trailer');
      button.setAttribute('aria-pressed', 'true');
      button.title = 'Resume trailer (P)';
    } else {
      button.textContent = '⏸';
      button.setAttribute('aria-label', 'Pause trailer');
      button.setAttribute('aria-pressed', 'false');
      button.title = 'Pause trailer (P)';
    }

    button.disabled = !state.running;
  }

  function updateModeButton() {
    if (!el.btnModeToggle) return;
    const icon = el.btnModeToggle.querySelector('.icon');
    const inTrailer = state.mode === 'trailer';

    if (el.modeText) el.modeText.textContent = inTrailer ? 'Exit video' : 'Watch trailer';
    if (icon) icon.textContent = inTrailer ? '■' : '▶';

    el.btnModeToggle.title = inTrailer
      ? 'Exit video and return to the cover (Space)'
      : 'Play the 3-Day trailer (Space)';
    el.btnModeToggle.setAttribute(
      'aria-label',
      inTrailer ? 'Exit video and return to the cover' : 'Play the 3-Day trailer'
    );
  }

  function switchMode(newMode, options) {
    const opts = options || {};

    if (newMode === 'trailer') {
      if (state.mode !== 'trailer') {
        state.trailerOpener = document.activeElement;
        state.mode = 'trailer';
        document.body.classList.add('trailer-mode');

        if (el.viewCover) {
          el.viewCover.classList.remove('active-view');
          el.viewCover.setAttribute('aria-hidden', 'true');
        }
        if (el.viewTrailer) {
          el.viewTrailer.classList.add('active-view');
          el.viewTrailer.removeAttribute('aria-hidden');
        }
        if (el.trailerProgressContainer) el.trailerProgressContainer.classList.remove('is-hidden');
      }

      updateModeButton();
      configureTrack(state.activeTrack);

      if (el.headerStatusText) el.headerStatusText.textContent = TRACKS[state.activeTrack].status;

      window.scrollTo({ top: 0, behavior: 'auto' });
      if (el.viewTrailer) el.viewTrailer.focus({ preventScroll: true });

      startTrailerSequence();

      const engine = window.soundEngine;
      if (engine) engine.playMusic({ restart: Boolean(opts.restartMusic) });
    } else {
      stopTrailerSequence();

      const engine = window.soundEngine;
      if (engine) engine.pauseMusic();

      state.mode = 'cover';
      document.body.classList.remove('trailer-mode');

      if (el.viewTrailer) {
        el.viewTrailer.classList.remove('active-view');
        el.viewTrailer.setAttribute('aria-hidden', 'true');
      }
      if (el.viewCover) {
        el.viewCover.classList.add('active-view');
        el.viewCover.removeAttribute('aria-hidden');
      }
      if (el.trailerProgressContainer) el.trailerProgressContainer.classList.add('is-hidden');
      if (el.headerStatusText) el.headerStatusText.textContent = 'Presentation cover';

      updateModeButton();

      const opener = state.trailerOpener;
      if (opener && document.contains(opener) && opener.focus) {
        opener.focus({ preventScroll: true });
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function launchTrailer(trackName) {
    const track = TRACKS[trackName] ? trackName : 'full';
    const wasInTrailer = state.mode === 'trailer';
    state.activeTrack = track;
    switchMode('trailer', { restartMusic: !wasInTrailer });
    if (window.soundEngine) window.soundEngine.playWhoosh();
  }

  function scenesFor(trackName) {
    return trackName === 'day3' ? el.scenesDay3 : el.scenesFull;
  }

  function setActiveScene(sceneNumber) {
    const scenes = scenesFor(state.activeTrack);
    state.currentScene = sceneNumber;

    scenes.forEach((scene, index) => {
      scene.classList.toggle('active-scene', index + 1 === sceneNumber);
      scene.setAttribute('aria-hidden', index + 1 === sceneNumber ? 'false' : 'true');
    });

    const track = TRACKS[state.activeTrack];
    const meta = track.scenes.find((scene) => scene.scene === sceneNumber);
    if (meta && el.trailerStageTitle) el.trailerStageTitle.textContent = meta.title;

    const engine = window.soundEngine;
    if (engine) {
      if (sceneNumber === 1) engine.playGlitch();
      else if (sceneNumber === track.scenes.length) engine.playFanfare();
      else engine.playWhoosh();
    }

    if (window.particleCanvas) window.particleCanvas.triggerShockwave();
  }

  function startTrailerSequence() {
    cancelAnimationFrame(state.rafId);

    state.running = true;
    state.paused = false;
    state.ended = false;
    state.elapsed = 0;
    state.currentScene = 0;
    state.lastTimestamp = performance.now();

    renderProgress(0);
    setActiveScene(1);
    updatePauseButton();

    state.rafId = requestAnimationFrame(tick);
  }

  function renderProgress(elapsed) {
    const track = TRACKS[state.activeTrack];
    const percent = Math.min((elapsed / track.duration) * 100, 100);

    if (el.trailerProgressFill) el.trailerProgressFill.style.width = `${percent}%`;

    if (el.trailerTimeDisplay) {
      el.trailerTimeDisplay.textContent = `${formatTime(elapsed)} / ${formatTime(track.duration)}`;
    }

    if (el.trailerProgress) {
      const rounded = Math.round(percent);
      if (el.trailerProgress.getAttribute('aria-valuenow') !== String(rounded)) {
        el.trailerProgress.setAttribute('aria-valuenow', String(rounded));
      }
    }
  }

  function tick(timestamp) {
    if (!state.running || state.paused) return;

    const track = TRACKS[state.activeTrack];
    const delta = Math.min((timestamp - state.lastTimestamp) / 1000, 0.25);
    state.lastTimestamp = timestamp;
    state.elapsed += delta;

    renderProgress(state.elapsed);

    const meta = track.scenes.find(
      (scene) => state.elapsed >= scene.start && state.elapsed < scene.end
    ) || track.scenes[track.scenes.length - 1];

    if (meta && meta.scene !== state.currentScene) setActiveScene(meta.scene);

    if (state.elapsed >= track.duration) {
      finishTrailer();
      return;
    }

    state.rafId = requestAnimationFrame(tick);
  }

  function finishTrailer() {
    const track = TRACKS[state.activeTrack];
    state.running = false;
    state.ended = true;
    state.elapsed = track.duration;
    renderProgress(track.duration);

    if (el.headerStatusText) el.headerStatusText.textContent = 'Trailer complete';
    if (el.trailerStageTitle) el.trailerStageTitle.textContent = 'Finale · replay or exit';
    if (window.soundEngine) window.soundEngine.pauseMusic();
    updatePauseButton();
  }

  function stopTrailerSequence() {
    state.running = false;
    state.paused = false;
    state.ended = false;
    state.pausedForHidden = false;
    cancelAnimationFrame(state.rafId);
    state.rafId = 0;
    renderProgress(0);
    updatePauseButton();
  }

  function pauseTrailer(reason) {
    if (!state.running || state.paused) return;
    state.paused = true;
    state.lastTimestamp = 0;
    cancelAnimationFrame(state.rafId);
    state.rafId = 0;

    if (state.mode === 'trailer' && el.headerStatusText) {
      el.headerStatusText.textContent = 'Trailer paused';
    }
    if (reason === 'hidden') state.pausedForHidden = true;

    const engine = window.soundEngine;
    if (engine) engine.pauseMusic();
    updatePauseButton();
  }

  function resumeTrailer() {
    if (!state.running || !state.paused) return;
    state.paused = false;
    state.pausedForHidden = false;
    state.lastTimestamp = performance.now();
    state.rafId = requestAnimationFrame(tick);

    if (el.headerStatusText) {
      el.headerStatusText.textContent = TRACKS[state.activeTrack].status;
    }

    const engine = window.soundEngine;
    if (engine) engine.resumeMusic();
    updatePauseButton();
  }

  function toggleTrailerPause() {
    if (state.ended) {
      launchTrailer(state.activeTrack);
      return;
    }
    if (!state.running) return;
    if (state.paused) resumeTrailer();
    else pauseTrailer('user');
  }

  // ------------------------------------------------------------- keyboard
  function isTypingTarget(target) {
    if (!target || !target.tagName) return false;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  function isInteractiveTarget(target) {
    if (!target || !target.closest) return false;
    return Boolean(target.closest('button, a[href], input, select, textarea, [role="button"], [role="tab"], [contenteditable="true"]'));
  }

  /** Keep Tab / Shift+Tab inside the open dialog. */
  function trapFocus(event, modal) {
    const items = focusableIn(modal);
    if (!items.length) {
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !modal.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !modal.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleKeyboard(event) {
    if (event.defaultPrevented) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key;
    const lower = typeof key === 'string' ? key.toLowerCase() : '';

    if (event.key === 'Tab' && state.openModal) {
      trapFocus(event, state.openModal);
      return;
    }

    if (key === 'Escape' || lower === 'esc') {
      if (state.openModal) {
        event.preventDefault();
        closeModal();
      } else if (state.mode === 'trailer') {
        event.preventDefault();
        switchMode('cover');
      }
      return;
    }

    if (state.openModal) return;
    if (isTypingTarget(event.target)) return;
    if (event.repeat) return;

    if (event.code === 'Space' || key === ' ') {
      // Native activation for focused controls; global toggle everywhere else.
      if (isInteractiveTarget(event.target)) return;
      event.preventDefault();
      if (state.mode === 'trailer') switchMode('cover');
      else launchTrailer('full');
      return;
    }

    switch (lower) {
      case 'm':
        event.preventDefault();
        handleAudioToggle();
        break;
      case 'f':
        event.preventDefault();
        toggleFullscreen();
        break;
      case 'v':
        event.preventDefault();
        openVideoCenter();
        break;
      case 'd':
        event.preventDefault();
        launchTrailer('day3');
        break;
      case 'p':
        if (state.mode === 'trailer') {
          event.preventDefault();
          toggleTrailerPause();
        }
        break;
      default:
        break;
    }
  }

  // ------------------------------------------------------------ fullscreen
  function updateFullscreenButton() {
    if (!el.btnFullscreen) return;
    const active = Boolean(document.fullscreenElement);
    el.btnFullscreen.setAttribute('aria-pressed', String(active));
    el.btnFullscreen.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    el.btnFullscreen.title = active
      ? 'Exit fullscreen (F)'
      : 'Fullscreen presentation (F)';
    const icon = el.btnFullscreen.querySelector('.icon');
    if (icon) icon.textContent = active ? '⤢' : '⛶';
  }

  function toggleFullscreen() {
    const root = document.documentElement;

    if (!document.fullscreenElement) {
      if (!root.requestFullscreen) {
        if (el.btnFullscreen) {
          el.btnFullscreen.title = 'Fullscreen is not supported in this browser';
        }
        return;
      }
      root.requestFullscreen().catch((error) => {
        console.warn('Fullscreen was not available:', error && error.message);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  // ------------------------------------------------------------ media tabs
  function selectVisualTab(name, moveFocus) {
    el.visualTabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });

    Object.keys(el.panes).forEach((key) => {
      const pane = el.panes[key];
      if (!pane) return;
      const active = key === name;
      pane.classList.toggle('active', active);
      pane.classList.toggle('is-hidden', !active);
      pane.setAttribute('aria-hidden', String(!active));
    });

    syncTypewriter();
  }

  function bindTablist(tabs, onSelect) {
    tabs.forEach((tab, index) => {
      on(tab, 'click', () => {
        onSelect(tab);
        if (window.soundEngine) window.soundEngine.playKeyClick();
      });

      on(tab, 'keydown', (event) => {
        const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();

        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;

        tabs[next].focus();
        onSelect(tabs[next]);
      });
    });
  }

  // ------------------------------------------------------------- typewriter
  const TERMINAL_SNIPPETS = [
    `# TinkerHub CE Karunagappally
# 3-Day Python Study Jam: Syntax to Solutions

def function_junction(team_code):
    """
    Day 03 Offline Session:
    Swap code, read foreign logic, and collaborate!
    """
    print("Welcome to CEK Maker Lab!")
    assembled_app = assemble_pieces(team_code)
    return "Status: Ready to Ship 🚀"

# October 22 • Bring your laptop & 1 idea!`,

    `# Relatable bug? Slayed together!
try:
    build_python_logic()
except IndentationError:
    # Arjun S Nair & TinkerHub peers sit beside you:
    pair_programming.debug_together()
    print("Code runs like magic ✨")`,

    `# The 3-Day Roadmap:
study_jam = {
    "Day 1": "Snake Bytes (Oct 16, 8 PM Online)",
    "Day 2": "Logic Unlocked (Oct 17, 8 PM Online)",
    "Day 3": "Function Junction (Oct 22 In-Person)"
}
for day, theme in study_jam.items():
    print(f"[{day}] -> {theme}")`
  ];

  const typewriter = {
    timer: 0,
    snippet: 0,
    char: 0,
    deleting: false,
    active: false
  };

  function terminalIsVisible() {
    return Boolean(el.paneTerminal && !el.paneTerminal.classList.contains('is-hidden'));
  }

  function stopTypewriter(resetText) {
    window.clearTimeout(typewriter.timer);
    typewriter.timer = 0;
    typewriter.active = false;

    if (resetText && el.codeTypewriter) {
      el.codeTypewriter.textContent = TERMINAL_SNIPPETS[typewriter.snippet];
    }
  }

  function syncTypewriter() {
    const shouldRun = terminalIsVisible() && !document.hidden;

    if (!shouldRun) {
      if (typewriter.active) stopTypewriter(true);
      return;
    }

    if (prefersReducedMotion.matches) {
      stopTypewriter(false);
      if (el.codeTypewriter) el.codeTypewriter.textContent = TERMINAL_SNIPPETS[0];
      return;
    }

    if (typewriter.active) return;

    typewriter.active = true;
    typewriter.snippet = 0;
    typewriter.char = 0;
    typewriter.deleting = false;
    if (el.codeTypewriter) el.codeTypewriter.textContent = '';
    typewriter.timer = window.setTimeout(typeStep, 400);
  }

  function typeStep() {
    if (!typewriter.active) return;
    if (document.hidden || !terminalIsVisible()) {
      stopTypewriter(true);
      return;
    }

    const text = TERMINAL_SNIPPETS[typewriter.snippet];

    if (!typewriter.deleting) {
      typewriter.char += 1;
      if (el.codeTypewriter) el.codeTypewriter.textContent = text.slice(0, typewriter.char);

      if (typewriter.char >= text.length) {
        typewriter.deleting = true;
        typewriter.timer = window.setTimeout(typeStep, 3200);
        return;
      }
    } else {
      typewriter.char -= 1;
      if (el.codeTypewriter) el.codeTypewriter.textContent = text.slice(0, typewriter.char);

      if (typewriter.char <= 0) {
        typewriter.deleting = false;
        typewriter.snippet = (typewriter.snippet + 1) % TERMINAL_SNIPPETS.length;
        typewriter.timer = window.setTimeout(typeStep, 450);
        return;
      }
    }

    if (!typewriter.deleting && typewriter.char % 14 === 0 && window.soundEngine) {
      window.soundEngine.playKeyClick();
    }

    const delay = typewriter.deleting ? 12 : 18 + Math.random() * 24;
    typewriter.timer = window.setTimeout(typeStep, delay);
  }

  // ------------------------------------------------------------------ init
  function bindEvents() {
    // Trailer / mode controls
    on(el.btnModeToggle, 'click', () => {
      if (state.mode === 'cover') launchTrailer('full');
      else switchMode('cover');
    });

    on(el.btnDay3Trailer, 'click', () => launchTrailer('day3'));
    on(el.btnHeroPlayTrailer, 'click', () => launchTrailer('full'));
    on(el.btnHeroPlayDay3, 'click', () => launchTrailer('day3'));

    on(el.btnReplayTrailer, 'click', () => launchTrailer('full'));
    on(el.btnSwitchToDay3Now, 'click', () => launchTrailer('day3'));
    on(el.btnReplayDay3, 'click', () => launchTrailer('day3'));
    on(el.btnSwitchToFullTrailer, 'click', () => launchTrailer('full'));

    on(el.btnTrailerToCover, 'click', () => switchMode('cover'));
    on(el.btnDay3ToCover, 'click', () => switchMode('cover'));

    on(el.btnSwitchTrailerTrack, 'click', () => {
      launchTrailer(state.activeTrack === 'full' ? 'day3' : 'full');
    });
    on(el.btnTrailerPause, 'click', toggleTrailerPause);

    // Toolbar
    on(el.btnAudioToggle, 'click', handleAudioToggle);
    on(el.btnFullscreen, 'click', toggleFullscreen);
    on(el.btnVideoCenter, 'click', openVideoCenter);
    on(el.btnQuickWatchMp4, 'click', openVideoCenter);

    // Modals
    on(el.btnHeroExploreCurriculum, 'click', openCurriculum);
    on(el.btnModalStartTrailer, 'click', () => {
      closeModal();
      launchTrailer('full');
    });
    on(el.btnModalStartDay3, 'click', () => {
      closeModal();
      launchTrailer('day3');
    });

    document.querySelectorAll('[data-close]').forEach((button) => {
      on(button, 'click', closeModal);
    });

    [el.videoCenterModal, el.curriculumModal].forEach((modal) => {
      on(modal, 'click', (event) => {
        if (event.target === modal) closeModal();
      });
    });

    // Video tabs
    bindTablist(el.videoTabs, (tab) => selectVideoTab(tab.dataset.video));

    on(el.nativeMp4Player, 'error', showVideoError);
    on(el.mp4VideoSrc, 'error', showVideoError);

    // Media tabs
    bindTablist(el.visualTabs, (tab) => selectVisualTab(tab.dataset.tab));

    // Keyboard
    on(document, 'keydown', handleKeyboard);

    // Fullscreen state
    on(document, 'fullscreenchange', updateFullscreenButton);

    // Pause the trailer (and particles already self-manage) when hidden.
    on(document, 'visibilitychange', () => {
      if (document.hidden) {
        if (state.running && !state.paused) pauseTrailer('hidden');
        if (typewriter.active) stopTypewriter(true);
      } else {
        if (state.pausedForHidden && !state.openModal) resumeTrailer();
        syncTypewriter();
      }
    });

    on(window, 'pagehide', () => {
      if (window.soundEngine) window.soundEngine.pauseMusic();
    });
  }

  function init() {
    cacheElements();
    bindEvents();

    Object.keys(el.panes).forEach((key) => {
      const pane = el.panes[key];
      if (pane) pane.setAttribute('aria-hidden', String(!pane.classList.contains('active')));
    });

    el.visualTabs.forEach((tab) => {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    });

    if (el.nativeMp4Player) el.nativeMp4Player.setAttribute('preload', 'none');
    if (el.viewTrailer) el.viewTrailer.setAttribute('aria-hidden', 'true');

    if (window.soundEngine) {
      window.soundEngine.onStateChange = renderAudioState;
      renderAudioState();
    }

    updateModeButton();
    updateFullscreenButton();
    configureTrack(state.activeTrack);
    updatePauseButton();
    syncTypewriter();

    // Reflect reduced-motion changes for the typewriter.
    if (typeof prefersReducedMotion.addEventListener === 'function') {
      prefersReducedMotion.addEventListener('change', syncTypewriter);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
