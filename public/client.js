async function uploadImage() {
    const input = document.getElementById('imageUpload');
    const status = document.getElementById('status');
    const imgElement = document.getElementById('uploadedImage');
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');

    if (input.files.length === 0) {
        alert('Please select an image first.');
        return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    // Display image immediately
    imgElement.src = URL.createObjectURL(file);
    imgElement.onload = () => {
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
    };

    status.textContent = 'Processing...';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
        const response = await fetch('/detect', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Detection failed');
        }

        const data = await response.json();
        status.textContent = `Detected ${data.detections.length} faces.`;

        drawDetections(data.detections, imgElement, canvas);

    } catch (error) {
        console.error(error);
        status.textContent = 'Error occurred during detection.';
    }
}

function drawDetections(detections, imgElement, canvas) {
    const ctx = canvas.getContext('2d');
    
    // Calculate scale factors
    // The server returns coordinates for the original image size.
    // The imgElement might be displayed at a different size if CSS constrains it.
    // However, canvas.width/height are set to imgElement.width/height (rendered size) in the onload handler?
    // Wait, imgElement.width is the *rendered* width in pixels, imgElement.naturalWidth is the original.
    // We need to ensure the canvas matches the rendered size.
    
    const displayWidth = imgElement.width;
    const displayHeight = imgElement.height;
    const originalWidth = imgElement.naturalWidth;
    const originalHeight = imgElement.naturalHeight;

    const scaleX = displayWidth / originalWidth;
    const scaleY = displayHeight / originalHeight;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    detections.forEach(det => {
        const box = det.detection._box; // face-api.js structure
        // or det.detection.box if simplified, but usually it's nested like this from server serialization
        // Let's check what face-api returns. It returns an object with detection property.
        // Actually, faceapi.detectAllFaces returns an array of FaceDetection or objects containing it.
        // When serialized to JSON, it keeps the structure.
        // The box properties are x, y, width, height.
        
        // Handle potential structure variations
        const x = (box._x || box.x) * scaleX;
        const y = (box._y || box.y) * scaleY;
        const w = (box._width || box.width) * scaleX;
        const h = (box._height || box.height) * scaleY;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        
        // Draw landmarks if available
        if (det.landmarks) {
            const positions = det.landmarks._positions || det.landmarks.positions;
            ctx.fillStyle = 'red';
            positions.forEach(pos => {
                ctx.beginPath();
                ctx.arc(pos._x * scaleX, pos._y * scaleY, 2, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    });
}
