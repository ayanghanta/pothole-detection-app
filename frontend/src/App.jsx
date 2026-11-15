import { useEffect, useRef, useState } from "react";
import ControllButton from "./components/ControllButton";
import { useDrawBoundingBoxInCanvas } from "./hooks/useDrawBoundingBoxInCanvas";
import { useDetection } from "./hooks/useDetection";
function App() {
  const [isReady, setIsReady] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [isDetectionOn, setIsDetectionOn] = useState(false);

  const cameraVideoRef = useRef(null);
  const cameraStreamInstance = useRef(null);

  const {
    detections: potholesDetections,
    frameInfo,
    isDetecting,
    error: detectionError,
    startDetection,
    stopDetection,
  } = useDetection({
    videoRef: cameraVideoRef,
  });

  const { overlayRef } = useDrawBoundingBoxInCanvas({
    videoRef: cameraVideoRef,
    detections: potholesDetections,
    frameInfo,
    isDetectionOn,
  });

  useEffect(
    function () {
      const startCamera = async () => {
        setVideoError(null);
        try {
          cameraStreamInstance.current =
            await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "environment",
              },
              audio: false,
            });

          if (cameraVideoRef.current)
            cameraVideoRef.current.srcObject = cameraStreamInstance.current;
        } catch (err) {
          console.error(err);
          console.log("ERROR", err.message);
          setVideoError(err);
        }
      };

      if (isReady) startCamera();

      // Clean up
      return () => {
        if (cameraStreamInstance.current) {
          cameraStreamInstance.current
            .getTracks()
            .forEach((track) => track.stop());
        }
      };
    },

    [isReady],
  );

  function handleStopCamera() {
    if (!cameraStreamInstance.current) return;
    cameraStreamInstance.current.getTracks().forEach((track) => track.stop());
    cameraStreamInstance.current = null;

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }

  function handleStartDetection() {
    setIsDetectionOn(true);
    startDetection();
  }

  function handleStopDetection() {
    stopDetection();
    setIsDetectionOn(false);
  }

  console.log({ detectionError });

  if (!isReady) return <p onClick={() => setIsReady(true)}>Start the app</p>;

  return (
    <div>
      <div>
        {/* Video section */}
        <div>
          {videoError ? (
            <div>
              <h3>Camera Error</h3>

              <p>Secure context: {String(window.isSecureContext)}</p>

              <p>
                Camera API available:{" "}
                {String(Boolean(navigator.mediaDevices?.getUserMedia))}
              </p>

              <p>Error name: {videoError.name}</p>

              <p>Error message: {videoError.message}</p>
            </div>
          ) : (
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "800px",
              }}
            >
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={(event) => event.currentTarget.play()}
                className="block w-full h-auto"
              />

              {isDetectionOn && (
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              )}
            </div>
          )}
        </div>
        {/* Stats Section */}
        <div>
          <p>{isDetecting ? "Detecting" : "Not Detecting"}</p>
        </div>
      </div>
      {/* Controll section */}
      <div className="flex gap-2.5 mt-2.5">
        <ControllButton onClick={handleStartDetection}>
          Start Detection
        </ControllButton>
        <ControllButton onClick={handleStopDetection}>
          Stop Detection
        </ControllButton>
        <ControllButton onClick={handleStopCamera}>Stop Camera</ControllButton>
      </div>
    </div>
  );
}

export default App;
