// Hand skeleton connections (standard 21-point MediaPipe hand landmark topology)
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// A small, hand-picked vocabulary of static poses that can be reliably told apart
// from a single frame of hand-landmark geometry. This is NOT full ASL/ISL
// recognition (that requires motion, two hands, and facial expression) — it's a
// beta gesture-to-word demo. "ily" is the real ASL/ISL handshape for "I love you".
// `image` points at a real sign photo in /signs/ and is preferred wherever it
// exists. The camera vocabulary intentionally uses labels and sign imagery only;
// no emoji fallbacks are rendered in the recognition UI.
export const GESTURES = {
  open_hand:   { word: "hello", image: "signs/hello.png", label: "Open Palm / Hello" },
  bye:         { word: "bye", image: "signs/bye.png", label: "Open Palm Wave / Bye", motion: "wave" },
  fist:        { word: "stop", image: "signs/stop.jpg", label: "Closed Fist / Stop" },
  thumbs_up:   { word: "good", image: "signs/good.jpg", label: "Thumbs Up / Good" },
  thumbs_down: { word: "bad", image: "signs/bad.png", label: "Thumbs Down / Bad" },
  point:       { word: "you", image: "signs/you.png", label: "Pointing / You" },
  ily:         { word: "love", image: "signs/love.png", label: "I-Love-You Sign" },
  shaka:       { word: "call", image: "signs/call.png", label: "Shaka / Call Me" },
  fine:        { word: "fine", image: "signs/fine.png", label: "O-Hand / Fine" },
  how:         { word: "how", image: "signs/how.png", label: "Two Fingers / How" },
  well:        { word: "well", label: "Three Fingers / Well" },
};

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

/**
 * Classify a single hand's 21 landmarks into one of the GESTURES keys, or null
 * if the pose doesn't clearly match anything in the vocabulary.
 */
export function classifyHand(lm, previousLm = null, motionHistory = []) {
  if (!lm || lm.length < 21) return null;

  const wrist = lm[0];
  const palmWidth = dist(lm[5], lm[17]) || 0.001;

  // A finger counts as "up" if its tip sits farther from the wrist than its
  // own pip joint does — robust to hand rotation, unlike a plain y-comparison.
  const up = (tip, pip) => dist(lm[tip], wrist) > dist(lm[pip], wrist);
  const indexUp = up(8, 6);
  const middleUp = up(12, 10);
  const ringUp = up(16, 14);
  const pinkyUp = up(20, 18);

  // Thumb "out" if its tip is far from the pinky's base relative to palm width.
  const thumbOut = dist(lm[4], lm[17]) > palmWidth * 0.85;
  const pinch = dist(lm[4], lm[8]) < palmWidth * 0.7;

  const upCount = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;
  const horizontalMotion = previousLm
    ? Math.abs(wrist.x - previousLm[0].x) + Math.abs(lm[9].x - previousLm[9].x)
    : 0;
  const recentXs = Array.isArray(motionHistory) ? motionHistory : [];
  const recentTravel = recentXs.length > 3 ? Math.max(...recentXs) - Math.min(...recentXs) : 0;
  let directionChanges = 0;
  for (let i = 2; i < recentXs.length; i += 1) {
    const previousDirection = Math.sign(recentXs[i - 1] - recentXs[i - 2]);
    const currentDirection = Math.sign(recentXs[i] - recentXs[i - 1]);
    if (previousDirection !== 0 && currentDirection !== 0 && previousDirection !== currentDirection) directionChanges += 1;
  }

  // A wave is movement, so Bye is intentionally different from the still open
  // palm used for Hello. The rolling window catches natural phone-camera waves
  // even when one individual frame moves only a few pixels.
  const waving = horizontalMotion > 0.018 || (recentTravel > 0.055 && directionChanges >= 1);
  if (upCount === 4 && thumbOut && waving) return "bye";
  if (pinch && middleUp && ringUp && pinkyUp) return "fine";
  if (upCount === 3 && indexUp && middleUp && ringUp && !pinkyUp) return "well";
  if (upCount === 2 && indexUp && middleUp && !ringUp && !pinkyUp) return "how";
  if (upCount === 4 && thumbOut) return "open_hand";
  if (upCount === 0 && !thumbOut) return "fist";
  if (upCount === 0 && thumbOut) return lm[4].y < wrist.y ? "thumbs_up" : "thumbs_down";
  if (indexUp && !middleUp && !ringUp && !pinkyUp && !thumbOut) return "point";
  if (indexUp && pinkyUp && !middleUp && !ringUp && thumbOut) return "ily";
  if (!indexUp && !middleUp && !ringUp && pinkyUp && thumbOut) return "shaka";
  return null;
}
