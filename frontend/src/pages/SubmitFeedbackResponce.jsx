import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PublicFeedback.css";

import useImageCapture from "../components/imageCapruturer";
import useAudioRecorder from "../components/AudioRecorder";
import useVideoRecorder from "../components/VideoRecorder";
import { applyTheme, loadThemeFromStorage } from "../themeUtils";
import { useDialog } from "../components/DialogProvider";
const BACKENDURL = import.meta.env.VITE_BACKENDURL;

// ─── Answer type options ───
const ANSWER_TYPES = [
  { value: "text", label: "Text", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> },
  { value: "rating", label: "Rating", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
  { value: "image", label: "Image", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg> },
  { value: "audio", label: "Audio", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg> },
  { value: "video", label: "Video", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg> },
];

// ─── QuestionAnswer Component ───
function QuestionAnswer({ question, index, onAnswerChange, answer }) {
  const { showDialog } = useDialog();
  const image = useImageCapture();
  const audio = useAudioRecorder();
  const video = useVideoRecorder();

  const [currentType, setCurrentType] = useState(answer?.answerType || "");
  const [capturedImage, setCapturedImage] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);

  // Sync with parent answer
  useEffect(() => {
    if (answer?.file) {
      if (answer.answerType === "image") {
        setCapturedImage(URL.createObjectURL(answer.file));
      } else if (answer.answerType === "audio") {
        setRecordedAudio(URL.createObjectURL(answer.file));
      } else if (answer.answerType === "video") {
        setRecordedVideo(URL.createObjectURL(answer.file));
      }
    } else {
      if (!answer) {
        setCapturedImage(null);
        setRecordedAudio(null);
        setRecordedVideo(null);
      }
    }
  }, [answer]);

  // Watch for audio blob changes
  useEffect(() => {
    if (currentType === "audio" && audio.audioBlob && !recordedAudio) {
      const audioUrl = URL.createObjectURL(audio.audioBlob);
      setRecordedAudio(audioUrl);
      onAnswerChange(question._id, {
        answerType: "audio",
        file: audio.audioBlob,
      });
    }
  }, [audio.audioBlob, currentType, recordedAudio, question._id, onAnswerChange]);

  // Watch for video blob changes
  useEffect(() => {
    if (currentType === "video" && video.videoBlob && !recordedVideo && !video.recording) {
      const timer = setTimeout(() => {
        if (video.videoBlob && video.videoBlob.size > 0) {
          const videoUrl = URL.createObjectURL(video.videoBlob);
          setRecordedVideo(videoUrl);
          onAnswerChange(question._id, {
            answerType: "video",
            file: video.videoBlob,
          });
        } else {
          console.error("Video blob is empty or invalid");
          showDialog("Video recording failed. The recorded video appears to be empty. Please try again.");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [video.videoBlob, video.recording, currentType, recordedVideo, question._id, onAnswerChange]);

  // Handle answer type change
  const handleTypeChange = (type) => {
    if (type === currentType) return;
    setCurrentType(type);
    if (type !== "image") image.stop?.();
    if (type !== "video") {
      if (video.recording) video.stopRecording();
      video.reset?.();
    }
    if (type !== "audio" && audio.recording) audio.stopAudio?.();

    if (capturedImage) URL.revokeObjectURL(capturedImage);
    if (recordedAudio) URL.revokeObjectURL(recordedAudio);
    if (recordedVideo) URL.revokeObjectURL(recordedVideo);

    setCapturedImage(null);
    setRecordedAudio(null);
    setRecordedVideo(null);
    onAnswerChange(question._id, { answerType: type });
  };

  // Image capture
  const handleImageCapture = async () => {
    try {
      const blob = await image.capture();
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage(imageUrl);
      image.stop();
      onAnswerChange(question._id, { answerType: "image", file: blob });
    } catch (err) {
      showDialog("Camera not ready yet. Please open camera first.");
    }
  };

  // Audio stop
  const handleAudioStop = () => audio.stopAudio();

  // Video stop
  const handleVideoStop = () => {
    if (video.recording) video.stopRecording();
  };

  // Retake
  const handleRetake = () => {
    if (capturedImage) URL.revokeObjectURL(capturedImage);
    if (recordedAudio) URL.revokeObjectURL(recordedAudio);
    if (recordedVideo) URL.revokeObjectURL(recordedVideo);
    if (video.recording) video.stopRecording();
    if (audio.recording) audio.stopAudio();
    if (image.videoRef.current?.srcObject) image.stop();

    setCapturedImage(null);
    setRecordedAudio(null);
    setRecordedVideo(null);
    onAnswerChange(question._id, null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (capturedImage) URL.revokeObjectURL(capturedImage);
      if (recordedAudio) URL.revokeObjectURL(recordedAudio);
      if (recordedVideo) URL.revokeObjectURL(recordedVideo);
    };
  }, [capturedImage, recordedAudio, recordedVideo]);

  return (
    <div className="pfb-question-card">
      {/* Question Number + Text */}
      <div className="pfb-question-number">{index + 1}</div>
      <p className="pfb-question-text">{question.text}</p>

      {/* Answer Type Chips */}
      <div className="pfb-type-selector">
        {ANSWER_TYPES.map((t) => (
          <button
            key={t.value}
            className={`pfb-type-chip ${currentType === t.value ? "active" : ""}`}
            onClick={() => handleTypeChange(t.value)}
          >
            <span className="pfb-type-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {currentType === "" && (
        <div style={{ color: '#64748B', fontSize: '14px', marginTop: '12px', fontStyle: 'italic' }}>
          Please select format of your answer
        </div>
      )}

      {/* ── TEXT ── */}
      {currentType === "text" && (
        <textarea
          className="pfb-text-area"
          placeholder="Share your thoughts here..."
          rows="4"
          value={answer?.answerText || ""}
          onChange={(e) =>
            onAnswerChange(question._id, {
              answerType: "text",
              answerText: e.target.value,
            })
          }
        />
      )}

      {/* ── RATING ── */}
      {currentType === "rating" && (
        <div className="pfb-rating">
          <div className="pfb-stars">
            {[1, 2, 3, 4, 5].map((val) => (
              <span
                key={val}
                className={`pfb-star ${answer?.ratingValue >= val ? "active" : ""}`}
                onClick={() =>
                  onAnswerChange(question._id, {
                    answerType: "rating",
                    ratingValue: val,
                  })
                }
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={answer?.ratingValue >= val ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </span>
            ))}
          </div>
          {answer?.ratingValue && (
            <span className="pfb-rating-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              {answer.ratingValue} star{answer.ratingValue > 1 ? "s" : ""} selected
            </span>
          )}
        </div>
      )}

      {/* ── IMAGE ── */}
      {currentType === "image" && (
        <div className="pfb-media">
          {!capturedImage ? (
            <>
              <div className="pfb-camera-box">
                <video ref={image.videoRef} autoPlay playsInline className="pfb-media-video" />
              </div>
              <div className="pfb-controls">
                <button className="pfb-ctrl-btn primary" onClick={image.start}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  Open Camera
                </button>
                <button
                  className="pfb-ctrl-btn primary"
                  onClick={handleImageCapture}
                  disabled={!image.videoRef.current?.srcObject}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                  Capture
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pfb-captured-box">
                <img src={capturedImage} alt="Captured" className="pfb-captured-img" />
              </div>
              <div className="pfb-controls">
                <button className="pfb-ctrl-btn secondary" onClick={handleRetake}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                  Retake
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── AUDIO ── */}
      {currentType === "audio" && (
        <div className="pfb-media">
          {!recordedAudio ? (
            <>
              <div className="pfb-rec-status">
                {audio.recording ? (
                  <div className="pfb-rec-indicator">
                    <span className="pfb-rec-dot"></span>
                    Recording…
                  </div>
                ) : (
                  <p>Tap start to begin recording</p>
                )}
              </div>
              <div className="pfb-controls">
                {!audio.recording ? (
                  <button className="pfb-ctrl-btn primary" onClick={audio.startAudio}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                    Start Recording
                  </button>
                ) : (
                  <button className="pfb-ctrl-btn stop" onClick={handleAudioStop}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
                    Stop Recording
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="pfb-captured-box" style={{ background: "transparent", boxShadow: "none" }}>
                <audio controls src={recordedAudio} className="pfb-audio-player" />
              </div>
              <div className="pfb-controls">
                <button className="pfb-ctrl-btn secondary" onClick={handleRetake}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                  Re-record
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── VIDEO ── */}
      {currentType === "video" && (
        <div className="pfb-media">
          {!recordedVideo ? (
            <>
              <div className="pfb-camera-box">
                <video ref={video.videoRef} autoPlay muted className="pfb-media-video" />
              </div>
              <div className="pfb-rec-status">
                {video.recording && (
                  <div className="pfb-rec-indicator">
                    <span className="pfb-rec-dot"></span>
                    Recording…
                  </div>
                )}
              </div>
              <div className="pfb-controls">
                {!video.recording ? (
                  <button className="pfb-ctrl-btn primary" onClick={video.startRecording}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                    Start Recording
                  </button>
                ) : (
                  <button className="pfb-ctrl-btn stop" onClick={handleVideoStop}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
                    Stop Recording
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="pfb-captured-box">
                <video
                  controls
                  src={recordedVideo}
                  className="pfb-captured-vid"
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => console.log("Video loaded, duration:", e.target.duration)}
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    showDialog("Error playing video. The file may be corrupted.");
                  }}
                />
              </div>
              <div className="pfb-controls">
                <button className="pfb-ctrl-btn secondary" onClick={handleRetake}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                  Re-record
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


// ─── Main FeedbackResponse Component ───
export default function FeedbackResponse() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [closedHospitalId, setClosedHospitalId] = useState(null);
  const { showDialog } = useDialog();

  // Instant load theme on mount
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // Load feedback form
  useEffect(() => {
    setLoading(true);
    fetch(`${BACKENDURL}/api/user/getFeedbackByIdForUser/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setFeedback(data.data);
        } else if (data && !data.success) {
          setFetchError("This form temporarily close");
          if (data.hospitalId) {
            setClosedHospitalId(data.hospitalId);
          }
        }
      })
      .catch((err) => {
        setFetchError("Network error or form unavailable.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);


  // Load hospital-specific theme
  useEffect(() => {
    const loadHospitalTheme = async () => {
      if (!feedback?.hospitalId) return;
      try {
        const res = await fetch(`${BACKENDURL}/api/user/getHospitalProfileForUser/${feedback.hospitalId}`);
        const data = await res.json();
        if (data.success) {
          const OLD_DEFAULT = "#94D8E2";
          const rawP = data.data.adminColor;
          const rawS = data.data.userColor;
          const primary = (!rawP || rawP.toUpperCase() === OLD_DEFAULT) ? "#1c6e73" : rawP;
          const secondary = (!rawS || rawS.toUpperCase() === OLD_DEFAULT) ? "#9ed6df" : rawS;
          applyTheme(primary, secondary);
        }
      } catch (err) {
        console.error("Failed to load hospital theme:", err);
      }
    };
    loadHospitalTheme();
  }, [feedback?.hospitalId]);

  // Handle answer change
  const handleAnswerChange = useCallback((qid, answerData) => {
    if (answerData === null) {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[qid];
        return newAnswers;
      });
    } else {
      setAnswers((prev) => ({ ...prev, [qid]: answerData }));
    }
  }, []);

  // Calculate progress
  const answeredCount = feedback
    ? feedback.questions.filter((q) => {
      const a = answers[q._id];
      if (!a) return false;
      if (a.answerType === "text") return !!a.answerText?.trim();
      if (a.answerType === "rating") return !!a.ratingValue;
      if (["image", "audio", "video"].includes(a.answerType)) return !!a.file;
      return false;
    }).length
    : 0;
  const totalQuestions = feedback?.questions?.length || 0;
  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Submit
  const submitFeedback = async () => {
    if (!feedback) return;

    const formData = new FormData();
    const responses = [];

    for (const q of feedback.questions) {
      const ans = answers[q._id];
      if (!ans) continue;
      const item = { questionId: q._id, answerType: ans.answerType };

      if (ans.answerType === "text" && ans.answerText?.trim()) {
        item.answerText = ans.answerText;
      }
      if (ans.answerType === "rating" && ans.ratingValue) {
        item.ratingValue = ans.ratingValue;
      }
      if (["image", "audio", "video"].includes(ans.answerType) && ans.file) {
        const key = `file_${q._id}`;
        formData.append(key, ans.file);
        item.fileKey = key;
      }
      responses.push(item);
    }

    if (responses.length === 0) {
      setSubmitError("Minimum 1 question feedback required. Please select the format of your answer and provide feedback.");
      return;
    }

    setSubmitError("");
    formData.append("responses", JSON.stringify(responses));

    try {
      setLoading(true);
      const response = await fetch(`${BACKENDURL}/api/user/submitFeedbackForUser/${id}`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setSubmitError(result.message || "Submission failed. Please try again.");
        setLoading(false);
        return;
      }

      setAnswers({});
      showDialog("Thank you for your feedback!", () => {
        navigate(`/user/HomeforFeedback/${feedback.hospitalId}`, { replace: true });
      });
    } catch (err) {
      showDialog("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading State ───
  if (fetchError || !feedback || loading) {
    return (
      <div className="pfb-loading-page">
        <nav className="pfb-navbar">
          <div className="pfb-nav-left"></div>
          <div className="pfb-nav-center">
            <div className="pfb-brand">
              <span className="pfb-brand-icon-svg">
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                  <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                  <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
                </svg>
              </span>
              <span className="pfb-brand-name">PatientTalkback</span>
            </div>
          </div>
          <div className="pfb-nav-right"></div>
        </nav>
        <div className="pfb-loading-center">
          {fetchError ? (
            <div className="pfb-error-box" style={{ background: '#fef2f2', padding: '24px', borderRadius: '12px', border: '1px solid #fecaca', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <h2 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '20px' }}>Notice</h2>
              <p style={{ color: '#b91c1c', margin: 0, fontSize: '16px', fontWeight: '500' }}>{fetchError}</p>
              
              <button 
                 onClick={() => closedHospitalId ? navigate(`/user/HomeforFeedback/${closedHospitalId}`, { replace: true }) : navigate("/", { replace: true })}
                 style={{ marginTop: '24px', padding: '10px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '24px auto 0' }}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                 Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="pfb-spinner"></div>
              <p className="pfb-loading-text">
                {loading ? "Please wait…" : "Loading feedback form…"}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pfb-page">
      {/* ─── Navbar ─── */}
      <nav className="pfb-navbar">
        <div className="pfb-nav-left">
          <button
            className="pfb-back-btn"
            onClick={() => navigate(`/user/HomeforFeedback/${feedback.hospitalId}`, { replace: true })}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </div>
        <div className="pfb-nav-center">
          <div className="pfb-brand">
            <span className="pfb-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="pfb-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="pfb-nav-right"></div>
      </nav>

      {/* ─── Content ─── */}
      <div className="pfb-content">
        {/* ─── Header ─── */}
        <div className="pfb-header">
          <div className="pfb-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Feedback Form
          </div>
          <h1 className="pfb-header-title">
            {feedback.feedback_name || "Share Your Experience"}
          </h1>
          <p className="pfb-header-subtitle">
            Your feedback helps us improve our services
          </p>

          {/* Progress Bar */}
          <div className="pfb-progress-bar">
            <div className="pfb-progress-track">
              <div className="pfb-progress-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
            <span className="pfb-progress-label">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* ─── Questions ─── */}
        {feedback.questions.map((q, index) => (
          <QuestionAnswer
            key={q._id}
            question={q}
            index={index}
            onAnswerChange={handleAnswerChange}
            answer={answers[q._id]}
          />
        ))}

        {/* ─── Submit ─── */}
        <div className="pfb-submit-area">
          {submitError && (
            <div style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
              {submitError}
            </div>
          )}
          <button className="pfb-submit-btn" onClick={submitFeedback}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Submit Feedback
          </button>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="pfb-footer">
        <p className="pfb-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}
