import FlavorRadar from "./FlavorRadar";

export default function ResultCard({ result }) {
  if (!result) return null;
  const { extraction, recipe, meta, mode, warning, flavorProfile } = result;

  return (
    <div className="result-card">
      <div className="result-badges">
        <span className={`badge badge-mode-${mode === "hybrid-local" ? "live" : mode}`}>
          {mode === "live"
            ? "Live Gemini + Gemma"
            : mode === "hybrid-local"
            ? "Gemma 4 running locally (WebGPU)"
            : mode === "demo-fallback"
            ? "Fallback demo data"
            : "Demo mode"}
        </span>
        {meta?.usedOpenModel && <span className="badge badge-open">open-weight model: {meta.generationModel}</span>}
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

      <div className="fusion-score">
        <div className="fusion-score-bar">
          <div className="fusion-score-fridge" style={{ width: `${recipe.fusionScore.fridgePercent}%` }} />
          <div className="fusion-score-craving" style={{ width: `${recipe.fusionScore.cravingPercent}%` }} />
        </div>
        <div className="fusion-score-labels">
          <span>🧊 Fridge {recipe.fusionScore.fridgePercent}%</span>
          <span>🍽️ Craving {recipe.fusionScore.cravingPercent}%</span>
        </div>
      </div>

      <div className="fused-cuisines">
        {recipe.fusedCuisines.map((c) => (
          <span key={c} className="cuisine-chip">{c}</span>
        ))}
      </div>

      <FlavorRadar profile={flavorProfile} />

      <div className="result-grid">
        <div>
          <h3>Ingredients</h3>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className={ing.have ? "have" : "need"}>
                {ing.have ? "✓" : "+"} {ing.item}
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

      <p className="plating-tip"><strong>Plating:</strong> {recipe.platingTip}</p>
      <p className="fun-fact">{recipe.funFactOrTwist}</p>

      <details className="extraction-details">
        <summary>What the AI actually saw in your photos</summary>
        <p><strong>Fridge:</strong> {extraction.fridgeIngredients.join(", ")}</p>
        <p><strong>Craving:</strong> {extraction.cravingDish} ({extraction.cravingCuisine}) — {extraction.cravingFlavorNotes.join(", ")}</p>
      </details>
    </div>
  );
}
