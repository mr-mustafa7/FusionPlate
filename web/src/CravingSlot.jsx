import { useRef, useState } from "react";
import { IconUpload, IconRefresh, IconMic } from "./icons";

// Two ways in for the "what you're craving" half of the fusion: a photo (menu, plated
// dish, takeout screenshot), or a typed/spoken description — a second input modality,
// not just a second upload button, and genuinely useful when there's no photo to take.
export default function CravingSlot({ index, onChange }) {
  const [mode, setMode] = useState("photo");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const speechSupported =
    typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    onChange(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function handleTextChange(value) {
    setText(value);
    onChange(value.trim() ? value : null);
  }

  function switchMode(next) {
    setMode(next);
    onChange(next === "photo" ? file : text.trim() ? text : null);
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => handleTextChange(e.results[0][0].transcript);
    recognition.start();
  }

  return (
    <div className="photo-slot-wrap">
      <div className="slot-index-row">
        <span className="slot-index">{index}</span>
        <div className="mode-tabs">
          <button type="button" className={mode === "photo" ? "active" : ""} onClick={() => switchMode("photo")}>
            Photo
          </button>
          <button type="button" className={mode === "describe" ? "active" : ""} onClick={() => switchMode("describe")}>
            Describe it
          </button>
        </div>
      </div>

      {mode === "photo" ? (
        <div
          className={`photo-slot ${dragOver ? "drag-over" : ""} ${file ? "filled" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {preview ? (
            <>
              <img src={preview} alt="What you're craving" className="photo-preview" />
              <span className="photo-tag">What you're craving</span>
              <div className="photo-overlay">
                <IconRefresh width={14} height={14} />
                Replace
              </div>
            </>
          ) : (
            <div className="photo-placeholder">
              <span className="photo-icon">
                <IconUpload width={20} height={20} />
              </span>
              <span className="photo-label">What you're craving</span>
              <span className="photo-hint">A dish, a menu, a takeout photo</span>
            </div>
          )}
        </div>
      ) : (
        <div className="describe-slot">
          <textarea
            className="describe-textarea"
            placeholder="e.g. 'a really rich, spicy ramen' or 'my mom's lasagna'"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={4}
          />
          {speechSupported && (
            <button
              type="button"
              className={`mic-button ${listening ? "listening" : ""}`}
              onClick={startListening}
              title="Speak your craving"
            >
              <IconMic width={15} height={15} />
              {listening ? "Listening…" : "Speak it"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
