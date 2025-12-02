import express from 'express';
import expressWs from 'express-ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proxy } from 'rtsp-relay';

const streams = [
  {
    id: 'vyhlad-jazero',
    label: 'Strba – Vyhlad Jazero',
    rtspUrl: 'rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream'
  },
  {
    id: 'axis-demo',
    label: 'Axis Demo Feed',
    rtspUrl: 'rtsp://196.21.92.82/axis-media/media.amp'
  }
];

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
expressWs(app);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/streams', (_req, res) => {
  const payload = streams.map(({ id, label }) => ({
    id,
    label,
    wsPath: `/ws/${id}`
  }));

  res.json(payload);
});

app.ws('/ws/:streamId', (ws, req) => {
  const stream = streams.find(({ id }) => id === req.params.streamId);

  if (!stream) {
    ws.terminate();
    return;
  }

  proxy({
    url: stream.rtspUrl,
    transport: 'tcp',
    verbose: false
  })(ws, req);
});

app.listen(PORT, HOST, () => {
  console.log(`RTSP relay listening on http://${HOST}:${PORT}`);
});
