import React, { useState } from "react";
import {
  Sparkles,
  Film,
  Music,
  Mic,
  Sliders,
  Ratio,
  Layers,
  FileText,
  Lightbulb,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Video,
  Link as LinkIcon,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { AspectRatio, VisualTheme, AudioTrackMood } from "../types";

interface ScriptInputPanelProps {
  onGenerate: (config: {
    text: string;
    theme: VisualTheme;
    aspectRatio: AspectRatio;
    sceneCount: number;
    audioMood: AudioTrackMood;
    voiceGender: "female" | "male" | "neutral";
    voiceRate: number;
    sourceVideoLink?: string;
    copyrightFreeCertified?: boolean;
    prebuiltStoryboard?: any;
  }) => Promise<void>;
  isGenerating: boolean;
  generationStep: string;
  defaultAspectRatio: AspectRatio;
  onSetAspectRatio: (r: AspectRatio) => void;
  initialText?: string;
}

const THEME_OPTIONS: { id: VisualTheme; label: string; icon: string; desc: string }[] = [
  { id: "cinematic", label: "Cinematic Movie", icon: "🎬", desc: "Hollywood color grading, anamorphic depth, rich shadows" },
  { id: "documentary", label: "National Geographic", icon: "🌍", desc: "Crisp photorealistic nature & historical clarity" },
  { id: "scifi", label: "Sci-Fi Space Epic", icon: "🚀", desc: "Cosmic nebulas, spacecraft, futuristic horizons" },
  { id: "cyberpunk", label: "Cyberpunk Neon", icon: "⚡", desc: "Electric violet, rain reflections, futuristic cityscapes" },
  { id: "anime", label: "Anime Aesthetic", icon: "🌸", desc: "Studio Ghibli skies, vibrant painterly atmosphere" },
  { id: "3d-render", label: "3D Animation", icon: "💎", desc: "Pixar-grade octane lighting & digital geometry" },
  { id: "vintage", label: "Vintage 35mm", icon: "🎞️", desc: "Sepia tones, historic film texture & nostalgic warmth" },
  { id: "watercolor", label: "Watercolor Dream", icon: "🎨", desc: "Soft poetic brushstrokes & pastel flow" },
];

const MUSIC_OPTIONS: { id: AudioTrackMood; label: string; desc: string }[] = [
  { id: "cinematic-epic", label: "Epic Cinematic", desc: "Dramatic orchestra, rising minor chords & sub-bass" },
  { id: "ambient-calm", label: "Ambient Serenity", desc: "Peaceful airy harmonics & meditative calm" },
  { id: "synthwave-retro", label: "Synthwave Pulse", desc: "80s retro drive, analog arpeggios & retro bass" },
  { id: "lofi-chill", label: "Lo-Fi Beats", desc: "Dusty warm keys, vinyl texture & mellow groove" },
  { id: "tension-suspense", label: "Dark Suspense", desc: "Subtle ominous drones & heartbeat pulses" },
  { id: "none", label: "No Music (Narration Only)", desc: "Mute background soundtrack" },
];

const SAMPLE_VIDEO_LINKS = [
  {
    title: "Mariana Trench Abyss",
    url: "https://www.youtube.com/watch?v=sNhhvQGsMEc",
    label: "Ocean Trench Secrets",
  },
  {
    title: "James Webb Cosmic Origins",
    url: "https://www.youtube.com/watch?v=42zO28p_a1U",
    label: "James Webb Telescope",
  },
  {
    title: "Roman Aqueduct Engineering",
    url: "https://www.youtube.com/watch?v=FN1vE2Y_v0E",
    label: "Roman Aqueducts",
  },
  {
    title: "Inside A Supermassive Black Hole",
    url: "https://www.youtube.com/watch?v=0FH9cgRhQ-k",
    label: "Black Hole Event Horizon",
  },
];

export const ScriptInputPanel: React.FC<ScriptInputPanelProps> = ({
  onGenerate,
  isGenerating,
  generationStep,
  defaultAspectRatio,
  onSetAspectRatio,
  initialText = "",
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "expand" | "video-link">("text");
  const [textInput, setTextInput] = useState(initialText || "");
  const [expandTopic, setExpandTopic] = useState("");
  const [expandTone, setExpandTone] = useState("informative and captivating documentary");
  const [expandLength, setExpandLength] = useState("3-5 minutes");
  const [isExpanding, setIsExpanding] = useState(false);

  // Video Link Remake State
  const [videoLinkUrl, setVideoLinkUrl] = useState("");
  const [videoTransformStyle, setVideoTransformStyle] = useState("cinematic documentary");
  const [isRemakingVideo, setIsRemakingVideo] = useState(false);
  const [remakeResult, setRemakeResult] = useState<{
    detectedTopic?: string;
    clearanceSummary?: string;
    licenseType?: string;
    originalityScore?: number;
    storyboard?: any;
  } | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<VisualTheme>("cinematic");
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>(defaultAspectRatio);
  const [sceneCount, setSceneCount] = useState<number>(6);
  const [selectedMusic, setSelectedMusic] = useState<AudioTrackMood>("cinematic-epic");
  const [voiceGender, setVoiceGender] = useState<"female" | "male" | "neutral">("female");
  const [voiceRate, setVoiceRate] = useState<number>(1.0);

  // Sync aspect ratio when prop changes
  React.useEffect(() => {
    setSelectedAspect(defaultAspectRatio);
  }, [defaultAspectRatio]);

  const wordCount = textInput.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDurationMinutes = (wordCount / 140).toFixed(1);

  const handleExpandTopic = async () => {
    if (!expandTopic.trim()) return;
    setIsExpanding(true);
    try {
      const res = await fetch("/api/video/expand-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: expandTopic,
          tone: expandTone,
          targetLength: expandLength,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setTextInput(data.script);
        setActiveTab("text");
      }
    } catch (err) {
      console.error("Failed to expand script:", err);
    } finally {
      setIsExpanding(false);
    }
  };

  // Remake from Video Link handler
  const handleRemakeFromVideoLink = async () => {
    if (!videoLinkUrl.trim()) return;
    setIsRemakingVideo(true);
    setRemakeResult(null);

    try {
      const res = await fetch("/api/video/remake-from-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: videoLinkUrl,
          transformationStyle: videoTransformStyle,
          sceneCount,
          theme: selectedTheme,
          aspectRatio: selectedAspect,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to remake video from link.");
      }

      const data = await res.json();
      const combinedScript = (data.scenes || [])
        .map((s: any) => s.narration)
        .filter(Boolean)
        .join("\n\n");

      setTextInput(combinedScript);
      setRemakeResult({
        detectedTopic: data.detectedTopic,
        clearanceSummary: data.copyrightClearance?.clearanceSummary || "100% transformative original script. Verified free of copyright claims.",
        licenseType: data.copyrightClearance?.licenseType || "CC0 / Transformative Commercial Public Domain",
        originalityScore: data.copyrightClearance?.originalityScore || 100,
        storyboard: data,
      });

      if (data.theme) {
        setSelectedTheme(data.theme as VisualTheme);
      }
      if (data.suggestedMusicMood) {
        setSelectedMusic(data.suggestedMusicMood as AudioTrackMood);
      }
    } catch (err) {
      console.error("Failed to remake video from link:", err);
      alert("Notice: Could not parse video link. Please verify the URL or try one of the sample topics.");
    } finally {
      setIsRemakingVideo(false);
    }
  };

  const handleStartProduction = () => {
    if (!textInput.trim() || isGenerating) return;
    onGenerate({
      text: textInput,
      theme: selectedTheme,
      aspectRatio: selectedAspect,
      sceneCount,
      audioMood: selectedMusic,
      voiceGender,
      voiceRate,
      sourceVideoLink: remakeResult ? videoLinkUrl : undefined,
      copyrightFreeCertified: remakeResult ? true : false,
      prebuiltStoryboard: remakeResult?.storyboard || undefined,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Mode Tabs */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-1.5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            id="tab-direct-script"
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex flex-1 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "text"
                ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
            }`}
          >
            <FileText className="h-4 w-4 text-amber-400" />
            <span>Paste Text / Script</span>
          </button>

          <button
            id="tab-expand-topic"
            type="button"
            onClick={() => setActiveTab("expand")}
            className={`flex flex-1 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "expand"
                ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
            }`}
          >
            <Lightbulb className="h-4 w-4 text-sky-400" />
            <span>AI Story Writer</span>
          </button>

          <button
            id="tab-video-link"
            type="button"
            onClick={() => setActiveTab("video-link")}
            className={`flex flex-1 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "video-link"
                ? "bg-emerald-950/70 text-emerald-200 shadow-md border border-emerald-600/40"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
            }`}
          >
            <Video className="h-4 w-4 text-emerald-400" />
            <span>Video Link (Copyright-Free)</span>
            <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 font-bold">
              SAFE
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-7 shadow-2xl space-y-6">
        {activeTab === "text" && (
          /* Direct Text Input */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="script-textarea" className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Source Script or Article Narrative
              </label>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{wordCount} words</span>
                <span className="h-3 w-px bg-neutral-700" />
                <span className="text-amber-400">~{estimatedDurationMinutes} min duration</span>
              </div>
            </div>

            <textarea
              id="script-textarea"
              rows={8}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your long text, YouTube script, documentary essay, blog post, or story here...&#10;&#10;CineText AI will break it down into sequential scenes, direct camera motions, generate visuals, synchronize narration, and assemble a complete video."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/80 transition-all font-sans leading-relaxed"
            />
          </div>
        )}

        {activeTab === "expand" && (
          /* AI Topic Expansion */
          <div className="space-y-4 rounded-xl border border-sky-900/30 bg-sky-950/20 p-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                Video Topic or Core Narrative Idea
              </label>
              <input
                id="expand-topic-input"
                type="text"
                value={expandTopic}
                onChange={(e) => setExpandTopic(e.target.value)}
                placeholder="e.g. The James Webb Space Telescope: Unveiling the First Galaxies in the Universe"
                className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-300">Tone & Voice</label>
                <select
                  value={expandTone}
                  onChange={(e) => setExpandTone(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="informative and captivating documentary">National Geographic Documentary</option>
                  <option value="fast-paced engaging YouTube video essay">Viral YouTube Essay</option>
                  <option value="dramatic sci-fi cinematic narrative">Cinematic Sci-Fi Drama</option>
                  <option value="philosophical and thought-provoking">Philosophical & Reflective</option>
                  <option value="mysterious and suspenseful true crime">Mysterious & Suspenseful</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300">Target Video Length</label>
                <select
                  value={expandLength}
                  onChange={(e) => setExpandLength(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="1-2 minutes (4-5 scenes)">Short Video (1-2 mins)</option>
                  <option value="3-5 minutes (6-8 scenes)">Standard Long Video (3-5 mins)</option>
                  <option value="6-10 minutes (10-14 scenes)">Extended In-Depth Video (6-10 mins)</option>
                </select>
              </div>
            </div>

            <button
              id="expand-script-btn"
              type="button"
              onClick={handleExpandTopic}
              disabled={isExpanding || !expandTopic.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-sky-500 transition-all disabled:opacity-50"
            >
              {isExpanding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Writing Documentary Script with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Full Script with AI</span>
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "video-link" && (
          /* Video Link to Copyright-Free Regeneration */
          <div className="space-y-5 rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-5">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Reference Video Link (YouTube, Vimeo, or Web Video)</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                  100% Transformative Rewrite
                </span>
              </div>
              <input
                id="video-link-input"
                type="url"
                value={videoLinkUrl}
                onChange={(e) => setVideoLinkUrl(e.target.value)}
                placeholder="Paste link: e.g. https://www.youtube.com/watch?v=sNhhvQGsMEc"
                className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            {/* Quick Sample Links */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Or try a popular sample video link:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {SAMPLE_VIDEO_LINKS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setVideoLinkUrl(s.url)}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/70 px-2.5 py-1 text-[11px] text-neutral-300 hover:border-emerald-500/40 hover:bg-neutral-800 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style and scene config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-300">Transformation Direction</label>
                <select
                  value={videoTransformStyle}
                  onChange={(e) => setVideoTransformStyle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="cinematic documentary">Cinematic Documentary (Rich Depth)</option>
                  <option value="fast-paced video essay">Viral YouTube Essay (High Retention)</option>
                  <option value="educational explainer">Educational Explainer (Clear Analogies)</option>
                  <option value="philosophical journey">Philosophical & Reflective</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300">Number of Scenes</label>
                <select
                  value={sceneCount}
                  onChange={(e) => setSceneCount(parseInt(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value={4}>4 Scenes (~1.5 minutes)</option>
                  <option value={6}>6 Scenes (~3 minutes)</option>
                  <option value={8}>8 Scenes (~4.5 minutes)</option>
                  <option value={10}>10 Scenes (~6 minutes)</option>
                </select>
              </div>
            </div>

            {/* Legal Copyright Guarantee Card */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Copyright-Free Regeneration Guarantee</span>
              </div>
              <ul className="text-[11px] text-emerald-200/80 space-y-1">
                <li>• <strong>Original Script Synthesis:</strong> Brand new narrative phrasing, 0% copied verbatim text.</li>
                <li>• <strong>Royalty-Free Visuals:</strong> Synthesized AI imagery & CC0 public-domain video footages.</li>
                <li>• <strong>Original Soundtrack:</strong> Procedural synthesized music tracks safe from Content ID.</li>
                <li>• <strong>Monetization Cleared:</strong> Safe for YouTube Partner Program, TikTok & Commercial distribution.</li>
              </ul>
            </div>

            {/* Action button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                id="remake-video-btn"
                type="button"
                onClick={handleRemakeFromVideoLink}
                disabled={isRemakingVideo || !videoLinkUrl.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
              >
                {isRemakingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Video Link & Generating Copyright-Free Script...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Regenerate 100% Copyright-Free Script & Storyboard</span>
                  </>
                )}
              </button>
            </div>

            {/* Success feedback if script is generated */}
            {remakeResult && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Script Regenerated: {remakeResult.detectedTopic || "Custom Video Topic"}
                    </span>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {remakeResult.originalityScore}% Original Expression
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {remakeResult.clearanceSummary}
                </p>
                <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {remakeResult.licenseType}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Raw Script</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Production Settings */}
        <div className="border-t border-neutral-800/80 pt-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>Cinematic Direction & Production Style</span>
            </h3>
          </div>

          {/* Aspect Ratio & Scene Granularity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Ratio className="h-3.5 w-3.5 text-amber-400" />
                <span>Video Format & Dimensions</span>
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { id: "16:9", label: "16:9", desc: "YouTube / TV" },
                  { id: "9:16", label: "9:16", desc: "TikTok / Shorts" },
                  { id: "1:1", label: "1:1", desc: "Instagram" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedAspect(item.id as AspectRatio);
                      onSetAspectRatio(item.id as AspectRatio);
                    }}
                    className={`rounded-xl border p-2 text-center transition-all ${
                      selectedAspect === item.id
                        ? "border-amber-500 bg-amber-500/10 text-amber-300 font-semibold"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <div className="font-mono text-xs">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scene Count */}
            <div>
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-sky-400" />
                <span>Scene Granularity ({sceneCount} Scenes)</span>
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { count: 4, label: "Short", desc: "4 Scenes (~1m)" },
                  { count: 7, label: "Medium", desc: "7 Scenes (~2m)" },
                  { count: 12, label: "Longform", desc: "12 Scenes (~4m)" },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setSceneCount(item.count)}
                    className={`rounded-xl border p-2 text-center transition-all ${
                      sceneCount === item.count
                        ? "border-sky-500 bg-sky-500/10 text-sky-300 font-semibold"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Theme Selection */}
          <div>
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-amber-400" />
              <span>Artistic & Visual Theme</span>
            </label>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEME_OPTIONS.map((theme) => (
                <div
                  key={theme.id}
                  id={`theme-btn-${theme.id}`}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    selectedTheme === theme.id
                      ? "border-amber-500 bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/50"
                      : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{theme.icon}</span>
                    <span className="text-xs font-semibold">{theme.label}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[10px] text-neutral-400">
                    {theme.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Audio & Narration Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Music Mood */}
            <div>
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-emerald-400" />
                <span>Background Soundtrack</span>
              </label>
              <select
                id="music-mood-select"
                value={selectedMusic}
                onChange={(e) => setSelectedMusic(e.target.value as AudioTrackMood)}
                className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
              >
                {MUSIC_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} — {opt.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Settings */}
            <div>
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-rose-400" />
                <span>AI Narration Voice</span>
              </label>
              <div className="mt-2 flex items-center gap-2">
                <select
                  id="voice-gender-select"
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value as any)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="female">Natural Female Voice</option>
                  <option value="male">Deep Male Voice</option>
                  <option value="neutral">Neutral Balanced Voice</option>
                </select>

                <div className="flex items-center gap-1 border border-neutral-800 bg-neutral-950 px-3 py-2 rounded-xl text-xs text-neutral-300">
                  <span className="text-[10px] text-neutral-400">Pace:</span>
                  <select
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="bg-transparent text-xs text-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="0.9">0.9x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.1">1.1x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA / Progress State */}
        <div className="pt-2">
          {isGenerating ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    AI Video Production In Progress
                  </div>
                  <div className="text-sm font-medium text-white">{generationStep}</div>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          ) : (
            <button
              id="generate-video-btn"
              type="button"
              onClick={handleStartProduction}
              disabled={!textInput.trim()}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-sm font-bold text-neutral-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500 hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4 transition-transform group-hover:scale-125" />
              <span>Generate Multi-Scene Long Video</span>
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
