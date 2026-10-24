import { useState } from "react";
import { getShoppingList, setShoppingList } from "./storage";
import { IconCheck, IconPlus } from "./icons";

export default function ShoppingListTab() {
  const [items, setItems] = useState(() => getShoppingList());
  const [draft, setDraft] = useState("");

  function persist(next) {
    setItems(next);
    setShoppingList(next);
  }

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    persist([...items, { item: value, checked: false }]);
    setDraft("");
  }

  function toggleItem(idx) {
    persist(items.map((it, i) => (i === idx ? { ...it, checked: !it.checked } : it)));
  }

  function removeItem(idx) {
    persist(items.filter((_, i) => i !== idx));
  }

  function clearChecked() {
    persist(items.filter((it) => !it.checked));
  }

  const checkedCount = items.filter((it) => it.checked).length;

  return (
    <div className="panel-card tab-panel">
      <div className="tab-intro">
        <h2>Shopping list</h2>
        <p>Missing ingredients from a fusion land here automatically — check them off as you shop.</p>
      </div>

      <div className="pantry-add-row">
        <input
          type="text"
          className="pantry-input"
          placeholder="Add something manually"
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
        <p className="tab-empty">Nothing on your list — fuse something and missing ingredients will show up here.</p>
      ) : (
        <>
          <ul className="shopping-list">
            {items.map((it, i) => (
              <li key={i} className={it.checked ? "checked" : ""}>
                <button type="button" className="shopping-check" onClick={() => toggleItem(i)}>
                  {it.checked && <IconCheck width={12} height={12} />}
                </button>
                <span onClick={() => toggleItem(i)}>{it.item}</span>
                <button type="button" className="shopping-remove" onClick={() => removeItem(i)}>×</button>
              </li>
            ))}
          </ul>
          {checkedCount > 0 && (
            <button type="button" className="clear-checked-button" onClick={clearChecked}>
              Clear {checkedCount} checked
            </button>
          )}
        </>
      )}
    </div>
  );
}
