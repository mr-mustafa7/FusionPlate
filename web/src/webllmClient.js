// Runs Gemma 4 entirely in-browser via WebGPU using the open-source mlc-ai/web-llm
// runtime — no API key, no server round-trip for this step. This model build is
// text-only, so it still relies on a prior cloud vision call (see /api/extract) to
// read the two photos; this module only handles the creative generation step locally.
import * as webllm from "@mlc-ai/web-llm";
import { flavorProfileToPromptContext } from "./flavorPromptContext";

export const LOCAL_MODEL_ID = "gemma-4-E2B-it-q4f16_1-MLC";

const RECIPE_JSON_SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    title: { type: "string" },
    tagline: { type: "string" },
    fusedCuisines: { type: "array", items: { type: "string" } },
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
        properties: { item: { type: "string" }, have: { type: "boolean" } },
        required: ["item", "have"]
      }
    },
    steps: { type: "array", items: { type: "string" } },
    platingTip: { type: "string" },
    funFactOrTwist: { type: "string" }
  },
  required: ["title", "tagline", "fusedCuisines", "fusionScore", "ingredients", "steps", "platingTip", "funFactOrTwist"]
});

let enginePromise = null;

export function isWebGPUSupported() {
  return typeof navigator !== "undefined" && Boolean(navigator.gpu);
}

export function loadLocalEngine(onProgress) {
  if (!enginePromise) {
    enginePromise = webllm.CreateMLCEngine(LOCAL_MODEL_ID, {
      initProgressCallback: (report) => onProgress?.(report)
    });
  }
  return enginePromise;
}

export async function generateFusionRecipeLocally({ extraction, flavorProfile, onProgress }) {
  const engine = await loadLocalEngine(onProgress);

  const prompt = `You are a playful, slightly chaotic fusion chef. Using ONLY the structured data below, invent one
original fusion recipe that genuinely combines the fridge ingredients with the craved dish's cuisine/flavor profile.
Prefer using ingredients the user already has; only add 1-3 extra items they'd need to buy, and mark those have:false.
Keep steps short and punchy (4-7 steps). The tone should be fun and a little witty.
Respond with ONLY a JSON object matching the required schema, no extra text.

${flavorProfileToPromptContext(flavorProfile)}

Structured input:
${JSON.stringify(extraction, null, 2)}`;

  const reply = await engine.chat.completions.create({
    stream: false,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 768,
    response_format: { type: "json_object", schema: RECIPE_JSON_SCHEMA }
  });

  const content = reply.choices[0].message.content;
  return JSON.parse(content);
}
