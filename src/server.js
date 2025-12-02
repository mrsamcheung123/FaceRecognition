import { createServer } from 'http';
import express from 'express';
import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT) || 3000;
const RTSP_STREAMS = [
  {
    id: 'strba-lake',
    name: 'Štrbské Pleso Lake',
    url: 'rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream'
  },
  {
    id: 'axis-demo',
    name: 'Axis Demo Camera',
    url: 'rtsp://196.21.92.82/axis-media/media.amp'
  }
];

const app = express();
app.use(express.static('public'));
app.get('/api/streams', (_req, res) => {
  res.json(RTSP_STREAMS.map(({ id, name }) => ({ id, name })));
});

const server = createServer(app);
const streamServers = new Map();

function broadcastChunk(wss, chunk) {
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(chunk);
    }
  }
}

function startFfmpeg(stream, wss, setProcess) {
  const args = [
    '-rtsp_transport',
    'tcp',
    '-i',
    stream.url,
    '-f',
    'mpegts',
    '-codec:v',
    'mpeg1video',
    '-b:v',
    '800k',
    '-r',
    '25',
    '-an',
    '-'
  ];

  const ffmpeg = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'inherit'] });
  setProcess(ffmpeg);
  console.log(`ffmpeg started for ${stream.id}`);

  ffmpeg.stdout.on('data', (chunk) => broadcastChunk(wss, chunk));
  ffmpeg.on('close', (code) => {
    console.error(`ffmpeg for ${stream.id} exited with code ${code}. Restarting in 5s.`);
    setProcess(null);
    if (wss.clients.size) {
      setTimeout(() => startFfmpeg(stream, wss, setProcess), 5000);
    } else {
      console.log(`ffmpeg restart skipped for ${stream.id}; no active viewers.`);
    }
  });

  return ffmpeg;
}

function setupStream(stream) {
  const wss = new WebSocketServer({ noServer: true });
  const upgradePath = `/ws/${stream.id}`;
  let ffmpegProcess = null;

  wss.on('connection', (ws) => {
    console.log(`Client connected to ${stream.id}`);

    ws.on('close', () => {
      console.log(`Client disconnected from ${stream.id}`);
      if (!wss.clients.size && ffmpegProcess) {
        console.log(`Stopping ffmpeg for ${stream.id} (no listeners).`);
        ffmpegProcess.kill('SIGTERM');
        ffmpegProcess = null;
      }
    });

    if (!ffmpegProcess) {
      startFfmpeg(stream, wss, (proc) => {
        ffmpegProcess = proc;
      });
    }
  });

  streamServers.set(upgradePath, { wss });
}

RTSP_STREAMS.forEach(setupStream);

server.on('upgrade', (request, socket, head) => {
  const host = request.headers.host || `localhost:${PORT}`;
  const { pathname } = new URL(request.url, `http://${host}`);
  const entry = streamServers.get(pathname);

  if (!entry) {
    socket.destroy();
    return;
  }

  entry.wss.handleUpgrade(request, socket, head, (ws) => {
    entry.wss.emit('connection', ws, request);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  RTSP_STREAMS.forEach(({ id }) => console.log(`WebSocket available at ws://localhost:${PORT}/ws/${id}`));
});
