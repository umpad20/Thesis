"use client";

export interface VoicePreferences {
  gender: "female" | "male";
  rate: number;
  pitch: number;
  selectedVoiceName?: string;
}

const DEFAULT_PREFERENCES: VoicePreferences = {
  gender: "female",
  rate: 0.85,
  pitch: 1.05,
};

const STORAGE_KEY = "readsmart_voice_preferences";

export function getVoicePreferences(): VoicePreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveVoicePreferences(prefs: Partial<VoicePreferences>): VoicePreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const current = getVoicePreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("readsmart_voice_changed"));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Find best matching browser voice for selected gender
 */
export function getMatchingVoice(gender: "female" | "male"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  const femaleKeywords = ["female", "zira", "samantha", "karen", "victoria", "hazel", "susan", "natural female", "eva", "cather", "aria"];
  const maleKeywords = ["male", "david", "george", "daniel", "alex", "guy", "mark", "james", "natural male", "richard", "oliver"];

  const targetKeywords = gender === "female" ? femaleKeywords : maleKeywords;

  for (const voice of pool) {
    const nameLower = voice.name.toLowerCase();
    if (targetKeywords.some((k) => nameLower.includes(k))) {
      return voice;
    }
  }

  // Fallback: pick by index or default
  return pool[0] || null;
}

/**
 * Speak text with current user voice preferences
 */
export function speakSentenceWithVoice(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return null;
  }

  window.speechSynthesis.cancel();

  const prefs = getVoicePreferences();
  const utterance = new SpeechSynthesisUtterance(text);

  // Apply rate and pitch
  utterance.rate = prefs.rate || (prefs.gender === "female" ? 0.85 : 0.85);
  utterance.pitch = prefs.pitch || (prefs.gender === "female" ? 1.05 : 0.9);

  // Apply voice if found
  const matchingVoice = getMatchingVoice(prefs.gender);
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onError) onError();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}
