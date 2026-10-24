# FusionPlate — MLH submission write-up

**Event:** Hacktoberfest Southampton · **Theme:** Fusion · **Track:** Best Gemma 4 Project

## Inspiration

The theme was "Fusion" — combine two or more things that already exist to make something better.
Fusion *cuisine* is a real, well-loved culinary tradition built on exactly that idea, so we took the
theme literally: what if an AI looked at what's actually in your fridge and what you're actually craving,
and fused the two into a dish that only makes sense because of those two specific photos?

## What it does

Show FusionPlate your fridge/pantry — a photo, or a saved Pantry list — and what you're craving, as a
photo or a typed/spoken description. It reads both, figures out what's really available and what
cuisine/flavor profile the craving represents, computes a real numeric flavor-compatibility score, then
invents an original fusion recipe grounded in that score: a title, a radar chart of the shared flavor DNA,
an ingredient list (with flavor-matched substitution suggestions for anything missing), step-by-step
instructions, a plating tip, and — when live models are enabled — a generated photo of the finished dish.

Beyond the single generation: a **Pantry** tab so you don't re-photograph your fridge every time, a
**Shopping List** auto-populated from missing ingredients, a **Preferences** tab (dietary restrictions +
household size) that actually constrains every generation, a persistent **Saved** cookbook, a **Spookify**
toggle that genuinely biases the recipe/image toward Halloween, and a **Share** button using the native
share sheet. A separate toggle lets you regenerate the recipe step entirely offline, running the real
Gemma 4 model in your own browser via WebGPU.

## How we built it

Three-part pipeline, deliberately fusing a closed multimodal model, an open-weight model, and a small
original symbolic model:

1. **Gemini API** (`gemini-2.5-flash`) does the multimodal understanding — reading both photos together
   and extracting structured JSON (ingredients, cuisine, dish, flavor notes) via a strict response schema.
2. **A hand-built flavor-science engine** (not scraped, not an LLM call) maps ingredients and cuisines
   onto an 8-cluster flavor taxonomy (umami, acidic, spice, creamy, fermented, herbaceous, smoky, sweet)
   and computes a cosine-similarity "fusion affinity score" between the fridge and the craving. This
   grounds the next step instead of leaving it to pure LLM improvisation.
3. **Gemma** — an **open-weight model** — takes the structured extraction plus the flavor-science
   analysis and creatively writes the actual fusion recipe. This runs two ways: by default through the
   Gemini API (`gemma-3-27b-it`), or — going further than the brief — as the **real `gemma-4-E2B-it`
   model running entirely client-side via WebGPU**, using the open-source `mlc-ai/web-llm` runtime, with
   zero API key and zero server round-trip for that step.
4. An optional fourth call (`gemini-2.5-flash-image`) generates a photo of the finished dish.

Frontend is React + Vite; backend is a small Express API with a dedicated `/api/extract` endpoint so the
local-WebGPU path can skip the cloud generation call while still getting multimodal photo understanding
(the in-browser Gemma 4 build is text-only, so it still needs that one cloud call). The backend degrades
gracefully at every stage: no API key → demo mode with representative canned fusions (still scored by the
real flavor engine); open model unavailable → silent fallback to the vision model with that fact surfaced
honestly in the UI; any live call failing → a fallback fusion instead of an error page. That reliability
design was deliberate — a 12-hour mini-hackathon demo has one shot in front of judges and patchy venue
wifi is a real risk.

## Challenges we ran into

- Making "open model + Gemini API" a real architectural decision rather than a label — solved by
  genuinely splitting responsibilities across three independent components (vision, symbolic scoring,
  generation) instead of one prompt doing everything.
- Verifying the in-browser Gemma 4 model id was real and current rather than guessing — confirmed
  directly against the `mlc-ai/web-llm` source (`gemma-4-E2B-it-q4f16_1-MLC`, added in v0.2.86) before
  wiring it up, since this kind of "state of the art" claim goes stale fast.
- Keeping the demo bulletproof for live judging without making it feel fake — solved with the
  mode/badge system that's honest about whether a given response was live cloud, live local-WebGPU, or
  offline demo data.

## Accomplishments we're proud of

A project that's funny and demo-friendly in the room (everyone has an opinion about their fridge) while
being a genuinely multimodal, three-component pipeline underneath — cloud vision, an original symbolic
flavor model, and open-weight generation (with a real in-browser WebGPU path) — not a single-prompt
chatbot wrapper.

## What's next

- Real accounts and a lightweight social layer beyond the native-share-sheet Share button.
- Split the "spice" flavor cluster into heat vs. warm-spice for even sharper substitution matches.
- Stream tokens from the local WebGPU model for a livelier "thinking" demo moment.

## Tech stack

React, Vite, Node.js, Express, Google Gemini API (`gemini-2.5-flash`, `gemini-2.5-flash-image`), Gemma
(`gemma-3-27b-it` via the Gemini API, and `gemma-4-E2B-it` running locally via WebGPU/`mlc-ai/web-llm`),
a hand-built flavor-cluster scoring engine.

## Try it

Repo: (add your repo URL here before submitting)
Setup instructions: see [README.md](README.md)
