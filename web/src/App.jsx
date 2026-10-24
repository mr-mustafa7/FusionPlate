import { useState } from "react";
import FridgeSlot from "./FridgeSlot";
import CravingSlot from "./CravingSlot";
import ResultCard from "./ResultCard";
import HistoryStrip from "./HistoryStrip";
import PantryTab from "./PantryTab";
import ShoppingListTab from "./ShoppingListTab";
import PreferencesTab from "./PreferencesTab";
import SavedTab from "./SavedTab";
import { fuse, extractOnly } from "./api";
import { isWebGPUSupported, generateFusionRecipeLocally, LOCAL_MODEL_ID } from "./webllmClient";
import { getPreferences } from "./storage";
import { IconPlus, IconSpark, IconCpu, IconGhost, IconMark } from "./icons";
import "./App.css";

const TABS = [
  { id: "fuse", label: "Fuse" },
  { id: "pantry", label: "Pantry" },
  { id: "shopping", label: "Shopping list" },
  { id: "saved", label: "Saved" },
  { id: "preferences", label: "Preferences" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("fuse");
  const [fridge, setFridge] = useState(null); // File (photo) or string (saved pantry)
  const [craving, setCraving] = useState(null); // File (photo) or string (description)
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [localMode, setLocalMode] = useState(false);
  const [spookify, setSpookify] = useState(false);
  const [localProgress, setLocalProgress] = useState(null);
  const webgpuSupported = isWebGPUSupported();

  async function handleFuseCloud() {
    const { dietary, servings } = getPreferences();
    const data = await fuse(fridge, craving, { spookify, dietary, servings });
    setResult(data);
    setHistory((h) => [data, ...h].slice(0, 6));
  }

  async function handleFuseLocal() {
    const { dietary, servings } = getPreferences();
    const extracted = await extractOnly(fridge, craving);
    setLocalProgress({ text: "Booting Gemma 4 (first run downloads the model, then it's cached)...", progress: 0 });

    const recipe = await generateFusionRecipeLocally({
      extraction: extracted.extraction,
      flavorProfile: extracted.flavorProfile,
      spookify,
      dietary,
      servings,
      onProgress: (report) => setLocalProgress(report)
    });

    const data = {
      mode: "hybrid-local",
      extraction: extracted.extraction,
      flavorProfile: extracted.flavorProfile,
      recipe,
      dishImage: null,
      meta: {
        visionModel: extracted.mode === "live" ? "gemini-2.5-flash" : "demo",
        generationModel: LOCAL_MODEL_ID,
        usedOpenModel: true
      }
    };
    setResult(data);
    setHistory((h) => [data, ...h].slice(0, 6));
  }

  async function handleFuse() {
    if (!fridge || !craving) return;
    setLoading(true);
    setError(null);
    setLocalProgress(null);
    try {
      if (localMode && webgpuSupported) {
        await handleFuseLocal();
      } else {
        await handleFuseCloud();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLocalProgress(null);
    }
  }

  const statusText =
    localMode && webgpuSupported
      ? localProgress?.text || "Reading your fridge..."
      : "Reading your fridge and drafting the fusion...";

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-row">
          <span className="brand-mark">
            <IconMark />
          </span>
          <span className="brand-name">FusionPlate</span>
        </div>
        <p className="subtitle">
          Photograph your fridge. Show or describe what you're craving. Get one original recipe that fuses both.
        </p>
      </header>

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "pantry" && <PantryTab />}
      {activeTab === "shopping" && <ShoppingListTab />}
      {activeTab === "saved" && (
        <SavedTab
          onView={(item) => {
            setResult(item);
            setActiveTab("fuse");
          }}
        />
      )}
      {activeTab === "preferences" && <PreferencesTab />}

      {activeTab === "fuse" && (
        <>
          <main className="fuse-panel">
            <div className="panel-card">
              <div className="slots-row">
                <FridgeSlot index="01" onChange={setFridge} onGoToPantry={() => setActiveTab("pantry")} />
                <div className="connector" aria-hidden="true">
                  <IconPlus width={15} height={15} />
                </div>
                <CravingSlot index="02" onChange={setCraving} />
              </div>

              <div className="settings-row">
                <label className={`switch-row ${!webgpuSupported ? "disabled" : ""}`}>
                  <span className="switch-icon">
                    <IconCpu width={16} height={16} />
                  </span>
                  <span className="switch-copy">
                    <span className="switch-label">Run Gemma 4 locally</span>
                    <span className="switch-hint">
                      {webgpuSupported
                        ? "In-browser via WebGPU, open-source, no API key — first run downloads ~3GB"
                        : "Needs a WebGPU-capable browser"}
                    </span>
                  </span>
                  <span className="switch-control">
                    <input
                      type="checkbox"
                      checked={localMode}
                      disabled={!webgpuSupported}
                      onChange={(e) => setLocalMode(e.target.checked)}
                    />
                    <span className="switch-track" />
                  </span>
                </label>

                <div className="settings-divider" />

                <label className="switch-row">
                  <span className="switch-icon switch-icon-spooky">
                    <IconGhost width={16} height={16} />
                  </span>
                  <span className="switch-copy">
                    <span className="switch-label">Spookify this fusion</span>
                    <span className="switch-hint">Nudges the recipe toward a Halloween theme</span>
                  </span>
                  <span className="switch-control">
                    <input type="checkbox" checked={spookify} onChange={(e) => setSpookify(e.target.checked)} />
                    <span className="switch-track" />
                  </span>
                </label>
              </div>

              <button className="fuse-button" disabled={!fridge || !craving || loading} onClick={handleFuse}>
                <IconSpark width={17} height={17} />
                {loading ? "Fusing" : "Fuse it"}
              </button>

              {error && <p className="error-banner">{error}</p>}

              {loading && (
                <div className="fusing-status" aria-live="polite">
                  <div className="progress-track">
                    <div className="progress-fill" />
                  </div>
                  <p className="fusing-text">{statusText}</p>
                </div>
              )}
            </div>
          </main>

          <ResultCard result={result} />

          <HistoryStrip items={history} onSelect={setResult} />
        </>
      )}

      <footer className="app-footer">Built for Hacktoberfest Southampton — theme: Fusion</footer>
    </div>
  );
}
