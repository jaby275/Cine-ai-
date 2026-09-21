import { AudioTrackMood } from "../types";

export interface AudioEngineCallbacks {
  onWordSpoken?: (wordIndex: number, charIndex: number) => void;
  onSceneSpeechEnd?: () => void;
  onError?: (err: any) => void;
}

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private currentMood: AudioTrackMood = "cinematic-epic";
  private isMusicPlaying = false;
  private timerId: number | null = null;
  private isDucked = false;
  private musicVolume = 0.35;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioCtx.currentTime);

      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);

      // Create stream destination for video recording export
      this.destinationNode = this.audioCtx.createMediaStreamDestination();
      this.masterGain.connect(this.destinationNode);
    }

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public getMediaStream(): MediaStream | null {
    this.initContext();
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.audioCtx) {
      const target = this.isDucked ? this.musicVolume * 0.25 : this.musicVolume;
      this.musicGain.gain.linearRampToValueAtTime(target, this.audioCtx.currentTime + 0.1);
    }
  }

  public duckMusic(duck: boolean) {
    this.isDucked = duck;
    if (this.musicGain && this.audioCtx) {
      const target = duck ? this.musicVolume * 0.25 : this.musicVolume;
      this.musicGain.gain.linearRampToValueAtTime(target, this.audioCtx.currentTime + 0.3);
    }
  }

  public setMood(mood: AudioTrackMood) {
    this.currentMood = mood;
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic(mood);
    }
  }

  /**
   * Procedurally plays soothing or cinematic background music using Web Audio synthesis
   */
  public startMusic(mood: AudioTrackMood = this.currentMood) {
    this.initContext();
    if (!this.audioCtx || !this.musicGain) return;
    if (mood === "none") {
      this.stopMusic();
      return;
    }

    this.stopMusic();
    this.isMusicPlaying = true;
    this.currentMood = mood;

    // Chord progressions in frequencies
    // Cinematic D Minor: Dm, Bb, F, C
    const cinematicChords = [
      [146.83, 220.0, 261.63, 349.23], // Dm7 (D3, A3, C4, F4)
      [116.54, 233.08, 293.66, 349.23], // Bbmaj7 (Bb2, Bb3, D4, F4)
      [174.61, 261.63, 329.63, 440.0], // Fmaj7 (F3, C4, E4, A4)
      [130.81, 196.0, 246.94, 329.63], // C/E (C3, G3, B3, E4)
    ];

    // Ambient Calm: Pentatonic lush pads
    const ambientChords = [
      [130.81, 196.0, 261.63, 329.63, 392.0], // C maj9
      [146.83, 220.0, 293.66, 369.99], // D sus2
      [164.81, 246.94, 329.63, 392.0], // Em7
      [174.61, 261.63, 349.23, 440.0], // Fmaj9
    ];

    // Synthwave: Minor arpeggiated drive
    const synthwaveChords = [
      [110.0, 164.81, 220.0, 277.18], // A minor
      [97.99, 146.83, 196.0, 246.94], // G
      [87.31, 130.81, 174.61, 220.0], // F
      [82.41, 123.47, 164.81, 207.65], // E
    ];

    // Lofi Chill: warm 7th chords
    const lofiChords = [
      [130.81, 207.65, 261.63, 311.13], // Cm7
      [116.54, 174.61, 233.08, 277.18], // Bbm7
      [103.83, 155.56, 207.65, 246.94], // Abmaj7
      [123.47, 185.0, 246.94, 293.66], // G7sus
    ];

    // Tension Suspense: low drone + tritone beats
    const tensionChords = [
      [73.42, 110.0, 155.56, 220.0], // D + tritone Ab
      [65.41, 98.0, 138.59, 196.0],
      [73.42, 103.83, 146.83, 207.65],
      [61.74, 92.5, 130.81, 185.0],
    ];

    let chordBank = cinematicChords;
    if (mood === "ambient-calm") chordBank = ambientChords;
    else if (mood === "synthwave-retro") chordBank = synthwaveChords;
    else if (mood === "lofi-chill") chordBank = lofiChords;
    else if (mood === "tension-suspense") chordBank = tensionChords;

    let chordIndex = 0;

    const playChord = () => {
      if (!this.isMusicPlaying || !this.audioCtx || !this.musicGain) return;

      const chord = chordBank[chordIndex % chordBank.length];
      chordIndex++;

      const now = this.audioCtx.currentTime;
      const duration = 5.0; // 5 seconds per chord transition

      chord.forEach((freq, idx) => {
        if (!this.audioCtx || !this.musicGain) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Synth wave types
        if (mood === "ambient-calm") {
          osc.type = "sine";
        } else if (mood === "synthwave-retro") {
          osc.type = idx === 0 ? "sawtooth" : "triangle";
        } else if (mood === "tension-suspense") {
          osc.type = "sawtooth";
        } else {
          osc.type = idx === 0 ? "sine" : "triangle";
        }

        osc.frequency.setValueAtTime(freq, now);

        // Lowpass filter for warm cinematic feel
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(mood === "synthwave-retro" ? 1400 : 750, now);
        filter.Q.setValueAtTime(2, now);

        // Soft ADSR envelope
        const baseGain = 0.07 / chord.length;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(baseGain, now + 1.2);
        gain.gain.setValueAtTime(baseGain, now + duration - 1.2);
        gain.gain.linearRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      this.timerId = window.setTimeout(playChord, (duration - 0.8) * 1000);
    };

    playChord();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Synthesizes and narrates speech for the current scene
   */
  public speakSceneNarration(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceGender?: "neutral" | "female" | "male";
      callbacks?: AudioEngineCallbacks;
    }
  ) {
    if (!("speechSynthesis" in window)) {
      console.warn("Web Speech API not supported on this browser.");
      return;
    }

    this.stopSpeech();
    this.duckMusic(true);

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    // Pick best natural voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

    if (englishVoices.length > 0) {
      let selectedVoice = englishVoices[0];
      if (options.voiceGender === "female") {
        const female = englishVoices.find((v) => /female|zira|samantha|karen|victoria/i.test(v.name));
        if (female) selectedVoice = female;
      } else if (options.voiceGender === "male") {
        const male = englishVoices.find((v) => /male|david|daniel|george|alex/i.test(v.name));
        if (male) selectedVoice = male;
      } else {
        const natural = englishVoices.find((v) => /natural|google|enhanced/i.test(v.name));
        if (natural) selectedVoice = natural;
      }
      utterance.voice = selectedVoice;
    }

    // Word boundary tracking for animated karaoke captions
    let wordCounter = 0;
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        if (options.callbacks?.onWordSpoken) {
          options.callbacks.onWordSpoken(wordCounter, event.charIndex);
        }
        wordCounter++;
      }
    };

    utterance.onend = () => {
      this.duckMusic(false);
      this.currentUtterance = null;
      if (options.callbacks?.onSceneSpeechEnd) {
        options.callbacks.onSceneSpeechEnd();
      }
    };

    utterance.onerror = (e) => {
      this.duckMusic(false);
      this.currentUtterance = null;
      if (options.callbacks?.onError) {
        options.callbacks.onError(e);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.duckMusic(false);
  }

  public pauseAll() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
    this.stopMusic();
  }

  public resumeAll() {
    if ("speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    if (this.currentMood !== "none") {
      this.startMusic(this.currentMood);
    }
  }

  public cleanup() {
    this.stopSpeech();
    this.stopMusic();
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

export const audioEngine = new AudioEngine();
