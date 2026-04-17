import { useEffect, useRef, useState } from "react";

export default function Audio1() {
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 🎙️ Start Recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);

      setAudioURL(url);
      setRecordings((prev) => [...prev, url]);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  // ⏹️ Stop Recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ padding: 20 }}>
      
      <h2>🎧 Audio Studio</h2>

      {/* Recorder Controls */}
      <div style={{ marginBottom: 20 }}>
        {!isRecording ? (
          <button onClick={startRecording}>🎙️ Start Recording</button>
        ) : (
          <button onClick={stopRecording}>⏹️ Stop</button>
        )}
      </div>

      {/* Current Audio Player */}
      {audioURL && (
        <div>
          <h4>Latest Recording</h4>
          <audio controls src={audioURL}></audio>
        </div>
      )}

      {/* Saved Recordings */}
      <div style={{ marginTop: 20 }}>
        <h4>Saved Recordings</h4>
        {recordings.map((rec, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <audio controls src={rec}></audio>
          </div>
        ))}
      </div>
    </div>
  );
}