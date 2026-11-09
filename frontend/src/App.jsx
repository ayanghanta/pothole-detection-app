import { useEffect, useRef, useState } from "react";
import ControllButton from "./components/ControllButton";
import { useDrawBoundingBoxInCanvas } from "./hooks/useDrawBoundingBoxInCanvas";
function App() {
  const [isReady, setIsReady] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [isDetectionOn, setIsDetectionOn] = useState(false);

  const cameraVideoRef = useRef(null);
  const cameraStreamInstance = useRef(null);
  const captureCanvasRef = useRef(null);

  const DUMMY = [
    {
      box: { x1: 0, x2: 100, y1: 0, y2: 100 },
      class_name: "text",
      confidence: 0.5,
    },
    {
      box: { x1: 50, x2: 130, y1: 90, y2: 120 },
      class_name: "text",
      confidence: 0.5,
    },
  ];

  const { overlayRef } = useDrawBoundingBoxInCanvas({
    videoRef: cameraVideoRef,
    detections: DUMMY,
    isDetectionOn,
  });

  // initlize canvas
  useEffect(function () {
    captureCanvasRef.current = document.createElement("canvas");
  }, []);

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
            <>
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={(event) => event.currentTarget.play()}
                className="w-3/5"
              />

              {isDetectionOn && (
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
              )}
            </>
          )}
        </div>
        {/* Stats Section */}
        <div>Stats</div>
      </div>
      {/* Controll section */}
      <div className="flex gap-2.5 mt-2.5">
        <ControllButton onClick={() => setIsDetectionOn(true)}>
          Start Detection
        </ControllButton>
        <ControllButton onClick={() => setIsDetectionOn(false)}>
          Stop Detection
        </ControllButton>
        <ControllButton onClick={handleStopCamera}>Stop Camera</ControllButton>
      </div>
    </div>
  );
}

export default App;
