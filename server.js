const express = require('express');
const Stream = require('node-rtsp-stream');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (HTML, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Stream 1: Strba Lake View
const stream1 = new Stream({
  name: 'stream1',
  streamUrl: 'rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream',
  wsPort: 9999,
  ffmpegOptions: {
    '-stats': '',
    '-r': 30,
    '-q:v': 3
  }
});

// Stream 2: Axis Camera
const stream2 = new Stream({
  name: 'stream2',
  streamUrl: 'rtsp://196.21.92.82/axis-media/media.amp',
  wsPort: 9998,
  ffmpegOptions: {
    '-stats': '',
    '-r': 30,
    '-q:v': 3
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Stream 1 (Strba Lake) WebSocket on port 9999');
  console.log('Stream 2 (Axis Camera) WebSocket on port 9998');
});
