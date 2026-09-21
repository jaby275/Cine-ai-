export type AspectRatio = '16:9' | '9:16' | '1:1';

export type VisualTheme = 
  | 'cinematic' 
  | 'documentary' 
  | 'anime' 
  | 'scifi' 
  | '3d-render' 
  | 'vintage' 
  | 'watercolor' 
  | 'cyberpunk';

export type AudioTrackMood = 
  | 'cinematic-epic' 
  | 'ambient-calm' 
  | 'synthwave-retro' 
  | 'lofi-chill' 
  | 'tension-suspense' 
  | 'none';

export type CameraMotion = 
  | 'zoom-in' 
  | 'zoom-out' 
  | 'pan-left' 
  | 'pan-right' 
  | 'tilt-up' 
  | 'dynamic-drift';

export type TransitionType = 
  | 'fade' 
  | 'crossfade' 
  | 'dissolve' 
  | 'flash' 
  | 'cut';

export interface SubtitleWord {
  word: string;
  start: number; // in seconds relative to scene start
  end: number;
}

export interface VideoScene {
  id: string;
  sceneNumber: number;
  title: string;
  narration: string;
  duration: number; // seconds
  visualPrompt: string;
  visualUrl: string;
  videoUrl?: string; // Optional direct royalty-free video clip URL (e.g. MP4/WebM)
  cameraMotion: CameraMotion;
  transition: TransitionType;
  moodColor: string; // hex or rgb
  overlayText?: string;
  subtitles?: SubtitleWord[];
  isCopyrightFree?: boolean;
  copyrightSource?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  topic: string;
  originalText: string;
  description: string;
  aspectRatio: AspectRatio;
  theme: VisualTheme;
  audioMood: AudioTrackMood;
  voiceGender: 'neutral' | 'female' | 'male';
  voiceRate: number; // 0.8 to 1.3
  voicePitch: number; // 0.8 to 1.2
  scenes: VideoScene[];
  totalDuration: number; // seconds
  createdAt: number;
  sourceVideoLink?: string;
  copyrightFreeCertified?: boolean;
  licenseType?: string;
}

export interface StockVideoClip {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  license: string;
  description: string;
}

export interface StoryboardResponse {
  title: string;
  description: string;
  theme: VisualTheme;
  suggestedMusicMood: AudioTrackMood;
  scenes: {
    sceneNumber: number;
    title: string;
    narration: string;
    duration: number;
    visualPrompt: string;
    cameraMotion: CameraMotion;
    transition: TransitionType;
    moodColor: string;
    overlayText?: string;
  }[];
}
