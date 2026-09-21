import React from "react";
import { Film, Sparkles, Download, Wand2, Compass, Ratio } from "lucide-react";
import { AspectRatio } from "../types";

interface HeaderProps {
  onOpenPresets: () => void;
  onOpenExport: () => void;
  onNewProject: () => void;
  aspectRatio: AspectRatio;
  onToggleAspectRatio: () => void;
  hasProject: boolean;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPresets,
  onOpenExport,
  onNewProject,
  aspectRatio,
  onToggleAspectRatio,
  hasProject,
  isGenerating,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Film className="h-5 w-5 text-neutral-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold tracking-tight text-white">
                CineText <span className="text-amber-400">AI</span>
              </h1>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                Long Video Studio
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Text & Article to Multi-Scene Cinematic Video
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset templates */}
          <button
            id="header-presets-btn"
            type="button"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Aspect Ratio Toggle */}
          <button
            id="header-aspect-ratio-btn"
            type="button"
            onClick={onToggleAspectRatio}
            title="Switch Aspect Ratio (16:9 Landscape / 9:16 Portrait / 1:1 Square)"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Ratio className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-mono">{aspectRatio}</span>
          </button>

          {/* New Script / Project */}
          <button
            id="header-new-project-btn"
            type="button"
            onClick={onNewProject}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
          >
            <Wand2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">New Script</span>
          </button>

          {/* Export Video Button */}
          {hasProject && (
            <button
              id="header-export-btn"
              type="button"
              onClick={onOpenExport}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Video</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
