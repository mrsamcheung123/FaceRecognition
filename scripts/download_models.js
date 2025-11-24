const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const modelsDir = path.join(__dirname, '..', 'models');
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = [
    'ssd_mobilenet_v1_model-weights_manifest.json',
    'ssd_mobilenet_v1_model.weights.bin',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model.weights.bin',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model.weights.bin'
];

async function downloadFile(filename) {
    const url = `${baseUrl}/${filename}`;
    const filePath = path.join(modelsDir, filename);
    
    console.log(`Downloading ${filename}...`);
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        
        const buffer = await response.buffer();
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved ${filename}`);
    } catch (error) {
        console.error(`Error downloading ${filename}:`, error.message);
    }
}

async function main() {
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir);
    }

    for (const model of models) {
        await downloadFile(model);
    }
    console.log('All models downloaded successfully!');
}

main();
