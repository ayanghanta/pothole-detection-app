import { useEffect, useRef, useState } from "react";

import {
  PiCamera,
  PiCameraSlash,
  PiPlay,
  PiStop,
  PiTarget,
  PiBroadcast,
  PiWarningCircle,
} from "react-icons/pi";

import ControllButton from "./ControllButton";
import LiveStat from "./LiveStat";

import { useDrawBoundingBoxInCanvas } from "../hooks/useDrawBoundingBoxInCanvas";
import { useDetection } from "../hooks/useDetection";
import Logo from "./Logo";

function DetectionDashboard() {
  const [isReady, setIsReady] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [isDetectionOn, setIsDetectionOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const cameraVideoRef = useRef(null);
  const cameraStreamInstance = useRef(null);

  const potholeCount = useRef(null);

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

  useEffect(() => {
    const video = cameraVideoRef.current;
    const stream = cameraStreamInstance.current;

    if (!video || !stream || isCameraLoading) return;

    video.srcObject = stream;

    video.play().catch((err) => {
      console.error("Video playback error:", err);
    });
  }, [isCameraLoading]);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      setVideoError(null);
      setIsCameraLoading(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        cameraStreamInstance.current = stream;

        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }

        setIsCameraOn(true);
      } catch (err) {
        console.error(err);
        setVideoError(err);
        setIsCameraOn(false);
      } finally {
        setIsCameraLoading(false);
      }
    };

    if (isReady) startCamera();

    return () => {
      if (cameraStreamInstance.current) {
        cameraStreamInstance.current
          .getTracks()
          .forEach((track) => track.stop());

        cameraStreamInstance.current = null;
      }
    };
  }, [isReady]);

  // count
  useEffect(
    function () {
      if (!potholeCount.current) potholeCount.current = 0;
      const newCount = Array.isArray(potholesDetections)
        ? potholesDetections.length
        : 0;

      potholeCount.current += newCount;
    },
    [potholesDetections],
  );

  // Stop camera
  function handleStopCamera() {
    handleStopDetection();

    if (!cameraStreamInstance.current) return;

    cameraStreamInstance.current.getTracks().forEach((track) => track.stop());

    cameraStreamInstance.current = null;

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }

  // Start detection
  function handleStartDetection() {
    if (!isCameraOn || isDetectionOn) return;

    setIsDetectionOn(true);
    startDetection();
  }

  // Stop detection
  function handleStopDetection() {
    stopDetection();
    setIsDetectionOn(false);
    potholeCount.current = null;
  }

  // Start app screen
  if (!isReady) {
    return (
      <main className="min-h-screen bg-[#F3F6F2] flex items-center justify-center p-5 font-manrope">
        <div className="max-w-md w-full bg-white border border-[#E2EAE3] p-8 text-center">
          <div className="w-14 h-14 mx-auto bg-[#DDF1E5] text-[#2D8A60] flex items-center justify-center">
            <PiCamera size={28} />
          </div>

          <h2 className="text-2xl font-bold text-[#26352D] mt-5">
            Ready to monitor?
          </h2>

          <p className="text-sm text-[#718176] mt-2 leading-relaxed">
            Allow camera access to start real-time pothole detection on your
            road.
          </p>

          <div className="mt-6">
            <ControllButton
              onClick={() => setIsReady(true)}
              bgColor="#2D8A60"
              hoverColor="#236F4C"
            >
              <span className="flex items-center gap-2">
                <PiCamera size={19} />
                Enable Camera
              </span>
            </ControllButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#F3F6F2] p-3 md:p-5 font-manrope flex flex-col">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between mb-4 shrink-0">
        <div>
          <Logo />
          <p className="text-[9px] text-[#718176]">Live Detection Dashboard</p>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col">
        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_210px] gap-3 flex-1 min-h-0">
          <section className="order-1 bg-white border border-[#E2EAE3] min-w-0 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#E2EAE3] shrink-0">
              <div className="flex items-center gap-2">
                <PiCamera size={15} className="text-[#2D8A60]" />
                <h2 className="text-[11px] font-bold text-[#26352D]">
                  Camera Preview
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDetecting
                      ? "bg-[#2D8A60] animate-pulse"
                      : isCameraOn
                        ? "bg-[#D99A32]"
                        : "bg-[#A0AAA3]"
                  }`}
                />

                <span
                  className={`text-[9px] font-semibold tracking-wide ${
                    isDetecting ? "text-[#2D8A60]" : "text-[#718176]"
                  }`}
                >
                  {isDetecting
                    ? "LIVE"
                    : isCameraOn
                      ? "CAMERA READY"
                      : "CAMERA OFF"}
                </span>
              </div>
            </div>

            {/* Video */}
            <div className="bg-[#17251D] flex-1 min-h-0 flex justify-center items-center relative overflow-hidden">
              {videoError ? (
                <div className="text-center p-4 max-w-lg">
                  <PiWarningCircle size={30} className="text-red-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white mt-2">
                    Camera Access Error
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-2">
                    {videoError.message}
                  </p>

                  <div className="text-[9px] text-slate-400 mt-3 space-y-1">
                    <p>Secure context: {String(window.isSecureContext)}</p>
                    <p>
                      Camera API available:{" "}
                      {String(Boolean(navigator.mediaDevices?.getUserMedia))}
                    </p>
                    <p>Error name: {videoError.name}</p>
                  </div>
                </div>
              ) : isCameraLoading ? (
                <div className="text-center text-white">
                  <PiCamera size={26} className="mx-auto animate-pulse" />
                  <p className="text-[11px] mt-2">Connecting to camera...</p>
                </div>
              ) : (
                <>
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    muted
                    playsInline
                    onLoadedMetadata={(event) => event.currentTarget.play()}
                    className="block w-full h-full object-contain"
                  />

                  {isDetectionOn && (
                    <canvas
                      ref={overlayRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                  )}
                </>
              )}
            </div>
          </section>

          <aside className="order-2 flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2 mb-1">
              <PiBroadcast size={14} className="text-[#2D8A60]" />
              <h3 className="text-[11px] font-bold text-[#26352D]">
                Live Statistics
              </h3>
            </div>

            <LiveStat
              title="POTHOLES IN FRAME"
              value={potholeCount.current}
              description="Currently detected"
              icon={PiTarget}
              accentColor="#2D8A60"
            />

            <LiveStat
              title="DETECTION STATUS"
              value={isDetecting ? "Active" : "Inactive"}
              description={
                isDetecting ? "Analyzing camera frames" : "Detection stopped"
              }
              icon={PiBroadcast}
              accentColor={isDetecting ? "#2D8A60" : "#89958D"}
            />

            <LiveStat
              title="CAMERA STATUS"
              value={isCameraOn ? "Connected" : "Disconnected"}
              description={
                isCameraOn ? "Camera stream available" : "Camera not running"
              }
              icon={isCameraOn ? PiCamera : PiCameraSlash}
              accentColor={isCameraOn ? "#2D8A60" : "#89958D"}
            />
          </aside>
        </div>

        {/* Controls - Bottom */}
        <section className="mt-3 shrink-0 bg-white border border-[#E2EAE3] px-3 py-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-[11px] font-bold text-[#26352D]">
                Detection Controls
              </h3>
              <p className="text-[9px] text-[#89958D] mt-0.5">
                Manage your camera and detection session
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ControllButton
                onClick={handleStartDetection}
                disabled={!isCameraOn || isDetectionOn || isCameraLoading}
                bgColor="#2D8A60"
                hoverColor="#236F4C"
              >
                <span className="flex items-center gap-1.5">
                  <PiPlay size={13} />
                  Start Detection
                </span>
              </ControllButton>

              <ControllButton
                onClick={handleStopDetection}
                disabled={!isDetectionOn}
                bgColor="#DC5555"
                hoverColor="#BD3838"
              >
                <span className="flex items-center gap-1.5">
                  <PiStop size={13} />
                  Stop Detection
                </span>
              </ControllButton>

              <ControllButton
                onClick={handleStopCamera}
                disabled={!isCameraOn}
                bgColor="#E8ECE9"
                hoverColor="#D5DDD7"
                textColor="#35463A"
              >
                <span className="flex items-center gap-1.5">
                  <PiCameraSlash size={13} />
                  Stop Camera
                </span>
              </ControllButton>
            </div>
          </div>
        </section>

        {/* Detection Error */}
        {detectionError && (
          <div className="mt-2 shrink-0 p-2 bg-red-50 border border-red-200 flex items-center gap-2">
            <PiWarningCircle size={16} className="text-red-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-red-700">
                Detection Error
              </p>
              <p className="text-[9px] text-red-600 mt-0.5">
                {String(detectionError.message || detectionError)}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default DetectionDashboard;
