import { useState } from "react";
import { getPreferences, setPreferences } from "./storage";

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free", "Halal", "Kosher", "Low-carb"];

export default function PreferencesTab() {
  const [prefs, setPrefs] = useState(() => getPreferences());

  function persist(next) {
    setPrefs(next);
    setPreferences(next);
  }

  function toggleDietary(option) {
    const dietary = prefs.dietary.includes(option)
      ? prefs.dietary.filter((d) => d !== option)
      : [...prefs.dietary, option];
    persist({ ...prefs, dietary });
  }

  function setServings(n) {
    persist({ ...prefs, servings: Math.max(1, Math.min(8, n)) });
  }

  return (
    <div className="panel-card tab-panel">
      <div className="tab-intro">
        <h2>Preferences</h2>
        <p>These shape every fusion the model writes — it's told to treat them as hard requirements, not suggestions.</p>
      </div>

      <div className="pref-section">
        <h3>Dietary needs</h3>
        <div className="pref-chip-grid">
          {DIETARY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip chip-toggle ${prefs.dietary.includes(option) ? "selected" : ""}`}
              onClick={() => toggleDietary(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="pref-section">
        <h3>Household size</h3>
        <div className="servings-stepper">
          <button type="button" onClick={() => setServings(prefs.servings - 1)}>–</button>
          <span>{prefs.servings} {prefs.servings === 1 ? "serving" : "servings"}</span>
          <button type="button" onClick={() => setServings(prefs.servings + 1)}>+</button>
        </div>
      </div>
    </div>
  );
}
