# RTSP Stream Viewer

This project streams two RTSP feeds to a web browser using Flask and OpenCV.

## Prerequisites

- Python 3.x installed
- Internet connection (to access the public RTSP streams)

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Usage

1.  **Run the application:**
    ```bash
    python app.py
    ```

2.  **Open your browser:**
    Go to [http://localhost:5000](http://localhost:5000)

## Notes

- The application uses OpenCV to capture RTSP streams and converts them to MJPEG for browser compatibility.
- Performance depends on your network connection and the stability of the source RTSP streams.
