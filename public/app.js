const form = document.querySelector('#uploadForm');
const imageInput = document.querySelector('#imageInput');
const previewSection = document.querySelector('#previewSection');
const previewImage = document.querySelector('#previewImage');
const overlayCanvas = document.querySelector('#overlayCanvas');
const resultsJson = document.querySelector('#resultsJson');
const progress = document.querySelector('#progress');
const dropzone = document.querySelector('#dropzone');
const errorTemplate = document.querySelector('#errorTemplate');

function showError(message) {
  const errorNode = errorTemplate.content.cloneNode(true);
  errorNode.querySelector('.error').textContent = message;
  dropzone.appendChild(errorNode);
  setTimeout(() => {
    const existing = dropzone.querySelector('.error');
    if (existing) existing.remove();
  }, 6000);
}

function drawBoxes(image, detections) {
  const ctx = overlayCanvas.getContext('2d');
  overlayCanvas.width = image.naturalWidth;
  overlayCanvas.height = image.naturalHeight;
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#22c55e';
  ctx.font = '24px Segoe UI';
  ctx.fillStyle = '#22c55e';
  detections.forEach(det => {
    const { x, y, width, height } = det.box;
    ctx.strokeRect(x, y, width, height);
    ctx.fillText(`${Math.round(det.score * 100)}%`, x + 4, y + 24);
  });
}

async function sendImage(file) {
  const data = new FormData();
  data.append('image', file);
  progress.classList.remove('hidden');
  const response = await fetch('/api/detect', {
    method: 'POST',
    body: data
  });
  progress.classList.add('hidden');
  if (!response.ok) {
    const { message } = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(message);
  }
  return response.json();
}

function previewFile(file) {
  const reader = new FileReader();
  reader.onload = evt => {
    previewImage.src = evt.target.result;
    previewSection.hidden = false;
    overlayCanvas.width = 0;
    overlayCanvas.height = 0;
  };
  reader.readAsDataURL(file);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const file = imageInput.files[0];
  if (!file) {
    showError('Please select an image first.');
    return;
  }
  try {
    previewFile(file);
    const result = await sendImage(file);
    resultsJson.textContent = JSON.stringify(result, null, 2);
    previewImage.onload = () => drawBoxes(previewImage, result.detections);
    if (previewImage.complete) {
      drawBoxes(previewImage, result.detections);
    }
  } catch (err) {
    showError(err.message);
  }
});

dropzone.addEventListener('dragover', evt => {
  evt.preventDefault();
  dropzone.classList.add('dragging');
});

dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));

dropzone.addEventListener('drop', evt => {
  evt.preventDefault();
  dropzone.classList.remove('dragging');
  if (!evt.dataTransfer || !evt.dataTransfer.files.length) return;
  imageInput.files = evt.dataTransfer.files;
  previewFile(evt.dataTransfer.files[0]);
});
