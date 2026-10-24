import { useState } from "react";
import { getSavedRecipes, removeSavedRecipe } from "./storage";

export default function SavedTab({ onView }) {
  const [items, setItems] = useState(() => getSavedRecipes());

  function handleRemove(title) {
    setItems(removeSavedRecipe(title));
  }

  return (
    <div className="panel-card tab-panel">
      <div className="tab-intro">
        <h2>Saved recipes</h2>
        <p>Your permanent cookbook — these stick around even after you refresh.</p>
      </div>

      {items.length === 0 ? (
        <p className="tab-empty">Nothing saved yet — tap the bookmark on a fusion you like.</p>
      ) : (
        <div className="saved-list">
          {items.map((item) => (
            <div key={item.recipe.title} className="saved-card">
              <div className="saved-card-body" onClick={() => onView(item)} role="button" tabIndex={0}>
                <h3>{item.recipe.title}</h3>
                <p>{item.recipe.tagline}</p>
                <div className="saved-card-chips">
                  {item.recipe.fusedCuisines.map((c) => (
                    <span key={c} className="chip chip-mini">{c}</span>
                  ))}
                </div>
              </div>
              <button type="button" className="saved-remove" onClick={() => handleRemove(item.recipe.title)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
