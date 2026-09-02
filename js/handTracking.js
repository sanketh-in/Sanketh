// Loads MediaPipe's HandLandmarker from CDN on first use only (no bundler needed —
// dynamic import of a URL specifier works natively in the browser). Cached so the
// (fairly large) wasm + model only download once per page session.

let handLandmarkerPromise = null;

export async function getHandLandmarker() {
  if (!handLandmarkerPromise) {
    handLandmarkerPromise = (async () => {
      const { HandLandmarker, FilesetResolver } = await import(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
      );
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      return await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
    })();
  }
  return handLandmarkerPromise;
}
