# Dual RTSP Stream Viewer

Stream 2 RTSP feeds simultaneously in your browser using Node.js, Express, and WebSockets.

## Features

- Streams 2 RTSP sources at the same time
- Real-time video streaming in the browser
- Responsive grid layout
- Connection status indicators
- No browser plugins required

## RTSP Sources

1. **Stream 1**: Strba Lake View - `rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream`
2. **Stream 2**: Axis Camera - `rtsp://196.21.92.82/axis-media/media.amp`

## Prerequisites

- Node.js (v14 or higher)
- npm
- FFmpeg installed on your system

### Installing FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

## Installation

1. Clone or navigate to the project directory:
```bash
cd FaceRecognition
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

You should see both RTSP streams playing simultaneously in a side-by-side grid layout.

## How It Works

- **Backend**: Node.js server uses `node-rtsp-stream` to convert RTSP streams to MPEG1 format and transmit via WebSockets
- **Frontend**: JSMpeg player decodes and displays the streams in HTML5 canvas elements
- **Stream 1**: WebSocket on port 9999
- **Stream 2**: WebSocket on port 9998
- **Web Server**: HTTP server on port 3000

## Troubleshooting

### Streams not loading
- Verify FFmpeg is installed: `ffmpeg -version`
- Check if RTSP URLs are accessible from your network
- Ensure ports 3000, 9999, and 9998 are not in use
- Check firewall settings

### Poor video quality
- Adjust the `-q:v` parameter in `server.js` (lower = better quality, higher CPU usage)
- Modify the `-r` (frame rate) parameter

### High CPU usage
- Reduce frame rate in `server.js`
- Increase `-q:v` value for lower quality
- Consider using a more powerful server

## Configuration

Edit `server.js` to customize:

```javascript
ffmpegOptions: {
  '-stats': '',
  '-r': 30,        // Frame rate (fps)
  '-q:v': 3        // Quality (1-31, lower = better)
}
```

## License

ISC
