"use client";

export interface VoicePreferences {
  gender: "female" | "male";
  rate: number;
  pitch: number;
  selectedVoiceName?: string;
}

export const DEFAULT_PREFERENCES: VoicePreferences = {
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
 * Find best matching browser voice for selected gender (prioritizing en-US for DepEd curriculum)
 */
export function getMatchingVoice(gender: "female" | "male"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Filter for US English first (standard for DepEd Philippine elementary curriculum)
  const usVoices = voices.filter(
    (v) => v.lang === "en-US" || v.lang.replace(/_/g, "-").startsWith("en-US")
  );
  const generalEnVoices = voices.filter((v) => v.lang.startsWith("en"));
  const pool = usVoices.length > 0 ? usVoices : generalEnVoices.length > 0 ? generalEnVoices : voices;

  // Prioritize top natural/neural US voices first
  const femaleKeywords = [
    "jenny",
    "aria",
    "zira",
    "google us english",
    "samantha",
    "natural female",
    "female",
    "eva",
    "karen",
  ];
  const maleKeywords = [
    "guy",
    "david",
    "google us english",
    "natural male",
    "alex",
    "male",
    "daniel",
    "james",
    "mark",
    "richard",
  ];

  const targetKeywords = gender === "female" ? femaleKeywords : maleKeywords;

  // Find by priority keyword order
  for (const keyword of targetKeywords) {
    const match = pool.find((v) => v.name.toLowerCase().includes(keyword));
    if (match) {
      return match;
    }
  }

  // Fallback: pick by pool index
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
  utterance.lang = "en-US";

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onError) onError();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}
