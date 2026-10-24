// Mirrors server/flavorScience.js's flavorProfileToPromptContext — duplicated here (not
// imported) because the frontend only ever receives an already-computed flavorProfile
// from the backend; it just needs to turn that into prompt text for the local model.
export function flavorProfileToPromptContext(profile) {
  return `Flavor-science analysis (computed, not guessed):
- Fusion affinity score: ${profile.affinityScore}/100 (cosine similarity between the two flavor-cluster profiles)
- Flavor clusters both share: ${profile.sharedClusters.join(", ") || "none strongly shared"}
- Clusters only the fridge brings: ${profile.fridgeUniqueClusters.join(", ") || "none"}
- Clusters only the craving brings: ${profile.cravingUniqueClusters.join(", ") || "none"}
Use this analysis to justify why the fusion works, referencing the shared/unique clusters naturally in the tagline or fun fact where it fits.`;
}
