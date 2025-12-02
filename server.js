const express = require('express');
const Stream = require('node-rtsp-stream');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

// Add ffmpeg to PATH so node-rtsp-stream can find it
process.env.PATH = path.dirname(ffmpegPath) + path.delimiter + process.env.PATH;

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Stream 1
const stream1 = new Stream({
  name: 'Stream 1',
  streamUrl: 'rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream',
  wsPort: 9991,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', 
    '-r': 30 
  }
});

// Stream 2
const stream2 = new Stream({
  name: 'Stream 2',
  streamUrl: 'rtsp://196.21.92.82/axis-media/media.amp',
  wsPort: 9992,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', 
    '-r': 30 
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Stream 1 running on ws://localhost:9991');
  console.log('Stream 2 running on ws://localhost:9992');
});
