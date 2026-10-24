import { useEffect, useState } from "react";
import FlavorRadar from "./FlavorRadar";
import { suggestSubstitutions } from "./substitutions";
import { addToShoppingList, isRecipeSaved, saveRecipe, removeSavedRecipe } from "./storage";
import { IconCheck, IconPlus, IconDot, IconBookmark } from "./icons";

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
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAdded(false);
    setSaved(result?.recipe?.title ? isRecipeSaved(result.recipe.title) : false);
  }, [result]);

  if (!result) return null;
  const { extraction, recipe, meta, mode, warning, flavorProfile } = result;
  const neededItems = recipe.ingredients.filter((ing) => !ing.have).map((ing) => ing.item);
  const substitutions = suggestSubstitutions(extraction.fridgeIngredients, neededItems);

  function handleAddToShoppingList() {
    addToShoppingList(neededItems);
    setAdded(true);
  }

  function handleToggleSave() {
    if (saved) {
      removeSavedRecipe(recipe.title);
      setSaved(false);
    } else {
      saveRecipe(result);
      setSaved(true);
    }
  }

  return (
    <article className="result-card">
      <div className="result-header-row">
        <div className="result-badges">
          <span className={`badge badge-${MODE_TONE[mode] || "neutral"}`}>
            <IconDot />
            {MODE_LABEL[mode] || mode}
          </span>
          {meta?.usedOpenModel && <span className="badge badge-outline">open-weight · {meta.generationModel}</span>}
        </div>
        <button
          type="button"
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={handleToggleSave}
          title={saved ? "Remove from saved" : "Save this recipe"}
        >
          <IconBookmark width={16} height={16} fill={saved ? "currentColor" : "none"} />
        </button>
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
            <div className="ingredients-heading-row">
              <h3>Ingredients</h3>
              {neededItems.length > 0 && (
                <button type="button" className="add-to-list-button" onClick={handleAddToShoppingList}>
                  {added ? "Added ✓" : "+ Shopping list"}
                </button>
              )}
            </div>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => {
                const sub = !ing.have && substitutions[ing.item];
                return (
                  <li key={i} className={ing.have ? "have" : "need"}>
                    <span className="ingredient-icon">{ing.have ? <IconCheck width={13} height={13} /> : <IconPlus width={12} height={12} />}</span>
                    <span>
                      {ing.item}
                      {sub && <span className="sub-hint"> — try {sub.item}, you have it</span>}
                    </span>
                  </li>
                );
              })}
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
