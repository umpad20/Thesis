// ============================================================================
// ReadSmart Questionnaire Helpers & Serializers
// Supports: Single Choice, Checkboxes (Multi-Answer), Matching Type,
// Question Images, and Option Images.
// ============================================================================

import type { QuestionChoice, QuizQuestion, QuizQuestionType } from "@/lib/types";

export interface ParsedQuestionData {
  question_text: string;
  question_image_url?: string | null;
  question_type: QuizQuestionType;
}

export interface ParsedChoiceData {
  choice_text: string;
  choice_image_url?: string | null;
  match_target?: string | null;
  match_target_image_url?: string | null;
}

/**
 * Extracts question image URL (if encoded as [img:URL]) and clean question text
 */
export function extractQuestionMedia(rawText: string = ""): {
  cleanText: string;
  imageUrl: string | null;
} {
  if (!rawText) return { cleanText: "", imageUrl: null };

  const imgMatch = rawText.match(/\[img:(.+?)\]/);
  if (imgMatch) {
    const imageUrl = imgMatch[1].trim();
    const cleanText = rawText.replace(/\[img:(.+?)\]/, "").trim();
    return { cleanText, imageUrl };
  }

  return { cleanText: rawText.trim(), imageUrl: null };
}

/**
 * Extracts choice image URL and matching pair target (if encoded)
 */
export function extractChoiceMedia(rawText: string = ""): {
  cleanText: string;
  imageUrl: string | null;
  matchTarget: string | null;
  targetImageUrl: string | null;
} {
  if (!rawText) return { cleanText: "", imageUrl: null, matchTarget: null, targetImageUrl: null };

  let workingText = rawText;
  let imageUrl: string | null = null;
  let matchTarget: string | null = null;
  let targetImageUrl: string | null = null;

  // 1. Check for matching separator [match] or ::
  if (workingText.includes("[match]")) {
    const parts = workingText.split("[match]");
    workingText = parts[0]?.trim() || "";
    matchTarget = parts[1]?.trim() || "";
  } else if (workingText.includes(" :: ")) {
    const parts = workingText.split(" :: ");
    workingText = parts[0]?.trim() || "";
    matchTarget = parts[1]?.trim() || "";
  }

  // 2. Extract image from target if present
  if (matchTarget) {
    const targetImgMatch = matchTarget.match(/\[img:(.+?)\]/);
    if (targetImgMatch) {
      targetImageUrl = targetImgMatch[1].trim();
      matchTarget = matchTarget.replace(/\[img:(.+?)\]/, "").trim();
    }
  }

  // 3. Extract image from left/main choice
  const imgMatch = workingText.match(/\[img:(.+?)\]/);
  if (imgMatch) {
    imageUrl = imgMatch[1].trim();
    workingText = workingText.replace(/\[img:(.+?)\]/, "").trim();
  }

  return {
    cleanText: workingText.trim(),
    imageUrl,
    matchTarget: matchTarget ? matchTarget.trim() : null,
    targetImageUrl,
  };
}

/**
 * Formats question text with optional image URL tag
 */
export function formatQuestionTextForSave(cleanText: string, imageUrl?: string | null): string {
  const trimmedText = (cleanText || "").trim();
  const trimmedUrl = (imageUrl || "").trim();
  if (trimmedUrl) {
    return `[img:${trimmedUrl}] ${trimmedText}`;
  }
  return trimmedText;
}

/**
 * Formats choice text with optional choice image and match target
 */
export function formatChoiceTextForSave(
  cleanText: string,
  imageUrl?: string | null,
  matchTarget?: string | null
): string {
  const trimmedText = (cleanText || "").trim();
  const trimmedUrl = (imageUrl || "").trim();
  const trimmedTarget = (matchTarget || "").trim();

  let result = trimmedUrl ? `[img:${trimmedUrl}] ${trimmedText}` : trimmedText;

  if (trimmedTarget) {
    result = `${result} [match] ${trimmedTarget}`;
  }

  return result;
}

/**
 * Helper to normalize and parse a QuizQuestion row from DB or mock data
 */
export function parseQuizQuestion(q: any): QuizQuestion {
  const rawText = q.question_text || "";
  const { cleanText, imageUrl } = extractQuestionMedia(rawText);
  const explicitImageUrl = q.image_url || q.question_image_url || imageUrl || null;

  return {
    ...q,
    question_text: cleanText,
    question_image_url: explicitImageUrl,
    question_type: (q.question_type || "multiple_choice") as QuizQuestionType,
    points: q.points || 10,
    hint: q.hint || "",
    explanation: q.explanation || "",
  };
}

/**
 * Helper to normalize and parse a QuestionChoice row from DB or mock data
 */
export function parseQuestionChoice(c: any): QuestionChoice {
  const rawText = c.choice_text || "";
  const { cleanText, imageUrl, matchTarget } = extractChoiceMedia(rawText);
  const explicitImageUrl = c.image_url || c.choice_image_url || imageUrl || null;
  const explicitTarget = c.match_target || matchTarget || null;

  return {
    ...c,
    choice_text: cleanText,
    choice_image_url: explicitImageUrl,
    match_target: explicitTarget,
    is_correct: Boolean(c.is_correct),
  };
}

/**
 * Fisher-Yates array shuffle for non-biased randomness (e.g. matching right-column)
 */
export function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
