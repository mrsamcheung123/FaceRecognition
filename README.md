# RTSP Multi-Stream Viewer

This project relays two RTSP feeds to any modern browser using Node.js, Express, and [`rtsp-relay`](https://github.com/kyriesent/rtsp-relay).

## Prerequisites

- Node.js 18+ and npm
- `ffmpeg` available on your `PATH` (required by `rtsp-relay` to transcode the RTSP feeds)

## Getting started

```powershell
Set-Location "c:\Users\mrsam\OneDrive\文件\GitHub\FaceRecognition"
npm install
npm start
```

Then open `http://localhost:3000` and both RTSP streams will appear side-by-side. Use `PORT` or `HOST` environment variables to override the defaults if needed.

## Customizing streams

Update `streams` in `src/server.mjs` with any other RTSP endpoints you want to relay. Each stream automatically receives its own WebSocket endpoint (`/ws/{id}`), and the frontend consumes `/api/streams` to determine what to display.
