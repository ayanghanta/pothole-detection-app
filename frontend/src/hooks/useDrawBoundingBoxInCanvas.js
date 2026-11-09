import { useEffect, useRef } from "react";

export function useDrawBoundingBoxInCanvas({
  videoRef,
  detections,
  isDetectionOn = true,
}) {
  const overlayRef = useRef(null);

  useEffect(
    function () {
      if (!isDetectionOn) {
        const canvas = overlayRef.current;
        const ctx = canvas?.getContext("2d");

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return;
      }
      const video = videoRef?.current;
      const canvas = overlayRef.current;
      //   if (!video || !canvas || !video.videoWidth) return;
      if (!video || !canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //   const d = {
      //     box: { x1: 0, x2: 100, y1: 0, y2: 100 },
      //     class_name: "text",
      //     confidence: 0.5,
      //   };

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
    },
    [videoRef, detections, isDetectionOn],
  );

  return { overlayRef };
}
