const SKIN = "#f3b08d";
const SKIN_DARK = "#9f5b4a";
const ACCENT = "#7c3aed";
const MOTION = "#a855f7";

function hand(type, x = 0, y = 0, scale = 1, rotate = 0) {
  const transform = `translate(${x} ${y}) scale(${scale}) rotate(${rotate} 60 75)`;
  const base = `<g transform="${transform}" fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`;
  const palm = `<path d="M36 76 Q29 88 34 111 L39 140 Q42 153 56 153 L83 153 Q96 151 97 137 L94 88 Q92 76 82 76 Z"/>`;
  const close = `</g>`;
  const finger = (d) => `<path d="${d}" fill="none"/>`;

  switch (type) {
    case "fist":
      return `${base}<rect x="35" y="72" width="58" height="70" rx="18"/><path d="M40 92 Q52 83 64 92 Q76 82 89 93"/><path d="M41 111 H89 M43 128 H87"/>${close}`;
    case "open":
      return `${base}${palm}${finger("M42 79 L37 27 Q37 20 43 20 Q49 20 50 27 L53 72")}${finger("M53 73 L52 14 Q52 7 59 7 Q66 7 66 14 L67 72")}${finger("M67 72 L69 18 Q69 11 76 11 Q83 11 83 18 L82 74")}${finger("M82 76 L87 29 Q88 22 94 23 Q100 24 98 32 L94 89")}${finger("M37 91 L21 74 Q17 69 21 65 Q25 61 30 65 L47 80")}${close}`;
    case "flat":
      return `${base}<path d="M29 83 Q26 75 34 72 L43 72 L43 28 Q43 21 50 21 Q57 21 57 28 L57 70 L61 70 L61 17 Q61 10 68 10 Q75 10 75 17 L75 70 L79 70 L79 23 Q79 16 86 16 Q93 16 93 23 L93 76 Q101 76 100 88 L96 134 Q94 153 78 157 L55 157 Q39 154 34 137 Z"/>${close}`;
    case "point":
      return `${base}${palm}${finger("M52 80 L53 9 Q53 2 60 2 Q67 2 67 9 L67 80")}${finger("M42 89 Q55 78 75 83")}${close}`;
    case "v":
      return `${base}${palm}${finger("M52 79 L38 20 Q37 13 43 11 Q50 9 53 17 L61 67")}${finger("M69 72 L86 17 Q88 10 94 13 Q100 15 98 22 L82 88")}${close}`;
    case "pinch":
      return `${base}${palm}${finger("M45 79 Q49 50 65 38 Q75 30 83 38 Q88 44 82 50 L67 64")}${finger("M43 91 Q55 82 68 87 Q82 92 89 83")}${close}`;
    case "y":
      return `${base}${palm}${finger("M47 83 L25 46 Q21 39 27 35 Q33 32 37 38 L56 68")}${finger("M79 82 L102 40 Q106 33 112 37 Q117 41 113 48 L92 91")}${close}`;
    case "c":
      return `${base}<path d="M88 47 Q75 26 54 29 Q36 32 35 57 L35 104 Q36 133 58 142 Q78 149 91 128" fill="none" stroke-width="14"/>${finger("M88 48 Q96 54 98 68")}${close}`;
    case "l":
      return `${base}${palm}${finger("M56 77 L56 10 Q56 3 63 3 Q70 3 70 10 L70 77")}${finger("M45 81 L18 56 Q13 51 18 46 Q23 41 28 45 L55 68")}${close}`;
    case "o":
      return `${base}${palm}<ellipse cx="65" cy="65" rx="25" ry="24" fill="none" stroke-width="12"/>${close}`;
    case "f":
      return `${base}${palm}<circle cx="59" cy="47" r="11" fill="none" stroke-width="9"/>${finger("M69 43 L91 22")}${finger("M69 55 L95 48")}${close}`;
    case "b":
      return `${base}<path d="M34 82 Q30 74 38 72 L45 72 L45 17 Q45 10 52 10 Q59 10 59 17 L59 70 L64 70 L64 14 Q64 7 71 7 Q78 7 78 14 L78 70 L83 70 L83 20 Q83 13 90 13 Q97 13 97 20 L97 84 Q101 91 96 102 L87 137 Q82 154 65 155 L52 155 Q40 151 37 138 Z"/>${close}`;
    default:
      return hand("open", x, y, scale, rotate);
  }
}

function arrow(d, dashed = false) {
  return `<path d="${d}" fill="none" stroke="${MOTION}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="7 7"' : ""} marker-end="url(#arrow)"/>`;
}

const VISUALS = {
  open: () => hand("open", 47, 12, 0.72),
  flat: () => hand("flat", 47, 12, 0.72),
  o: () => hand("o", 47, 12, 0.72),
  pinch: () => hand("pinch", 47, 12, 0.72),
  wave: () => `${hand("open", 20, 8, 0.82, -8)}${arrow("M137 45 Q190 18 198 65")}${arrow("M198 65 Q190 112 137 91")}`,
  greeting: () => `${hand("flat", 25, 18, 0.68, -6)}${hand("flat", 126, 18, 0.68, 6)}${arrow("M82 82 Q110 52 138 82")}`,
  flatForward: () => `${hand("flat", 18, 18, 0.78, -8)}${arrow("M116 88 H199")}`,
  flatFlip: () => `${hand("flat", 28, 16, 0.78, 10)}${arrow("M146 46 Q190 77 146 112")}`,
  flatCircle: () => `${hand("flat", 30, 18, 0.78)}${arrow("M145 46 Q193 40 191 91 Q185 125 147 114")}`,
  fistCircle: () => `${hand("fist", 26, 22, 0.83)}${arrow("M137 52 Q191 36 191 91 Q186 128 141 113")}`,
  point: () => `${hand("point", 30, 18, 0.8)}${arrow("M120 79 H201")}`,
  pointChest: () => `${hand("point", 58, 18, 0.75, -18)}${arrow("M104 69 Q86 97 105 126")}`,
  twoIndexMeet: () => `${hand("point", 5, 24, 0.58, -4)}${hand("point", 111, 24, 0.58, 4)}${arrow("M73 70 H103")}`,
  fistNod: () => `${hand("fist", 42, 10, 0.86)}${arrow("M106 42 V17")}${arrow("M106 123 V98")}`,
  noSnap: () => `${hand("pinch", 43, 17, 0.78)}${arrow("M129 52 Q173 75 129 103")}`,
  twoFlatOut: () => `${hand("flat", -2, 24, 0.6, -7)}${hand("flat", 132, 24, 0.6, 7)}${arrow("M78 80 H111")}`,
  browClasp: () => `${hand("flat", 12, 10, 0.56, -8)}${hand("point", 120, 85, 0.53, 12)}${arrow("M82 47 Q109 70 133 95")}`,
  cheekClasp: () => `${hand("fist", 17, 12, 0.58, -8)}${hand("point", 120, 86, 0.53, 12)}${arrow("M82 47 Q109 70 133 95")}`,
  mother: () => `${hand("open", 28, 8, 0.68)}${arrow("M85 39 Q103 32 112 50")}`,
  father: () => `${hand("open", 28, 40, 0.68)}${arrow("M85 84 Q103 72 112 51")}`,
  twoF: () => `${hand("f", 4, 24, 0.58, -6)}${hand("f", 131, 24, 0.58, 6)}${arrow("M81 59 Q112 38 143 59")}`,
  clap: () => `${hand("flat", 3, 36, 0.6, -10)}${hand("flat", 126, 15, 0.6, 10)}${arrow("M79 67 Q97 54 119 67")}`,
  home: () => `${hand("flat", 20, 16, 0.62, -42)}${hand("flat", 129, 16, 0.62, 42)}${arrow("M78 66 Q108 37 137 66")}`,
  brushChest: () => `${hand("flat", 52, 22, 0.72, 12)}${arrow("M112 57 V19")}${arrow("M128 70 V32")}`,
  fallingHands: () => `${hand("open", 20, 10, 0.65)}${hand("open", 125, 10, 0.65)}${arrow("M73 48 V113")}${arrow("M143 48 V113")}`,
  crossFists: () => `${hand("fist", 28, 40, 0.62, -25)}${hand("fist", 112, 40, 0.62, 25)}${arrow("M87 92 Q108 107 125 114")}`,
  hook: () => `${hand("point", 10, 18, 0.59, -22)}${hand("point", 126, 18, 0.59, 22)}${arrow("M81 61 Q102 83 81 106")}`,
  pinchMouth: () => `${hand("pinch", 55, 50, 0.65, -22)}${arrow("M109 75 Q137 48 151 42")}`,
  cupMouth: () => `${hand("c", 48, 44, 0.64, -20)}${arrow("M107 80 Q130 49 146 39")}`,
  yEar: () => `${hand("y", 48, 38, 0.65, -16)}${arrow("M116 75 Q150 42 168 44")}`,
  spread: () => `${hand("l", 0, 28, 0.62, -7)}${hand("l", 143, 28, 0.62, 7)}${arrow("M76 79 H25")}${arrow("M116 79 H176")}`,
  openBook: () => `${hand("flat", 5, 28, 0.58, -25)}${hand("flat", 138, 28, 0.58, 25)}${arrow("M79 94 Q104 111 128 94")}`,
  brush: () => `${hand("flat", 36, 28, 0.65, -4)}${hand("fist", 125, 52, 0.55)}${arrow("M102 89 Q130 72 157 89")}`,
  shiver: () => `${hand("fist", 8, 30, 0.62, -10)}${hand("fist", 139, 30, 0.62, 10)}${arrow("M74 65 V39")}${arrow("M119 39 V65")}`,
  beckon: () => `${hand("point", 42, 19, 0.7, -4)}${arrow("M109 62 Q157 37 181 69")}${arrow("M181 105 Q153 130 111 106")}`,
  pullApart: () => `${hand("point", 24, 20, 0.65, -18)}${hand("point", 127, 20, 0.65, 18)}${arrow("M91 76 H30")}${arrow("M111 76 H178")}`,
  tap: () => `${hand("point", 55, 22, 0.68, -10)}${arrow("M113 62 V25")}${arrow("M113 101 V125")}`,
  flip: () => `${hand("open", 8, 18, 0.58, -9)}${hand("open", 137, 18, 0.58, 9)}${arrow("M79 71 Q110 39 139 71")}${arrow("M139 111 Q110 141 79 111")}`,
  twoIndexForward: () => `${hand("point", 16, 31, 0.58, -8)}${hand("point", 120, 31, 0.58, -8)}${arrow("M78 75 H191")}`,
  spiral: () => `${hand("point", 45, 18, 0.7)}${arrow("M113 62 Q157 24 189 59 Q202 97 159 113")}`,
  walk: () => `${hand("open", 20, 19, 0.55)}${hand("v", 126, 60, 0.52)}${arrow("M82 116 H186")}`,
  pullIn: () => `${hand("open", 8, 21, 0.59, -5)}${hand("open", 130, 21, 0.59, 5)}${arrow("M22 65 H72")}${arrow("M198 65 H148")}`,
  pressDown: () => `${hand("flat", 8, 16, 0.6)}${hand("flat", 133, 16, 0.6)}${arrow("M73 53 V113")}${arrow("M145 53 V113")}`,
  sweep: () => `${hand("flat", 28, 25, 0.67, -4)}${arrow("M112 85 Q153 42 199 66")}`,
  orbit: () => `${hand("fist", 70, 50, 0.42)}${hand("point", 34, 20, 0.58)}${arrow("M93 44 Q182 15 184 86 Q173 140 101 121")}`,
  heavy: () => `${hand("fist", 22, 35, 0.64)}${hand("fist", 128, 35, 0.64)}${arrow("M78 53 V115")}${arrow("M144 53 V115")}`,
  diagonal: () => `${hand("point", 28, 66, 0.62, -38)}${arrow("M87 110 L185 26")}`,
  closeTogether: () => `${hand("open", 6, 25, 0.56)}${hand("open", 143, 25, 0.56)}${arrow("M26 80 H83")}${arrow("M193 80 H137")}`,
  fistOnPalm: () => `${hand("flat", 20, 60, 0.62, 90)}${hand("fist", 45, 8, 0.58)}${arrow("M95 68 V28")}`,
  sunrise: () => `${hand("flat", 5, 55, 0.55, 100)}${hand("flat", 75, 12, 0.58, -8)}${arrow("M135 65 Q150 32 145 15")}`,
  palmsUpForward: () => `${hand("open", 5, 22, 0.62, -6)}${hand("open", 118, 22, 0.62, 6)}${arrow("M78 78 H190")}`,
  handToForehead: () => `${hand("open", 40, 60, 0.6)}${arrow("M108 65 Q120 30 110 12")}`,
  snapForehead: () => `${hand("point", 45, 10, 0.6)}${arrow("M108 22 Q120 8 105 0")}`,
  twoIndexCircle: () => `${hand("point", 5, 24, 0.55, -6)}${hand("point", 118, 24, 0.55, 6)}${arrow("M78 62 Q110 40 142 62 Q110 90 78 62")}`,
  flatChest: () => `${hand("flat", 50, 22, 0.68, -6)}`,
  yDrop: () => `${hand("y", 6, 15, 0.55, -6)}${hand("y", 118, 15, 0.55, 6)}${arrow("M75 65 V110")}${arrow("M148 65 V110")}`,
};

const COMMON = {
  hello: "greeting", bye: "wave", goodbye: "wave", thank: "flatForward", thanks: "flatForward",
  please: "flatCircle", sorry: "fistCircle", you: "point", me: "pointChest", i: "pointChest",
  meet: "twoIndexMeet", yes: "fistNod", no: "noSnap", good: "flatForward", bad: "flatFlip",
  teacher: "twoFlatOut", brother: "browClasp", sister: "cheekClasp", mother: "mother", father: "father",
  family: "twoF", school: "clap", home: "home", happy: "brushChest", sad: "fallingHands",
  love: "crossFists", friend: "hook", friends: "hook", food: "pinchMouth", eat: "pinchMouth",
  drink: "cupMouth", water: "cupMouth", hot: "brushChest", cold: "shiver", call: "yEar", phone: "yEar",
  clean: "brush", busy: "brush", come: "beckon", different: "pullApart", doctor: "tap",
  done: "flip", finish: "flip", give: "flatForward", go: "twoIndexForward", later: "sweep",
  morning: "sunrise", night: "sweep", now: "pressDown", today: "yDrop", wait: "pressDown",
  name: "twoIndexMeet", nice: "open", open: "openBook", big: "spread", small: "pinch",
  book: "openBook", understand: "snapForehead", think: "spiral", walk: "walk", want: "pullIn",
  more: "spiral", need: "pullIn", help: "fistOnPalm", stop: "flat", know: "tap",
  play: "twoIndexForward", sick: "tap", hungry: "pinchMouth", tired: "fallingHands",
  again: "spiral", what: "open", where: "point", when: "tap", who: "point", why: "tap",
  work: "heavy", beautiful: "faceSweep", opposite: "pullApart", action: "flatForward",
  equal: "closeTogether", force: "flatForward", object: "o", rest: "flat", motion: "sweep",
  acceleration: "twoIndexForward", reaction: "pullIn", period: "twoIndexForward", group: "pressDown",
  element: "o", atom: "orbit", proton: "point", electron: "orbit", mass: "heavy", cell: "o",
  membrane: "closeTogether", nucleus: "o", dna: "orbit", mitochondria: "heavy", cytoplasm: "open",
  chromosome: "hook", divide: "pullApart", grow: "sweep", triangle: "diagonal",
  "right angle": "closeTogether", square: "closeTogether", hypotenuse: "diagonal",
  how: "palmsUpForward", well: "twoIndexForward", fine: "o", my: "flatChest", your: "flatForward", our: "closeTogether",
  sign: "twoIndexCircle", language: "twoIndexCircle", learn: "handToForehead",
  read: "twoIndexForward", write: "sweep", listen: "yEar", speak: "sweep",
  see: "twoIndexForward", look: "point", tell: "point", ask: "open",
  answer: "flatForward", true: "fistNod", false: "flatFlip", same: "closeTogether",
  first: "point", last: "point", one: "point", two: "v", three: "twoF",
  four: "flat", five: "open", six: "y", seven: "f", eight: "f", nine: "f", ten: "y",
};

const ISL_OVERRIDES = {
  thank: "flatForward", thanks: "flatForward", water: "cupMouth", yes: "point",
  no: "flatFlip", teacher: "sweep", bathroom: "wash", hungry: "brushChest",
  tired: "fallingHands", later: "sweep", what: "open", when: "tap", who: "point",
  why: "tap", work: "heavy", name: "twoIndexMeet", nice: "open",
};

const EXTRA_VISUALS = {
  faceSweep: () => `${hand("open", 42, 14, 0.68)}${arrow("M112 51 Q164 23 188 65 Q164 109 112 85")}`,
  wash: () => `${hand("open", 5, 40, 0.55, -18)}${hand("open", 131, 40, 0.55, 18)}${arrow("M73 82 Q104 57 134 82")}`,
};

function visualKey(word, mode) {
  const normalized = String(word || "").toLowerCase();
  return (mode === "ISL" && ISL_OVERRIDES[normalized]) || COMMON[normalized] || "open";
}

export function gestureVisualHTML(entry = {}, word = entry.word || "", mode = "ASL", compact = false) {
  const size = compact ? "width:56px;height:52px;" : "width:100%;height:100%;min-height:200px;";
  const label = `${mode} hand gesture illustration for ${word || "sign"}`;

  // Prefer the real photographed sign when one exists for this entry.
  // On load failure, swap the <img> out for the drawn SVG fallback instead
  // of leaving a broken image icon.
  const photoPath = entry.imagePath || entry.image;
  if (photoPath) {
    const fallbackId = `svgfallback-${Math.random().toString(36).slice(2)}`;
    return `<div class="gesture-illustration flex items-center justify-center" role="img" aria-label="${label.replace(/"/g, "&quot;")}" style="background:linear-gradient(145deg,#fbf9ff,#f2eafd);${size}overflow:hidden;">
      <img src="${photoPath}" alt="${label.replace(/"/g, "&quot;")}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';document.getElementById('${fallbackId}').style.display='flex';">
      <div id="${fallbackId}" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;">
        ${svgIllustration(word, mode)}
      </div>
    </div>`;
  }

  return `<div class="gesture-illustration flex items-center justify-center" role="img" aria-label="${label.replace(/"/g, "&quot;")}" style="background:linear-gradient(145deg,#fbf9ff,#f2eafd);${size}overflow:hidden;">
    ${svgIllustration(word, mode)}
  </div>`;
}

function svgIllustration(word, mode) {
  const key = visualKey(word, mode);
  const renderer = VISUALS[key] || EXTRA_VISUALS[key] || VISUALS.open;
  return `<svg viewBox="0 0 220 160" width="100%" height="100%" fill="none" aria-hidden="true">
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="${MOTION}"/></marker></defs>
      <ellipse cx="110" cy="145" rx="70" ry="7" fill="rgba(124,58,237,0.1)"/>
      ${renderer()}
    </svg>`;
}