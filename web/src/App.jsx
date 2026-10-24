import { useState } from "react";
import PhotoSlot from "./PhotoSlot";
import ResultCard from "./ResultCard";
import HistoryStrip from "./HistoryStrip";
import { fuse, extractOnly } from "./api";
import { isWebGPUSupported, generateFusionRecipeLocally, LOCAL_MODEL_ID } from "./webllmClient";
import "./App.css";

export default function App() {
  const [fridgeFile, setFridgeFile] = useState(null);
  const [cravingFile, setCravingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [localMode, setLocalMode] = useState(false);
  const [localProgress, setLocalProgress] = useState(null);
  const webgpuSupported = isWebGPUSupported();

  async function handleFuseCloud() {
    const data = await fuse(fridgeFile, cravingFile);
    setResult(data);
    setHistory((h) => [data, ...h].slice(0, 6));
  }

  async function handleFuseLocal() {
    const extracted = await extractOnly(fridgeFile, cravingFile);
    setLocalProgress({ text: "Booting Gemma 4 (first run downloads the model, then it's cached)...", progress: 0 });

    const recipe = await generateFusionRecipeLocally({
      extraction: extracted.extraction,
      flavorProfile: extracted.flavorProfile,
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
    if (!fridgeFile || !cravingFile) return;
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧊 + 🍽️ FusionPlate</h1>
        <p className="subtitle">
          Photo of your fridge. Photo of what you're craving. One AI-invented fusion recipe.
        </p>
      </header>

      <main className="fuse-panel">
        <div className="slots-row">
          <PhotoSlot
            label="Your fridge / pantry"
            hint="Click or drop a photo"
            emoji="🧊"
            file={fridgeFile}
            onChange={setFridgeFile}
          />
          <div className="plus-sign">+</div>
          <PhotoSlot
            label="What you're craving"
            hint="A dish, a menu, a takeout photo"
            emoji="🍽️"
            file={cravingFile}
            onChange={setCravingFile}
          />
        </div>

        <label className={`local-mode-toggle ${!webgpuSupported ? "disabled" : ""}`} title={webgpuSupported ? "" : "WebGPU isn't available in this browser"}>
          <input
            type="checkbox"
            checked={localMode}
            disabled={!webgpuSupported}
            onChange={(e) => setLocalMode(e.target.checked)}
          />
          Run Gemma 4 locally in your browser (WebGPU, open-source, no API key)
          {!webgpuSupported && <span className="toggle-hint"> — not supported in this browser</span>}
          {webgpuSupported && (
            <span className="toggle-hint"> — first use downloads ~3GB (several minutes); cached after that</span>
          )}
        </label>

        <button
          className="fuse-button"
          disabled={!fridgeFile || !cravingFile || loading}
          onClick={handleFuse}
        >
          {loading ? "Fusing..." : "⚡ Fuse It!"}
        </button>

        {error && <p className="error-banner">{error}</p>}

        {loading && (
          <div className="fusing-animation" aria-live="polite">
            <span className="orb orb-a" />
            <span className="orb orb-b" />
            <span className="fusing-text">
              {localMode && webgpuSupported
                ? localProgress?.text || "Reading your photos..."
                : "Gemini is reading your photos, Gemma is inventing the recipe..."}
            </span>
          </div>
        )}
      </main>

      <ResultCard result={result} />

      <HistoryStrip items={history} onSelect={setResult} />

      <footer className="app-footer">
        Built for Hacktoberfest Southampton · Theme: Fusion · Track: Best Gemma 4 Project
      </footer>
    </div>
  );
}
