import { useRef, useState } from "react";

export default function useImageCapture() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      setIsReady(true); // 🔥 THIS TRIGGERS RE-RENDER
      videoRef.current.play();
    };
  };

  const capture = async () => {
    if (!videoRef.current) throw new Error("Camera not ready");

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsReady(false);
  };

  return {
    videoRef,
    start,
    capture,
    stop,
    isReady, // 👈 expose state
  };
}
