// import { useEffect, useRef } from "react";

// export function useDrawBoundingBoxInCanvas({
//   videoRef,
//   detections,
//   isDetectionOn = true,
//   frameInfo,
// }) {
//   const overlayRef = useRef(null);

//   useEffect(() => {
//     const video = videoRef.current;
//     const canvas = overlayRef.current;

//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");

//     if (!isDetectionOn) {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       return;
//     }

//     if (
//       !video ||
//       !video.videoWidth ||
//       !frameInfo?.width ||
//       !frameInfo?.height
//     ) {
//       return;
//     }

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     const scaleX = video.videoWidth / frameInfo.width;
//     const scaleY = video.videoHeight / frameInfo.height;

//     detections.forEach((detection) => {
//       const { x1, y1, x2, y2 } = detection.box;

//       const x = x1 * scaleX;
//       const y = y1 * scaleY;
//       const boxWidth = (x2 - x1) * scaleX;
//       const boxHeight = (y2 - y1) * scaleY;

//       ctx.strokeStyle = "#00ff00";
//       ctx.lineWidth = 3;
//       ctx.strokeRect(x, y, boxWidth, boxHeight);

//       const label = `${detection.class_name} ${(
//         detection.confidence * 100
//       ).toFixed(1)}%`;

//       ctx.font = "16px Arial";

//       const textWidth = ctx.measureText(label).width;
//       const labelY = Math.max(0, y - 24);

//       ctx.fillStyle = "#00ff00";
//       ctx.fillRect(x, labelY, textWidth + 10, 24);

//       ctx.fillStyle = "#000000";
//       ctx.fillText(label, x + 5, Math.max(17, y - 7));
//     });
//   }, [videoRef, detections, isDetectionOn, frameInfo]);

//   return { overlayRef };
// }

















import { useEffect, useRef } from "react";

export function useDrawBoundingBoxInCanvas({
  videoRef,
  detections,
  isDetectionOn = true,
  frameInfo,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = overlayRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!isDetectionOn) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (
      !video ||
      !video.videoWidth ||
      !frameInfo?.width ||
      !frameInfo?.height
    ) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = video.videoWidth / frameInfo.width;
    const scaleY = video.videoHeight / frameInfo.height;

    detections.forEach((detection) => {

      const { x1, y1, x2, y2 } = detection.box;

      const x = x1 * scaleX;
      const y = y1 * scaleY;

      const boxWidth = (x2 - x1) * scaleX;
      const boxHeight = (y2 - y1) * scaleY;

      // Get classification from backend
      const colorMap = {
        small: "#16A34A",
        medium: "#F59E0B",
        large: "#DC2626",
      };

      const color =
        colorMap[detection.size] || "#FFFFFF";

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, boxWidth, boxHeight);

      // Create label
      const label =
        `${detection.size.toUpperCase()} | ` +
        `${detection.area_percentage}% | ` +
        `${(detection.confidence * 100).toFixed(1)}%`;

      ctx.font = "bold 14px Arial";

      const textWidth = ctx.measureText(label).width;
      const labelY = Math.max(0, y - 26);

      // Label background
      ctx.fillStyle = color;

      ctx.fillRect(
        x,
        labelY,
        textWidth + 12,
        25
      );

      // Label text
      ctx.fillStyle = "#FFFFFF";

      ctx.fillText(
        label,
        x + 6,
        Math.max(17, y - 8)
      );

    });

  }, [videoRef, detections, isDetectionOn, frameInfo]);

  return { overlayRef };
}
