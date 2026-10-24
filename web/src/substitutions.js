// Mirrors the matching/scoring logic in server/flavorScience.js's suggestSubstitutions, so
// the "try X instead" hint works identically whether the recipe came from the cloud pipeline,
// demo mode, or the local WebGPU path (none of which guarantee a server round-trip for this).
const CLUSTERS = ["umami", "acidic", "spice", "creamy", "fermented", "herbaceous", "smoky", "sweet"];

const INGREDIENT_CLUSTERS = {
  "soy sauce": { umami: 2, fermented: 2 },
  miso: { umami: 2, fermented: 2 },
  "fish sauce": { umami: 2, fermented: 2 },
  "oyster sauce": { umami: 2 },
  parmesan: { umami: 2, creamy: 1 },
  cheddar: { umami: 1, creamy: 2 },
  cheese: { umami: 1, creamy: 2 },
  feta: { creamy: 1, acidic: 1 },
  mushroom: { umami: 2 },
  tomato: { umami: 1, acidic: 2, sweet: 1 },
  anchovy: { umami: 2, fermented: 1 },
  "cured meat": { umami: 2, smoky: 1 },
  bacon: { umami: 1, smoky: 2 },
  ham: { umami: 1, smoky: 1 },
  seaweed: { umami: 2 },
  nori: { umami: 2 },
  broth: { umami: 2 },
  stock: { umami: 2 },
  lime: { acidic: 3 },
  lemon: { acidic: 3 },
  vinegar: { acidic: 3 },
  yogurt: { acidic: 1, creamy: 2, fermented: 1 },
  tamarind: { acidic: 2, sweet: 1 },
  pickle: { acidic: 2, fermented: 1 },
  kimchi: { acidic: 1, fermented: 3, spice: 1 },
  citrus: { acidic: 3 },
  wine: { acidic: 1 },
  cinnamon: { spice: 2, sweet: 1 },
  cumin: { spice: 2 },
  cardamom: { spice: 2 },
  chili: { spice: 3 },
  "chili flakes": { spice: 3 },
  paprika: { spice: 2 },
  ginger: { spice: 2 },
  clove: { spice: 2 },
  nutmeg: { spice: 2, sweet: 1 },
  curry: { spice: 3 },
  "black pepper": { spice: 1 },
  gochujang: { spice: 2, fermented: 2, umami: 1 },
  cream: { creamy: 3 },
  butter: { creamy: 2 },
  "coconut milk": { creamy: 3, sweet: 1 },
  tahini: { creamy: 2, umami: 1 },
  avocado: { creamy: 2 },
  mayo: { creamy: 2, acidic: 1 },
  egg: { creamy: 1, umami: 1 },
  fermented: { fermented: 2 },
  sauerkraut: { acidic: 2, fermented: 3 },
  "blue cheese": { umami: 2, fermented: 2, creamy: 1 },
  basil: { herbaceous: 3 },
  cilantro: { herbaceous: 3 },
  coriander: { herbaceous: 2 },
  mint: { herbaceous: 3 },
  parsley: { herbaceous: 2 },
  dill: { herbaceous: 2 },
  "spring onion": { herbaceous: 2 },
  scallion: { herbaceous: 2 },
  lettuce: { herbaceous: 1 },
  arugula: { herbaceous: 2 },
  grilled: { smoky: 3 },
  charred: { smoky: 3 },
  "smoked paprika": { smoky: 3, spice: 1 },
  roasted: { smoky: 2 },
  toasted: { smoky: 1 },
  honey: { sweet: 3 },
  "maple syrup": { sweet: 3 },
  sugar: { sweet: 3 },
  caramel: { sweet: 3 },
  fruit: { sweet: 2, acidic: 1 },
  date: { sweet: 2 },
  chocolate: { sweet: 2, umami: 1 },
  "pumpkin puree": { sweet: 2, creamy: 1 },
  chickpea: { umami: 1, creamy: 1 },
  ramen: { umami: 2 }
};

function emptyVector() {
  return Object.fromEntries(CLUSTERS.map((c) => [c, 0]));
}

function addWeighted(vec, weights) {
  for (const [cluster, weight] of Object.entries(weights)) {
    if (vec[cluster] !== undefined) vec[cluster] += weight;
  }
}

function classifyIngredient(raw) {
  const name = String(raw).toLowerCase();
  const vec = emptyVector();
  let matched = false;
  for (const [key, weights] of Object.entries(INGREDIENT_CLUSTERS)) {
    if (name.includes(key)) {
      addWeighted(vec, weights);
      matched = true;
    }
  }
  return { vector: vec, matched };
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (const c of CLUSTERS) {
    dot += a[c] * b[c];
    magA += a[c] * a[c];
    magB += b[c] * b[c];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const MIN_SCORE = 0.6;
const MIN_SHARED_CLUSTERS = 2;

// Two ingredients dominated by a single shared axis (e.g. "ramen" and "soy sauce" both read
// mostly as umami) can score a deceptively high cosine similarity despite being nothing alike
// as ingredients — requiring overlap across at least two axes filters those out.
function sharedClusterCount(a, b) {
  return CLUSTERS.filter((c) => a[c] > 0 && b[c] > 0).length;
}

export function suggestSubstitutions(fridgeIngredients, neededIngredients) {
  const fridgeCandidates = (fridgeIngredients || [])
    .map((item) => ({ item, ...classifyIngredient(item) }))
    .filter((c) => c.matched);

  const result = {};
  for (const needed of neededIngredients || []) {
    const needClass = classifyIngredient(needed);
    if (!needClass.matched || fridgeCandidates.length === 0) continue;
    let best = null;
    let bestScore = 0;
    for (const candidate of fridgeCandidates) {
      if (sharedClusterCount(needClass.vector, candidate.vector) < MIN_SHARED_CLUSTERS) continue;
      const score = cosineSimilarity(needClass.vector, candidate.vector);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    if (best && bestScore >= MIN_SCORE) {
      result[needed] = { item: best.item, score: Math.round(bestScore * 100) };
    }
  }
  return result;
}
