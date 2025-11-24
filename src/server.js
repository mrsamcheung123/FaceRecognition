require('dotenv').config();
const path = require('path');
const express = require('express');
const multer = require('multer');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const { ensureModels } = require('./modelManager');
const { setupFaceDetector, detectFaces } = require('./faceDetector');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 5);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
      err.message = 'Only JPEG, PNG, or WebP files are allowed.';
      return callback(err);
    }
    return callback(null, true);
  }
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/detect', upload.single('image'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }
  try {
    const started = Date.now();
    const detections = await detectFaces(req.file.buffer);
    res.json({
      count: detections.length,
      detections,
      durationMs: Date.now() - started
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: `File too large. Max ${MAX_UPLOAD_MB}MB allowed.` });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: err.message || 'Unsupported file type.' });
    }
  }
  res.status(500).json({ message: 'Unable to process image.', detail: err.message });
});

async function bootstrap() {
  const modelPath = path.join(__dirname, '..', 'models');
  await ensureModels(modelPath, console);
  await setupFaceDetector(modelPath);
  app.listen(PORT, () => {
    console.log(`Face recognition server ready on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
