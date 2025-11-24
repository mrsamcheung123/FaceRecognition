const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const fetch = require('node-fetch');

const streamPipeline = promisify(pipeline);

// Tiny face detector + landmarks + descriptor weights
const MODEL_FILES = [
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: 'https://github.com/vladmandic/face-api/raw/master/model/tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: 'https://github.com/vladmandic/face-api/raw/master/model/tiny_face_detector_model-shard1'
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: 'https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model-shard1'
  },
  {
    name: 'face_recognition_model-weights_manifest.json',
    url: 'https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-weights_manifest.json'
  },
  {
    name: 'face_recognition_model-shard1',
    url: 'https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-shard1'
  }
];

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  await streamPipeline(response.body, fs.createWriteStream(destination));
}

async function ensureModels(modelDir, logger = console) {
  await fs.promises.mkdir(modelDir, { recursive: true });
  for (const file of MODEL_FILES) {
    const filePath = path.join(modelDir, file.name);
    const exists = await fs.promises
      .access(filePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      continue;
    }
    logger.info?.(`Downloading ${file.name}…`);
    await downloadFile(file.url, filePath);
    logger.info?.(`Saved ${file.name}`);
  }
  return modelDir;
}

if (require.main === module) {
  const targetDir = path.join(__dirname, '..', 'models');
  ensureModels(targetDir)
    .then(() => {
      console.log('Model files are ready at', targetDir);
    })
    .catch(err => {
      console.error('Failed to download models:', err);
      process.exitCode = 1;
    });
}

module.exports = { ensureModels, MODEL_FILES };
