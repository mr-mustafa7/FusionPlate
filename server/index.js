import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { hasApiKey, runFusionPipeline, extractWithFlavorProfile } from "./geminiClient.js";
import { analyzeFlavorFusion } from "./flavorScience.js";
import { pickMockFusion } from "./mockData.js";

const app = express();
const PORT = process.env.PORT || 8787;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, liveModelsConfigured: hasApiKey() });
});

app.post(
  "/api/fuse",
  upload.fields([
    { name: "fridge", maxCount: 1 },
    { name: "craving", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const fridgeFile = req.files?.fridge?.[0];
      const cravingFile = req.files?.craving?.[0];
      const fridgeText = (req.body?.fridgeText || "").trim();
      const cravingText = (req.body?.cravingText || "").trim();
      const spookify = req.body?.spookify === "true";
      const servings = Number(req.body?.servings) || 2;
      let dietary = [];
      try {
        dietary = JSON.parse(req.body?.dietary || "[]");
      } catch {
        dietary = [];
      }

      if (!hasApiKey()) {
        await new Promise((r) => setTimeout(r, 900)); // feels like real "fusing" work
        const mock = pickMockFusion({ spooky: spookify });
        return res.json({
          mode: "demo",
          extraction: mock.extraction,
          recipe: mock.recipe,
          flavorProfile: analyzeFlavorFusion(mock.extraction),
          meta: { visionModel: "demo", generationModel: "demo", usedOpenModel: false }
        });
      }

      if ((!fridgeFile && !fridgeText) || (!cravingFile && !cravingText)) {
        return res.status(400).json({ error: "A fridge photo/pantry and either a craving photo or description are required." });
      }

      const result = await runFusionPipeline({
        fridgeImage: fridgeFile ? { mimeType: fridgeFile.mimetype, data: fridgeFile.buffer.toString("base64") } : null,
        fridgeText: fridgeFile ? null : fridgeText,
        cravingImage: cravingFile ? { mimeType: cravingFile.mimetype, data: cravingFile.buffer.toString("base64") } : null,
        cravingText: cravingFile ? null : cravingText,
        spookify,
        dietary,
        servings
      });

      res.json(result);
    } catch (err) {
      console.error("[fusion] pipeline error:", err);
      // Never hard-fail the demo: degrade to a mock fusion instead of a 500 screen.
      const mock = pickMockFusion({ spooky: req.body?.spookify === "true" });
      res.json({
        mode: "demo-fallback",
        extraction: mock.extraction,
        recipe: mock.recipe,
        flavorProfile: analyzeFlavorFusion(mock.extraction),
        meta: { visionModel: "demo", generationModel: "demo", usedOpenModel: false },
        warning: "Live model call failed; showing a fallback fusion so the demo keeps moving."
      });
    }
  }
);

// Vision-only extraction, used by Local Mode: the browser runs Gemma 4 itself via
// WebGPU for the creative step, but still needs a multimodal read of the two photos
// first (the in-browser Gemma 4 build here is text-only).
app.post(
  "/api/extract",
  upload.fields([
    { name: "fridge", maxCount: 1 },
    { name: "craving", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const fridgeFile = req.files?.fridge?.[0];
      const cravingFile = req.files?.craving?.[0];
      const fridgeText = (req.body?.fridgeText || "").trim();
      const cravingText = (req.body?.cravingText || "").trim();

      if (!hasApiKey()) {
        const mock = pickMockFusion();
        return res.json({
          mode: "demo",
          extraction: mock.extraction,
          flavorProfile: analyzeFlavorFusion(mock.extraction)
        });
      }

      if ((!fridgeFile && !fridgeText) || (!cravingFile && !cravingText)) {
        return res.status(400).json({ error: "A fridge photo/pantry and either a craving photo or description are required." });
      }

      const result = await extractWithFlavorProfile({
        fridgeImage: fridgeFile ? { mimeType: fridgeFile.mimetype, data: fridgeFile.buffer.toString("base64") } : null,
        fridgeText: fridgeFile ? null : fridgeText,
        cravingImage: cravingFile ? { mimeType: cravingFile.mimetype, data: cravingFile.buffer.toString("base64") } : null,
        cravingText: cravingFile ? null : cravingText
      });

      res.json({ mode: "live", ...result });
    } catch (err) {
      console.error("[extract] error:", err);
      const mock = pickMockFusion();
      res.json({
        mode: "demo-fallback",
        extraction: mock.extraction,
        flavorProfile: analyzeFlavorFusion(mock.extraction),
        warning: "Live extraction failed; showing fallback data."
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`FusionPlate server running on http://localhost:${PORT}`);
  console.log(hasApiKey() ? "Live Gemini/Gemma models enabled." : "No GEMINI_API_KEY set — running in demo mode with mock fusions.");
});
