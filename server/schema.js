// Shared response schemas for structured Gemini/Gemma output (Type values are plain strings;
// @google/genai accepts JSON-schema-ish objects for responseSchema).

export const extractionSchema = {
  type: "object",
  properties: {
    fridgeIngredients: {
      type: "array",
      items: { type: "string" },
      description: "Distinct food items/ingredients visible in the fridge/pantry photo."
    },
    cravingDish: {
      type: "string",
      description: "The specific dish shown or implied in the craving photo, e.g. 'tonkotsu ramen'."
    },
    cravingCuisine: {
      type: "string",
      description: "The cuisine/culinary tradition the craving photo belongs to, e.g. 'Japanese'."
    },
    cravingFlavorNotes: {
      type: "array",
      items: { type: "string" },
      description: "3-5 short flavor/texture descriptors for the craving photo, e.g. 'umami', 'rich broth'."
    }
  },
  required: ["fridgeIngredients", "cravingDish", "cravingCuisine", "cravingFlavorNotes"]
};

export const recipeSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "A fun, punny fusion dish name." },
    tagline: { type: "string", description: "One witty sentence selling the fusion." },
    fusedCuisines: {
      type: "array",
      items: { type: "string" },
      description: "The 2+ culinary traditions/ingredient sets being fused."
    },
    fusionScore: {
      type: "object",
      properties: {
        fridgePercent: { type: "number" },
        cravingPercent: { type: "number" }
      },
      required: ["fridgePercent", "cravingPercent"]
    },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string" },
          have: { type: "boolean", description: "True if it came from the fridge photo, false if it's a suggested addition." }
        },
        required: ["item", "have"]
      }
    },
    steps: {
      type: "array",
      items: { type: "string" },
      description: "4-7 short numbered cooking steps."
    },
    platingTip: { type: "string" },
    funFactOrTwist: { type: "string", description: "One playful closing note about the fusion." }
  },
  required: ["title", "tagline", "fusedCuisines", "fusionScore", "ingredients", "steps", "platingTip", "funFactOrTwist"]
};
