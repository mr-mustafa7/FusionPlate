// A small hand-built ingredient -> flavor-cluster model, used to ground the LLM's
// "fusion score" in something computed rather than purely vibes-based. Not scraped from
// any dataset — a curated taxonomy of 8 broad flavor/texture clusters used in professional
// flavor-pairing practice (umami, acid, spice, fat/creaminess, ferment, herb, char, sugar).

export const CLUSTERS = [
  "umami",
  "acidic",
  "spice",
  "creamy",
  "fermented",
  "herbaceous",
  "smoky",
  "sweet"
];

// ingredient keyword (lowercase, matched as substring) -> { cluster: weight }
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

  "fermented": { fermented: 2 },
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
  "chickpea": { umami: 1, creamy: 1 },
  ramen: { umami: 2 }
};

// cuisine keyword (lowercase, substring-matched against the extracted cuisine string) -> cluster bias
const CUISINE_BIAS = {
  japanese: { umami: 3, fermented: 2, acidic: 1 },
  korean: { fermented: 3, spice: 2, umami: 1 },
  chinese: { umami: 2, fermented: 1, spice: 1 },
  thai: { spice: 2, acidic: 2, herbaceous: 2, sweet: 1 },
  vietnamese: { herbaceous: 2, acidic: 2, umami: 1 },
  italian: { umami: 2, herbaceous: 2, creamy: 1 },
  french: { creamy: 2, umami: 1, herbaceous: 1 },
  mexican: { smoky: 2, acidic: 2, spice: 2 },
  indian: { spice: 3, creamy: 2, umami: 1 },
  "middle eastern": { spice: 2, herbaceous: 1, acidic: 1, creamy: 1 },
  mediterranean: { herbaceous: 2, acidic: 1, umami: 1, creamy: 1 },
  american: { smoky: 2, sweet: 1, creamy: 1 },
  "american cafe": { sweet: 2, spice: 1, creamy: 2 },
  cafe: { sweet: 2, creamy: 1 }
};

const FLAVOR_KEYWORD_MAP = {
  umami: "umami",
  savory: "umami",
  rich: "creamy",
  creamy: "creamy",
  tangy: "acidic",
  acidic: "acidic",
  sour: "acidic",
  zesty: "acidic",
  spicy: "spice",
  "warm spice": "spice",
  peppery: "spice",
  sweet: "sweet",
  caramelized: "sweet",
  smoky: "smoky",
  charred: "smoky",
  fermented: "fermented",
  funky: "fermented",
  funk: "fermented",
  fresh: "herbaceous",
  herby: "herbaceous",
  herbal: "herbaceous"
};

function emptyVector() {
  return Object.fromEntries(CLUSTERS.map((c) => [c, 0]));
}

function normalize(vec) {
  const total = CLUSTERS.reduce((sum, c) => sum + vec[c], 0);
  if (total <= 0) return emptyVector();
  return Object.fromEntries(CLUSTERS.map((c) => [c, vec[c] / total]));
}

function addWeighted(vec, weights, scale = 1) {
  for (const [cluster, weight] of Object.entries(weights)) {
    if (vec[cluster] !== undefined) vec[cluster] += weight * scale;
  }
}

function vectorFromIngredients(ingredients) {
  const vec = emptyVector();
  for (const raw of ingredients) {
    const name = String(raw).toLowerCase();
    let matched = false;
    for (const [key, weights] of Object.entries(INGREDIENT_CLUSTERS)) {
      if (name.includes(key)) {
        addWeighted(vec, weights);
        matched = true;
      }
    }
    if (!matched) {
      // Unknown ingredient: spread a small flat weight so it doesn't vanish from the model entirely.
      addWeighted(vec, Object.fromEntries(CLUSTERS.map((c) => [c, 1])), 0.15);
    }
  }
  return normalize(vec);
}

function vectorFromCraving({ cravingCuisine, cravingFlavorNotes }) {
  const vec = emptyVector();
  const cuisineKey = String(cravingCuisine || "").toLowerCase();
  for (const [key, weights] of Object.entries(CUISINE_BIAS)) {
    if (cuisineKey.includes(key)) addWeighted(vec, weights);
  }
  for (const note of cravingFlavorNotes || []) {
    const noteKey = String(note).toLowerCase();
    for (const [keyword, cluster] of Object.entries(FLAVOR_KEYWORD_MAP)) {
      if (noteKey.includes(keyword)) addWeighted(vec, { [cluster]: 2 });
    }
  }
  const total = CLUSTERS.reduce((sum, c) => sum + vec[c], 0);
  if (total === 0) return Object.fromEntries(CLUSTERS.map((c) => [c, 1 / CLUSTERS.length]));
  return normalize(vec);
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

function topClusters(vec, n = 2) {
  return [...CLUSTERS].sort((a, b) => vec[b] - vec[a]).slice(0, n);
}

/**
 * Computes a deterministic flavor-compatibility profile between the fridge ingredients
 * and the craving's cuisine/flavor-note signal. This is independent of any LLM call —
 * it's a small symbolic model that *grounds* the generative step rather than replacing it.
 */
export function analyzeFlavorFusion(extraction) {
  const fridgeVector = vectorFromIngredients(extraction.fridgeIngredients || []);
  const cravingVector = vectorFromCraving(extraction);
  const similarity = cosineSimilarity(fridgeVector, cravingVector);

  const fridgeTop = topClusters(fridgeVector, 3);
  const cravingTop = topClusters(cravingVector, 3);
  const sharedClusters = fridgeTop.filter((c) => cravingTop.includes(c));
  const fridgeUniqueClusters = fridgeTop.filter((c) => !cravingTop.includes(c));
  const cravingUniqueClusters = cravingTop.filter((c) => !fridgeTop.includes(c));

  return {
    clusters: CLUSTERS,
    fridgeVector,
    cravingVector,
    affinityScore: Math.round(similarity * 100),
    sharedClusters,
    fridgeUniqueClusters,
    cravingUniqueClusters
  };
}

export function flavorProfileToPromptContext(profile) {
  return `Flavor-science analysis (computed, not guessed):
- Fusion affinity score: ${profile.affinityScore}/100 (cosine similarity between the two flavor-cluster profiles)
- Flavor clusters both share: ${profile.sharedClusters.join(", ") || "none strongly shared"}
- Clusters only the fridge brings: ${profile.fridgeUniqueClusters.join(", ") || "none"}
- Clusters only the craving brings: ${profile.cravingUniqueClusters.join(", ") || "none"}
Use this analysis to justify why the fusion works, referencing the shared/unique clusters naturally in the tagline or fun fact where it fits.`;
}
