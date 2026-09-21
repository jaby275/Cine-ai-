import React, { useState } from "react";
import {
  Film,
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Sparkles,
  Upload,
  Camera,
  Clock,
  Check,
  X,
  RefreshCw,
  Video,
  Link as LinkIcon,
  ShieldCheck,
  Play,
} from "lucide-react";
import { VideoScene, VideoProject, CameraMotion, TransitionType } from "../types";
import { generateProceduralSceneArtwork } from "../utils/visualArtist";
import { COPYRIGHT_FREE_STOCK_VIDEOS } from "../data/stockVideos";

interface VideoTimelineProps {
  project: VideoProject;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScene: (sceneIndex: number, updated: Partial<VideoScene>) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneIndex: number) => void;
  onDuplicateScene: (sceneIndex: number) => void;
  onMoveScene: (sceneIndex: number, direction: "left" | "right") => void;
}

const MOTION_OPTIONS: { id: CameraMotion; label: string }[] = [
  { id: "zoom-in", label: "Slow Zoom In" },
  { id: "zoom-out", label: "Slow Zoom Out" },
  { id: "pan-left", label: "Pan Left" },
  { id: "pan-right", label: "Pan Right" },
  { id: "tilt-up", label: "Tilt Upward" },
  { id: "dynamic-drift", label: "Dynamic Drift" },
];

const TRANSITION_OPTIONS: { id: TransitionType; label: string }[] = [
  { id: "fade", label: "Fade Through Black" },
  { id: "crossfade", label: "Cross-Dissolve" },
  { id: "dissolve", label: "Soft Dissolve" },
  { id: "flash", label: "Film Flash" },
  { id: "cut", label: "Hard Cut" },
];

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onAddScene,
  onDeleteScene,
  onDuplicateScene,
  onMoveScene,
}) => {
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editNarration, setEditNarration] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState(8);
  const [editMotion, setEditMotion] = useState<CameraMotion>("zoom-in");
  const [editTransition, setEditTransition] = useState<TransitionType>("fade");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [mediaMode, setMediaMode] = useState<"ai-artwork" | "video-link">("ai-artwork");
  const [isRegeneratingVisual, setIsRegeneratingVisual] = useState(false);

  const openEditor = (idx: number) => {
    const sc = project.scenes[idx];
    if (!sc) return;
    setEditingSceneIndex(idx);
    setEditTitle(sc.title);
    setEditNarration(sc.narration);
    setEditPrompt(sc.visualPrompt);
    setEditDuration(sc.duration);
    setEditMotion(sc.cameraMotion);
    setEditTransition(sc.transition);
    setEditVideoUrl(sc.videoUrl || "");
    setMediaMode(sc.videoUrl ? "video-link" : "ai-artwork");
  };

  const saveSceneEdits = () => {
    if (editingSceneIndex === null) return;
    onUpdateScene(editingSceneIndex, {
      title: editTitle,
      narration: editNarration,
      visualPrompt: editPrompt,
      duration: editDuration,
      cameraMotion: editMotion,
      transition: editTransition,
      videoUrl: editVideoUrl.trim() || undefined,
      isCopyrightFree: true,
    });
    setEditingSceneIndex(null);
  };

  // Re-generate visual for scene
  const handleRegenerateVisual = async () => {
    if (editingSceneIndex === null) return;
    setIsRegeneratingVisual(true);
    const scene = project.scenes[editingSceneIndex];

    try {
      // First try server-side Gemini generation
      const res = await fetch("/api/video/generate-scene-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editPrompt || scene.visualPrompt,
          theme: project.theme,
          aspectRatio: project.aspectRatio,
          sceneNumber: scene.sceneNumber,
        }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        onUpdateScene(editingSceneIndex, { visualUrl: data.imageUrl });
      } else {
        // Fallback procedural artwork with custom prompt seed
        const procedural = generateProceduralSceneArtwork({
          prompt: editPrompt || scene.visualPrompt,
          theme: project.theme,
          aspectRatio: project.aspectRatio,
          sceneNumber: scene.sceneNumber + Math.floor(Math.random() * 50),
          moodColor: scene.moodColor,
          title: editTitle,
        });
        onUpdateScene(editingSceneIndex, { visualUrl: procedural });
      }
    } catch (err) {
      console.warn("Visual regeneration fallback:", err);
      const procedural = generateProceduralSceneArtwork({
        prompt: editPrompt || scene.visualPrompt,
        theme: project.theme,
        aspectRatio: project.aspectRatio,
        sceneNumber: scene.sceneNumber + Math.floor(Math.random() * 50),
        moodColor: scene.moodColor,
      });
      onUpdateScene(editingSceneIndex, { visualUrl: procedural });
    } finally {
      setIsRegeneratingVisual(false);
    }
  };

  // Custom Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingSceneIndex === null || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onUpdateScene(editingSceneIndex, { visualUrl: event.target.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full space-y-4">
      {/* Timeline Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-amber-400" />
          <h3 className="font-display text-sm font-bold text-white">
            Multi-Scene Timeline ({project.scenes.length} Scenes)
          </h3>
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-400">
            Total {project.totalDuration}s
          </span>
        </div>

        <button
          id="add-scene-btn"
          type="button"
          onClick={onAddScene}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/90 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:border-amber-500 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-amber-400" />
          <span>Add Scene</span>
        </button>
      </div>

      {/* Horizontal Storyboard Track */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-track-neutral-900 scrollbar-thumb-neutral-700">
        {project.scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;

          return (
            <div
              key={scene.id}
              id={`timeline-scene-card-${scene.sceneNumber}`}
              onClick={() => onSelectScene(idx)}
              className={`group relative flex w-64 shrink-0 flex-col rounded-xl border p-3 transition-all cursor-pointer ${
                isActive
                  ? "border-amber-500 bg-neutral-900/90 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                  : "border-neutral-800 bg-neutral-950/70 hover:border-neutral-700 hover:bg-neutral-900/50"
              }`}
            >
              {/* Scene Number & Duration badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-amber-400" : "text-neutral-400"}`}>
                  Scene {scene.sceneNumber}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                  <Clock className="h-3 w-3" />
                  {scene.duration}s
                </span>
              </div>

              {/* Thumbnail Visual with Camera Motion Badge */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
                {scene.visualUrl ? (
                  <img
                    src={scene.visualUrl}
                    alt={scene.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-500 text-xs">
                    No visual
                  </div>
                )}

                {/* Motion pill */}
                <div className="absolute bottom-1.5 left-1.5 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[9px] font-mono text-neutral-300 backdrop-blur-md flex items-center gap-1">
                  {scene.videoUrl && <Video className="h-2.5 w-2.5 text-amber-400" />}
                  <span>{scene.cameraMotion}</span>
                </div>

                {/* Video Clip Indicator Pill */}
                {scene.videoUrl && (
                  <div className="absolute top-1.5 right-1.5 rounded-md bg-amber-500/90 text-neutral-950 font-bold px-1.5 py-0.5 text-[9px] shadow-md flex items-center gap-0.5">
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>VIDEO</span>
                  </div>
                )}
              </div>

              {/* Title & Narration Preview */}
              <div className="mt-2.5 flex-1">
                <h4 className="font-display text-xs font-semibold text-white line-clamp-1">
                  {scene.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-[11px] text-neutral-400 leading-relaxed">
                  {scene.narration}
                </p>
              </div>

              {/* Action Buttons on Hover */}
              <div className="mt-3 flex items-center justify-between border-t border-neutral-800/80 pt-2 text-neutral-400">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move Left"
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveScene(idx, "left");
                    }}
                    className="rounded p-1 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
                  >
                    <ArrowLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title="Move Right"
                    disabled={idx === project.scenes.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveScene(idx, "right");
                    }}
                    className="rounded p-1 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Edit Scene"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditor(idx);
                    }}
                    className="rounded p-1 text-amber-400 hover:bg-neutral-800 hover:text-amber-300"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateScene(idx);
                    }}
                    className="rounded p-1 hover:bg-neutral-800 hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    disabled={project.scenes.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScene(idx);
                    }}
                    className="rounded p-1 text-rose-400 hover:bg-neutral-800 hover:text-rose-300 disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scene Detail Editor Modal */}
      {editingSceneIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            id="scene-editor-modal"
            className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-base font-bold text-white">
                  Edit Scene {editingSceneIndex + 1} Directing & Script
                </h3>
              </div>
              <button
                onClick={() => setEditingSceneIndex(null)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-300">Scene Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-300">Duration (seconds)</label>
                <input
                  type="number"
                  min={4}
                  max={30}
                  value={editDuration}
                  onChange={(e) => setEditDuration(Math.max(4, parseInt(e.target.value) || 6))}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Narration Script */}
            <div>
              <label className="text-xs font-semibold text-neutral-300">
                Spoken Voiceover Narration (Spoken during this scene)
              </label>
              <textarea
                rows={3}
                value={editNarration}
                onChange={(e) => setEditNarration(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-100 focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Visual Media Selection: AI Artwork or Copyright-Free Video Clip */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaMode("ai-artwork")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      mediaMode === "ai-artwork"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Visual Artwork</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaMode("video-link")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      mediaMode === "video-link"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Copyright-Free Video Link</span>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1 py-0.2">CC0</span>
                  </button>
                </div>

                {mediaMode === "ai-artwork" && (
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-[11px] text-neutral-300 hover:bg-neutral-700 transition-colors">
                      <Upload className="h-3 w-3" />
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={handleRegenerateVisual}
                      disabled={isRegeneratingVisual}
                      className="flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${isRegeneratingVisual ? "animate-spin" : ""}`} />
                      <span>Re-Roll</span>
                    </button>
                  </div>
                )}
              </div>

              {mediaMode === "ai-artwork" ? (
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">
                    Cinematic Visual Description Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                    placeholder="Describe scene visual atmosphere, lighting, camera lens..."
                  />
                  {editVideoUrl && (
                    <p className="mt-1 text-[10px] text-amber-400/80">
                      Note: Scene currently has an active video clip. Switching to AI Artwork will use the generated image.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1">
                        <LinkIcon className="h-3.5 w-3.5 text-amber-400" />
                        <span>Direct Video Link (MP4, WebM, Pexels, Royalty-Free URL)</span>
                      </span>
                      {editVideoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditVideoUrl("")}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Clear Video
                        </button>
                      )}
                    </label>
                    <input
                      type="url"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      placeholder="https://example.com/footage.mp4 or select a copyright-free clip below"
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Curated Copyright-Free Video Library Quick Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>1-Click Curated Copyright-Free Clips (100% Cleared)</span>
                      </span>
                      <span className="text-[10px] text-neutral-500">Commercial Safe</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COPYRIGHT_FREE_STOCK_VIDEOS.map((clip) => (
                        <button
                          key={clip.id}
                          type="button"
                          onClick={() => setEditVideoUrl(clip.videoUrl)}
                          className={`group/clip relative overflow-hidden rounded-lg border p-1 text-left transition-all ${
                            editVideoUrl === clip.videoUrl
                              ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                              : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700"
                          }`}
                        >
                          <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
                            <img
                              src={clip.thumbnailUrl}
                              alt={clip.title}
                              className="h-full w-full object-cover group-hover/clip:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity">
                              <Play className="h-4 w-4 text-white fill-current" />
                            </div>
                            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[8px] text-emerald-400 font-bold">
                              CC0
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-[10px] font-medium text-neutral-200">
                            {clip.title}
                          </p>
                          <p className="line-clamp-1 text-[9px] text-neutral-500">
                            {clip.category}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Motion & Transition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-sky-400" />
                  <span>Camera Movement Effect</span>
                </label>
                <select
                  value={editMotion}
                  onChange={(e) => setEditMotion(e.target.value as CameraMotion)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                >
                  {MOTION_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300">Scene Transition In</label>
                <select
                  value={editTransition}
                  onChange={(e) => setEditTransition(e.target.value as TransitionType)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                >
                  {TRANSITION_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingSceneIndex(null)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSceneEdits}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400"
              >
                <Check className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
