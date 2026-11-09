import { useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const busyRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState("");

  // Start laptop camera
  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        videoRef.current.srcObject = stream;
        setCameraActive(true);
      } catch (err) {
        setError("Unable to access camera");
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Capture frame and send to FastAPI
  useEffect(() => {
    if (!cameraActive) return;

    const captureFrame = async () => {
      const video = videoRef.current;

      if (!video || !video.videoWidth || busyRef.current) {
        return;
      }

      busyRef.current = true;

      try {
        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        context.drawImage(video, 0, 0);

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.8);
        });

        if (!blob) return;

        const formData = new FormData();

        formData.append("file", blob, "frame.jpg");

        const response = await fetch(`${API_URL}/predict`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Detection API failed");
        }

        const result = await response.json();

        setDetections(result.detections);

        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        busyRef.current = false;
      }
    };

    const interval = setInterval(captureFrame, 700);

    return () => clearInterval(interval);
  }, [cameraActive]);

  // Draw YOLO bounding boxes over video
  useEffect(() => {
    const video = videoRef.current;
    const canvas = overlayRef.current;

    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection) => {
      const { x1, y1, x2, y2 } = detection.box;

      const width = x2 - x1;
      const height = y2 - y1;

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;

      ctx.strokeRect(x1, y1, width, height);

      const label = `${detection.class_name} ${(detection.confidence * 100).toFixed(1)}%`;

      ctx.font = "16px Arial";

      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "#00ff00";
      ctx.fillRect(x1, Math.max(0, y1 - 24), textWidth + 10, 24);

      ctx.fillStyle = "#000000";
      ctx.fillText(label, x1 + 5, Math.max(17, y1 - 7));
    });
  }, [detections]);

  return (
    <div style={{ padding: "25px", fontFamily: "Arial" }}>
      <h1>Live Pothole Detection</h1>

      <p>Camera: {cameraActive ? "Active" : "Connecting..."}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={(event) => event.currentTarget.play()}
          style={{
            width: "100%",
            display: "block",
          }}
        />

        <canvas
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      <h3>Potholes detected: {detections.length}</h3>

      {detections.map((item, index) => (
        <p key={index}>
          {item.class_name} - {(item.confidence * 100).toFixed(2)}%
        </p>
      ))}
    </div>
  );
}

export default App;
