import { useEffect, useRef, useCallback } from "react";
import { scaleCanvas } from "../utils/helper";

export function useCaptureFrame({ videoRef }) {
  const captureCanvasRef = useRef(null);

  useEffect(() => {
    captureCanvasRef.current = document.createElement("canvas");
  }, []);

  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvasRaw = captureCanvasRef.current;

    if (!video || !video.videoWidth || !canvasRaw) return null;

    try {
      //   canvas.width = video.videoWidth;
      //   canvas.height = video.videoHeight;

      const { canvas, width, height } = scaleCanvas(video, canvasRaw);

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      });

      return {
        blob,
        width,
        height,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [videoRef]);

  return { captureFrame };
}
