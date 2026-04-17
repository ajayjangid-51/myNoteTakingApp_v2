import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Audio1() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

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

      const newRec = {
        id: Date.now(),
        name: `Recording ${recordings.length + 1}`,
        url,
      };

      const updated = [...recordings, newRec];
      setRecordings(updated);

      // 💾 Save to localStorage
      localStorage.setItem("recordings", JSON.stringify(updated));
    };

    mediaRecorder.start();
    setIsRecording(true);

    // ⏱️ Timer
    setTime(0);
    timerRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  };

  // ⏹️ Stop Recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  // 🔁 Load saved recordings
  useEffect(() => {
    const saved = localStorage.getItem("recordings");
    if (saved) {
      setRecordings(JSON.parse(saved));
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎧 Audio Studio</h2>

      {/* Recorder */}
      <div style={{ marginBottom: 20 }}>
        {!isRecording ? (
          <button onClick={startRecording}>🎙️ Start</button>
        ) : (
          <button onClick={stopRecording}>⏹️ Stop ({time}s)</button>
        )}
      </div>

      {/* Recordings List */}
      {recordings.map((rec, index) => (
        <AudioItem
          key={rec.id}
          rec={rec}
          recordings={recordings}
          setRecordings={setRecordings}
        />
      ))}
    </div>
  );
}

// 🎧 Individual Audio Item with Waveform
function AudioItem({ rec, recordings, setRecordings }: any) {
  const waveformRef = useRef<any>(null);
  const waveSurferRef = useRef<any>(null);

  const [name, setName] = useState(rec.name);

  useEffect(() => {
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#555",
      progressColor: "#0f0",
      height: 60,
    });

    waveSurferRef.current.load(rec.url);

    return () => waveSurferRef.current.destroy();
  }, [rec.url]);

  const handleRename = () => {
    const updated = recordings.map((r: any) =>
      r.id === rec.id ? { ...r, name } : r
    );
    setRecordings(updated);
    localStorage.setItem("recordings", JSON.stringify(updated));
  };

  return (
    <div style={{ marginBottom: 20, border: "1px solid #333", padding: 10 }}>
      
      {/* Name */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleRename}
        style={{ marginBottom: 10 }}
      />

      {/* Waveform */}
      <div ref={waveformRef}></div>

      {/* Controls */}
      <div style={{ marginTop: 10 }}>
        <button onClick={() => waveSurferRef.current.playPause()}>
          ▶️ / ⏸️
        </button>

        <a href={rec.url} download={`${name}.webm`}>
          ⬇️ Download
        </a>
      </div>
    </div>
  );
}