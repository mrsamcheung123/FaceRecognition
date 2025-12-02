from flask import Flask, render_template, Response
import cv2
import threading
import time

app = Flask(__name__)

# RTSP URLs
RTSP_URL_1 = "rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream"
RTSP_URL_2 = "rtsp://196.21.92.82/axis-media/media.amp"

def generate_frames(rtsp_url):
    cap = cv2.VideoCapture(rtsp_url)
    
    # Check if camera opened successfully
    if not cap.isOpened():
        print(f"Error opening video stream or file: {rtsp_url}")
        return

    while True:
        success, frame = cap.read()
        if not success:
            # If the stream disconnects, try to reconnect or break
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(rtsp_url)
            continue
        
        # Encode the frame in JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        # Yield the frame in byte format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed_1')
def video_feed_1():
    return Response(generate_frames(RTSP_URL_1), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_2')
def video_feed_2():
    return Response(generate_frames(RTSP_URL_2), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
