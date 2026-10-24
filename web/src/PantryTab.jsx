import { useState } from "react";
import { getPantry, setPantry } from "./storage";
import { IconPlus } from "./icons";

export default function PantryTab() {
  const [items, setItems] = useState(() => getPantry());
  const [draft, setDraft] = useState("");

  function persist(next) {
    setItems(next);
    setPantry(next);
  }

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    persist([...items, value]);
    setDraft("");
  }

  function removeItem(item) {
    persist(items.filter((i) => i !== item));
  }

  return (
    <div className="panel-card tab-panel">
      <div className="tab-intro">
        <h2>Your pantry</h2>
        <p>
          Keep a running list of what you usually have on hand — the Fuse tab can use this instead of a fresh
          fridge photo, so you're not re-photographing every time.
        </p>
      </div>

      <div className="pantry-add-row">
        <input
          type="text"
          className="pantry-input"
          placeholder="Add an ingredient — e.g. soy sauce"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addItem();
          }}
        />
        <button type="button" className="pantry-add-button" onClick={addItem}>
          <IconPlus width={14} height={14} />
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="tab-empty">No saved items yet — add a few things you always have around.</p>
      ) : (
        <div className="pantry-chip-grid">
          {items.map((item) => (
            <button key={item} type="button" className="chip chip-removable" onClick={() => removeItem(item)}>
              {item}
              <span className="chip-remove">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
