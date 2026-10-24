// Thin localStorage wrapper — every call is try/caught since storage access can throw
// (private browsing, disabled site data, etc.) and the app should degrade, not crash.
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — this device just won't persist between sessions
  }
}

const KEYS = {
  pantry: "fusionplate.pantry",
  shoppingList: "fusionplate.shoppingList",
  preferences: "fusionplate.preferences",
  saved: "fusionplate.saved"
};

export function getPantry() {
  return read(KEYS.pantry, []);
}

export function setPantry(items) {
  write(KEYS.pantry, items);
}

export function getShoppingList() {
  return read(KEYS.shoppingList, []);
}

export function setShoppingList(items) {
  write(KEYS.shoppingList, items);
}

// Merges new items in without duplicating ones already on the list (case-insensitive).
export function addToShoppingList(newItems) {
  const current = getShoppingList();
  const existing = new Set(current.map((i) => i.item.toLowerCase()));
  const additions = (newItems || [])
    .filter((item) => !existing.has(String(item).toLowerCase()))
    .map((item) => ({ item, checked: false }));
  const next = [...current, ...additions];
  setShoppingList(next);
  return next;
}

const DEFAULT_PREFERENCES = { dietary: [], servings: 2 };

export function getPreferences() {
  return { ...DEFAULT_PREFERENCES, ...read(KEYS.preferences, {}) };
}

export function setPreferences(prefs) {
  write(KEYS.preferences, prefs);
}

// A persistent "cookbook" — unlike the in-session history strip, these survive a refresh.
export function getSavedRecipes() {
  return read(KEYS.saved, []);
}

export function isRecipeSaved(title) {
  return getSavedRecipes().some((r) => r.recipe.title === title);
}

export function saveRecipe(result) {
  const current = getSavedRecipes();
  if (current.some((r) => r.recipe.title === result.recipe.title)) return current;
  const next = [{ ...result, savedAt: Date.now() }, ...current].slice(0, 30);
  write(KEYS.saved, next);
  return next;
}

export function removeSavedRecipe(title) {
  const next = getSavedRecipes().filter((r) => r.recipe.title !== title);
  write(KEYS.saved, next);
  return next;
}
