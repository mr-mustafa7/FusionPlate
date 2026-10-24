import { GoogleGenAI } from "@google/genai";
import { extractionSchema, recipeSchema } from "./schema.js";
import { analyzeFlavorFusion, flavorProfileToPromptContext } from "./flavorScience.js";

const VISION_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash";
// Open-weight model, called through the same Gemini API key — this is the
// "experiment with an open model while using the Gemini API" half of the challenge.
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-3-27b-it";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

let ai = null;
function client() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}

export function hasApiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function extractFromPhotos({ fridgeImage, cravingImage }) {
  const genai = client();
  const prompt = `You are a vision assistant for a cooking app called FusionPlate.
You are given two photos:
1. "fridge" photo: the contents of someone's fridge or pantry.
2. "craving" photo: a dish, meal, or cuisine reference the user is craving (could be a plated dish, a menu, a food delivery app screenshot, or similar).

Carefully identify what is actually visible. Be specific about ingredients (not "vegetables" but "red bell pepper, broccoli"). For the craving photo, name the most likely specific dish and its cuisine of origin, plus a few flavor/texture notes that capture what makes it craveable.`;

  const response = await genai.models.generateContent({
    model: VISION_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { text: "Fridge/pantry photo:" },
          { inlineData: { mimeType: fridgeImage.mimeType, data: fridgeImage.data } },
          { text: "Craving photo:" },
          { inlineData: { mimeType: cravingImage.mimeType, data: cravingImage.data } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: extractionSchema
    }
  });

  return JSON.parse(response.text);
}

export async function extractWithFlavorProfile({ fridgeImage, cravingImage }) {
  const extraction = await extractFromPhotos({ fridgeImage, cravingImage });
  const flavorProfile = analyzeFlavorFusion(extraction);
  return { extraction, flavorProfile };
}

async function generateFusionRecipe(extraction, { modelOverride, flavorProfile } = {}) {
  const genai = client();
  const modelToUse = modelOverride || GEMMA_MODEL;

  const prompt = `You are a playful, slightly chaotic fusion chef. Using ONLY the structured data below, invent one
original fusion recipe that genuinely combines the fridge ingredients with the craved dish's cuisine/flavor profile.
Prefer using ingredients the user already has; only add 1-3 extra items they'd need to buy, and mark those have:false.
Keep steps short and punchy (4-7 steps). The tone should be fun and a little witty, judges are reading this live.

${flavorProfileToPromptContext(flavorProfile)}

Structured input:
${JSON.stringify(extraction, null, 2)}`;

  const response = await genai.models.generateContent({
    model: modelToUse,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema
    }
  });

  return JSON.parse(response.text);
}

async function generateDishImage(recipe) {
  const genai = client();
  const prompt = `A single appetizing, well-lit food photograph of this exact dish, overhead or 45-degree angle,
on a simple plate/bowl, no text or watermark: "${recipe.title}" — ${recipe.tagline}. Key ingredients: ${recipe.ingredients
    .map((i) => i.item)
    .join(", ")}. Style notes: ${recipe.platingTip}`;

  const response = await genai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) throw new Error("no image returned");
  return { mimeType: imagePart.inlineData.mimeType, data: imagePart.inlineData.data };
}

/**
 * Full pipeline: multimodal extraction (Gemini) -> creative generation (Gemma, with
 * automatic fallback to the vision model if the open-weight model id isn't available
 * on this API key/tier) -> best-effort dish image generation, so a live demo never
 * hard-fails on a model-availability quirk.
 */
export async function runFusionPipeline({ fridgeImage, cravingImage }) {
  const extraction = await extractFromPhotos({ fridgeImage, cravingImage });
  const flavorProfile = analyzeFlavorFusion(extraction);

  let recipe;
  let usedOpenModel = true;
  let modelUsed = GEMMA_MODEL;
  try {
    recipe = await generateFusionRecipe(extraction, { flavorProfile });
  } catch (err) {
    console.warn(`[fusion] open model "${GEMMA_MODEL}" failed (${err.message}); falling back to ${VISION_MODEL}`);
    usedOpenModel = false;
    modelUsed = VISION_MODEL;
    recipe = await generateFusionRecipe(extraction, { modelOverride: VISION_MODEL, flavorProfile });
  }

  let dishImage = null;
  try {
    dishImage = await generateDishImage(recipe);
  } catch (err) {
    console.warn(`[fusion] image generation skipped (${err.message})`);
  }

  return {
    mode: "live",
    extraction,
    recipe,
    dishImage,
    flavorProfile,
    meta: {
      visionModel: VISION_MODEL,
      generationModel: modelUsed,
      usedOpenModel,
      imageModel: dishImage ? IMAGE_MODEL : null
    }
  };
}
