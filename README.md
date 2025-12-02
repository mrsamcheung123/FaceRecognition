# Dual RTSP Streamer

Node.js + ffmpeg restreamer that pulls two RTSP feeds concurrently and delivers them to browsers via WebSocket/MPEG-TS (jsmpeg player). The default feeds are:

1. `rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream`
2. `rtsp://196.21.92.82/axis-media/media.amp`

## Prerequisites

- Node.js 18+ (for native ES modules and fetch API parity)
- ffmpeg available on your system `PATH` (the server spawns it for each stream)
- Network access to the RTSP endpoints (firewall friendly outbound TCP/UDP)

## Install

```powershell
cd FaceRecognition
npm install
```

## Run

```powershell
npm start
```

Then open `http://localhost:3000` in a browser. The page will auto-connect to both WebSocket endpoints (`/ws/strba-lake`, `/ws/axis-demo`) and display them side-by-side.

## How it works

- Each RTSP entry in `src/server.js` spawns an ffmpeg process when at least one browser client connects to its WebSocket.
- ffmpeg pulls the RTSP feed over TCP, transcodes it to MPEG1 video inside an MPEG-TS container, and pushes the bytes to stdout.
- The Node server fans those bytes out to every connected WebSocket client.
- The browser uses [jsmpeg](https://github.com/phoboslab/jsmpeg) to decode the MPEG1 stream onto a `<canvas>`.
- When the last viewer disconnects, the server stops the corresponding ffmpeg process to conserve bandwidth/CPU.

## Customizing streams

Edit the `RTSP_STREAMS` array inside `src/server.js` to point at other RTSP cameras:

```js
const RTSP_STREAMS = [
  { id: 'cam-1', name: 'Lobby', url: 'rtsp://example/camera01' },
  { id: 'cam-2', name: 'Parking', url: 'rtsp://example/camera02' }
];
```

The `id` must remain URL-safe because it becomes part of the WebSocket path (`/ws/<id>`). Add additional entries to support more than two cameras—no extra front-end changes required.

## Troubleshooting

- **Black canvas or “Connecting…” forever** – confirm ffmpeg can pull the RTSP feed directly: `ffmpeg -i <url> -f null -`. Some public cameras occasionally limit concurrent viewers.
- **`ffmpeg` command not found** – install ffmpeg and ensure it’s in your PATH (e.g., via [ffmpeg.org](https://ffmpeg.org/download.html) or package managers like `choco install ffmpeg`).
- **Firewall blocks RTSP** – the default args use TCP transport; switch to UDP by removing `-rtsp_transport tcp` if your network allows it.
- **High CPU/bandwidth** – lower `-b:v` or `-r` in `startFfmpeg()` to reduce bitrate.
