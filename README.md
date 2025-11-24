# Face Recognition Demo

A compact Node.js + Express application that lets users upload an image through a browser UI and get back face detections computed on the server with [`@vladmandic/face-api`](https://github.com/vladmandic/face-api) running on TensorFlow.js for Node.

## Features

- Drag & drop or click-to-upload web interface with live preview
- REST API (`POST /api/detect`) that accepts images (JPEG/PNG/WebP)
- Server-side detection powered by Tiny Face Detector + 68-point landmarks + descriptors
- Automatic download of pre-trained model weights on first run
- Bounding boxes rendered on top of the uploaded preview

## Prerequisites

- **Node.js 18+** (uses native `fetch`, async/await, and TensorFlow.js bindings)
- Python 3.x and native build tools (required for installing the `canvas` dependency on Windows/macOS). On Windows you can install the Build Tools via:
  ```powershell
  npm install --global --production --vs2015 windows-build-tools
  ```

## Getting started

```powershell
# Install dependencies
npm install

# Optionally download model files ahead of time
npm run download-models

# Start the server
npm start
```

- Open http://localhost:3000 in your browser
- Upload an image; detections will render directly on the page and the raw JSON response is shown below the preview

## Environment variables

| Name | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port for the Express server |
| `MAX_UPLOAD_MB` | `5` | Maximum upload size accepted by multer |
| `FACE_DETECTOR_INPUT_SIZE` | `416` | Input resolution for the TinyFaceDetector (higher == more accurate, slower) |
| `FACE_DETECTOR_SCORE_THRESHOLD` | `0.5` | Minimum confidence for a detection to be returned |

You can define these in a local `.env` file.

## Project structure

```
├── public/              # Static assets served to the browser
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── faceDetector.js  # TensorFlow/face-api glue code
│   ├── modelManager.js  # Model download + verification helpers
│   └── server.js        # Express app + API routes
├── models/              # Downloaded model files (gitignored)
├── .env.example         # Sample configuration
├── package.json
└── README.md
```

## API reference

```
POST /api/detect (multipart/form-data)
  field: image (single file)
```

### Response

```json
{
  "count": 2,
  "detections": [
    {
      "id": 1,
      "score": 0.9963,
      "box": { "x": 120.32, "y": 64.15, "width": 140.77, "height": 140.22 },
      "descriptor": [/* 128 numbers for embeddings */]
    }
  ],
  "durationMs": 187
}
```

- `descriptor` can be stored to build your own face-recognition / matching pipeline later.

## Notes on accuracy & performance

- This demo uses Tiny Face Detector for fast inference on CPU. For higher accuracy you can switch to the SSD Mobilenet v1 model by updating `faceDetector.js` to load the corresponding network and adjusting the download list in `modelManager.js`.
- Running on large images can be slow; the frontend resizes previews but the server still sees the full-resolution file. Consider resizing server-side if latency becomes an issue.

## License

This sample is provided as-is under the MIT license. Face detection model weights are sourced from the `face-api.js` project (MIT license).
