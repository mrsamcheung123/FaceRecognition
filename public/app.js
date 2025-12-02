const streamsContainer = document.querySelector('#streams');
const template = document.querySelector('#stream-template');

const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

async function fetchStreams() {
  const response = await fetch('/api/streams');
  if (!response.ok) {
    throw new Error('Unable to load stream list.');
  }
  return response.json();
}

function setStatus(statusEl, message) {
  statusEl.textContent = message;
}

function renderStream({ id, name }) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.stream-card');
  const title = fragment.querySelector('h2');
  const statusEl = fragment.querySelector('.status');
  const canvas = fragment.querySelector('canvas');

  title.textContent = name ?? id;
  streamsContainer.appendChild(fragment);

  const url = `${wsProtocol}://${window.location.host}/ws/${id}`;
  const player = new JSMpeg.Player(url, { canvas, autoplay: true, audio: false });
  const socket = player.source?.socket;

  setStatus(statusEl, 'Connecting…');
  if (socket) {
    socket.addEventListener('open', () => setStatus(statusEl, 'Live'));
    socket.addEventListener('close', () => setStatus(statusEl, 'Reconnecting…'));
    socket.addEventListener('error', () => setStatus(statusEl, 'Error'));
  }

  return card;
}

async function init() {
  try {
    const streams = await fetchStreams();
    if (!streams.length) {
      streamsContainer.innerHTML = '<p>No streams configured.</p>';
      return;
    }
    streams.forEach(renderStream);
  } catch (error) {
    console.error(error);
    streamsContainer.innerHTML = '<p class="error">Failed to load stream configuration.</p>';
  }
}

init();
