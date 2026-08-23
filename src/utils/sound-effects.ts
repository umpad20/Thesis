/**
 * Web Audio API & Speech Synthesis Feedback System for ReadSmart Gamification
 *
 * Provides instant synthesized harmonic chimes AND natural human-like spoken encouragement
 * ("Correct! Great job! ✨", "Nice try, keep it up! 💪") with neural voice selection.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private naturalVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.initVoiceSelection();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoiceSelection();
      };
    }
  }

  /**
   * Intelligently selects the highest-quality natural / neural English voice available
   */
  private initVoiceSelection() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Filter for English voices
    const enVoices = voices.filter((v) => v.lang.startsWith("en"));

    // Rank voices by natural human-like quality
    const priorityKeywords = [
      "Natural",
      "Online (Natural)",
      "Google US English",
      "Microsoft Jenny",
      "Microsoft Guy",
      "Microsoft Aria",
      "Neural",
      "Samantha",
      "Alex",
      "en-US",
      "en-GB",
    ];

    for (const keyword of priorityKeywords) {
      const match = enVoices.find(
        (v) =>
          v.name.includes(keyword) ||
          v.voiceURI.includes(keyword) ||
          (keyword === "en-US" && v.lang === "en-US")
      );
      if (match) {
        this.naturalVoice = match;
        this.voicesLoaded = true;
        return;
      }
    }

    // Fallback to first available English voice
    if (enVoices.length > 0) {
      this.naturalVoice = enVoices[0];
      this.voicesLoaded = true;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Speak friendly encouragement or vocabulary text aloud using realistic natural voice
   */
  speakText(text: string, pitch = 1.0, rate = 0.88) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        if (!this.naturalVoice) {
          this.initVoiceSelection();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.naturalVoice) {
          utterance.voice = this.naturalVoice;
        }
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }
  }

  /**
   * Pronounce a vocabulary word clearly with a natural human cadence
   */
  speakWord(word: string, exampleSentence?: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        if (!this.naturalVoice) {
          this.initVoiceSelection();
        }

        const utterance = new SpeechSynthesisUtterance(word);
        if (this.naturalVoice) {
          utterance.voice = this.naturalVoice;
        }
        utterance.rate = 0.82; // slightly slower for clear phonetic pronunciation
        utterance.pitch = 1.0;
        utterance.lang = "en-US";

        if (exampleSentence) {
          utterance.onend = () => {
            setTimeout(() => {
              const sentenceUtterance = new SpeechSynthesisUtterance(exampleSentence);
              if (this.naturalVoice) {
                sentenceUtterance.voice = this.naturalVoice;
              }
              sentenceUtterance.rate = 0.88;
              sentenceUtterance.pitch = 1.0;
              sentenceUtterance.lang = "en-US";
              window.speechSynthesis.speak(sentenceUtterance);
            }, 300);
          };
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }
  }

  /**
   * Cheerful chime chord + spoken voice "Awesome! That is correct!"
   */
  playCorrect(speakVoice = true) {
    const ctx = this.getContext();
    if (ctx) {
      try {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
          const startTime = now + i * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.46);
        });
      } catch (err) {
        console.warn("AudioContext error:", err);
      }
    }

    if (speakVoice) {
      const phrases = [
        "Correct! Great job!",
        "Awesome! That is correct!",
        "Nice! You got it right!",
        "Brilliant! Correct answer!",
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setTimeout(() => {
        this.speakText(randomPhrase, 1.05, 0.95);
      }, 200);
    }
  }

  /**
   * Gentle supportive chime + spoken voice "Nice try, keep it up!"
   */
  playWrong(speakVoice = true) {
    const ctx = this.getContext();
    if (ctx) {
      try {
        const now = ctx.currentTime;
        const notes = [349.23, 261.63]; // F4 -> C4

        notes.forEach((freq, i) => {
          const startTime = now + i * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.36);
        });
      } catch (err) {
        console.warn("AudioContext error:", err);
      }
    }

    if (speakVoice) {
      const phrases = [
        "Nice try, keep it up!",
        "Good effort, keep it going!",
        "Almost there! Keep practicing!",
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setTimeout(() => {
        this.speakText(randomPhrase, 1.0, 0.92);
      }, 150);
    }
  }

  /**
   * Celebratory fanfare chord when finishing quiz
   */
  playVictory() {
    const ctx = this.getContext();
    if (ctx) {
      try {
        const now = ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

        chord.forEach((freq, i) => {
          const startTime = now + i * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.86);
        });
      } catch (err) {
        console.warn("AudioContext victory error:", err);
      }
    }

    setTimeout(() => {
      this.speakText("Congratulations! Comprehension mastered!", 1.05, 0.92);
    }, 400);
  }

  /**
   * Soft page turn sound effect for storybook page transitions
   */
  playPageTurn() {
    const ctx = this.getContext();
    if (ctx) {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.19);
      } catch (err) {
        console.warn("AudioContext page turn error:", err);
      }
    }
  }
}

export const soundEffects = new SoundSynthesizer();
