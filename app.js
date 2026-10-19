/**
 * TinkerHub CE Karunagappally - Syntax to Solutions
 * Main Presentation & Video Trailer Controller
 * Supports 3-Day Hype Trailer (31s) and Day 3 Offline Session Video (27s)
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    mode: 'cover', // 'cover' | 'trailer'
    activeTrack: 'full', // 'full' (31s) | 'day3' (27s)
    trailerRunning: false,
    currentScene: 1,
    trailerStartTime: null,
    trailerTimer: null,
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: []
  };

  // Track configurations
  const trackConfig = {
    full: {
      duration: 31.5,
      badgeText: '3-DAY STUDY JAM TRAILER',
      scenes: [
        { scene: 1, start: 0, end: 5.2, title: 'SCENE 1: THE SYNTAX WALL & FRUSTRATION' },
        { scene: 2, start: 5.2, end: 10.4, title: 'SCENE 2: SYNTAX TO SOLUTIONS // 3 DAYS, ONE ARC' },
        { scene: 3, start: 10.4, end: 15.6, title: 'SCENE 3: ONLINE ESSENTIALS (DAYS 01 & 02)' },
        { scene: 4, start: 15.6, end: 20.8, title: 'SCENE 4: DAY 03 OFFLINE // FUNCTION JUNCTION' },
        { scene: 5, start: 20.8, end: 26.0, title: 'SCENE 5: MENTOR ARJUN S NAIR & WHAT TO BRING' },
        { scene: 6, start: 26.0, end: 31.5, title: 'SCENE 6: READY TO JAM // CLAIM YOUR SPOT' }
      ]
    },
    day3: {
      duration: 26.5,
      badgeText: 'DAY 3 OFFLINE SESSION SPECIAL',
      scenes: [
        { scene: 1, start: 0, end: 5.2, title: 'DAY 3 - SCENE 1: THE OFFLINE CLIMAX (OCT 22)' },
        { scene: 2, start: 5.2, end: 10.4, title: 'DAY 3 - SCENE 2: STEPPING INTO THE MAKER LAB' },
        { scene: 3, start: 10.4, end: 15.6, title: 'DAY 3 - SCENE 3: THE CODE SWAP CHALLENGE' },
        { scene: 4, start: 15.6, end: 20.8, title: 'DAY 3 - SCENE 4: MENTOR GUIDANCE & COLLABORATION' },
        { scene: 5, start: 20.8, end: 26.5, title: 'DAY 3 - SCENE 5: SEE YOU AT CEK CAMPUS!' }
      ]
    }
  };

  // DOM Elements
  const el = {
    viewCover: document.getElementById('view-cover'),
    viewTrailer: document.getElementById('view-trailer'),
    trackFull: document.getElementById('track-full'),
    trackDay3: document.getElementById('track-day3'),
    btnModeToggle: document.getElementById('btn-mode-toggle'),
    modeText: document.getElementById('mode-text'),
    btnDay3Trailer: document.getElementById('btn-day3-trailer'),
    btnAudioToggle: document.getElementById('btn-audio-toggle'),
    audioIcon: document.getElementById('audio-icon'),
    audioStateText: document.getElementById('audio-state-text'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    headerStatus: document.getElementById('header-status-text'),
    trailerProgressContainer: document.getElementById('trailer-progress-container'),
    trailerProgressFill: document.getElementById('trailer-progress-fill'),
    trailerTrackBadge: document.getElementById('trailer-track-badge'),
    trailerTimeDisplay: document.getElementById('trailer-time-display'),
    trailerStageTitle: document.getElementById('trailer-stage-title'),
    btnSwitchTrailerTrack: document.getElementById('btn-switch-trailer-track'),

    // Hero action buttons
    btnHeroPlayTrailer: document.getElementById('btn-hero-play-trailer'),
    btnHeroPlayDay3: document.getElementById('btn-hero-play-day3'),
    btnHeroExploreCurriculum: document.getElementById('btn-hero-explore-curriculum'),
    btnQuickWatchMp4: document.getElementById('btn-quick-watch-mp4'),

    // Trailer Controls
    btnReplayTrailer: document.getElementById('btn-replay-trailer'),
    btnTrailerToCover: document.getElementById('btn-trailer-to-cover'),
    btnSwitchToDay3Now: document.getElementById('btn-switch-to-day3-now'),
    btnReplayDay3: document.getElementById('btn-replay-day3'),
    btnSwitchToFullTrailer: document.getElementById('btn-switch-to-full-trailer'),
    btnDay3ToCover: document.getElementById('btn-day3-to-cover'),

    // Video Center Modal
    btnVideoCenter: document.getElementById('btn-video-center'),
    videoCenterModal: document.getElementById('video-center-modal'),
    btnCloseVideoCenter: document.getElementById('btn-close-video-center'),
    btnCloseVideoCenterFooter: document.getElementById('btn-close-video-center-footer'),
    tabVswDay3: document.getElementById('tab-vsw-day3'),
    tabVswFull: document.getElementById('tab-vsw-full'),
    nativeMp4Player: document.getElementById('native-mp4-player'),
    mp4VideoSrc: document.getElementById('mp4-video-src'),
    vmbTitle: document.getElementById('vmb-title'),
    vmbDesc: document.getElementById('vmb-desc'),
    btnDownloadActiveMp4: document.getElementById('btn-download-active-mp4'),

    // Curriculum Modal
    curriculumModal: document.getElementById('curriculum-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnModalCloseAction: document.getElementById('btn-modal-close-action'),
    btnModalStartTrailer: document.getElementById('btn-modal-start-trailer'),
    btnModalStartDay3: document.getElementById('btn-modal-start-day3'),

    // Visual Showcase Tabs
    visualTabs: document.querySelectorAll('.vtab'),
    tabPanes: {
      poster: document.getElementById('pane-poster'),
      day3: document.getElementById('pane-day3'),
      terminal: document.getElementById('pane-terminal')
    },

    // Live Typewriter
    codeTypewriter: document.getElementById('code-typewriter'),

    // Toast
    recordToast: document.getElementById('record-toast')
  };

  // Scene DOM nodes
  const scenesFull = [
    document.getElementById('scene-1'),
    document.getElementById('scene-2'),
    document.getElementById('scene-3'),
    document.getElementById('scene-4'),
    document.getElementById('scene-5'),
    document.getElementById('scene-6')
  ];

  const scenesDay3 = [
    document.getElementById('scene-d3-1'),
    document.getElementById('scene-d3-2'),
    document.getElementById('scene-d3-3'),
    document.getElementById('scene-d3-4'),
    document.getElementById('scene-d3-5')
  ];

  // --- INITIALIZATION ---
  function init() {
    bindEvents();
    startTypewriter();
  }

  // --- EVENT LISTENERS ---
  function bindEvents() {
    // Mode toggles
    el.btnModeToggle.addEventListener('click', () => {
      if (state.mode === 'cover') {
        launchTrailer('full');
      } else {
        switchMode('cover');
      }
    });

    el.btnDay3Trailer.addEventListener('click', () => launchTrailer('day3'));
    el.btnHeroPlayTrailer.addEventListener('click', () => launchTrailer('full'));
    el.btnHeroPlayDay3.addEventListener('click', () => launchTrailer('day3'));

    el.btnReplayTrailer.addEventListener('click', () => launchTrailer('full'));
    el.btnTrailerToCover.addEventListener('click', () => switchMode('cover'));
    el.btnSwitchToDay3Now.addEventListener('click', () => launchTrailer('day3'));

    el.btnReplayDay3.addEventListener('click', () => launchTrailer('day3'));
    el.btnSwitchToFullTrailer.addEventListener('click', () => launchTrailer('full'));
    el.btnDay3ToCover.addEventListener('click', () => switchMode('cover'));

    el.btnSwitchTrailerTrack.addEventListener('click', () => {
      const nextTrack = state.activeTrack === 'full' ? 'day3' : 'full';
      launchTrailer(nextTrack);
    });

    // Audio toggle
    el.btnAudioToggle.addEventListener('click', handleAudioToggle);

    // Fullscreen
    el.btnFullscreen.addEventListener('click', toggleFullscreen);

    // Curriculum Modal
    el.btnHeroExploreCurriculum.addEventListener('click', openCurriculumModal);
    el.btnCloseModal.addEventListener('click', closeCurriculumModal);
    el.btnModalCloseAction.addEventListener('click', closeCurriculumModal);
    el.curriculumModal.addEventListener('click', (e) => {
      if (e.target === el.curriculumModal) closeCurriculumModal();
    });
    el.btnModalStartTrailer.addEventListener('click', () => {
      closeCurriculumModal();
      launchTrailer('full');
    });
    el.btnModalStartDay3.addEventListener('click', () => {
      closeCurriculumModal();
      launchTrailer('day3');
    });

    // Video Center Modal
    el.btnVideoCenter.addEventListener('click', openVideoCenter);
    el.btnQuickWatchMp4.addEventListener('click', openVideoCenter);
    el.btnCloseVideoCenter.addEventListener('click', closeVideoCenter);
    el.btnCloseVideoCenterFooter.addEventListener('click', closeVideoCenter);
    el.videoCenterModal.addEventListener('click', (e) => {
      if (e.target === el.videoCenterModal) closeVideoCenter();
    });

    el.tabVswDay3.addEventListener('click', () => selectVideoCenterTab('day3'));
    el.tabVswFull.addEventListener('click', () => selectVideoCenterTab('full'));

    // Visual Showcase Tabs
    el.visualTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        el.visualTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        Object.keys(el.tabPanes).forEach(k => {
          if (k === target) {
            el.tabPanes[k].classList.remove('hidden');
            el.tabPanes[k].classList.add('active');
          } else {
            el.tabPanes[k].classList.add('hidden');
            el.tabPanes[k].classList.remove('active');
          }
        });

        if (window.soundEngine) window.soundEngine.playKeyClick();
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', handleKeyboardShortcuts);
  }

  function handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        if (state.mode === 'cover') launchTrailer('full');
        else switchMode('cover');
        break;
      case 'm':
        e.preventDefault();
        handleAudioToggle();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'd':
        e.preventDefault();
        launchTrailer('day3');
        break;
      case 'v':
        e.preventDefault();
        openVideoCenter();
        break;
      case 'escape':
        closeCurriculumModal();
        closeVideoCenter();
        if (state.mode === 'trailer') switchMode('cover');
        break;
    }
  }

  // --- AUDIO LOGIC ---
  function handleAudioToggle() {
    if (!window.soundEngine) return;
    const isAudioActive = window.soundEngine.toggleMute();
    if (isAudioActive) {
      window.soundEngine.startMusic();
      el.audioIcon.textContent = '🔊';
      el.audioStateText.textContent = 'OneRepublic ♫';
    } else {
      el.audioIcon.textContent = '🔇';
      el.audioStateText.textContent = 'MUTED';
    }
  }

  // --- TRAILER LAUNCHER & MODE SWITCHING ---
  function launchTrailer(trackName) {
    state.activeTrack = trackName;
    switchMode('trailer');
  }

  function switchMode(newMode) {
    state.mode = newMode;

    if (newMode === 'trailer') {
      el.viewCover.classList.remove('active-view');
      el.viewTrailer.classList.add('active-view');
      el.trailerProgressContainer.classList.remove('hidden');

      // Setup active track in DOM
      if (state.activeTrack === 'day3') {
        el.trackFull.classList.add('hidden');
        el.trackFull.classList.remove('active-track');
        el.trackDay3.classList.remove('hidden');
        el.trackDay3.classList.add('active-track');
        el.trailerTrackBadge.textContent = 'DAY 3 OFFLINE VIDEO';
        el.trailerTrackBadge.className = 'track-tag tag-day3';
        el.btnSwitchTrailerTrack.textContent = 'Switch to 3-Day Trailer ➔';
        el.headerStatus.textContent = 'DAY 3 OFFLINE VIDEO (27s)';
      } else {
        el.trackDay3.classList.add('hidden');
        el.trackDay3.classList.remove('active-track');
        el.trackFull.classList.remove('hidden');
        el.trackFull.classList.add('active-track');
        el.trailerTrackBadge.textContent = '3-DAY STUDY JAM TRAILER';
        el.trailerTrackBadge.className = 'track-tag tag-full';
        el.btnSwitchTrailerTrack.textContent = 'Switch to Day 3 Video ➔';
        el.headerStatus.textContent = 'SYNTAX TO SOLUTIONS TRAILER (31s)';
      }

      el.modeText.textContent = 'Exit Video (Cover)';

      if (window.soundEngine) {
        window.soundEngine.startMusic();
      }

      startTrailerSequence();
    } else {
      stopTrailerSequence();
      el.viewTrailer.classList.remove('active-view');
      el.viewCover.classList.add('active-view');
      el.trailerProgressContainer.classList.add('hidden');
      el.modeText.textContent = 'Play 3-Day Trailer (31s)';
      el.headerStatus.textContent = 'PRESENTATION COVER MODE';
    }
  }

  // --- TRAILER TIMELINE SEQUENCER ---
  function startTrailerSequence() {
    state.trailerRunning = true;
    state.trailerStartTime = performance.now();
    setActiveScene(1);

    if (window.particleCanvas) {
      window.particleCanvas.triggerShockwave();
    }

    if (state.trailerTimer) cancelAnimationFrame(state.trailerTimer);

    const cfg = trackConfig[state.activeTrack];
    const totalDuration = cfg.duration;
    const timeline = cfg.scenes;

    function tick(now) {
      if (!state.trailerRunning) return;

      const elapsed = (now - state.trailerStartTime) / 1000;
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);

      // Update progress bar
      el.trailerProgressFill.style.width = `${progressPercent}%`;

      // Update timer display
      const curSec = Math.floor(elapsed);
      const curSecFmt = curSec < 10 ? '0' + curSec : curSec;
      const totSec = Math.floor(totalDuration);
      el.trailerTimeDisplay.textContent = `00:${curSecFmt} / 00:${totSec}`;

      // Find current scene
      const currentMeta = timeline.find(s => elapsed >= s.start && elapsed < s.end) || timeline[timeline.length - 1];
      if (currentMeta && currentMeta.scene !== state.currentScene) {
        setActiveScene(currentMeta.scene, currentMeta.title);
      }

      if (elapsed < totalDuration) {
        state.trailerTimer = requestAnimationFrame(tick);
      } else {
        // Lingering on finale
        state.trailerRunning = false;
        el.trailerProgressFill.style.width = '100%';
        if (state.isRecording) {
          stopMediaRecorder();
        }
      }
    }

    state.trailerTimer = requestAnimationFrame(tick);
  }

  function setActiveScene(sceneNum, sceneTitle) {
    state.currentScene = sceneNum;
    const currentSceneSet = state.activeTrack === 'day3' ? scenesDay3 : scenesFull;

    currentSceneSet.forEach((sc, idx) => {
      if (idx + 1 === sceneNum) {
        sc.classList.add('active-scene');
      } else {
        sc.classList.remove('active-scene');
      }
    });

    if (sceneTitle) {
      el.trailerStageTitle.textContent = sceneTitle;
    } else {
      const cfg = trackConfig[state.activeTrack];
      const match = cfg.scenes.find(s => s.scene === sceneNum);
      if (match) el.trailerStageTitle.textContent = match.title;
    }

    // Sound cues
    if (window.soundEngine) {
      if (sceneNum === 1) window.soundEngine.playGlitch();
      else if (sceneNum === currentSceneSet.length) window.soundEngine.playFanfare();
      else window.soundEngine.playWhoosh();
    }

    if (window.particleCanvas) {
      window.particleCanvas.triggerShockwave();
    }
  }

  function stopTrailerSequence() {
    state.trailerRunning = false;
    if (state.trailerTimer) {
      cancelAnimationFrame(state.trailerTimer);
      state.trailerTimer = null;
    }
  }

  // --- VIDEO CENTER (MP4 PLAYER) ---
  function openVideoCenter() {
    el.videoCenterModal.classList.remove('hidden');
    selectVideoCenterTab('day3');
    if (window.soundEngine) window.soundEngine.playWhoosh();
  }

  function closeVideoCenter() {
    el.videoCenterModal.classList.add('hidden');
    if (el.nativeMp4Player) el.nativeMp4Player.pause();
  }

  function selectVideoCenterTab(track) {
    if (track === 'day3') {
      el.tabVswDay3.classList.add('active');
      el.tabVswFull.classList.remove('active');
      el.nativeMp4Player.poster = 'assets/day3_offline.jpg';
      el.nativeMp4Player.src = 'day3_offline_session.mp4';
      el.vmbTitle.textContent = 'Day 3: Function Junction — The Offline Session (1080p MP4)';
      el.vmbDesc.textContent = 'Dedicated video for the October 22 in-person collaborative maker lab at CE Karunagappally campus. Highlights team code swaps, unblocking bugs with peers, and mentor Arjun S Nair.';
      el.btnDownloadActiveMp4.href = 'day3_offline_session.mp4';
      el.btnDownloadActiveMp4.download = 'day3_offline_session.mp4';
      el.btnDownloadActiveMp4.innerHTML = '<span>⬇ Download Day 3 MP4 (3.3 MB)</span>';
    } else {
      el.tabVswFull.classList.add('active');
      el.tabVswDay3.classList.remove('active');
      el.nativeMp4Player.poster = 'assets/poster.png';
      el.nativeMp4Player.src = 'tinkerhub_python_studyjam.mp4';
      el.vmbTitle.textContent = 'Syntax to Solutions — 3-Day Hype Trailer (1080p MP4)';
      el.vmbDesc.textContent = 'High-impact 31-second trailer covering the full 3-day arc: Day 1 Snake Bytes, Day 2 Logic Unlocked, and Day 3 Function Junction. Zero lag, crisp transitions, and synth sound.';
      el.btnDownloadActiveMp4.href = 'tinkerhub_python_studyjam.mp4';
      el.btnDownloadActiveMp4.download = 'tinkerhub_python_studyjam.mp4';
      el.btnDownloadActiveMp4.innerHTML = '<span>⬇ Download 3-Day Trailer MP4 (3.3 MB)</span>';
    }
    el.nativeMp4Player.load();
  }

  // --- CURRICULUM MODAL ---
  function openCurriculumModal() {
    el.curriculumModal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playWhoosh();
  }

  function closeCurriculumModal() {
    el.curriculumModal.classList.add('hidden');
  }

  // --- FULLSCREEN ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request:', err);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  // --- LIVE TERMINAL TYPEWRITER ---
  const terminalSnippets = [
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

  let snippetIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function startTypewriter() {
    const curText = terminalSnippets[snippetIdx];

    if (!isDeleting) {
      el.codeTypewriter.textContent = curText.substring(0, charIdx + 1);
      charIdx++;

      if (Math.random() > 0.65 && window.soundEngine) {
        window.soundEngine.playKeyClick();
      }

      if (charIdx >= curText.length) {
        isDeleting = true;
        setTimeout(startTypewriter, 2800);
        return;
      }
    } else {
      el.codeTypewriter.textContent = curText.substring(0, charIdx - 1);
      charIdx--;

      if (charIdx <= 0) {
        isDeleting = false;
        snippetIdx = (snippetIdx + 1) % terminalSnippets.length;
        setTimeout(startTypewriter, 350);
        return;
      }
    }

    const speed = isDeleting ? 16 : (Math.random() * 20 + 30);
    setTimeout(startTypewriter, speed);
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', init);

})();
