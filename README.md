# FusionPlate 🧊🍽️

Built at **Hacktoberfest Southampton** (MLH), Oct 24 2026.
**Theme:** Fusion — "combine two or more things that already exist to make something better."
**Track:** Best Gemma 4 Project.

## The idea

Take a photo of your fridge. Take a photo of a dish you're craving (a menu, a takeout photo, anything).
FusionPlate invents a brand-new **fusion recipe** that genuinely merges your actual ingredients with the
craved dish's cuisine and flavor profile — not a generic recipe, a specific one that only makes sense
because of *those two photos*.

It's the theme taken literally: fusion cuisine is a real culinary tradition, and the app fuses three
different things to make it:

1. **Gemini API** (`gemini-2.5-flash`, multimodal) reads both photos and extracts structured data: what's
   actually in the fridge, and what dish/cuisine/flavor profile the craving photo represents.
2. **Gemma 4** — an **open-weight model** — creatively writes the fusion recipe. It runs two ways:
   - by default, through the Gemini API (`gemma-3-27b-it`, falling back to the vision model if unavailable
     on a given key/tier), or
   - optionally **entirely inside your browser via WebGPU**, using the open-source
     [mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) runtime running the real `gemma-4-E2B-it` build
     — no API key, no server call for that step at all. Toggle "Run Gemma 4 locally" to try it.
3. A hand-built **flavor-science engine** (`server/flavorScience.js`) computes a real numeric
   compatibility score between the fridge and the craving using an 8-cluster flavor taxonomy (umami,
   acidic, spice, creamy, fermented, herbaceous, smoky, sweet) and feeds that grounding into the model's
   prompt — so the "fusion score" isn't just LLM vibes, it's backed by a deterministic model you can
   inspect, visualized as a radar chart in the UI.

If the cloud open-weight model id isn't available on a given API key/tier, the backend automatically
falls back to the vision model for generation and says so in the UI — same for a missing API key or a
flaky connection, which drops into a demo mode with representative canned fusions (complete with a
locally-computed flavor profile) instead of crashing mid-judging.


FusionPlate's entire core mechanism *is* that sentence, twice over: a cloud-hosted Gemma model reached
through the Gemini API for the default path, and — going further than the brief asks — the actual
open-weight Gemma 4 model running fully client-side via WebGPU as an alternate path. Multimodal
understanding (two photos reasoned over together), a real open-source inference runtime, and a grounded,
inspectable scoring model instead of a single opaque prompt.

## Running it

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# put a real key in .env: GEMINI_API_KEY=...
npm start
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Without a key the
server still runs fine — it serves demo-mode fusions (with a real flavor-science score) so the UI is
fully testable offline.

### 2. Frontend

```bash
cd web
npm install
npm run dev
```

Open the printed localhost URL. Vite proxies `/api/*` to the backend on port 8787. The "Run Gemma 4
locally" toggle needs a WebGPU-capable browser (recent Chrome/Edge); the first run downloads the real
quantized `gemma-4-E2B-it` weights (~3GB, several minutes depending on connection — confirmed by actually
running it: 84 shards, ~4% every ~45s on a typical connection). The browser caches it after that, so
**warm the cache before walking up to judges** rather than triggering the download live — toggle it on,
run one fusion, and let it finish in advance; every run after that is fast and fully offline.

## Architecture

```
web/  (React + Vite)
  PhotoSlot.jsx          — drag/drop or camera-capture photo input
  ResultCard.jsx          — renders the generated fusion recipe
  FlavorRadar.jsx          — SVG radar chart of the flavor-cluster compatibility
  HistoryStrip.jsx         — session history of past fusions
  webllmClient.js          — in-browser Gemma 4 inference via WebGPU (mlc-ai/web-llm)
  api.js                   — talks to the backend

server/  (Node + Express)
  index.js                 — /api/fuse (full pipeline), /api/extract (vision-only, for
                             Local Mode), /api/health, demo-mode + error fallback
  geminiClient.js           — Gemini vision extraction -> Gemma recipe generation ->
                             dish image generation, with automatic model fallback
  flavorScience.js          — the hand-built flavor-cluster taxonomy and compatibility model
  schema.js                 — structured JSON schemas for the Gemini/Gemma calls
  mockData.js                — canned fusions for offline/demo-mode reliability
```


## What's next (if we had more time)

- Let users save/share a fusion as a card image.
- A "spookify this fusion" button for a free Halloween angle on the side-challenge.
- Cache the local WebGPU model across sessions more aggressively and show live token streaming.
