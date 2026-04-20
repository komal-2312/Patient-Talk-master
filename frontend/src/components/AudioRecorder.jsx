import { useState, useRef } from "react";

export default function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef();
  const chunksRef = useRef([]);

  const startAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      chunksRef.current = [];
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopAudio = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return { startAudio, stopAudio, recording, audioBlob };
}
