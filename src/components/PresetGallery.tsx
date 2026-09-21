import React from "react";
import { X, Sparkles, Clock, Film, Play } from "lucide-react";
import { VisualTheme, AudioTrackMood } from "../types";

export interface PresetItem {
  id: string;
  title: string;
  category: string;
  theme: VisualTheme;
  audioMood: AudioTrackMood;
  targetDuration: "short" | "medium" | "long";
  sceneCount: number;
  text: string;
}

export const SAMPLE_PRESETS: PresetItem[] = [
  {
    id: "deep-ocean",
    title: "The Abyssal Realm: Mysteries of the Mariana Trench",
    category: "Nature & Science",
    theme: "documentary",
    audioMood: "ambient-calm",
    targetDuration: "medium",
    sceneCount: 6,
    text: `Far beneath the sunlit waves of the Pacific lies the deepest scar on planet Earth: the Mariana Trench. 
Descending past the twilight zone, sunlight vanishes completely at one thousand meters. 
Down here, under colossal pressures exceeding one thousand atmospheres, life doesn't merely survive; it flourishes in forms stranger than science fiction.
Bioluminescent anglerfish cast ghostly lures into the freezing blackness, guiding unsuspecting prey into rows of needle-sharp teeth.
Near hydrothermal vents spewing superheated mineral plumes, blind ghost shrimp and giant tube worms feed on chemosynthetic bacteria, completely divorced from solar energy.
Exploring this abyss reminds us that the greatest frontiers of alien life are not light-years away in outer space, but nestled in the silent depths of our own home world.`,
  },
  {
    id: "ai-future-2050",
    title: "Synthetic Dawn: How AGI Will Reshape Humanity by 2050",
    category: "Futurism & Tech",
    theme: "scifi",
    audioMood: "synthwave-retro",
    targetDuration: "medium",
    sceneCount: 7,
    text: `By the middle of the twenty-first century, humanity crossed a quiet threshold.
Artificial General Intelligence ceased to be a laboratory ambition and became the invisible architecture of global civilization.
Smart cities breathe through self-healing grid networks, choreographing automated transport, vertical harvest towers, and zero-emission fusion hubs.
In medicine, generative molecular architects design bespoke cures in microseconds, turning once-fatal genetic diseases into historic relics.
Yet the ultimate questions remain human: as machine cognition surpasses biological thought, who are we when labor is no longer necessary?
The dawn of synthetic minds has not replaced our purpose; it has magnified our collective responsibility to seek wonder, ethics, and universal empathy.`,
  },
  {
    id: "ancient-rome",
    title: "Iron & Marble: The Rise and Triumph of the Roman Legion",
    category: "History",
    theme: "cinematic",
    audioMood: "cinematic-epic",
    targetDuration: "medium",
    sceneCount: 6,
    text: `From seven humble mudbrick hills along the Tiber River emerged the greatest military machine of antiquity.
The Roman legion was not merely an army; it was an engineering marvel forged in discipline, asphalt-straight roads, and unyielding tactical geometry.
Standard-bearers held high the golden Aquila eagle, marching across the scorching sands of North Africa to the misty rain-soaked forests of Britannia.
In siege after siege, Roman sappers bridged raging rivers in days and encircled fortified citadels with impenetrable walls of turf and timber.
Though empires eventually crumble into dust and moss, Rome’s monumental laws, aqueducts, and civic spirit left an indelible imprint on human destiny.`,
  },
  {
    id: "cyberpunk-tokyo",
    title: "Neon Rain: Midnight Chronicles of Neo-Shibuya",
    category: "Sci-Fi Fiction",
    theme: "cyberpunk",
    audioMood: "synthwave-retro",
    targetDuration: "short",
    sceneCount: 5,
    text: `Rain falls in electric violet sheets over the endless spires of Neo-Shibuya.
Holographic advertisements flicker against chrome skyscrapers, casting shimmering reflections across steam-drenched asphalt alleys.
Sub-level courier drones zip silently through magnetic channels, delivering quantum encrypted data chips to underground resistance cells.
In the crowded ramen stalls beneath the elevated maglev tracks, synthetic augmentations hum in quiet harmony with human conversation.
Here in the labyrinth of eternal midnight, every flashing light holds a memory, and every shadow guards a future waiting to be ignited.`,
  },
  {
    id: "stoic-wisdom",
    title: "The Citadel of the Mind: Stoic Secrets for Inner Peace",
    category: "Philosophy",
    theme: "vintage",
    audioMood: "ambient-calm",
    targetDuration: "medium",
    sceneCount: 6,
    text: `Two thousand years ago, an emperor sat in his war tent on the frozen frontier of the Danube, writing notes to himself.
Marcus Aurelius did not write for fame or followers; he wrote to fortify his soul against fear, grief, and chaos.
The central doctrine of the Stoics is disarmingly simple: you cannot control external events, but you retain absolute sovereignty over your mind.
When storm clouds gather and life’s demands threaten to overwhelm you, retreat inward to that inner citadel where no rumor or misfortune can harm your integrity.
Realize this, said the emperor, and you will find your greatest strength: peace is not the absence of trouble, but the mastery of your reaction to it.`,
  },
];

interface PresetGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetItem) => void;
}

export const PresetGallery: React.FC<PresetGalleryProps> = ({ isOpen, onClose, onSelectPreset }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        id="preset-gallery-modal"
        className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-display">
              Ready-Made Long Video Storyboards
            </h2>
          </div>
          <button
            id="close-presets-btn"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-xs text-neutral-400">
          Select any curated script to instantly build and preview a multi-scene cinematic video.
        </p>

        <div className="mt-4 grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {SAMPLE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              id={`preset-card-${preset.id}`}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="group relative cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 hover:border-amber-500/50 hover:bg-neutral-800/60 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 text-[10px] font-medium text-amber-300 uppercase tracking-wider">
                      {preset.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {preset.sceneCount} Scenes (~1-2m)
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Film className="h-3 w-3" />
                      {preset.theme} style
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-sm font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                    {preset.text}
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
