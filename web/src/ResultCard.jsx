import FlavorRadar from "./FlavorRadar";
import { IconCheck, IconPlus, IconDot } from "./icons";

const MODE_LABEL = {
  live: "Live — Gemini + Gemma",
  "hybrid-local": "Gemma 4 running locally (WebGPU)",
  demo: "Demo data",
  "demo-fallback": "Fallback demo data"
};

const MODE_TONE = {
  live: "ok",
  "hybrid-local": "ok",
  demo: "neutral",
  "demo-fallback": "warn"
};

export default function ResultCard({ result }) {
  if (!result) return null;
  const { extraction, recipe, meta, mode, warning, flavorProfile } = result;

  return (
    <article className="result-card">
      <div className="result-badges">
        <span className={`badge badge-${MODE_TONE[mode] || "neutral"}`}>
          <IconDot />
          {MODE_LABEL[mode] || mode}
        </span>
        {meta?.usedOpenModel && <span className="badge badge-outline">open-weight · {meta.generationModel}</span>}
      </div>
      {warning && <p className="result-warning">{warning}</p>}

      <h2 className="result-title">{recipe.title}</h2>
      <p className="result-tagline">{recipe.tagline}</p>

      {result.dishImage && (
        <img
          className="dish-image"
          src={`data:${result.dishImage.mimeType};base64,${result.dishImage.data}`}
          alt={recipe.title}
        />
      )}

      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-value">{recipe.fusionScore.fridgePercent}%</span>
          <span className="stat-label">Fridge</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{recipe.fusionScore.cravingPercent}%</span>
          <span className="stat-label">Craving</span>
        </div>
        <div className="stat-tile stat-tile-brand">
          <span className="stat-value">{flavorProfile.affinityScore}</span>
          <span className="stat-label">Fusion score</span>
        </div>
      </div>

      <div className="fused-cuisines">
        {recipe.fusedCuisines.map((c) => (
          <span key={c} className="chip">{c}</span>
        ))}
      </div>

      <FlavorRadar profile={flavorProfile} />

      <div className="section-card">
        <div className="result-grid">
          <div>
            <h3>Ingredients</h3>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className={ing.have ? "have" : "need"}>
                  <span className="ingredient-icon">{ing.have ? <IconCheck width={13} height={13} /> : <IconPlus width={12} height={12} />}</span>
                  {ing.item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Steps</h3>
            <ol className="steps-list">
              {recipe.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>

        <p className="plating-tip"><strong>Plating —</strong> {recipe.platingTip}</p>

        <blockquote className="fun-fact">{recipe.funFactOrTwist}</blockquote>
      </div>

      <details className="extraction-details">
        <summary>What the AI actually saw in your photos</summary>
        <p><strong>Fridge:</strong> {extraction.fridgeIngredients.join(", ")}</p>
        <p><strong>Craving:</strong> {extraction.cravingDish} ({extraction.cravingCuisine}) — {extraction.cravingFlavorNotes.join(", ")}</p>
      </details>
    </article>
  );
}
