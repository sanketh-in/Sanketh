import { processText, lookupSign, getDictionaryEntries, CATEGORIES } from './signData.js';
import { translateToEnglish, LANGUAGE_OPTIONS } from './translation.js';
import { TOPICS } from './education.js';
import { GESTURES, HAND_CONNECTIONS, classifyHand } from './gestures.js';
import { getHandLandmarker } from './handTracking.js';
import { gestureVisualHTML } from './gestureVisuals.js';

const root = document.getElementById('app');

/* ---------------- shared sign-mode state (was useSignMode hook) ---------------- */
function getMode() {
  try { return localStorage.getItem('sanketh_sign_mode') || 'ASL'; } catch { return 'ASL'; }
}
function persistMode(m) {
  try { localStorage.setItem('sanketh_sign_mode', m); } catch {}
}

/* ---------------- small helpers ---------------- */

// Inline sign-photo icon, used everywhere an emoji used to stand in for a
// concept. Renders the real photo from /signs/ next to the keyword text; if
// no photo exists for that word (or the path fails to load) it quietly
// removes itself rather than falling back to an emoji.
function signIcon(pathOrWord, cls = "inline-block w-5 h-5 rounded object-cover align-middle") {
  if (!pathOrWord) return '';
  const src = pathOrWord.includes('/') ? pathOrWord : `signs/${pathOrWord.toLowerCase()}.png`;
  return `<img src="${src}" alt="" class="${cls}" onerror="this.remove()">`;
}

function icons() {
  if (window.lucide) window.lucide.createIcons();
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let cleanupCurrentPage = () => {};

/* ---------------- Router ---------------- */
function currentRoute() {
  return location.hash.replace(/^#/, '') || '/';
}
export function navigate(path) {
  location.hash = path;
}
function render() {
  cleanupCurrentPage();
  cleanupCurrentPage = () => {};
  const route = currentRoute();
  if (route === '/dictionary') renderDictionary();
  else if (route === '/education') renderEducation();
  else renderMain();
}
window.addEventListener('hashchange', render);

/* =========================================================================
   LOADING SCREEN
   ========================================================================= */
function renderLoadingScreen(onComplete) {
  const particles = Array.from({ length: 20 }).map(() => {
    const size = Math.random() * 4 + 2;
    return `<div class="absolute rounded-full opacity-20" style="width:${size}px;height:${size}px;background:#a855f7;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation:float ${3 + Math.random() * 4}s ease-in-out infinite;animation-delay:${Math.random() * 3}s;"></div>`;
  }).join('');

  root.innerHTML = `
    <div class="fixed inset-0 flex flex-col items-center justify-center z-50" style="background: linear-gradient(135deg, #0f0520 0%, #1a0535 30%, #0a0318 60%, #1f0840 100%);">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">${particles}</div>
      <div class="relative flex flex-col items-center gap-8">
        <div class="relative w-48 h-48">
          <div class="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-spin-slow" style="border-top-color:#a855f7;"></div>
          <div class="absolute inset-4 rounded-full border-4 border-violet-400/20 animate-spin-reverse" style="border-bottom-color:#8b5cf6;"></div>
          <div class="absolute inset-8 rounded-full border-4 border-fuchsia-500/30 animate-spin-slow" style="border-right-color:#d946ef;animation-duration:5s;"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="relative w-24 h-24 animate-pulse-glow rounded-full flex items-center justify-center" style="background:linear-gradient(135deg,#7c3aed,#9333ea,#c026d3);">
              <svg viewBox="0 0 100 100" class="w-16 h-16" fill="none">
                <path d="M30 70 L30 40 Q30 30 40 30 Q50 30 50 40 L50 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
                <path d="M50 55 L50 35 Q50 25 60 25 Q70 25 70 35 L70 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
                <path d="M50 55 Q50 70 40 75 L30 70" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M50 55 Q70 65 72 75" stroke="white" stroke-width="4" stroke-linecap="round"/>
                <circle cx="75" cy="75" r="4" fill="white"/>
                <circle cx="27" cy="73" r="4" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="text-center">
          <h1 class="text-5xl font-black tracking-widest mb-2" style="font-family:'Orbitron',sans-serif;background:linear-gradient(90deg,#c084fc,#a855f7,#7c3aed,#9333ea,#c084fc);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite;">SANKETH</h1>
          <p class="text-purple-300 text-sm tracking-[0.3em] font-light uppercase">Sign Language Bridge</p>
        </div>
        <div class="w-72 flex flex-col gap-3">
          <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div id="loading-bar" class="h-full rounded-full transition-all duration-100" style="width:0%;background:linear-gradient(90deg,#7c3aed,#a855f7,#d946ef);box-shadow:0 0 10px rgba(168,85,247,0.8);"></div>
          </div>
          <div class="flex justify-between items-center">
            <p id="loading-status" class="text-purple-400 text-xs">Initializing SANKETH...</p>
            <p id="loading-pct" class="text-purple-300 text-xs font-mono">0%</p>
          </div>
        </div>
      </div>
    </div>`;

  const messages = [
    "Initializing SANKETH...",
    "Loading sign language dictionary...",
    "Preparing speech recognition...",
    "Setting up translation engine...",
    "Almost ready...",
  ];
  let currentMessage = 0;
  const statusEl = document.getElementById('loading-status');
  const msgInterval = setInterval(() => {
    currentMessage = (currentMessage + 1) % messages.length;
    statusEl.textContent = messages[currentMessage];
  }, 600);

  let progress = 0;
  const bar = document.getElementById('loading-bar');
  const pct = document.getElementById('loading-pct');
  const progressInterval = setInterval(() => {
    progress += 2;
    if (progress >= 100) {
      progress = 100;
      bar.style.width = '100%';
      pct.textContent = '100%';
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setTimeout(onComplete, 400);
      return;
    }
    bar.style.width = progress + '%';
    pct.textContent = progress + '%';
  }, 60);
}

/* =========================================================================
   SIGN CARD (shared component)
   ========================================================================= */
function signCardHTML(entry, word, isActive, index, mode = getMode()) {
  const activeBg = isActive
    ? "linear-gradient(145deg, rgba(124,58,237,0.08), rgba(255,255,255,0.95))"
    : "rgba(255,255,255,0.8)";
  const border = isActive ? "2px solid rgba(139,92,246,0.6)" : "1px solid rgba(139,92,246,0.15)";
  return `
    <div data-testid="sign-card-${index}" class="flex-shrink-0 flex flex-col items-center rounded-2xl overflow-hidden transition-all duration-500 animate-sign-in ${isActive ? 'sign-card-active scale-100 opacity-100' : 'opacity-60 scale-95'}"
      style="background:${activeBg};border:${border};width:200px;min-height:260px;">
      <div class="w-full flex-1 relative overflow-hidden" style="min-height:200px;">
        ${gestureVisualHTML(entry || {}, word, mode)}
        ${isActive ? `<div class="absolute inset-0 pointer-events-none" style="background:linear-gradient(to bottom, transparent 60%, rgba(124,58,237,0.05));"></div>` : ''}
      </div>
      <div class="w-full px-3 py-3 text-center" style="border-top:1px solid rgba(139,92,246,0.1);">
        <p class="font-bold text-base capitalize tracking-wide ${isActive ? 'text-purple-700' : 'text-gray-600'}">${escapeHtml(word)}</p>
        ${entry && entry.description ? `<p class="text-xs text-gray-400 mt-0.5">${escapeHtml(entry.description)}</p>` : ''}
      </div>
    </div>`;
}

/* =========================================================================
   MAIN PAGE
   ========================================================================= */
const SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
];

const DEMO_SENTENCES = [
  "Hello, good morning, how are you today",
  "I want to learn sign language",
  "I love my family and friends",
  "My mother and father are happy",
  "I understand, thank you for your help",
];

function renderMain() {
  const state = {
    mode: getMode(),
    direction: 'toSign', // 'toSign' = speak/type -> sign,  'toText' = camera -> text/speech
    inputText: '',
    translatedText: '',
    selectedLang: 'en',
    isListening: false,
    isPlaying: false,
    speed: 1,
    signQueue: [],
    currentIndex: -1,
    isTranslating: false,
    statusMsg: '',
    recognition: null,
    playTimer: null,
    cameraRunning: false,
    recognizedText: '',
  };

  // --- camera-to-text internals (not re-rendered on every frame, see startCamera) ---
  let handLandmarker = null;
  let videoStream = null;
  let animationFrameId = null;
  let previousLandmarks = null;
  let motionHistory = [];
  let holdState = { gesture: null, startTime: 0, locked: false };
  const HOLD_MS = 800;
  const HOLD_MS_BY_GESTURE = { bye: 420 };

  function stopPlayback() {
    state.isPlaying = false;
    if (state.playTimer) clearTimeout(state.playTimer);
    state.playTimer = null;
  }

  function buildSignQueue(text) {
    return processText(text).map(word => ({
      word,
      entry: lookupSign(word, state.mode) || {
        word,
        mode: state.mode,
        category: "Reference",
        description: "This word is not in the expanded starter dictionary yet.",
        howTo: "Try one of the listed dictionary signs, or add this word to the dataset.",
      },
    }));
  }

  /* ---------------- Camera -> Text/Speech (beta gesture recognition) ---------------- */

  function confirmWord(gesture) {
    const word = GESTURES[gesture].word;
    confirmWordByName(word);
  }

  function confirmWordByName(word) {
    state.recognizedText = state.recognizedText ? state.recognizedText + ' ' + word : word;
    const textEl = document.getElementById('recognized-text');
    if (textEl) textEl.textContent = state.recognizedText;
    const speakBtn = document.getElementById('camera-speak');
    if (speakBtn) speakBtn.disabled = false;
  }

  function updateGestureUI(gesture) {
    const badge = document.getElementById('gesture-badge');
    const visualEl = document.getElementById('gesture-visual');
    const labelEl = document.getElementById('gesture-label');
    const progressEl = document.getElementById('hold-progress');

    if (gesture !== holdState.gesture) {
      holdState.gesture = gesture;
      holdState.startTime = performance.now();
      holdState.locked = false;
    }

    if (gesture && GESTURES[gesture]) {
      if (badge) badge.style.display = 'flex';
      if (visualEl) {
        visualEl.innerHTML = GESTURES[gesture].image
          ? signIcon(GESTURES[gesture].image, "w-8 h-8 rounded-lg object-cover align-middle")
          : '<i data-lucide="hand" class="w-7 h-7 text-white"></i>';
        icons();
      }
      if (labelEl) labelEl.textContent = GESTURES[gesture].label;
      const holdMs = HOLD_MS_BY_GESTURE[gesture] || HOLD_MS;
      const elapsed = performance.now() - holdState.startTime;
      const pct = Math.min(100, (elapsed / holdMs) * 100);
      if (progressEl) progressEl.style.width = pct + '%';

      if (!holdState.locked && elapsed >= holdMs) {
        holdState.locked = true;
        confirmWord(gesture);
      }
    } else {
      if (badge) badge.style.display = 'none';
      if (progressEl) progressEl.style.width = '0%';
    }
  }

  function cameraLoop() {
    if (!state.cameraRunning) return;
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    if (!video || !canvas || video.readyState < 2) {
      animationFrameId = requestAnimationFrame(cameraLoop);
      return;
    }
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let results = { landmarks: [] };
    try {
      results = handLandmarker.detectForVideo(video, performance.now());
    } catch {
      /* transient decode errors are fine to skip a frame on */
    }

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // mirror, feels natural for a selfie-style camera
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let gesture = null;
    if (results.landmarks && results.landmarks.length > 0) {
      const lm = results.landmarks[0];
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      HAND_CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
        ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
        ctx.stroke();
      });
      ctx.fillStyle = '#7c3aed';
      lm.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      motionHistory.push(lm[0].x);
      if (motionHistory.length > 12) motionHistory.shift();
      gesture = classifyHand(lm, previousLandmarks, motionHistory);
      previousLandmarks = lm.map(point => ({ ...point }));
    } else {
      previousLandmarks = null;
      motionHistory = [];
    }
    ctx.restore();

    updateGestureUI(gesture);
    animationFrameId = requestAnimationFrame(cameraLoop);
  }

  async function startCamera() {
    if (state.cameraRunning) return;
    const statusEl = document.getElementById('camera-status-text');
    const overlay = document.getElementById('camera-overlay');
    const toggleBtn = document.getElementById('camera-toggle');
    try {
      if (overlay) overlay.style.display = 'flex';
      if (statusEl) statusEl.textContent = 'Loading hand-tracking model…';
      if (!handLandmarker) handLandmarker = await getHandLandmarker();

      if (statusEl) statusEl.textContent = 'Requesting camera access…';
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      videoStream = stream;
      const video = document.getElementById('camera-video');
      video.srcObject = stream;
      await video.play();

      state.cameraRunning = true;
      previousLandmarks = null;
      motionHistory = [];
      holdState = { gesture: null, startTime: 0, locked: false };
      if (toggleBtn) toggleBtn.textContent = 'Stop Camera';
      if (overlay) overlay.style.display = 'none';
      animationFrameId = requestAnimationFrame(cameraLoop);
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Could not access camera: ' + (err && err.message ? err.message : 'permission denied');
      if (overlay) overlay.style.display = 'flex';
      state.cameraRunning = false;
    }
  }

  function stopCamera() {
    state.cameraRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    previousLandmarks = null;
    motionHistory = [];
    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
      videoStream = null;
    }
    const toggleBtn = document.getElementById('camera-toggle');
    const overlay = document.getElementById('camera-overlay');
    const statusEl = document.getElementById('camera-status-text');
    const badge = document.getElementById('gesture-badge');
    if (toggleBtn) toggleBtn.textContent = 'Start Camera';
    if (statusEl) statusEl.textContent = 'Camera off';
    if (overlay) overlay.style.display = 'flex';
    if (badge) badge.style.display = 'none';
  }

  function switchDirection(dir) {
    if (state.direction === dir) return;
    if (state.direction === 'toText') stopCamera();
    state.direction = dir;
    draw();
  }

  function startPlayback(queue, startIdx = 0) {
    if (queue.length === 0) return;
    state.isPlaying = true;
    state.currentIndex = startIdx;
    draw();

    const advance = (idx) => {
      if (!state.isPlaying) return;
      const nextIdx = idx + 1;
      if (nextIdx >= state.signQueue.length) {
        state.isPlaying = false;
        state.currentIndex = state.signQueue.length - 1;
        state.statusMsg = "Playback complete";
        draw();
        return;
      }
      state.currentIndex = nextIdx;
      draw();
      const delay = 1500 / state.speed;
      state.playTimer = setTimeout(() => advance(nextIdx), delay);
    };

    const delay = 1500 / state.speed;
    state.playTimer = setTimeout(() => advance(startIdx), delay);
  }

  async function handleConvert(text) {
    if (!text.trim()) return;
    stopPlayback();
    state.isTranslating = true;
    state.statusMsg = "Translating...";
    draw();

    let englishText = text;
    if (state.selectedLang !== "en") {
      try {
        englishText = await translateToEnglish(text, state.selectedLang);
        state.translatedText = englishText;
        state.statusMsg = `Translated: "${englishText}"`;
      } catch {
        state.statusMsg = "Translation failed, processing as English";
        englishText = text;
      }
    } else {
      state.translatedText = "";
      state.statusMsg = "";
    }

    state.isTranslating = false;
    const queue = buildSignQueue(englishText);
    state.signQueue = queue;
    state.currentIndex = 0;
    draw();

    if (queue.length > 0) {
      setTimeout(() => startPlayback(queue, 0), 200);
    } else {
      state.statusMsg = "No signs found for this text";
      draw();
    }
  }

  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      state.statusMsg = "Speech recognition not supported in this browser";
      return null;
    }
    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;

    const langMap = {
      en: "en-US", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", te: "te-IN",
      bn: "bn-IN", pa: "pa-IN", gu: "gu-IN", ml: "ml-IN", kn: "kn-IN",
      ur: "ur-PK", ar: "ar-SA", zh: "zh-CN", fr: "fr-FR", de: "de-DE", es: "es-ES",
    };
    recognition.lang = langMap[state.selectedLang] || "en-US";

    recognition.onstart = () => { state.isListening = true; state.statusMsg = "Listening..."; draw(); };
    recognition.onresult = (event) => {
      let finalTranscript = "", interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        state.inputText = state.inputText ? state.inputText + " " + finalTranscript : finalTranscript;
        const ta = document.getElementById('input-text');
        if (ta) ta.value = state.inputText;
        handleConvert(finalTranscript);
      } else if (interimTranscript) {
        state.statusMsg = `Hearing: "${interimTranscript}"`;
        draw();
      }
    };
    recognition.onerror = () => { state.isListening = false; state.statusMsg = "Speech recognition error"; draw(); };
    recognition.onend = () => { state.isListening = false; draw(); };
    return recognition;
  }

  function toggleListening() {
    if (state.isListening) {
      if (state.recognition) state.recognition.stop();
      state.isListening = false;
      state.statusMsg = "";
      draw();
    } else {
      const recognition = setupSpeechRecognition();
      if (recognition) {
        state.recognition = recognition;
        recognition.start();
      } else {
        draw();
      }
    }
  }

  function handleReset() {
    stopPlayback();
    state.inputText = '';
    state.translatedText = '';
    state.signQueue = [];
    state.currentIndex = -1;
    state.statusMsg = '';
    draw();
  }

  function handlePlayPause() {
    if (state.isPlaying) {
      stopPlayback();
      draw();
    } else if (state.signQueue.length > 0) {
      const startIdx = state.currentIndex >= state.signQueue.length - 1 ? 0 : state.currentIndex;
      startPlayback(state.signQueue, startIdx);
    }
  }

  function switchMode(m) {
    if (state.mode === m) return;
    state.mode = m;
    persistMode(m);
    if (state.inputText.trim() && state.signQueue.length > 0) {
      stopPlayback();
      state.signQueue = buildSignQueue(state.inputText);
      state.currentIndex = 0;
    }
    draw();
  }

  function html() {
    const visibleSigns = state.signQueue;
    const langLabel = (LANGUAGE_OPTIONS.find(l => l.code === state.selectedLang) || {}).label || 'your language';

    return `
    <div class="min-h-screen flex flex-col" style="background:linear-gradient(160deg, #faf5ff 0%, #f3e8ff 40%, #faf5ff 100%);">
      <header class="sticky top-0 z-20 glass-card border-b border-purple-100 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center purple-gradient shadow-lg">
            <svg viewBox="0 0 40 40" class="w-6 h-6" fill="none">
              <path d="M10 30 L10 16 Q10 10 16 10 Q22 10 22 16 L22 22" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M22 22 L22 12 Q22 6 28 6 Q34 6 34 12 L34 22" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M22 22 Q22 32 16 34 L10 30" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 22 Q32 28 33 34" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-black tracking-widest shimmer-text" style="font-family:'Orbitron',sans-serif;">SANKETH</h1>
            <p class="text-[10px] text-purple-400 tracking-widest uppercase">Sign Language Bridge</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center rounded-full p-0.5" style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);">
            <button id="mode-asl" class="px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200" style="${state.mode === 'ASL' ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;box-shadow:0 2px 8px rgba(124,58,237,0.4);' : 'color:#7c3aed;'}">ASL</button>
            <button id="mode-isl" class="px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200" style="${state.mode === 'ISL' ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;box-shadow:0 2px 8px rgba(124,58,237,0.4);' : 'color:#7c3aed;'}">ISL</button>
          </div>
          <button id="go-education" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95" style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);">
            <i data-lucide="book-open-check" class="w-3.5 h-3.5 text-purple-600"></i>
            <span class="font-semibold text-xs text-purple-700 hidden sm:inline">Learn</span>
          </button>
          <button id="go-dictionary" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95" style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);">
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-purple-600"></i>
            <span class="font-semibold text-xs text-purple-700 hidden sm:inline">Dictionary</span>
          </button>
        </div>
      </header>

      <div class="flex items-center justify-center py-2" style="background:rgba(255,255,255,0.5);border-bottom:1px solid rgba(124,58,237,0.08);">
        <div class="flex items-center rounded-full p-0.5" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);">
          <button id="dir-tosign" class="px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-200" style="${state.direction === 'toSign' ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;box-shadow:0 2px 8px rgba(124,58,237,0.4);' : 'color:#7c3aed;'}">Speak → Sign</button>
          <button id="dir-totext" class="px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-200" style="${state.direction === 'toText' ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;box-shadow:0 2px 8px rgba(124,58,237,0.4);' : 'color:#7c3aed;'}">Sign → Speak</button>
        </div>
      </div>

      <main class="flex-1 flex flex-col">
      ${state.direction === 'toText' ? cameraToTextHTML() : `
        <section class="flex-1 relative overflow-hidden" style="min-height:340px;">
          <div class="absolute inset-0 flex flex-col items-center justify-center" style="background:linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(255,255,255,0.6) 100%);">
            ${state.signQueue.length === 0 ? `
              <div class="flex flex-col items-center gap-4 text-center px-6 animate-float">
                <div>
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <span class="text-xs font-black px-3 py-1 rounded-full" style="background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;">
                      ${state.mode === 'ISL' ? '🇮🇳 Indian Sign Language' : '🇺🇸 American Sign Language'}
                    </span>
                  </div>
                  <p class="text-2xl font-bold text-purple-800 mb-1">Start Signing</p>
                  <p class="text-gray-500 text-sm max-w-xs">Speak or type in any language below to see ${state.mode} signs</p>
                </div>
              </div>` : `
              <div class="w-full h-full flex flex-col items-center justify-center gap-4 px-4">
                <div class="flex items-center justify-center mb-1">
                  <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest" style="background:${state.mode === 'ISL' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)'};color:${state.mode === 'ISL' ? '#dc2626' : '#2563eb'};">
                    ${state.mode === 'ISL' ? '🇮🇳 ISL' : '🇺🇸 ASL'}
                  </span>
                </div>
                <div class="relative">
                  ${(state.currentIndex >= 0 && state.currentIndex < state.signQueue.length)
                    ? signCardHTML(state.signQueue[state.currentIndex].entry, state.signQueue[state.currentIndex].word, true, state.currentIndex, state.mode)
                    : ''}
                </div>
                <div class="flex items-center gap-1.5">
                  ${visibleSigns.map((_, i) => `
                    <button data-dot="${i}" class="rounded-full transition-all duration-300 cursor-pointer ${i === state.currentIndex ? 'w-6 h-2.5 bg-purple-600' : i < state.currentIndex ? 'w-2 h-2 bg-purple-400' : 'w-2 h-2 bg-purple-200'}"></button>
                  `).join('')}
                </div>
                ${state.signQueue.length > 1 ? `<p class="text-xs text-purple-400">Sign ${Math.min(state.currentIndex + 1, state.signQueue.length)} of ${state.signQueue.length}</p>` : ''}
              </div>`}
          </div>
        </section>

        ${state.signQueue.length > 1 ? `
        <section class="px-4 py-3 bg-white/60 border-t border-purple-100">
          <p class="text-xs text-purple-500 font-medium mb-2 uppercase tracking-wider">All Signs</p>
          <div class="flex gap-3 overflow-x-auto pb-2" style="scrollbar-width:thin;">
            ${visibleSigns.map((item, i) => `
              <button data-mini="${i}" class="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${i === state.currentIndex ? 'bg-purple-100 border-2 border-purple-400' : 'bg-white/80 border border-purple-100'}" style="min-width:64px;">
                ${gestureVisualHTML(item.entry || {}, item.word, state.mode, true)}
                <span class="text-[10px] font-medium capitalize ${i === state.currentIndex ? 'text-purple-700' : 'text-gray-500'}">${escapeHtml(item.word)}</span>
              </button>`).join('')}
          </div>
        </section>` : ''}

        <section class="glass-card border-t border-purple-100 p-4 space-y-4">
          ${(state.statusMsg || state.isTranslating) ? `
          <div class="flex items-center gap-2 px-4 py-2 rounded-full text-xs" style="background:rgba(124,58,237,0.08);color:#7c3aed;">
            ${state.isTranslating ? `<div class="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>` : ''}
            <span>${state.isTranslating ? "Translating..." : escapeHtml(state.statusMsg)}</span>
          </div>` : ''}

          ${state.translatedText ? `
          <div class="px-4 py-2 rounded-xl text-sm" style="background:rgba(124,58,237,0.06);border-left:3px solid #7c3aed;">
            <span class="text-xs text-purple-400 block mb-0.5">English translation:</span>
            <span class="text-purple-800 font-medium">${escapeHtml(state.translatedText)}</span>
          </div>` : ''}

          <div class="flex gap-2">
            <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 bg-white/80 flex-shrink-0">
              <i data-lucide="globe" class="w-3.5 h-3.5 text-purple-500"></i>
              <select id="select-language" class="text-xs bg-transparent outline-none text-purple-700 font-medium cursor-pointer" style="max-width:120px;">
                ${LANGUAGE_OPTIONS.map(lang => `<option value="${lang.code}" ${lang.code === state.selectedLang ? 'selected' : ''}>${escapeHtml(lang.label)}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              ${SPEED_OPTIONS.map(opt => `
                <button data-speed="${opt.value}" class="px-3 py-2 rounded-xl text-xs font-bold transition-all ${state.speed === opt.value ? 'text-white shadow-sm' : 'text-purple-400 bg-white/60 border border-purple-100'}" style="${state.speed === opt.value ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);' : ''}">${opt.label}</button>`).join('')}
            </div>
          </div>

          <div class="relative flex gap-2">
            <textarea id="input-text" rows="3" placeholder="${state.selectedLang === 'en' ? 'Speak or type here... (press Enter to convert)' : `Type in ${escapeHtml(langLabel)}...`}"
              class="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none border-2 border-purple-200 focus:border-purple-500 bg-white/90 text-gray-800 placeholder-gray-400 transition-all"
              style="font-family:'Poppins',sans-serif;">${escapeHtml(state.inputText)}</textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <p class="text-[10px] font-bold text-purple-400 uppercase tracking-wider px-1">Demo sentences — verified signs</p>
            <div class="flex gap-2 overflow-x-auto pb-1" style="scrollbar-width:thin;">
              ${DEMO_SENTENCES.map((s, i) => `
                <button data-demo="${i}" class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 bg-white/80 border border-purple-200 text-purple-600 hover:border-purple-400">${escapeHtml(s.length > 28 ? s.slice(0, 28) + '…' : s)}</button>`).join('')}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button id="button-mic" class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${state.isListening ? 'animate-pulse-glow' : 'hover:shadow-xl'}" style="background:${state.isListening ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#7c3aed,#9333ea)'};">
              <i data-lucide="${state.isListening ? 'mic-off' : 'mic'}" class="w-5 h-5 text-white"></i>
            </button>
            <button id="button-convert" ${(!state.inputText.trim() || state.isTranslating) ? 'disabled' : ''} class="flex-1 h-14 rounded-2xl font-bold text-white text-sm transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl" style="background:linear-gradient(135deg,#7c3aed,#9333ea,#a855f7);">
              ${state.isTranslating ? "Translating..." : "Convert to Sign Language"}
            </button>
            ${state.signQueue.length > 0 ? `
            <button id="button-play" class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 hover:shadow-xl" style="background:${state.isPlaying ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)'};border:2px solid rgba(124,58,237,0.3);">
              <i data-lucide="${state.isPlaying ? 'pause' : 'play'}" class="w-5 h-5 text-purple-700"></i>
            </button>` : ''}
            <button id="button-reset" class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 border-purple-100 bg-white/80 active:scale-95 hover:border-purple-300">
              <i data-lucide="rotate-ccw" class="w-4 h-4 text-purple-400"></i>
            </button>
          </div>

          ${state.isListening ? `
          <div class="flex items-center justify-center gap-2 py-2">
            <div class="flex gap-1 items-end h-6">${Array.from({length:5}).map((_,i)=>`<div class="w-1.5 rounded-full bg-purple-500" style="height:${Math.random()*100}%;min-height:4px;animation:float ${0.5+Math.random()*0.5}s ease-in-out infinite;animation-delay:${i*0.1}s;"></div>`).join('')}</div>
            <span class="text-purple-600 text-sm font-medium">Listening in ${escapeHtml(langLabel)}...</span>
            <div class="flex gap-1 items-end h-6">${Array.from({length:5}).map((_,i)=>`<div class="w-1.5 rounded-full bg-purple-500" style="height:${Math.random()*100}%;min-height:4px;animation:float ${0.5+Math.random()*0.5}s ease-in-out infinite;animation-delay:${i*0.1}s;"></div>`).join('')}</div>
          </div>` : ''}
        </section>`}
      </main>
    </div>`;
  }

  function cameraToTextHTML() {
    const gestureList = Object.values(GESTURES)
      .map(g => g.word)
      .join(', ');
    const quickWords = ['hello', 'bye', 'how', 'well', 'fine', 'good', 'bad'];
    const FEATURED_DEMO_GESTURES = new Set(['hello', 'bye', 'how', 'well', 'fine', 'good', 'bad']);
    return `
    <section class="flex-1 flex flex-col items-center justify-center p-4 gap-4">
      <div class="relative rounded-3xl overflow-hidden shadow-xl w-full" style="max-width:480px;aspect-ratio:4/3;background:#111;">
        <canvas id="camera-canvas" class="w-full h-full object-cover"></canvas>
        <video id="camera-video" playsinline muted style="display:none;"></video>
        <div id="camera-overlay" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80" style="display:flex;background:rgba(0,0,0,0.35);">
          <i data-lucide="camera" class="w-10 h-10"></i>
          <p id="camera-status-text" class="text-sm px-6 text-center">Camera off — press Start to begin</p>
        </div>
        <div id="gesture-badge" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" style="display:none;">
          <div class="px-4 py-2 rounded-full flex items-center gap-2" style="background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);">
            <span id="gesture-visual" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10"></span>
            <span id="gesture-label" class="text-sm font-bold text-white"></span>
          </div>
          <div class="w-32 h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.2);">
            <div id="hold-progress" class="h-full bg-purple-500" style="width:0%;transition:width 0.05s linear;"></div>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button id="camera-toggle" class="px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-95 transition-all" style="background:linear-gradient(135deg,#7c3aed,#9333ea);">Start Camera</button>
        <button id="camera-clear" class="px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-purple-200 text-purple-600 active:scale-95 transition-all">Clear</button>
        <button id="camera-speak" ${!state.recognizedText ? 'disabled' : ''} class="px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed" style="background:linear-gradient(135deg,#059669,#10b981);"><i data-lucide="volume-2" class="w-3.5 h-3.5 inline align-middle mr-1"></i>Speak</button>
      </div>

      <div class="w-full rounded-2xl p-4 bg-white/80 border border-purple-100" style="max-width:480px;min-height:60px;">
        <p class="text-xs text-purple-400 uppercase tracking-wide mb-1 font-bold">Recognized Text</p>
        <p id="recognized-text" class="text-lg font-semibold text-gray-800">${state.recognizedText ? escapeHtml(state.recognizedText) : ''}</p>
      </div>

      <div class="w-full rounded-2xl p-4 bg-white/70 border border-purple-100" style="max-width:480px;">
        <p class="text-xs text-purple-400 uppercase tracking-wide mb-2 font-bold">Quick sign-to-text words</p>
        <div class="flex flex-wrap gap-2">
          ${quickWords.map(word => `<button data-camera-word="${word}" class="px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 ${FEATURED_DEMO_GESTURES.has(word) ? 'text-white shadow-sm' : 'text-purple-700 bg-purple-50 border border-purple-200'}" ${FEATURED_DEMO_GESTURES.has(word) ? 'style="background:linear-gradient(135deg,#7c3aed,#9333ea);"' : ''}>${word}</button>`).join('')}
        </div>
        <p class="text-[11px] text-gray-400 mt-2">These gesture labels are available for camera recognition or manual confirmation when a sign includes motion or more than one hand. For Bye, keep all five fingers open and wave left to right; a still open palm is Hello.</p>
      </div>

      <div class="text-xs text-gray-400 text-center px-4" style="max-width:480px;">
        <strong class="text-purple-400">Beta</strong> — recognizes ${Object.keys(GESTURES).length} camera-friendly hand gestures (${gestureList}), not the full ISL vocabulary. Hold a pose steady for about a second to add its word. Bye needs a short side-to-side wave; Hello is the still open-palm pose.
      </div>
    </section>`;
  }

  function attachListeners() {
    document.getElementById('dir-tosign').onclick = () => switchDirection('toSign');
    document.getElementById('dir-totext').onclick = () => switchDirection('toText');
    document.getElementById('mode-asl').onclick = () => switchMode('ASL');
    document.getElementById('mode-isl').onclick = () => switchMode('ISL');
    document.getElementById('go-education').onclick = () => navigate('/education');
    document.getElementById('go-dictionary').onclick = () => navigate('/dictionary');

    if (state.direction === 'toText') {
      document.getElementById('camera-toggle').onclick = () => {
        if (state.cameraRunning) stopCamera(); else startCamera();
      };
      document.getElementById('camera-clear').onclick = () => {
        state.recognizedText = '';
        const textEl = document.getElementById('recognized-text');
        if (textEl) textEl.textContent = '';
        const speakBtn = document.getElementById('camera-speak');
        if (speakBtn) speakBtn.disabled = true;
      };
      document.getElementById('camera-speak').onclick = () => {
        if (!state.recognizedText) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(state.recognizedText);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
      };
      document.querySelectorAll('[data-camera-word]').forEach(btn => {
        btn.onclick = () => confirmWordByName(btn.dataset.cameraWord);
      });
      icons();
      return;
    }

    const ta = document.getElementById('input-text');
    ta.value = state.inputText;
    ta.addEventListener('input', (e) => { state.inputText = e.target.value; });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleConvert(state.inputText);
      }
    });

    document.querySelectorAll('[data-demo]').forEach(btn => {
      btn.onclick = () => {
        const sentence = DEMO_SENTENCES[Number(btn.dataset.demo)];
        state.inputText = sentence;
        const ta2 = document.getElementById('input-text');
        if (ta2) ta2.value = sentence;
        handleConvert(sentence);
      };
    });

    document.getElementById('select-language').onchange = (e) => { state.selectedLang = e.target.value; draw(); };

    document.querySelectorAll('[data-speed]').forEach(btn => {
      btn.onclick = () => { state.speed = Number(btn.dataset.speed); draw(); };
    });

    document.querySelectorAll('[data-dot]').forEach(btn => {
      btn.onclick = () => { stopPlayback(); state.currentIndex = Number(btn.dataset.dot); draw(); };
    });
    document.querySelectorAll('[data-mini]').forEach(btn => {
      btn.onclick = () => { stopPlayback(); state.currentIndex = Number(btn.dataset.mini); draw(); };
    });

    document.getElementById('button-mic').onclick = toggleListening;
    const convertBtn = document.getElementById('button-convert');
    if (convertBtn) convertBtn.onclick = () => handleConvert(state.inputText);
    const playBtn = document.getElementById('button-play');
    if (playBtn) playBtn.onclick = handlePlayPause;
    document.getElementById('button-reset').onclick = handleReset;

    icons();
  }

  function draw() {
    root.innerHTML = html();
    attachListeners();
  }

  cleanupCurrentPage = () => {
    if (state.playTimer) clearTimeout(state.playTimer);
    if (state.recognition) { try { state.recognition.stop(); } catch {} }
    if (state.cameraRunning) stopCamera();
  };

  draw();
}

/* =========================================================================
   DICTIONARY PAGE
   ========================================================================= */
function dictCardHTML(entry, mode = getMode()) {
  return `
    <button data-dict-card="${escapeHtml(entry.word)}" class="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 active:scale-95 text-left w-full" style="background:#f3f3f3;border:none;">
      <div class="w-full overflow-hidden" style="height:180px;border-radius:16px 16px 0 0;">
        ${gestureVisualHTML(entry, entry.word, mode)}
      </div>
      <div class="px-3 py-2.5">
        <p class="font-bold text-base text-gray-900 capitalize">${escapeHtml(entry.word)}</p>
        <p class="text-xs text-gray-400 mt-0.5 lowercase">${escapeHtml(entry.category)}</p>
      </div>
    </button>`;
}

function detailModalHTML(entry, mode = getMode()) {
  return `
    <div id="detail-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center px-4" style="background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);">
      <div id="detail-modal-card" class="w-full max-w-sm rounded-3xl overflow-hidden" style="background:white;">
        <div class="relative">
          ${gestureVisualHTML(entry, entry.word, mode)}
          <button id="button-close-detail" class="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style="background:rgba(200,200,200,0.85);">
            <i data-lucide="x" class="w-4 h-4 text-gray-700"></i>
          </button>
        </div>
        <div class="px-5 pt-4 pb-6 space-y-2">
          <h2 class="text-2xl font-black text-gray-900 capitalize">${escapeHtml(entry.word)}</h2>
          <span class="inline-block text-xs font-semibold px-3 py-1 rounded-full lowercase" style="background:rgba(124,58,237,0.1);color:#7c3aed;">${escapeHtml(entry.category)}</span>
          <p class="text-gray-600 text-sm leading-relaxed pt-1">${escapeHtml(entry.howTo)}</p>
        </div>
      </div>
    </div>`;
}

function renderDictionary() {
  const state = { mode: getMode(), search: '', activeCategory: 'All', selectedEntry: null };

  function getFiltered() {
    const allEntries = getDictionaryEntries(state.mode);
    const filtered = allEntries.filter(e => {
      const matchesSearch = !state.search ||
        e.word.toLowerCase().includes(state.search.toLowerCase()) ||
        e.category.toLowerCase().includes(state.search.toLowerCase());
      const matchesCategory = state.activeCategory === "All" || e.category === state.activeCategory;
      return matchesSearch && matchesCategory;
    });
    const categories = CATEGORIES.filter(c => c === "All" || allEntries.some(e => e.category === c));
    return { allEntries, filtered, categories };
  }

  function html() {
    const { allEntries, filtered, categories } = getFiltered();
    return `
    <div class="min-h-screen flex flex-col" style="background:#f9f9f9;">
      <header class="sticky top-0 z-20 px-4 pt-4 pb-3 flex flex-col gap-3" style="background:#f9f9f9;border-bottom:1px solid #ebebeb;">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button id="button-back" class="w-9 h-9 rounded-full flex items-center justify-center" style="background:#efefef;">
              <i data-lucide="chevron-left" class="w-4.5 h-4.5 text-gray-600"></i>
            </button>
            <div class="flex items-center gap-2">
              ${signIcon('hello', 'w-7 h-7 rounded-lg object-cover align-middle')}
              <div>
                <p class="font-black text-gray-900 text-base leading-tight">Sign Dictionary</p>
                <p class="text-[10px] text-gray-400">${allEntries.length} signs</p>
              </div>
            </div>
          </div>
          <div class="flex items-center rounded-full p-0.5" style="background:#efefef;">
            <button id="mode-asl" class="px-4 py-1.5 rounded-full text-xs font-black transition-all duration-200" style="${state.mode === 'ASL' ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;' : 'color:#666;'}">ASL</button>
            <button id="mode-isl" class="px-4 py-1.5 rounded-full text-xs font-black transition-all duration-200" style="${state.mode === 'ISL' ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;' : 'color:#666;'}">ISL</button>
          </div>
        </div>
        <div class="relative">
          <i data-lucide="search" class="w-3.75 h-3.75 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input id="input-search" type="search" placeholder="Search signs..." value="${escapeHtml(state.search)}"
            class="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none" style="background:white;border:1.5px solid #e5e5e5;color:#222;">
          ${state.search ? `<button id="clear-search" class="absolute right-3 top-1/2 -translate-y-1/2"><i data-lucide="x" class="w-3.5 h-3.5 text-gray-400"></i></button>` : ''}
        </div>
        <div class="flex gap-2 overflow-x-auto" style="scrollbar-width:none;">
          ${categories.map(cat => `
            <button data-category="${escapeHtml(cat)}" class="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95" style="${state.activeCategory === cat ? 'background:#7c3aed;color:white;' : 'background:white;color:#555;border:1.5px solid #e5e5e5;'}">${escapeHtml(cat)}</button>`).join('')}
        </div>
      </header>
      <main class="flex-1 p-4">
        ${filtered.length === 0 ? `
          <div class="flex flex-col items-center justify-center py-20 gap-3">
            <i data-lucide="search-x" class="w-12 h-12 text-gray-300"></i>
            <p class="text-gray-600 font-semibold">No signs found</p>
            <p class="text-gray-400 text-sm">Try a different search</p>
          </div>` : `
          <div class="grid grid-cols-2 gap-3">
             ${filtered.map(entry => dictCardHTML(entry, state.mode)).join('')}
          </div>`}
      </main>
      ${state.selectedEntry ? detailModalHTML(state.selectedEntry, state.mode) : ''}
    </div>`;
  }

  function attachListeners() {
    document.getElementById('button-back').onclick = () => navigate('/');
    document.getElementById('mode-asl').onclick = () => { state.mode = 'ASL'; persistMode('ASL'); state.activeCategory = 'All'; draw(); };
    document.getElementById('mode-isl').onclick = () => { state.mode = 'ISL'; persistMode('ISL'); state.activeCategory = 'All'; draw(); };

    const searchInput = document.getElementById('input-search');
    searchInput.focus();
    searchInput.setSelectionRange(state.search.length, state.search.length);
    searchInput.addEventListener('input', (e) => { state.search = e.target.value; draw(); });

    const clearBtn = document.getElementById('clear-search');
    if (clearBtn) clearBtn.onclick = () => { state.search = ''; draw(); };

    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.onclick = () => { state.activeCategory = btn.dataset.category; draw(); };
    });

    document.querySelectorAll('[data-dict-card]').forEach(btn => {
      btn.onclick = () => {
        const { allEntries } = getFiltered();
        state.selectedEntry = allEntries.find(e => e.word === btn.dataset.dictCard) || null;
        draw();
      };
    });

    const backdrop = document.getElementById('detail-modal-backdrop');
    if (backdrop) {
      backdrop.onclick = () => { state.selectedEntry = null; draw(); };
      document.getElementById('detail-modal-card').onclick = (e) => e.stopPropagation();
      document.getElementById('button-close-detail').onclick = () => { state.selectedEntry = null; draw(); };
    }

    icons();
  }

  function draw() {
    root.innerHTML = html();
    attachListeners();
  }

  draw();
}

/* =========================================================================
   EDUCATION PAGE
   ========================================================================= */
function renderEducation() {
  const state = { selectedTopic: null };

  function signViewerHTML(lesson, topic, viewerIndex) {
    const sign = lesson.signs[viewerIndex];
    return `
    <div id="sign-viewer" class="fixed inset-0 z-50 flex flex-col" style="background:rgba(5,10,20,0.95);backdrop-filter:blur(12px);">
      <div class="flex items-center justify-between px-5 pt-6 pb-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest" style="color:${topic.color};">${signIcon(topic.image, 'inline-block w-4 h-4 rounded object-cover align-middle mr-1')}${escapeHtml(topic.subject)}</p>
          <h2 class="text-lg font-black text-white leading-tight">${escapeHtml(lesson.name)}</h2>
        </div>
        <button id="close-viewer" class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,0.12);">
          <i data-lucide="x" class="w-4.5 h-4.5 text-white"></i>
        </button>
      </div>
      <div class="flex items-center gap-2 px-5 pb-3">
        ${lesson.signs.map((_, i) => `<button data-viewer-dot="${i}" class="rounded-full transition-all duration-300" style="height:5px;width:${i === viewerIndex ? '24px' : '7px'};background:${i === viewerIndex ? topic.color : 'rgba(255,255,255,0.22)'};"></button>`).join('')}
        <span class="ml-auto text-xs text-white/40">${viewerIndex + 1} / ${lesson.signs.length}</span>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center px-4 gap-3">
        <div class="w-full max-w-sm rounded-3xl overflow-hidden" style="background:white;box-shadow:0 24px 64px rgba(0,0,0,0.6);">
          <div style="height:260px;">${gestureVisualHTML(sign, sign.word, getMode())}</div>
          <div class="px-5 pt-4 pb-5">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-2xl font-black text-gray-900">${escapeHtml(sign.word)}</h3>
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style="background:${topic.colorLight};color:${topic.color};">${viewerIndex + 1} of ${lesson.signs.length}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">${escapeHtml(sign.description)}</p>
            <div class="rounded-2xl p-3" style="background:#f8f8f8;">
              <p class="text-[11px] font-bold uppercase tracking-wider mb-1" style="color:${topic.color};">How to Sign</p>
              <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(sign.howTo)}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 px-4 pb-8 pt-3">
        <button id="viewer-prev" ${viewerIndex === 0 ? 'disabled' : ''} class="flex-1 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm py-4 transition-all" style="background:${viewerIndex === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)'};color:${viewerIndex === 0 ? 'rgba(255,255,255,0.25)' : 'white'};">
          <i data-lucide="chevron-left" class="w-4.5 h-4.5"></i> Previous
        </button>
        <button id="viewer-next" ${viewerIndex === lesson.signs.length - 1 ? 'disabled' : ''} class="flex-1 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm py-4 transition-all" style="background:${viewerIndex === lesson.signs.length - 1 ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${topic.color}, ${topic.color}cc)`};color:${viewerIndex === lesson.signs.length - 1 ? 'rgba(255,255,255,0.25)' : 'white'};">
          ${viewerIndex === lesson.signs.length - 1 ? "Complete ✓" : `Next <i data-lucide="chevron-right" class="w-4.5 h-4.5"></i>`}
        </button>
      </div>
    </div>`;
  }

  function openSignViewer(lesson, topic) {
    let viewerIndex = 0;
    function drawViewer() {
      const holder = document.getElementById('viewer-holder');
      holder.innerHTML = signViewerHTML(lesson, topic, viewerIndex);
      icons();
      document.getElementById('close-viewer').onclick = () => { holder.innerHTML = ''; };
      document.querySelectorAll('[data-viewer-dot]').forEach(btn => {
        btn.onclick = () => { viewerIndex = Number(btn.dataset.viewerDot); drawViewer(); };
      });
      const prev = document.getElementById('viewer-prev');
      const next = document.getElementById('viewer-next');
      prev.onclick = () => { if (viewerIndex > 0) { viewerIndex--; drawViewer(); } };
      next.onclick = () => { if (viewerIndex < lesson.signs.length - 1) { viewerIndex++; drawViewer(); } };
    }
    drawViewer();
  }

  function lessonCardHTML(lesson, topic, expanded) {
    return `
    <div data-lesson-card="${lesson.number}" class="rounded-2xl overflow-hidden transition-all duration-300" style="background:white;border:1.5px solid ${expanded ? topic.color + '44' : '#f0f0f0'};box-shadow:${expanded ? `0 6px 24px ${topic.color}18` : '0 1px 4px rgba(0,0,0,0.05)'};">
      <button data-toggle-lesson="${lesson.number}" class="w-full flex items-center gap-3 px-4 py-3.5 text-left active:scale-[0.99] transition-transform">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-lg" style="background:linear-gradient(135deg, ${topic.color}, ${topic.color}bb);">${lesson.number}</div>
        <div class="flex-1 min-w-0">
          <p class="text-gray-900 font-black text-sm leading-tight">${escapeHtml(lesson.name)}</p>
          <p class="text-gray-400 text-[11px] mt-0.5 line-clamp-1">${escapeHtml(lesson.definition.slice(0, 60))}…</p>
        </div>
        <i data-lucide="${expanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 flex-shrink-0" style="${expanded ? `color:${topic.color};` : 'color:#d1d5db;'}"></i>
      </button>
      ${expanded ? `
      <div class="px-4 pb-4 space-y-3 border-t border-gray-50">
        <div class="pt-3 rounded-2xl">
          <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(lesson.definition)}</p>
          ${lesson.formula ? `<div class="mt-2 text-center py-2 rounded-xl" style="background:${topic.colorLight};"><span class="text-xl font-black" style="color:${topic.color};">${escapeHtml(lesson.formula)}</span></div>` : ''}
        </div>
        <div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Key Signs</p>
          <div class="flex gap-2 overflow-x-auto pb-1" style="scrollbar-width:none;">
            ${lesson.signs.map(sign => `
              <button data-view-lesson="${lesson.number}" class="flex-shrink-0 flex flex-col items-center rounded-xl overflow-hidden active:scale-95 transition-transform" style="width:72px;background:#f9f9f9;border:1.5px solid #ebebeb;">
                <div style="height:64px;width:72px;overflow:hidden;">
                  ${gestureVisualHTML(sign, sign.word, getMode(), true)}
                </div>
                <p class="text-[10px] font-bold text-gray-700 py-1 px-1 text-center leading-tight">${escapeHtml(sign.word)}</p>
              </button>`).join('')}
          </div>
        </div>
        <button data-view-lesson="${lesson.number}" class="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95" style="background:linear-gradient(135deg, ${topic.color}, ${topic.color}cc);">${signIcon('hello', 'w-4 h-4 rounded object-cover align-middle')} Sign This Lesson</button>
      </div>` : ''}
    </div>`;
  }

  function topicDetailHTML(topic, expandedLessons) {
    return `
    <div class="flex-1 flex flex-col">
      <div class="mx-4 mt-4 mb-3 rounded-3xl overflow-hidden" style="background:linear-gradient(135deg, ${topic.color} 0%, ${topic.color}bb 100%);">
        <div class="px-5 py-5">
          <div class="flex items-center gap-3 mb-2">
            ${signIcon(topic.image, 'w-10 h-10 rounded-xl object-cover align-middle')}
            <div>
              <p class="text-white/70 text-[11px] font-semibold uppercase tracking-widest">${escapeHtml(topic.subject)} · ${escapeHtml(topic.grade)}</p>
              <h2 class="text-white font-black text-lg leading-tight">${escapeHtml(topic.title)}</h2>
            </div>
          </div>
          <p class="text-white/80 text-sm leading-relaxed">${escapeHtml(topic.subtitle)}</p>
          <div class="flex items-center gap-2 mt-3">
            <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:rgba(255,255,255,0.2);color:white;">${topic.lessons.length} Lessons</span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:rgba(255,255,255,0.2);color:white;">${topic.lessons.reduce((n, l) => n + l.signs.length, 0)} Signs</span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:rgba(255,255,255,0.2);color:white;"><i data-lucide="zap" class="w-3 h-3 inline align-middle mr-0.5"></i>Interactive</span>
          </div>
        </div>
      </div>
      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest px-5 mb-3">Tap a lesson to explore</p>
      <div class="px-4 space-y-3">
        ${topic.lessons.map(lesson => lessonCardHTML(lesson, topic, !!expandedLessons[lesson.number])).join('')}
      </div>
      <div class="mx-4 mt-4 mb-4 rounded-2xl px-4 py-3 flex items-start gap-3" style="background:${topic.colorLight};border:1px solid ${topic.color}22;">
        <i data-lucide="lightbulb" class="w-4.5 h-4.5 mt-0.5" style="color:${topic.color};"></i>
        <p class="text-xs leading-relaxed" style="color:${topic.color};"><strong>Tip:</strong> Tap "Sign This Lesson" to go through each sign one by one with detailed how-to instructions.</p>
      </div>
    </div>`;
  }

  function topicCardHTML(topic) {
    return `
    <button data-topic="${topic.id}" class="w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-transform" style="background:white;border:1.5px solid #f0f0f0;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div class="h-2 w-full" style="background:linear-gradient(90deg, ${topic.color}, ${topic.color}77);"></div>
      <div class="p-4 flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style="background:${topic.colorLight};">${signIcon(topic.image, 'w-9 h-9 rounded-lg object-cover align-middle')}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-[10px] font-black uppercase tracking-widest" style="color:${topic.color};">${escapeHtml(topic.subject)}</span>
            <span class="text-[10px] text-gray-400">${escapeHtml(topic.grade)}</span>
          </div>
          <p class="font-black text-gray-900 text-sm leading-tight">${escapeHtml(topic.title)}</p>
          <p class="text-gray-400 text-[11px] mt-0.5 line-clamp-1">${escapeHtml(topic.subtitle)}</p>
        </div>
        <div class="flex flex-col items-end gap-1 flex-shrink-0">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:${topic.colorLight};color:${topic.color};">${topic.lessons.length} lessons</span>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-gray-300"></i>
        </div>
      </div>
    </button>`;
  }

  const expandedLessons = {};

  function html() {
    return `
    <div class="min-h-screen flex flex-col" style="background:#f5f5f7;">
      <header class="sticky top-0 z-20 px-4 pt-5 pb-4" style="background:rgba(245,245,247,0.95);backdrop-filter:blur(20px);border-bottom:1px solid #ebebeb;">
        <div class="flex items-center gap-3">
          <button id="header-back" class="w-9 h-9 rounded-full flex items-center justify-center" style="background:#efefef;">
            <i data-lucide="chevron-left" class="w-4.5 h-4.5 text-gray-600"></i>
          </button>
          <div class="flex items-center gap-2">
            <i data-lucide="book-open-check" class="w-5 h-5 text-purple-600"></i>
            <div>
              <p class="font-black text-gray-900 text-base leading-tight">${state.selectedTopic ? escapeHtml(state.selectedTopic.title) : 'Education'}</p>
              <p class="text-[10px] text-gray-400 uppercase tracking-wider">${state.selectedTopic ? `${escapeHtml(state.selectedTopic.subject)} · ${escapeHtml(state.selectedTopic.grade)}` : 'Learn with Sign Language'}</p>
            </div>
          </div>
        </div>
      </header>
      <div class="flex-1 overflow-y-auto">
        ${state.selectedTopic ? topicDetailHTML(state.selectedTopic, expandedLessons) : `
        <div class="px-4 py-5 space-y-4">
          <div class="rounded-3xl px-5 py-4" style="background:linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);">
            <p class="text-white font-black text-xl mb-1">Sign &amp; Learn</p>
            <p class="text-white/80 text-sm leading-relaxed">Explore subjects through interactive sign language. Each lesson shows the key concepts as signs — tap to practice.</p>
            <div class="flex gap-2 mt-3">
              <span class="px-3 py-1 rounded-full text-xs font-bold" style="background:rgba(255,255,255,0.2);color:white;">${TOPICS.length} Topics</span>
              <span class="px-3 py-1 rounded-full text-xs font-bold" style="background:rgba(255,255,255,0.2);color:white;">${TOPICS.reduce((n, t) => n + t.lessons.length, 0)} Lessons</span>
              <span class="px-3 py-1 rounded-full text-xs font-bold" style="background:rgba(255,255,255,0.2);color:white;">${TOPICS.reduce((n, t) => n + t.lessons.reduce((m, l) => m + l.signs.length, 0), 0)} Signs</span>
            </div>
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Choose a topic</p>
          ${TOPICS.map(topic => topicCardHTML(topic)).join('')}
          <div class="rounded-2xl px-4 py-3 flex items-start gap-3" style="background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.14);">
            <i data-lucide="book-open" class="w-4.5 h-4.5 text-white/90"></i>
            <p class="text-xs text-purple-700 leading-relaxed"><strong>More topics coming soon</strong> — History, Geography, Economics and more will be added with sign language explanations.</p>
          </div>
        </div>`}
      </div>
      <div id="viewer-holder"></div>
    </div>`;
  }

  function attachListeners() {
    document.getElementById('header-back').onclick = () => {
      if (state.selectedTopic) { state.selectedTopic = null; draw(); }
      else navigate('/');
    };

    document.querySelectorAll('[data-topic]').forEach(btn => {
      btn.onclick = () => {
        state.selectedTopic = TOPICS.find(t => t.id === btn.dataset.topic) || null;
        draw();
      };
    });

    document.querySelectorAll('[data-toggle-lesson]').forEach(btn => {
      btn.onclick = () => {
        const n = btn.dataset.toggleLesson;
        expandedLessons[n] = !expandedLessons[n];
        draw();
      };
    });

    document.querySelectorAll('[data-view-lesson]').forEach(btn => {
      btn.onclick = () => {
        const n = Number(btn.dataset.viewLesson);
        const lesson = state.selectedTopic.lessons.find(l => l.number === n);
        openSignViewer(lesson, state.selectedTopic);
      };
    });

    icons();
  }

  function draw() {
    root.innerHTML = html();
    attachListeners();
  }

  draw();
}

/* =========================================================================
   BOOT
   ========================================================================= */
renderLoadingScreen(() => {
  render();
});
