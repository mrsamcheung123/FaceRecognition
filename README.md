# Node.js Face Recognition System

This is a complete Node.js system for face recognition using `face-api.js` and `express`.

## Prerequisites

1.  **Node.js**: Ensure Node.js is installed.
2.  **Build Tools (Windows)**: The `canvas` and `@tensorflow/tfjs-node` packages require native build tools.
    *   Run this in PowerShell as Administrator:
        ```powershell
        npm install --global --production windows-build-tools
        ```
    *   Or install Visual Studio with "Desktop development with C++".

## Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Download Face API Models:
    ```bash
    npm run download-models
    ```
    *This script downloads the required model weights to the `models/` directory.*

## Running the System

1.  Start the server:
    ```bash
    npm start
    ```

2.  Open your browser and navigate to:
    `http://localhost:3000`

3.  Upload an image to see the detected faces and landmarks.

## Project Structure

*   `server.js`: Main Express server handling uploads and face detection.
*   `public/`: Frontend files (HTML, CSS, JS).
*   `models/`: Directory for face-api.js model weights.
*   `uploads/`: Temporary storage for uploaded images.
*   `scripts/`: Helper scripts.
