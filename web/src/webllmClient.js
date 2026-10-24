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

const SPOOKY_INSTRUCTION = `Spookify mode is ON: lean into a Halloween theme. Give the dish an eerie/punny
name, write the tagline and funFactOrTwist with a spooky-playful tone (think haunted kitchen, not horror movie),
and if it fits naturally, nudge the plating toward something Halloween-appropriate — but never sacrifice the
dish actually sounding edible and good.`;

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

export async function generateFusionRecipeLocally({ extraction, flavorProfile, spookify, dietary, servings, onProgress }) {
  const engine = await loadLocalEngine(onProgress);

  const prompt = `You are a playful, slightly chaotic fusion chef. Using ONLY the structured data below, invent one
original fusion recipe that genuinely combines the fridge ingredients with the craved dish's cuisine/flavor profile.
Prefer using ingredients the user already has; only add 1-3 extra items they'd need to buy, and mark those have:false.
Keep steps short and punchy (4-7 steps). The tone should be fun and a little witty.
Respond with ONLY a JSON object matching the required schema, no extra text.

${flavorProfileToPromptContext(flavorProfile)}
${spookify ? `\n${SPOOKY_INSTRUCTION}\n` : ""}${dietaryInstruction({ dietary, servings })}
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
