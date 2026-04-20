import { useState, useRef } from "react";
import { useDialog } from "./DialogProvider";

export default function useVideoRecorder() {
  const { showDialog } = useDialog();
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const videoRef = useRef();
  const mediaRecorderRef = useRef();
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      // Clear previous blob
      setVideoBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Try to find a supported MIME type
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];

      let selectedMimeType = null;
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (selectedMimeType) {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
        });
      } else {
        // Fallback to browser default
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          setVideoBlob(blob);
        }
        chunksRef.current = [];
        
        // Stop stream tracks after blob is created
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        
        // Clear video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorderRef.current.onerror = (e) => {
        console.error("MediaRecorder error:", e);
      };

      // Start recording with timeslice to ensure data collection
      mediaRecorderRef.current.start(1000); // Collect data every second
      setRecording(true);
    } catch (error) {
      console.error("Error starting video recording:", error);
      showDialog("Failed to access camera/microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        // Request final data chunk
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
        setRecording(false);
      } catch (error) {
        console.error("Error stopping recording:", error);
        setRecording(false);
      }
    }
  };

  const stop = () => {
    stopRecording();
  };

  const reset = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setRecording(false);
    setVideoBlob(null);
    chunksRef.current = [];
  };

  return { videoRef, startRecording, stopRecording, stop, reset, recording, videoBlob };
}
