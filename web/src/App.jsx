import { useState } from "react";
import PhotoSlot from "./PhotoSlot";
import ResultCard from "./ResultCard";
import HistoryStrip from "./HistoryStrip";
import { fuse, extractOnly } from "./api";
import { isWebGPUSupported, generateFusionRecipeLocally, LOCAL_MODEL_ID } from "./webllmClient";
import { IconPlus, IconSpark, IconCpu, IconMark } from "./icons";
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

  const statusText =
    localMode && webgpuSupported
      ? localProgress?.text || "Reading your photos..."
      : "Reading your photos and drafting the fusion...";

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
          Photograph your fridge. Photograph what you're craving. Get one original recipe that fuses both.
        </p>
      </header>

      <main className="fuse-panel">
        <div className="panel-card">
          <div className="slots-row">
            <PhotoSlot
              index="01"
              label="Your fridge / pantry"
              hint="Click or drop a photo"
              file={fridgeFile}
              onChange={setFridgeFile}
            />
            <div className="connector" aria-hidden="true">
              <IconPlus width={15} height={15} />
            </div>
            <PhotoSlot
              index="02"
              label="What you're craving"
              hint="A dish, a menu, a takeout photo"
              file={cravingFile}
              onChange={setCravingFile}
            />
          </div>

          <div className={`settings-row ${!webgpuSupported ? "disabled" : ""}`}>
            <label className="switch-row">
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
          </div>

          <button className="fuse-button" disabled={!fridgeFile || !cravingFile || loading} onClick={handleFuse}>
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

      <footer className="app-footer">Built for Hacktoberfest Southampton — theme: Fusion</footer>
    </div>
  );
}
