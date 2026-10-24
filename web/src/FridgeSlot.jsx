import { useRef, useState } from "react";
import { IconUpload, IconRefresh } from "./icons";
import { getPantry } from "./storage";

// Mirrors CravingSlot's photo/text duality: a fresh photo, or the pantry list the user
// already maintains in the Pantry tab — so returning users don't have to re-photograph
// their fridge every single time.
export default function FridgeSlot({ index, onChange, onGoToPantry }) {
  const [mode, setMode] = useState("photo");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const pantry = getPantry();

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    onChange(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function switchMode(next) {
    setMode(next);
    if (next === "photo") {
      onChange(file);
    } else {
      onChange(pantry.length ? pantry.join(", ") : null);
    }
  }

  return (
    <div className="photo-slot-wrap">
      <div className="slot-index-row">
        <span className="slot-index">{index}</span>
        <div className="mode-tabs">
          <button type="button" className={mode === "photo" ? "active" : ""} onClick={() => switchMode("photo")}>
            Photo
          </button>
          <button type="button" className={mode === "pantry" ? "active" : ""} onClick={() => switchMode("pantry")}>
            My pantry
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
              <img src={preview} alt="Your fridge" className="photo-preview" />
              <span className="photo-tag">Your fridge / pantry</span>
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
              <span className="photo-label">Your fridge / pantry</span>
              <span className="photo-hint">Click or drop a photo</span>
            </div>
          )}
        </div>
      ) : (
        <div className="pantry-preview-slot">
          {pantry.length ? (
            <div className="pantry-preview-chips">
              {pantry.map((item) => (
                <span key={item} className="chip chip-mini">{item}</span>
              ))}
            </div>
          ) : (
            <p className="pantry-preview-empty">Your saved pantry is empty.</p>
          )}
          <button type="button" className="pantry-edit-link" onClick={onGoToPantry}>
            {pantry.length ? "Edit pantry" : "Add items to your pantry"}
          </button>
        </div>
      )}
    </div>
  );
}
