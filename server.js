const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData, loadImage } = require('canvas');

// Monkey patch face-api.js environment
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Load models
async function loadModels() {
    const modelPath = path.join(__dirname, 'models');
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log('FaceAPI models loaded successfully');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// Face Detection Endpoint
app.post('/detect', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const imgPath = req.file.path;
        const img = await loadImage(imgPath);
        
        // Detect faces
        const detections = await faceapi.detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

        // Clean up uploaded file (optional, keeping it for display)
        // fs.unlinkSync(imgPath); 

        res.json({
            filename: req.file.filename,
            detections: detections
        });
    } catch (error) {
        console.error('Detection error:', error);
        res.status(500).json({ error: 'Face detection failed' });
    }
});

// Start server
loadModels().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
