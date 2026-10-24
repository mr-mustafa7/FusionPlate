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

// Both the fridge and craving inputs independently accept a photo OR typed/spoken text —
// fridge-as-text covers a saved Pantry list (no re-photographing every time); craving-as-text
// covers the "describe it" input (including Web Speech API transcripts). Any combination works.
async function extractFusionInputs({ fridgeImage, fridgeText, cravingImage, cravingText }) {
  const genai = client();
  const fridgeSource = fridgeImage
    ? "a photo of the contents of someone's fridge or pantry"
    : "a saved pantry list the user typed in ahead of time (plain comma-separated items)";
  const cravingSource = cravingImage
    ? "a photo of a dish, meal, or cuisine reference the user is craving (could be a plated dish, a menu, a food delivery app screenshot, or similar)"
    : "a short text description the user typed or spoke describing what they're craving";

  const prompt = `You are a vision/reasoning assistant for a cooking app called FusionPlate.
You are given:
1. A "fridge" input: ${fridgeSource}.
2. A "craving" input: ${cravingSource}.

Carefully identify what's actually available in the fridge input. Be specific about ingredients (not "vegetables"
but "red bell pepper, broccoli"); if given as a pantry list, just normalize/clean up the item names. For the
craving input, name the most likely specific dish and its cuisine of origin, plus a few flavor/texture notes that
capture what makes it craveable — if it's a text description, infer the most fitting specific dish rather than
leaving it vague.`;

  const parts = [{ text: prompt }];
  if (fridgeImage) {
    parts.push({ text: "Fridge/pantry photo:" }, { inlineData: { mimeType: fridgeImage.mimeType, data: fridgeImage.data } });
  } else {
    parts.push({ text: `Fridge/pantry, saved list: "${fridgeText}"` });
  }
  if (cravingImage) {
    parts.push({ text: "Craving photo:" }, { inlineData: { mimeType: cravingImage.mimeType, data: cravingImage.data } });
  } else {
    parts.push({ text: `Craving, in the user's own words: "${cravingText}"` });
  }

  const response = await genai.models.generateContent({
    model: VISION_MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: extractionSchema
    }
  });

  return JSON.parse(response.text);
}

export async function extractWithFlavorProfile({ fridgeImage, fridgeText, cravingImage, cravingText }) {
  const extraction = await extractFusionInputs({ fridgeImage, fridgeText, cravingImage, cravingText });
  const flavorProfile = analyzeFlavorFusion(extraction);
  return { extraction, flavorProfile };
}

export const SPOOKY_INSTRUCTION = `Spookify mode is ON: lean into a Halloween theme. Give the dish an eerie/punny
name, write the tagline and funFactOrTwist with a spooky-playful tone (think haunted kitchen, not horror movie),
and if it fits naturally, nudge the plating toward something Halloween-appropriate (dark sauces, "blood" drizzles,
ghost/bat/pumpkin shapes) — but never sacrifice the dish actually sounding edible and good.`;

function dietaryInstruction({ dietary, servings }) {
  const lines = [];
  if (dietary?.length) {
    lines.push(
      `Dietary constraints (hard requirements, not suggestions): ${dietary.join(
        ", "
      )}. Swap or drop any ingredient that violates one of these — never include it and leave it unaddressed.`
    );
  }
  if (servings && servings !== 2) {
    lines.push(`Scale the recipe for ${servings} servings — adjust quantities mentioned in the steps accordingly.`);
  }
  return lines.length ? `\n${lines.join("\n")}\n` : "";
}

async function generateFusionRecipe(extraction, { modelOverride, flavorProfile, spookify, dietary, servings } = {}) {
  const genai = client();
  const modelToUse = modelOverride || GEMMA_MODEL;

  const prompt = `You are a playful, slightly chaotic fusion chef. Using ONLY the structured data below, invent one
original fusion recipe that genuinely combines the fridge ingredients with the craved dish's cuisine/flavor profile.
Prefer using ingredients the user already has; only add 1-3 extra items they'd need to buy, and mark those have:false.
Keep steps short and punchy (4-7 steps). The tone should be fun and a little witty, judges are reading this live.

${flavorProfileToPromptContext(flavorProfile)}
${spookify ? `\n${SPOOKY_INSTRUCTION}\n` : ""}${dietaryInstruction({ dietary, servings })}
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

async function generateDishImage(recipe, { spookify } = {}) {
  const genai = client();
  const prompt = `A single appetizing, well-lit food photograph of this exact dish, overhead or 45-degree angle,
on a simple plate/bowl, no text or watermark: "${recipe.title}" — ${recipe.tagline}. Key ingredients: ${recipe.ingredients
    .map((i) => i.item)
    .join(", ")}. Style notes: ${recipe.platingTip}${
    spookify ? " Lean into a moody, Halloween-appropriate styling — dim warm lighting, a dark backdrop, orange/black accents — while keeping the food itself looking genuinely appetizing." : ""
  }`;

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
export async function runFusionPipeline({ fridgeImage, fridgeText, cravingImage, cravingText, spookify, dietary, servings }) {
  const extraction = await extractFusionInputs({ fridgeImage, fridgeText, cravingImage, cravingText });
  const flavorProfile = analyzeFlavorFusion(extraction);

  let recipe;
  let usedOpenModel = true;
  let modelUsed = GEMMA_MODEL;
  try {
    recipe = await generateFusionRecipe(extraction, { flavorProfile, spookify, dietary, servings });
  } catch (err) {
    console.warn(`[fusion] open model "${GEMMA_MODEL}" failed (${err.message}); falling back to ${VISION_MODEL}`);
    usedOpenModel = false;
    modelUsed = VISION_MODEL;
    recipe = await generateFusionRecipe(extraction, { modelOverride: VISION_MODEL, flavorProfile, spookify, dietary, servings });
  }

  let dishImage = null;
  try {
    dishImage = await generateDishImage(recipe, { spookify });
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
