import { useState, useRef, useCallback, useEffect } from "react";

import { BACKEND_URL_DEV, TARGET_INTERVAL } from "../utils/contants";
import { useCaptureFrame } from "./useCaptureFreame";

export function useDetection({ videoRef }) {
  const { captureFrame } = useCaptureFrame({ videoRef });

  const [detections, setDetections] = useState([]);
  const [frameInfo, setFrameInfo] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const runningRef = useRef(false);
  const timeoutRef = useRef(null);

  const abortControllerRef = useRef(null);
  const sessionRef = useRef(0);
  const frameIdRef = useRef(0);

  const stopDetection = useCallback(() => {
    runningRef.current = false;
    sessionRef.current += 1;

    clearTimeout(timeoutRef.current);

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setIsDetecting(false);
    setDetections([]);
    setFrameInfo(null);
  }, []);

  const startDetection = useCallback(() => {
    if (runningRef.current) return;

    runningRef.current = true;
    const sessionId = ++sessionRef.current;

    setIsDetecting(true);
    setError(null);
    setDetections([]);
    setFrameInfo(null);

    const runLoop = async () => {
      if (!runningRef.current || sessionRef.current !== sessionId) {
        return;
      }

      const startTime = performance.now();
      let controller = null;

      try {
        // 1. Capture, resize and compress frame
        const frame = await captureFrame();

        if (!runningRef.current || sessionRef.current !== sessionId) {
          return;
        }

        if (!frame) {
          throw new Error("Could not capture video frame");
        }

        const { blob, width, height } = frame;
        const frameId = ++frameIdRef.current;

        // 2. Clear previous detections before sending new frame
        setDetections([]);
        setFrameInfo(null);

        // 3. Prepare request
        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        controller = new AbortController();
        abortControllerRef.current = controller;

        // 4. Send frame to FastAPI
        const response = await fetch(`${BACKEND_URL_DEV}/predict`, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!runningRef.current || sessionRef.current !== sessionId) {
          return;
        }

        // 5. Store detections with their captured frame dimensions
        setDetections(data.detections || []);

        setFrameInfo({
          frameId,
          width,
          height,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Detection error:", err);
          setError(err.message);
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        // 6. Measure total capture + request duration
        const elapsed = performance.now() - startTime;

        // 7. Schedule next capture
        const waitTime = Math.max(0, TARGET_INTERVAL - elapsed);

        if (runningRef.current && sessionRef.current === sessionId) {
          timeoutRef.current = setTimeout(runLoop, waitTime);
        }
      }
    };

    runLoop();
  }, [captureFrame]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      runningRef.current = false;
      sessionRef.current += 1;

      clearTimeout(timeoutRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    detections,
    frameInfo,
    isDetecting,
    error,
    startDetection,
    stopDetection,
  };
}
