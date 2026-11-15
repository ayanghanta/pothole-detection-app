import { CAPTURE_VIDEO_MAX_WIDTH } from "./contants";

export function scaleCanvas(video, canvas) {
  const scale = Math.min(1, CAPTURE_VIDEO_MAX_WIDTH / video.videoWidth);

  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  canvas.width = width;
  canvas.height = height;

  return { canvas, width, height };
}
