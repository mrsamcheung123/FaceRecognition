require('@tensorflow/tfjs-node');
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let initialized = false;
let detectorOptions;
let loadPromise;

async function setupFaceDetector(modelPath) {
  if (initialized) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
      const inputSize = Number(process.env.FACE_DETECTOR_INPUT_SIZE || 416);
      const scoreThreshold = Number(process.env.FACE_DETECTOR_SCORE_THRESHOLD || 0.5);
      detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
      initialized = true;
    })();
  }
  return loadPromise;
}

async function detectFaces(imageBuffer) {
  if (!initialized) {
    throw new Error('Face detector not initialized. Call setupFaceDetector before detectFaces.');
  }
  const img = await canvas.loadImage(imageBuffer);
  // Include landmarks and descriptors for future recognition / matching scenarios.
  const detections = await faceapi
    .detectAllFaces(img, detectorOptions)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections.map((det, index) => ({
    id: index + 1,
    score: Number(det.detection.score.toFixed(4)),
    box: {
      x: Number(det.detection.box.x.toFixed(2)),
      y: Number(det.detection.box.y.toFixed(2)),
      width: Number(det.detection.box.width.toFixed(2)),
      height: Number(det.detection.box.height.toFixed(2))
    },
    descriptor: Array.from(det.descriptor)
  }));
}

module.exports = { setupFaceDetector, detectFaces };
