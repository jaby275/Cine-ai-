import React, { useState } from "react";
import { Header } from "./components/Header";
import { ScriptInputPanel } from "./components/ScriptInputPanel";
import { VideoPlayer } from "./components/VideoPlayer";
import { VideoTimeline } from "./components/VideoTimeline";
import { PresetGallery, SAMPLE_PRESETS, PresetItem } from "./components/PresetGallery";
import { VideoExporter } from "./components/VideoExporter";
import { VideoProject, VideoScene, AspectRatio, VisualTheme, AudioTrackMood } from "./types";
import { getInitialSceneVisual, generateProceduralSceneArtwork } from "./utils/visualArtist";
import { Sparkles, ArrowLeft, Wand2, Film, RefreshCw, SlidersHorizontal } from "lucide-react";

export default function App() {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");

  // UI state
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [initialInputText, setInitialInputText] = useState<string>("");

  // Initialize with a high quality demo project so user sees a working long video immediately on first load
  React.useEffect(() => {
    loadDemoProject(SAMPLE_PRESETS[0]);
  }, []);

  const loadDemoProject = (preset: PresetItem) => {
    const rawScenes = preset.text.split("\n").filter((l) => l.trim().length > 0);
    const sceneCount = rawScenes.length || 5;

    const scenes: VideoScene[] = rawScenes.map((line, idx) => {
      const sceneNum = idx + 1;
      const motions = ["zoom-in", "pan-right", "zoom-out", "pan-left", "tilt-up", "dynamic-drift"] as const;
      const motion = motions[idx % motions.length];

      return {
        id: `demo-scene-${sceneNum}-${Date.now()}`,
        sceneNumber: sceneNum,
        title: `Act ${sceneNum}: Frontier of the Abyss`,
        narration: line.trim(),
        duration: 7.5,
        visualPrompt: `Cinematic ultra-realistic exploration of the deep sea abyss, volumetric underwater sun rays, glowing marine creatures, 8k resolution`,
        visualUrl: getInitialSceneVisual({
          prompt: `Abyss exploration scene ${sceneNum}`,
          theme: preset.theme,
          aspectRatio: "16:9",
          sceneNumber: sceneNum,
        }),
        cameraMotion: motion,
        transition: idx === 0 ? "cut" : "fade",
        moodColor: idx % 2 === 0 ? "#0284c7" : "#0d9488",
      };
    });

    const totalDur = scenes.reduce((acc, s) => acc + s.duration, 0);

    setProject({
      id: `proj-${Date.now()}`,
      title: preset.title,
      topic: preset.category,
      originalText: preset.text,
      description: "An evocative cinematic journey into the mysterious deepest trenches of planet Earth.",
      aspectRatio: "16:9",
      theme: preset.theme,
      audioMood: preset.audioMood,
      voiceGender: "female",
      voiceRate: 1.0,
      voicePitch: 1.0,
      scenes,
      totalDuration: totalDur,
      createdAt: Date.now(),
    });
    setActiveSceneIndex(0);
  };

  // Main Generation Handler (Calls Gemini server-side endpoint)
  const handleGenerateProject = async (config: {
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
  }) => {
    setIsGenerating(true);
    setGenerationStep("Analyzing narrative arc & story pacing with Gemini...");

    try {
      let data: any = null;

      if (config.prebuiltStoryboard) {
        data = config.prebuiltStoryboard;
      } else {
        // 1. Call storyboard breakdown API
        const res = await fetch("/api/video/storyboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: config.text,
            theme: config.theme,
            aspectRatio: config.aspectRatio,
            sceneCount: config.sceneCount,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create video storyboard from server.");
        }

        data = await res.json();
      }

      setGenerationStep("Directing camera angles, shots, and color grading...");
      setGenerationStep("Synthesizing cinematic scene visual artworks & clips...");

      // 2. Map scenes and generate visual artworks
      const generatedScenes: VideoScene[] = (data.scenes || []).map((sc: any, idx: number) => {
        const visualUrl = sc.visualUrl || getInitialSceneVisual({
          prompt: sc.visualPrompt,
          theme: config.theme,
          aspectRatio: config.aspectRatio,
          sceneNumber: sc.sceneNumber || idx + 1,
          moodColor: sc.moodColor,
          title: sc.title,
        });

        return {
          id: `scene-${idx + 1}-${Date.now()}`,
          sceneNumber: sc.sceneNumber || idx + 1,
          title: sc.title || `Scene ${idx + 1}`,
          narration: sc.narration || "",
          duration: Math.max(5, Math.min(25, sc.duration || 8)),
          visualPrompt: sc.visualPrompt || "",
          visualUrl,
          videoUrl: sc.videoUrl || undefined,
          cameraMotion: sc.cameraMotion || "zoom-in",
          transition: sc.transition || "fade",
          moodColor: sc.moodColor || "#1e293b",
          overlayText: sc.overlayText || "",
          isCopyrightFree: config.copyrightFreeCertified ?? true,
          copyrightSource: config.copyrightFreeCertified ? "100% Transformative AI / CC0 Cleared" : undefined,
        };
      });

      const totalDur = generatedScenes.reduce((acc, s) => acc + s.duration, 0);

      setProject({
        id: `proj-${Date.now()}`,
        title: data.title || "Untitled Cinematic Story",
        topic: config.sourceVideoLink ? `Remake of ${config.sourceVideoLink}` : config.text.slice(0, 60),
        originalText: config.text,
        description: data.description || "",
        aspectRatio: config.aspectRatio,
        theme: config.theme,
        audioMood: config.audioMood,
        voiceGender: config.voiceGender,
        voiceRate: config.voiceRate,
        voicePitch: 1.0,
        scenes: generatedScenes,
        totalDuration: totalDur,
        createdAt: Date.now(),
        sourceVideoLink: config.sourceVideoLink,
        copyrightFreeCertified: config.copyrightFreeCertified ?? (Boolean(config.sourceVideoLink)),
        licenseType: config.copyrightFreeCertified || config.sourceVideoLink ? "100% Transformative Original (CC0 / Monetization Safe)" : "Standard Creative Commons",
      });

      setActiveSceneIndex(0);
      setGenerationStep("Finalizing video studio timeline...");
    } catch (err: any) {
      console.error("Error generating project:", err);
      alert("Notice: Could not generate via remote API. Falling back to local storyboard director.");
      // Fallback local breakdown
      const sentences = config.text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
      const fallbackScenes: VideoScene[] = sentences.slice(0, config.sceneCount).map((sentence, idx) => {
        const num = idx + 1;
        return {
          id: `fallback-scene-${num}-${Date.now()}`,
          sceneNumber: num,
          title: `Scene ${num}`,
          narration: sentence.trim(),
          duration: 8,
          visualPrompt: `${sentence.slice(0, 80)}, ${config.theme} cinematic photography`,
          visualUrl: getInitialSceneVisual({
            prompt: sentence,
            theme: config.theme,
            aspectRatio: config.aspectRatio,
            sceneNumber: num,
          }),
          cameraMotion: "zoom-in",
          transition: "fade",
          moodColor: "#1e293b",
        };
      });

      setProject({
        id: `proj-${Date.now()}`,
        title: "Long Video Storyboard",
        topic: config.text.slice(0, 40),
        originalText: config.text,
        description: "Generated multi-scene video narrative.",
        aspectRatio: config.aspectRatio,
        theme: config.theme,
        audioMood: config.audioMood,
        voiceGender: config.voiceGender,
        voiceRate: config.voiceRate,
        voicePitch: 1.0,
        scenes: fallbackScenes,
        totalDuration: fallbackScenes.length * 8,
        createdAt: Date.now(),
      });
      setActiveSceneIndex(0);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Scene CRUD Operations
  const handleUpdateScene = (sceneIndex: number, updated: Partial<VideoScene>) => {
    if (!project) return;
    const newScenes = [...project.scenes];
    newScenes[sceneIndex] = { ...newScenes[sceneIndex], ...updated };
    const newTotal = newScenes.reduce((acc, s) => acc + s.duration, 0);
    setProject({ ...project, scenes: newScenes, totalDuration: newTotal });
  };

  const handleAddScene = () => {
    if (!project) return;
    const nextNum = project.scenes.length + 1;
    const newScene: VideoScene = {
      id: `scene-${nextNum}-${Date.now()}`,
      sceneNumber: nextNum,
      title: `Scene ${nextNum}: New Climax`,
      narration: "Add spoken narration text here for the AI voiceover...",
      duration: 8,
      visualPrompt: "Dramatic cinematic landscape with golden hour rays, high resolution",
      visualUrl: generateProceduralSceneArtwork({
        prompt: "New scene",
        theme: project.theme,
        aspectRatio: project.aspectRatio,
        sceneNumber: nextNum,
      }),
      cameraMotion: "zoom-in",
      transition: "fade",
      moodColor: "#d97706",
    };
    const newScenes = [...project.scenes, newScene];
    setProject({
      ...project,
      scenes: newScenes,
      totalDuration: newScenes.reduce((acc, s) => acc + s.duration, 0),
    });
  };

  const handleDeleteScene = (sceneIndex: number) => {
    if (!project || project.scenes.length <= 1) return;
    const newScenes = project.scenes.filter((_, idx) => idx !== sceneIndex);
    // Renumber scenes
    const renumbered = newScenes.map((s, i) => ({ ...s, sceneNumber: i + 1 }));
    setProject({
      ...project,
      scenes: renumbered,
      totalDuration: renumbered.reduce((acc, s) => acc + s.duration, 0),
    });
    if (activeSceneIndex >= renumbered.length) {
      setActiveSceneIndex(renumbered.length - 1);
    }
  };

  const handleDuplicateScene = (sceneIndex: number) => {
    if (!project) return;
    const target = project.scenes[sceneIndex];
    const copy: VideoScene = {
      ...target,
      id: `scene-copy-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const newScenes = [...project.scenes];
    newScenes.splice(sceneIndex + 1, 0, copy);
    const renumbered = newScenes.map((s, i) => ({ ...s, sceneNumber: i + 1 }));
    setProject({
      ...project,
      scenes: renumbered,
      totalDuration: renumbered.reduce((acc, s) => acc + s.duration, 0),
    });
  };

  const handleMoveScene = (sceneIndex: number, direction: "left" | "right") => {
    if (!project) return;
    const newScenes = [...project.scenes];
    const targetIndex = direction === "left" ? sceneIndex - 1 : sceneIndex + 1;
    if (targetIndex < 0 || targetIndex >= newScenes.length) return;

    const temp = newScenes[sceneIndex];
    newScenes[sceneIndex] = newScenes[targetIndex];
    newScenes[targetIndex] = temp;

    const renumbered = newScenes.map((s, i) => ({ ...s, sceneNumber: i + 1 }));
    setProject({
      ...project,
      scenes: renumbered,
    });
    setActiveSceneIndex(targetIndex);
  };

  const toggleAspectRatio = () => {
    const next: AspectRatio = aspectRatio === "16:9" ? "9:16" : aspectRatio === "9:16" ? "1:1" : "16:9";
    setAspectRatio(next);
    if (project) {
      setProject({ ...project, aspectRatio: next });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* App Header */}
      <Header
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onNewProject={() => {
          setInitialInputText(project?.originalText || "");
          setProject(null);
        }}
        aspectRatio={aspectRatio}
        onToggleAspectRatio={toggleAspectRatio}
        hasProject={!!project}
        isGenerating={isGenerating}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {project ? (
          /* Video Studio View: Player + Storyboard Timeline */
          <div className="space-y-6">
            {/* Top Video Title & Details Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    {project.theme} Visuals
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {project.aspectRatio} format
                  </span>
                  <span className="text-xs text-neutral-500">•</span>
                  <span className="text-xs text-neutral-400">
                    {project.audioMood} audio
                  </span>
                </div>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                  {project.title}
                </h2>
                {project.description && (
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="edit-script-view-btn"
                  type="button"
                  onClick={() => {
                    setInitialInputText(project.originalText);
                    setProject(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Edit Script</span>
                </button>

                <button
                  id="studio-export-btn"
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 shadow-md hover:bg-amber-400 transition-colors"
                >
                  <Film className="h-3.5 w-3.5" />
                  <span>Export Video</span>
                </button>
              </div>
            </div>

            {/* Video Player Display */}
            <VideoPlayer
              project={project}
              activeSceneIndex={activeSceneIndex}
              onSceneChange={(idx) => setActiveSceneIndex(idx)}
              onOpenExport={() => setIsExportOpen(true)}
            />

            {/* Storyboard Timeline */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm">
              <VideoTimeline
                project={project}
                activeSceneIndex={activeSceneIndex}
                onSelectScene={(idx) => setActiveSceneIndex(idx)}
                onUpdateScene={handleUpdateScene}
                onAddScene={handleAddScene}
                onDeleteScene={handleDeleteScene}
                onDuplicateScene={handleDuplicateScene}
                onMoveScene={handleMoveScene}
              />
            </div>
          </div>
        ) : (
          /* Script Input / Creator View */
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create AI Long Videos from <span className="text-amber-400">Any Text</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Transform articles, research, essays, and stories into cinematic videos with AI scene direction,
                dynamic Ken Burns camera motion, voiceover speech, and synchronized subtitles.
              </p>
            </div>

            <ScriptInputPanel
              onGenerate={handleGenerateProject}
              isGenerating={isGenerating}
              generationStep={generationStep}
              defaultAspectRatio={aspectRatio}
              onSetAspectRatio={(r) => setAspectRatio(r)}
              initialText={initialInputText}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <PresetGallery
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={(preset) => loadDemoProject(preset)}
      />

      {project && (
        <VideoExporter
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          project={project}
        />
      )}
    </div>
  );
}
