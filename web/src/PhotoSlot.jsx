import { useRef, useState } from "react";

export default function PhotoSlot({ label, hint, emoji, file, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f) {
    if (!f) return;
    onChange(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  return (
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
        <img src={preview} alt={label} className="photo-preview" />
      ) : (
        <div className="photo-placeholder">
          <span className="photo-emoji">{emoji}</span>
          <span className="photo-label">{label}</span>
          <span className="photo-hint">{hint}</span>
        </div>
      )}
      {preview && <div className="photo-overlay">Tap to replace</div>}
    </div>
  );
}
