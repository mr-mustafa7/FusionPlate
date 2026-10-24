# FusionPlate 🧊🍽️

Built at **Hacktoberfest Southampton** (MLH), Oct 24 2026.
**Theme:** Fusion — "combine two or more things that already exist to make something better."
**Track:** Best Gemma 4 Project.

## The idea

Show FusionPlate your fridge and what you're craving — it invents a brand-new **fusion recipe** that
genuinely merges your actual ingredients with the craved dish's cuisine and flavor profile. Not a generic
recipe: a specific one that only makes sense because of what you actually have and want.

It's the theme taken literally: fusion cuisine is a real culinary tradition, and the app fuses several
different things to make it happen:

1. **Gemini API** (`gemini-2.5-flash`, multimodal) reads your fridge and craving and extracts structured
   data — what's actually available, and what dish/cuisine/flavor profile you're after.
2. **Gemma 4** — an **open-weight model** — creatively writes the fusion recipe. It runs two ways:
   - by default, through the Gemini API (`gemma-3-27b-it`, falling back to the vision model if unavailable
     on a given key/tier), or
   - optionally **entirely inside your browser via WebGPU**, using the open-source
     [mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) runtime running the real `gemma-4-E2B-it` build
     — no API key, no server call for that step at all. Toggle "Run Gemma 4 locally" to try it.
3. A hand-built **flavor-science engine** (`server/flavorScience.js`) computes a real numeric
   compatibility score across an 8-cluster flavor taxonomy (umami, acidic, spice, creamy, fermented,
   herbaceous, smoky, sweet) — grounding the "fusion score" in something computed and inspectable, not
   LLM vibes, visualized as a radar chart. The same engine powers ingredient substitution suggestions.

If the cloud open-weight model id isn't available on a given API key/tier, the backend automatically
falls back to the vision model and says so in the UI — same for a missing API key or a flaky connection,
which drops into demo mode with representative canned fusions instead of crashing mid-judging.

## What it actually does, beyond the one-shot generator

- **Two ways in, for both sides of the fusion.** Fridge: a photo, or your saved Pantry list. Craving: a
  photo, or type/speak a description (Web Speech API) — "a really rich, spicy ramen" works fine with no
  photo at all.
- **Smart substitutions.** For every ingredient you're missing, the flavor-science engine checks whether
  something already in your fridge is a genuine flavor-cluster match (not a random guess) and suggests it.
- **Spookify mode.** A real toggle that biases recipe generation, image generation, and even demo-mode
  mock selection toward a Halloween theme.
- **Pantry tab.** Save what you usually have on hand once, reuse it on every fusion instead of
  re-photographing your fridge.
- **Shopping List tab.** Missing ingredients land here automatically (or add them manually); check off as
  you shop.
- **Preferences tab.** Dietary restrictions (vegetarian, vegan, gluten-free, etc.) and household size,
  threaded into every generation path — cloud and local — as hard requirements, not suggestions.
- **Saved tab.** A persistent cookbook (localStorage) — unlike the in-session history strip, these survive
  a refresh.
- **Share.** Send a fusion to a friend via the native share sheet, with a clipboard/prompt fallback.

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
  App.jsx                   — tab shell: Fuse / Pantry / Shopping list / Saved / Preferences
  FridgeSlot.jsx              — fridge input: photo, or your saved Pantry list
  CravingSlot.jsx              — craving input: photo, or typed/spoken description
  ResultCard.jsx                — renders the generated fusion recipe, save/share actions
  FlavorRadar.jsx                — SVG radar chart of the flavor-cluster compatibility
  PantryTab.jsx / ShoppingListTab.jsx / PreferencesTab.jsx / SavedTab.jsx
  HistoryStrip.jsx              — in-session recent fusions
  storage.js                     — localStorage-backed pantry/shopping-list/preferences/saved
  substitutions.js                — client-side mirror of the flavor-cluster substitution matcher
  webllmClient.js                 — in-browser Gemma 4 inference via WebGPU (mlc-ai/web-llm)
  api.js                           — talks to the backend

server/  (Node + Express)
  index.js                  — /api/fuse (full pipeline), /api/extract (vision-only, for
                             Local Mode), /api/health, demo-mode + error fallback
  geminiClient.js             — Gemini extraction (photo or text, either side) -> Gemma
                             recipe generation -> dish image generation, automatic fallback
  flavorScience.js             — flavor-cluster taxonomy, compatibility model, substitution matcher
  schema.js                     — structured JSON schemas for the Gemini/Gemma calls
  mockData.js                    — canned fusions (incl. a tagged spooky one) for offline/demo reliability
```

## Demo script

1. Upload a fridge photo (or flip to "My pantry" if you've saved one).
2. Upload a craving photo, or switch to "Describe it" and type or speak what you want.
3. Hit "Fuse it!" — point at the stat tiles and radar chart to show the flavor-science grounding is
   computed, not guessed.
4. Add a missing ingredient to the Shopping List, save the recipe, show it surviving a refresh in the
   Saved tab.
5. Toggle Spookify, re-fuse, show the Halloween-themed output.
6. For the finale: toggle "Run Gemma 4 locally" (pre-warmed in advance) and re-run live, showing the
   recipe regenerating entirely offline, in-browser, on WebGPU — no network call for that step at all.

## What's next (if we had more time)

- Real accounts + a lightweight social layer (currently Share uses the native share sheet instead).
- Split the "spice" flavor cluster into heat vs. warm-spice for even sharper substitution matches.
- Nutritional estimates per serving.
- Cache the local WebGPU model across sessions more aggressively and show live token streaming.
