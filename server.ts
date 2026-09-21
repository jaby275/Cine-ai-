import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy client accessor for Gemini API
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// 1. Storyboard generator from long text / script
app.post("/api/video/storyboard", async (req, res) => {
  try {
    const { text, targetDuration = "medium", sceneCount, theme = "cinematic", aspectRatio = "16:9" } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Please provide valid text or script." });
    }

    const ai = getAiClient();

    let desiredScenes = 6;
    if (sceneCount && Number(sceneCount) >= 2 && Number(sceneCount) <= 20) {
      desiredScenes = Number(sceneCount);
    } else if (targetDuration === "short") {
      desiredScenes = 4; // ~30-45s
    } else if (targetDuration === "medium") {
      desiredScenes = 7; // ~1.5 - 2m
    } else if (targetDuration === "long") {
      desiredScenes = 12; // ~3 - 5m
    }

    const systemPrompt = `You are a world-class documentary director, Hollywood filmmaker, and YouTube video producer specializing in transforming long text, articles, essays, and stories into captivating multi-scene long videos.
Your job is to analyze the user's input text and create a comprehensive, cinematic, scene-by-scene video production storyboard.

Requirements:
1. Divide the narrative into roughly ${desiredScenes} sequential, visually distinct scenes that maintain high viewer retention.
2. For each scene, write:
   - sceneNumber: 1-indexed number
   - title: Short dramatic/evocative title for the scene (e.g. "The Catalyst", "Voices in the Shadows", "The Quantum Breakthrough")
   - narration: The exact voiceover text spoken by the narrator. High-impact, engaging spoken English (roughly 20-50 words per scene).
   - duration: Estimated seconds needed to speak the narration at a natural, engaging pace (usually 6 to 14 seconds per scene).
   - visualPrompt: An ultra-detailed image generation prompt for this scene matching the visual style "${theme}". Include lighting, camera angle, atmosphere, lens depth, color palette, and hyper-detailed subject description.
   - cameraMotion: Choose one from ["zoom-in", "zoom-out", "pan-left", "pan-right", "tilt-up", "dynamic-drift"] that best matches the emotional beat.
   - transition: Choose one from ["fade", "crossfade", "dissolve", "flash", "cut"] for the transition into this scene.
   - moodColor: A hex code representing the ambient color grading tone of this scene (e.g. "#1e3a8a" for deep cosmic blue, "#d97706" for warm golden hour).
   - overlayText: Optional short text title/statistic/quote to show on screen (or empty string).
3. Provide a compelling video title, a summary description, and a suggested background music mood chosen from: ["cinematic-epic", "ambient-calm", "synthwave-retro", "lofi-chill", "tension-suspense"].`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Input Text / Script to transform into a long video:\n\n"""${text.slice(0, 15000)}"""\n\nAspect ratio: ${aspectRatio}\nVisual Style Theme: ${theme}\nTarget scene count: ${desiredScenes}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Punchy, cinematic title for the full video." },
            description: { type: Type.STRING, description: "Brief description/logline of the video." },
            theme: { type: Type.STRING, description: "The visual style applied." },
            suggestedMusicMood: {
              type: Type.STRING,
              description: "Music mood: cinematic-epic, ambient-calm, synthwave-retro, lofi-chill, or tension-suspense",
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  duration: { type: Type.NUMBER },
                  visualPrompt: { type: Type.STRING },
                  cameraMotion: { type: Type.STRING },
                  transition: { type: Type.STRING },
                  moodColor: { type: Type.STRING },
                  overlayText: { type: Type.STRING },
                },
                required: ["sceneNumber", "title", "narration", "duration", "visualPrompt", "cameraMotion", "transition", "moodColor"],
              },
            },
          },
          required: ["title", "description", "theme", "suggestedMusicMood", "scenes"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error generating storyboard:", error);
    return res.status(500).json({ error: error.message || "Failed to generate video storyboard." });
  }
});

// 2. Expand short prompt/idea into full long-form script
app.post("/api/video/expand-script", async (req, res) => {
  try {
    const { topic, tone = "informative and cinematic", targetLength = "3-5 minutes" } = req.body;

    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Please provide a topic or prompt." });
    }

    const ai = getAiClient();
    const prompt = `You are an acclaimed documentary scriptwriter and long-form video essayist.
Take the following topic/prompt and write a rich, captivating, multi-paragraph script optimized for long video production (~${targetLength}):
Topic: "${topic}"
Tone: ${tone}

Structure the script with:
1. An irresistible opening hook
2. Core background and context
3. Deep-dive revelations, tension, or pivotal points
4. Fascinating examples or visual metaphors
5. Thought-provoking conclusion and final takeaway

Provide only the narrative voiceover script, written in flowing, engaging spoken prose without stage directions, ready to be converted directly into video scenes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return res.json({ script: response.text });
  } catch (error: any) {
    console.error("Error expanding script:", error);
    return res.status(500).json({ error: error.message || "Failed to expand script." });
  }
});

// 2.5. Remake from Video Link into a 100% Copyright-Free Video Storyboard
app.post("/api/video/remake-from-link", async (req, res) => {
  try {
    const {
      videoUrl,
      transformationStyle = "cinematic documentary",
      sceneCount = 6,
      theme = "cinematic",
      aspectRatio = "16:9",
      targetDuration = "medium",
    } = req.body;

    if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim().length === 0) {
      return res.status(400).json({ error: "Please provide a valid video link." });
    }

    const ai = getAiClient();

    let desiredScenes = 6;
    if (sceneCount && Number(sceneCount) >= 2 && Number(sceneCount) <= 16) {
      desiredScenes = Number(sceneCount);
    }

    const systemPrompt = `You are an expert Hollywood video producer, copyright attorney, and documentary director specializing in transformative, 100% copyright-free video regeneration.
The user wants to take an existing video link (YouTube, Vimeo, educational web video, or topic reference) and regenerate a BRAND NEW, 100% COPYRIGHT-FREE, original long video production.

CRITICAL COPYRIGHT COMPLIANCE DIRECTIVES:
1. TRANSFORMATIVE SYNTHESIS: You must NOT copy or plagiarize copyrighted dialogue, transcription, or proprietary text from the original video.
2. ORIGINAL NARRATION: Write brand-new voiceover prose with fresh analogies, a new narrative pacing, an original dramatic opening hook, and an insightful conclusion.
3. COPYRIGHT-FREE CLEARANCE: The output must be completely safe for YouTube monetization, TikTok, and commercial distribution without copyright strikes or Content ID matching.
4. SCENE DIRECTING: Create ${desiredScenes} sequential scenes with precise narration, camera motions (zoom-in, zoom-out, pan-left, pan-right, tilt-up, dynamic-drift), scene transitions, and descriptive visual prompts designed for royalty-free visual synthesis.

Format the response strictly as valid JSON adhering to the provided schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Reference Video Link or Video Subject to remake into a copyright-free video:\n"""${videoUrl.trim()}"""\n\nTransformation Style: ${transformationStyle}\nDesired Scene Count: ${desiredScenes}\nVisual Theme: ${theme}\nAspect Ratio: ${aspectRatio}\nTarget Duration: ${targetDuration}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Brand-new original cinematic title for the remake video." },
            description: { type: Type.STRING, description: "Logline and overview of the transformative copyright-free remake." },
            detectedTopic: { type: Type.STRING, description: "The underlying subject matter identified from the video link." },
            copyrightClearance: {
              type: Type.OBJECT,
              properties: {
                isSafeForMonetization: { type: Type.BOOLEAN },
                licenseType: { type: Type.STRING, description: "e.g., '100% Transformative Original (Public Domain / CC0 Visuals)'" },
                clearanceSummary: { type: Type.STRING, description: "Legal assurance summary stating the script and assets are free of copyright infringement." },
                originalityScore: { type: Type.INTEGER, description: "Originality score out of 100 (e.g. 100)" },
              },
              required: ["isSafeForMonetization", "licenseType", "clearanceSummary", "originalityScore"],
            },
            theme: { type: Type.STRING },
            suggestedMusicMood: {
              type: Type.STRING,
              description: "Music mood: cinematic-epic, ambient-calm, synthwave-retro, lofi-chill, or tension-suspense",
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  duration: { type: Type.NUMBER },
                  visualPrompt: { type: Type.STRING },
                  cameraMotion: { type: Type.STRING },
                  transition: { type: Type.STRING },
                  moodColor: { type: Type.STRING },
                  overlayText: { type: Type.STRING },
                },
                required: ["sceneNumber", "title", "narration", "duration", "visualPrompt", "cameraMotion", "transition", "moodColor"],
              },
            },
          },
          required: ["title", "description", "detectedTopic", "copyrightClearance", "theme", "suggestedMusicMood", "scenes"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error remaking video from link:", error);
    return res.status(500).json({ error: error.message || "Failed to regenerate video from link." });
  }
});

// 3. Scene visual generation with Gemini Image Generation or fallback artwork
app.post("/api/video/generate-scene-visual", async (req, res) => {
  try {
    const { prompt, theme = "cinematic", aspectRatio = "16:9", sceneNumber = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing visual prompt." });
    }

    const ai = getAiClient();
    let validAspectRatio = "16:9";
    if (aspectRatio === "9:16" || aspectRatio === "1:1" || aspectRatio === "16:9") {
      validAspectRatio = aspectRatio;
    }

    // Try Gemini image generation model
    try {
      const enhancedPrompt = `${prompt}, ${theme} art style, cinematic masterpiece, 8k resolution, dramatic cinematic lighting, volumetric atmosphere, octane render quality, highly detailed`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio as any,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || "image/png";
          const dataUrl = `data:${mime};base64,${part.inlineData.data}`;
          return res.json({ imageUrl: dataUrl, source: "gemini-image" });
        }
      }
    } catch (imgErr: any) {
      console.warn("Gemini image generation unavailable or requires paid tier, using thematic cinematic visual generator:", imgErr?.message);
    }

    // Fallback: return metadata to let client/server generate custom high-res thematic canvas backdrop
    return res.json({
      imageUrl: null,
      fallbackNeeded: true,
      prompt,
      theme,
      sceneNumber,
    });
  } catch (error: any) {
    console.error("Error in scene visual generation:", error);
    return res.status(500).json({ error: error.message || "Failed to generate visual." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Long Video Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
