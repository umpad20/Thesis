"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck2,
  SpellCheck,
  AlertCircle,
  Save,
  Check,
  Eye,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Smile,
  Link as LinkIcon,
  RefreshCw,
  MousePointerClick,
  Edit3,
  CheckCheck,
  X,
  ChevronUp,
  ChevronDown,
  ImagePlus,
  FileText,
  Highlighter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
import {
  fetchTeacherSectionsFromSupabase,
  getCurrentUser,
} from "@/utils/auth-helpers";
import {
  fetchBadgesFromSupabase,
  fetchStageCurriculumDetails,
} from "@/utils/supabase-queries";
import { createClient } from "@/utils/supabase/client";
import type { Badge, BadgeType, MedalType, Lesson, LessonPage } from "@/lib/types";

export interface VocabularyWordFormItem {
  word: string;
  definition: string;
  example_sentence: string;
}

export interface QuestionFormItem {
  question_text: string;
  explanation: string;
  hint: string;
  points: number;
  choices: Array<{ choice_letter: string; choice_text: string; is_correct: boolean }>;
}

export interface LessonSentenceItem {
  sentence_id: string;
  sentence_text: string;
  image_url?: string;
  vocabulary: VocabularyWordFormItem[];
}

export interface StoryLessonFormItem {
  lesson_title: string;
  difficulty_level: "easy" | "medium" | "hard";
  story_content: string;
  sentences: LessonSentenceItem[];
  vocabulary: VocabularyWordFormItem[];
  questions: QuestionFormItem[];
}

function createBlankSentence(index: number = 1): LessonSentenceItem {
  return {
    sentence_id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sentence_text: "",
    image_url: "",
    vocabulary: [],
  };
}

function createBlankQuestion(): QuestionFormItem {
  return {
    question_text: "",
    explanation: "",
    hint: "",
    points: 20,
    choices: [
      { choice_letter: "A", choice_text: "", is_correct: true },
      { choice_letter: "B", choice_text: "", is_correct: false },
      { choice_letter: "C", choice_text: "", is_correct: false },
      { choice_letter: "D", choice_text: "", is_correct: false },
    ],
  };
}

function createBlankLesson(): StoryLessonFormItem {
  return {
    lesson_title: "",
    difficulty_level: "easy",
    story_content: "",
    sentences: [createBlankSentence(1)],
    vocabulary: [],
    questions: [],
  };
}

export function BadgeCreationStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawEditId =
    searchParams.get("editBadgeId") ||
    searchParams.get("edit") ||
    searchParams.get("id") ||
    searchParams.get("badgeId");
  const editBadgeId = rawEditId ? parseInt(rawEditId, 10) : null;

  // Wizard Step State: 1 = Stage Identity, 2 = Stories & Sentences, 3 = Final Mastery Quiz
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Teacher Section Data
  const [teacherSections, setTeacherSections] = useState<string[]>(["Grade 3-A"]);

  // Step 1 Form State (Unique Custom Badge & Artwork Upload)
  const [formBadgeName, setFormBadgeName] = useState("");
  const [formBadgeIconUrl, setFormBadgeIconUrl] = useState<string>("");
  const [formSection, setFormSection] = useState("all_my_sections");
  const [formPassingScore, setFormPassingScore] = useState(75);
  const [formXpReward, setFormXpReward] = useState(350);
  const [formDescription, setFormDescription] = useState("");

  // Step 2 Form State (Story Lessons, Unlimited Sentences, Pictures & Comprehension Quizzes)
  const [formLessons, setFormLessons] = useState<StoryLessonFormItem[]>([createBlankLesson()]);

  // Step 3 Form State (Stage Final Mastery Quiz)
  const [finalQuizTitle, setFinalQuizTitle] = useState("");
  const [finalQuizQuestions, setFinalQuizQuestions] = useState<QuestionFormItem[]>([]);

  // Bulk paste modal state
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");

  // Interactive Sentence Tagger Mode per sentence (index to show clickable word tokens)
  const [interactiveModeSentenceIdx, setInteractiveModeSentenceIdx] = useState<number | null>(null);

  // Inline Vocabulary tagging state per sentence (highlight or click)
  const [taggingSentenceIdx, setTaggingSentenceIdx] = useState<number | null>(null);
  const [newVocabWord, setNewVocabWord] = useState("");
  const [newVocabDef, setNewVocabDef] = useState("");
  const [highlightToast, setHighlightToast] = useState<{ sIdx: number; word: string } | null>(null);

  // File Upload Reference for Badge Icon
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vocabInputRef = useRef<HTMLInputElement>(null);

  // Load teacher sections & existing badge data if editing
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const sections = await fetchTeacherSectionsFromSupabase(user?.id);
      setTeacherSections(sections);

      if (editBadgeId) {
        try {
          const supabase = createClient();
          const { data: b } = await supabase.from("badges").select("*").eq("badge_id", editBadgeId).single();
          if (b) {
            setFormBadgeName(b.badge_name || "");
            setFormBadgeIconUrl(b.badge_icon_url || "");
            setFormSection(b.target_section || "all_my_sections");
            setFormPassingScore(b.required_passing_score || b.passing_score_percentage || 75);
            setFormXpReward(b.xp_reward || 350);
            setFormDescription(b.description || "");
          }

          const details = await fetchStageCurriculumDetails(editBadgeId);
          if (details) {
            if (details.lessons && details.lessons.length > 0) {
              const loadedLessons: StoryLessonFormItem[] = details.lessons.map((l) => {
                const passage = l.pages.map((p) => p.content).join("\n\n");
                const lessonVocab: VocabularyWordFormItem[] = (l.vocabulary || []).map((v) => ({
                  word: v.word,
                  definition: v.definition,
                  example_sentence: v.example_sentence || "",
                }));

                const sentences: LessonSentenceItem[] = l.pages.map((p, pIdx) => {
                  const sentText = p.content || "";
                  const attachedVocab = lessonVocab.filter((v) =>
                    sentText.toLowerCase().includes(v.word.toLowerCase())
                  );
                  return {
                    sentence_id: `s-${l.lesson_id}-${p.page_number || pIdx + 1}`,
                    sentence_text: sentText,
                    image_url: p.image_url || "",
                    vocabulary: attachedVocab,
                  };
                });

                const qs: QuestionFormItem[] = l.quiz?.questions
                  ? l.quiz.questions.map((q) => ({
                      question_text: q.question_text,
                      explanation: q.explanation || "",
                      hint: q.hint || "",
                      points: q.points || 20,
                      choices: q.choices.map((c, idx) => ({
                        choice_letter: String.fromCharCode(65 + idx),
                        choice_text: c.choice_text,
                        is_correct: c.is_correct,
                      })),
                    }))
                  : [];

                return {
                  lesson_title: l.lesson_title,
                  difficulty_level: (l.difficulty_level as "easy" | "medium" | "hard") || "easy",
                  story_content: passage || "",
                  sentences: sentences.length > 0 ? sentences : [createBlankSentence(1)],
                  vocabulary: lessonVocab,
                  questions: qs,
                };
              });
              setFormLessons(loadedLessons);
            }

            if (details.finalQuiz) {
              setFinalQuizTitle(details.finalQuiz.quiz_title);
              if (details.finalQuiz.questions && details.finalQuiz.questions.length > 0) {
                setFinalQuizQuestions(
                  details.finalQuiz.questions.map((q) => ({
                    question_text: q.question_text,
                    explanation: q.explanation || "",
                    hint: q.hint || "",
                    points: q.points || 20,
                    choices: q.choices.map((c, idx) => ({
                      choice_letter: String.fromCharCode(65 + idx),
                      choice_text: c.choice_text,
                      is_correct: c.is_correct,
                    })),
                  }))
                );
              }
            }
          }
        } catch (err) {
          console.error("Failed to load badge for editing:", err);
        }
      } else if (sections && sections.length > 0) {
        setFormSection(sections[0]);
      }
      setLoading(false);
    }
    loadData();
  }, [editBadgeId]);

  // Handle local image file upload for badge
  const handleBadgeImageUpload = (file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image file size exceeds 3MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormBadgeIconUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Active Lesson accessor
  const currentLesson: StoryLessonFormItem =
    formLessons[activeLessonIndex] || formLessons[0] || createBlankLesson();

  // ── VALIDATION RULES & GATING ──
  const isStep1Valid = formBadgeName.trim().length >= 3 && formDescription.trim().length >= 5;
  const isStep2Valid =
    isStep1Valid &&
    formLessons.length >= 1 &&
    formLessons.every((l) => {
      const hasTitle = l.lesson_title.trim().length >= 2;
      const hasSentences =
        (l.sentences && l.sentences.some((s) => s.sentence_text.trim().length >= 3)) ||
        l.story_content.trim().length >= 3;
      const hasQuestions =
        l.questions.length === 0 ||
        l.questions.every(
          (q) =>
            q.question_text.trim().length >= 3 &&
            q.choices.some((c) => c.is_correct && c.choice_text.trim().length > 0)
        );
      return hasTitle && hasSentences && hasQuestions;
    });

  const isStep3Valid =
    isStep2Valid &&
    (finalQuizTitle.trim().length >= 3 || finalQuizQuestions.length === 0) &&
    (finalQuizQuestions.length === 0 ||
      finalQuizQuestions.every(
        (q) =>
          q.question_text.trim().length >= 3 &&
          q.choices.some((c) => c.is_correct && c.choice_text.trim().length > 0)
      ));

  // ── LESSON MUTATION HELPERS ──
  const addLesson = () => {
    if (formLessons.length >= 3) return;
    setFormLessons([...formLessons, createBlankLesson()]);
    setActiveLessonIndex(formLessons.length);
  };

  const removeLesson = (index: number) => {
    if (formLessons.length <= 1) return;
    const updated = formLessons.filter((_, idx) => idx !== index);
    setFormLessons(updated);
    setActiveLessonIndex(Math.max(0, index - 1));
  };

  const updateCurrentLesson = (updater: (lesson: StoryLessonFormItem) => StoryLessonFormItem) => {
    setFormLessons((prev) =>
      prev.map((item, idx) => (idx === activeLessonIndex ? updater(item) : item))
    );
  };

  // ── SENTENCE MUTATION HELPERS (UNLIMITED SENTENCES & PICTURE PER SENTENCE) ──
  const addSentence = () => {
    updateCurrentLesson((l) => {
      const current = l.sentences || [];
      return {
        ...l,
        sentences: [...current, createBlankSentence(current.length + 1)],
      };
    });
  };

  const removeSentence = (sIdx: number) => {
    updateCurrentLesson((l) => {
      const current = l.sentences || [];
      const updated = current.filter((_, idx) => idx !== sIdx);
      return {
        ...l,
        sentences: updated.length > 0 ? updated : [createBlankSentence(1)],
      };
    });
  };

  const moveSentence = (sIdx: number, direction: "up" | "down") => {
    updateCurrentLesson((l) => {
      const current = [...(l.sentences || [])];
      const targetIdx = direction === "up" ? sIdx - 1 : sIdx + 1;
      if (targetIdx < 0 || targetIdx >= current.length) return l;
      const temp = current[sIdx];
      current[sIdx] = current[targetIdx];
      current[targetIdx] = temp;
      return {
        ...l,
        sentences: current,
        story_content: current.map((s) => s.sentence_text).join(" "),
      };
    });
  };

  const updateSentenceText = (sIdx: number, text: string) => {
    updateCurrentLesson((l) => {
      const updated = (l.sentences || []).map((s, idx) =>
        idx === sIdx ? { ...s, sentence_text: text } : s
      );
      return {
        ...l,
        sentences: updated,
        story_content: updated.map((s) => s.sentence_text).join(" "),
      };
    });
  };

  // ── MOUSE HIGHLIGHT SELECTION DETECTOR ON SENTENCE TEXTAREA ──
  const handleSentenceTextSelection = (
    sIdx: number,
    e: React.MouseEvent<HTMLTextAreaElement> | React.TouchEvent<HTMLTextAreaElement>
  ) => {
    const textarea = e.currentTarget as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const sentence = (currentLesson.sentences || [])[sIdx];
    if (!sentence || !sentence.sentence_text) return;

    const rawWord = sentence.sentence_text.slice(start, end).trim();
    const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, "");
    if (cleanWord.length >= 2) {
      setTaggingSentenceIdx(sIdx);
      setNewVocabWord(cleanWord);
      setNewVocabDef("");
      setHighlightToast({ sIdx, word: cleanWord });

      setTimeout(() => {
        vocabInputRef.current?.focus();
      }, 100);
    }
  };

  const updateSentenceImage = (sIdx: number, imgUrl: string) => {
    updateCurrentLesson((l) => ({
      ...l,
      sentences: (l.sentences || []).map((s, idx) =>
        idx === sIdx ? { ...s, image_url: imgUrl } : s
      ),
    }));
  };

  const handleSentenceImageFile = (sIdx: number, file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image exceeds 3MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) updateSentenceImage(sIdx, res);
    };
    reader.readAsDataURL(file);
  };

  const addVocabToSentence = (sIdx: number, word: string, def: string) => {
    if (!word.trim()) return;
    const cleanWord = word.trim();
    const cleanDef = def.trim() || "Key vocabulary word.";
    updateCurrentLesson((l) => {
      const updatedSentences = (l.sentences || []).map((s, idx) => {
        if (idx !== sIdx) return s;
        const exists = (s.vocabulary || []).some(
          (v) => v.word.toLowerCase() === cleanWord.toLowerCase()
        );
        if (exists) return s;
        return {
          ...s,
          vocabulary: [
            ...(s.vocabulary || []),
            { word: cleanWord, definition: cleanDef, example_sentence: s.sentence_text },
          ],
        };
      });

      const allVocab: VocabularyWordFormItem[] = [];
      for (const s of updatedSentences) {
        for (const v of s.vocabulary || []) {
          if (!allVocab.some((av) => av.word.toLowerCase() === v.word.toLowerCase())) {
            allVocab.push(v);
          }
        }
      }

      return {
        ...l,
        sentences: updatedSentences,
        vocabulary: allVocab,
      };
    });

    setTaggingSentenceIdx(null);
    setNewVocabWord("");
    setNewVocabDef("");
    setHighlightToast(null);
  };

  const removeVocabFromSentence = (sIdx: number, vIdx: number) => {
    updateCurrentLesson((l) => {
      const updatedSentences = (l.sentences || []).map((s, idx) =>
        idx === sIdx
          ? { ...s, vocabulary: (s.vocabulary || []).filter((_, i) => i !== vIdx) }
          : s
      );

      const allVocab: VocabularyWordFormItem[] = [];
      for (const s of updatedSentences) {
        for (const v of s.vocabulary || []) {
          if (!allVocab.some((av) => av.word.toLowerCase() === v.word.toLowerCase())) {
            allVocab.push(v);
          }
        }
      }

      return {
        ...l,
        sentences: updatedSentences,
        vocabulary: allVocab,
      };
    });
  };

  const handleBulkPassageSplit = () => {
    if (!bulkPasteText.trim()) return;
    const splitSentences = bulkPasteText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (splitSentences.length === 0) return;

    updateCurrentLesson((l) => {
      const newSentences: LessonSentenceItem[] = splitSentences.map((text, idx) => ({
        sentence_id: `s-${Date.now()}-${idx}`,
        sentence_text: text,
        image_url: "",
        vocabulary: [],
      }));

      return {
        ...l,
        sentences: newSentences,
        story_content: bulkPasteText,
      };
    });

    setShowBulkPasteModal(false);
    setBulkPasteText("");
  };

  // ── QUESTION MUTATION HELPERS ──
  const addQuestion = () => {
    updateCurrentLesson((lesson) => ({
      ...lesson,
      questions: [...lesson.questions, createBlankQuestion()],
    }));
  };

  const removeQuestion = (qIndex: number) => {
    updateCurrentLesson((lesson) => ({
      ...lesson,
      questions: lesson.questions.filter((_, idx) => idx !== qIndex),
    }));
  };

  const updateQuestion = (qIndex: number, field: keyof QuestionFormItem, value: any) => {
    updateCurrentLesson((lesson) => ({
      ...lesson,
      questions: lesson.questions.map((q, idx) =>
        idx === qIndex ? { ...q, [field]: value } : q
      ),
    }));
  };

  const setQuestionChoiceCorrect = (qIndex: number, choiceIdx: number) => {
    updateCurrentLesson((lesson) => ({
      ...lesson,
      questions: lesson.questions.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          choices: q.choices.map((c, cIdx) => ({
            ...c,
            is_correct: cIdx === choiceIdx,
          })),
        };
      }),
    }));
  };

  const updateChoiceText = (qIndex: number, choiceIdx: number, text: string) => {
    updateCurrentLesson((lesson) => ({
      ...lesson,
      questions: lesson.questions.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          choices: q.choices.map((c, cIdx) =>
            cIdx === choiceIdx ? { ...c, choice_text: text } : c
          ),
        };
      }),
    }));
  };

  // ── STEP 3: FINAL QUIZ HELPERS ──
  const addFinalQuestion = () => {
    setFinalQuizQuestions([...finalQuizQuestions, createBlankQuestion()]);
  };

  const removeFinalQuestion = (qIndex: number) => {
    setFinalQuizQuestions(finalQuizQuestions.filter((_, idx) => idx !== qIndex));
  };

  const setFinalChoiceCorrect = (qIndex: number, choiceIdx: number) => {
    setFinalQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          choices: q.choices.map((c, cIdx) => ({
            ...c,
            is_correct: cIdx === choiceIdx,
          })),
        };
      })
    );
  };

  const updateFinalChoiceText = (qIndex: number, choiceIdx: number, text: string) => {
    setFinalQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          choices: q.choices.map((c, cIdx) =>
            cIdx === choiceIdx ? { ...c, choice_text: text } : c
          ),
        };
      })
    );
  };

  // ── 🚀 PUBLISH ENTIRE CUSTOM STAGE CURRICULUM TO SUPABASE ──
  const handlePublish = async () => {
    if (!isStep3Valid) return;
    setIsSaving(true);

    try {
      const supabase = createClient();
      const user = getCurrentUser();

      let badgeId = editBadgeId;

      if (editBadgeId) {
        const { error: updateErr } = await supabase
          .from("badges")
          .update({
            badge_name: formBadgeName.trim(),
            badge_icon_url: formBadgeIconUrl || "/badges/star-badge.svg",
            description: formDescription.trim(),
            required_passing_score: formPassingScore,
            xp_reward: formXpReward,
            target_section: formSection,
          })
          .eq("badge_id", editBadgeId);

        if (updateErr) throw new Error(updateErr.message);
      } else {
        const { data: allBadges } = await supabase
          .from("badges")
          .select("badge_order")
          .order("badge_order", { ascending: false })
          .limit(1);

        const nextOrder = (allBadges?.[0]?.badge_order || 5) + 1;

        const { data: newBadge, error: badgeErr } = await supabase
          .from("badges")
          .insert({
            badge_name: formBadgeName.trim(),
            badge_icon_url: formBadgeIconUrl || "/badges/star-badge.svg",
            badge_order: nextOrder,
            description: formDescription.trim(),
            required_passing_score: formPassingScore,
            xp_reward: formXpReward,
            badge_type: "star",
            medal_type: null,
            target_section: formSection,
            teacher_id: user?.id || null,
          })
          .select("badge_id")
          .single();

        if (badgeErr || !newBadge) {
          throw new Error(badgeErr?.message || "Failed to insert custom badge.");
        }
        badgeId = newBadge.badge_id;
      }

      if (!badgeId) throw new Error("Missing badge ID.");

      // If updating an existing badge, clean up previous lessons/quizzes before re-inserting
      if (editBadgeId) {
        await supabase.from("quizzes").delete().eq("badge_id", editBadgeId);
        await supabase.from("lessons").delete().eq("badge_id", editBadgeId);
      }

      // 2. Process each Story Lesson & Unlimited Sentences
      for (let i = 0; i < formLessons.length; i++) {
        const lesson = formLessons[i];

        const storyTitle = lesson.lesson_title.trim() || `${formBadgeName.trim()} - Story ${i + 1}`;
        const { data: newLesson, error: lessonErr } = await supabase
          .from("lessons")
          .insert({
            badge_id: badgeId,
            lesson_title: storyTitle,
            difficulty_level: lesson.difficulty_level || "easy",
            lesson_description: `Story Lesson ${i + 1} for ${formBadgeName}`,
            lesson_order: i + 1,
            passing_score: formPassingScore,
            target_section: formSection,
            status: "published",
            teacher_id: user?.id || null,
          })
          .select("lesson_id")
          .single();

        if (lessonErr || !newLesson) {
          console.error("Lesson insert error:", lessonErr);
          throw new Error(lessonErr?.message || `Failed to create Story ${i + 1}`);
        }

        const lessonId = newLesson.lesson_id;

        // Insert lesson_pages for each sentence (with specific picture!)
        const sentencesToSave = (lesson.sentences || []).filter(
          (s) => s.sentence_text.trim().length > 0
        );

        if (sentencesToSave.length > 0) {
          for (let sIdx = 0; sIdx < sentencesToSave.length; sIdx++) {
            const s = sentencesToSave[sIdx];
            await supabase.from("lesson_pages").insert({
              lesson_id: lessonId,
              page_number: sIdx + 1,
              page_title: `Scene ${sIdx + 1}`,
              content: s.sentence_text.trim(),
              image_url: s.image_url || `/images/stories/l1_s1.jpg`,
            });
          }
        } else if (lesson.story_content.trim()) {
          const rawSentences = lesson.story_content
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          for (let sIdx = 0; sIdx < rawSentences.length; sIdx++) {
            await supabase.from("lesson_pages").insert({
              lesson_id: lessonId,
              page_number: sIdx + 1,
              page_title: `Scene ${sIdx + 1}`,
              content: rawSentences[sIdx],
              image_url: `/images/stories/l1_s1.jpg`,
            });
          }
        }

        // Insert vocabulary words from all sentences
        const allVocabToInsert: VocabularyWordFormItem[] = [];
        const seenWords = new Set<string>();

        for (const s of lesson.sentences || []) {
          for (const v of s.vocabulary || []) {
            const clean = v.word.trim().toLowerCase();
            if (clean && !seenWords.has(clean)) {
              seenWords.add(clean);
              allVocabToInsert.push({
                word: v.word.trim(),
                definition: v.definition.trim(),
                example_sentence: v.example_sentence || s.sentence_text,
              });
            }
          }
        }

        for (const v of lesson.vocabulary || []) {
          const clean = v.word.trim().toLowerCase();
          if (clean && !seenWords.has(clean)) {
            seenWords.add(clean);
            allVocabToInsert.push(v);
          }
        }

        for (const v of allVocabToInsert) {
          if (v.word.trim().length > 0 && v.definition.trim().length > 0) {
            await supabase.from("vocabulary_words").insert({
              lesson_id: lessonId,
              word: v.word.trim(),
              definition: v.definition.trim(),
              example_sentence: v.example_sentence?.trim() || null,
            });
          }
        }

        // Insert Lesson Comprehension Quiz if questions exist
        if (lesson.questions && lesson.questions.length > 0) {
          const { data: newQuiz } = await supabase
            .from("quizzes")
            .insert({
              lesson_id: lessonId,
              badge_id: badgeId,
              quiz_type: "lesson_evaluation",
              quiz_title: `${lesson.lesson_title} Comprehension Check`,
              passing_score: formPassingScore,
            })
            .select("quiz_id")
            .single();

          if (newQuiz) {
            for (let qIdx = 0; qIdx < lesson.questions.length; qIdx++) {
              const q = lesson.questions[qIdx];
              if (q.question_text.trim().length > 0) {
                const { data: createdQ, error: qErr } = await supabase
                  .from("quiz_questions")
                  .insert({
                    quiz_id: newQuiz.quiz_id,
                    question_text: q.question_text.trim(),
                    explanation: q.explanation.trim() || null,
                    hint: q.hint.trim() || null,
                    points: q.points || 20,
                  })
                  .select("question_id")
                  .single();

                if (qErr) {
                  console.error("quiz_questions insert error:", qErr);
                }

                if (createdQ) {
                  for (const c of q.choices) {
                    if (c.choice_text.trim().length > 0) {
                      await supabase.from("question_choices").insert({
                        question_id: createdQ.question_id,
                        choice_text: c.choice_text.trim(),
                        is_correct: c.is_correct,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 3. Process Stage Final Quiz (Table: quizzes, quiz_questions, question_choices)
      if (finalQuizQuestions.length > 0) {
        const { data: finalQuiz } = await supabase
          .from("quizzes")
          .insert({
            lesson_id: null,
            badge_id: badgeId,
            quiz_type: "badge_final",
            quiz_title: finalQuizTitle.trim() || `${formBadgeName} Final Evaluation Exam`,
            passing_score: formPassingScore,
          })
          .select("quiz_id")
          .single();

        if (finalQuiz) {
          for (let qIdx = 0; qIdx < finalQuizQuestions.length; qIdx++) {
            const q = finalQuizQuestions[qIdx];
            if (q.question_text.trim().length > 0) {
              const { data: createdQ, error: finalQErr } = await supabase
                .from("quiz_questions")
                .insert({
                  quiz_id: finalQuiz.quiz_id,
                  question_text: q.question_text.trim(),
                  explanation: q.explanation.trim() || null,
                  hint: q.hint.trim() || null,
                  points: q.points || 20,
                })
                .select("question_id")
                .single();

              if (finalQErr) {
                console.error("final quiz_questions insert error:", finalQErr);
              }

              if (createdQ) {
                for (const c of q.choices) {
                  if (c.choice_text.trim().length > 0) {
                    await supabase.from("question_choices").insert({
                      question_id: createdQ.question_id,
                      choice_text: c.choice_text.trim(),
                      is_correct: c.is_correct,
                    });
                  }
                }
              }
            }
          }
        }
      }

      router.push("/teacher/badges");
    } catch (err: any) {
      console.error("Publish stage error:", err);
      alert(`Error publishing stage badge: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-24">
      {/* ── Top Header & Wizard Navigation ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/badges"
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {editBadgeId ? "Edit Custom Stage Quest" : "Create New Custom Badge & Quest"}
              </h1>
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider">
                Full-Canvas Authoring
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Author unlimited story sentences, highlight words to define vocabulary, attach sentence illustrations, and build comprehension quizzes.
            </p>
          </div>
        </div>

        {/* Wizard Stepper Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              currentStep === 1
                ? "bg-white text-indigo-700 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center">
              1
            </span>
            <span>Badge &amp; Artwork</span>
          </button>

          <button
            type="button"
            onClick={() => isStep1Valid && setCurrentStep(2)}
            disabled={!isStep1Valid}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              currentStep === 2
                ? "bg-white text-indigo-700 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center">
              2
            </span>
            <span>Stories &amp; Sentences</span>
          </button>

          <button
            type="button"
            onClick={() => isStep2Valid && setCurrentStep(3)}
            disabled={!isStep2Valid}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              currentStep === 3
                ? "bg-white text-indigo-700 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center">
              3
            </span>
            <span>Final Mastery Quiz</span>
          </button>
        </div>
      </div>

      {/* ── Main Full-Screen Width 2-Column Authoring Layout (9 Cols Canvas / 3 Cols Live Preview) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Expansive Authoring Canvas (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* ════ STEP 1: BADGE IDENTITY & CUSTOM ARTWORK ════ */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs space-y-7 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-indigo-600" />
                  <span>Step 1: Custom Milestone Badge &amp; Artwork Upload</span>
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Upload your own custom badge emblem and target your classroom sections.
                </p>
              </div>

              {/* Badge Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>Badge &amp; Quest Name <span className="text-rose-500">*</span></span>
                  <span className="text-xs text-slate-400 font-medium">Min. 3 characters</span>
                </label>
                <input
                  type="text"
                  value={formBadgeName}
                  onChange={(e) => setFormBadgeName(e.target.value)}
                  placeholder="e.g., Rainforest Explorer, Space Pioneer, Nature Detective"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Upload Badge Image */}
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-800 block">
                  Upload Custom Badge Artwork Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBadgeImageUpload(file);
                  }}
                  className="hidden"
                />

                {formBadgeIconUrl ? (
                  <div className="flex items-center gap-5 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/70">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-indigo-200 flex items-center justify-center p-2.5 shadow-2xs flex-shrink-0">
                      <img
                        src={formBadgeIconUrl}
                        alt="Uploaded Badge"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <span className="text-sm font-black text-indigo-950 block">Custom Artwork Active</span>
                      <p className="text-xs text-slate-500 font-medium">
                        This image will display on the Pupil Badge Map and Reward certificates.
                      </p>
                      <div className="flex items-center gap-2.5 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 cursor-pointer"
                        >
                          Change Picture
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setFormBadgeIconUrl("")}
                          className="h-8 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shadow-2xs">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-indigo-950 block">
                        Click to browse and upload badge image
                      </span>
                      <span className="text-xs text-slate-400">
                        Supports PNG, JPG, SVG, WebP (Max 3MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Section Access */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Target Section Access</label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all_my_sections">
                    All of My Sections ({teacherSections.join(", ")})
                  </option>
                  {teacherSections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 font-medium">
                  Choose "All of My Sections" to publish to all your classes, or select an individual section above.
                </p>
              </div>

              {/* Passing Score & XP Reward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-800">Stage Passing Score</span>
                    <span className="text-indigo-600 font-mono bg-indigo-50 px-2.5 py-0.5 rounded-lg font-black">
                      {formPassingScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={formPassingScore}
                    onChange={(e) => setFormPassingScore(parseInt(e.target.value, 10))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs text-slate-400 font-medium block">
                    Pupils must score at least {formPassingScore}% on all quizzes to earn badge.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800 block">Stage Completion XP</label>
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    step="50"
                    value={formXpReward}
                    onChange={(e) => setFormXpReward(parseInt(e.target.value, 10) || 350)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none"
                  />
                  <span className="text-xs text-slate-400 font-medium block">
                    Total bonus experience awarded upon completing this stage.
                  </span>
                </div>
              </div>

              {/* Curriculum Stage Summary */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>Curriculum Stage Summary <span className="text-rose-500">*</span></span>
                  <span className="text-xs text-slate-400 font-medium">Min. 5 characters</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the core reading competency, themes, and learning goals for pupils in this stage..."
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Next Step Action */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setCurrentStep(2)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl px-7 py-3.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>Proceed to Story Lessons &amp; Sentences (Step 2)</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ════ STEP 2: UNLIMITED SENTENCES, PICTURES & COMPREHENSION QUIZZES ════ */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs space-y-7 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <span>Step 2: Sentence-by-Sentence Story Builder</span>
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">
                    Add unlimited reading sentences, highlight words with your mouse to create vocabulary, and attach picture illustrations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={formLessons.length >= 3}
                    onClick={addLesson}
                    className="h-10 px-4 text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>Add Story Chapter ({formLessons.length}/3)</span>
                  </Button>
                </div>
              </div>

              {/* Lesson Tabs */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {formLessons.map((l, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      setTaggingSentenceIdx(null);
                      setInteractiveModeSentenceIdx(null);
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeLessonIndex === idx
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    <span>Story {idx + 1}: {l.lesson_title.trim() ? `${l.lesson_title.slice(0, 20)}...` : `Story ${idx + 1}`}</span>
                    {formLessons.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLesson(idx);
                        }}
                        className="hover:text-rose-300 p-0.5 rounded-full"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Active Story Editor */}
              <div className="space-y-7 p-6 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-800">Story Title *</label>
                    <input
                      type="text"
                      value={currentLesson.lesson_title}
                      onChange={(e) =>
                        updateCurrentLesson((l) => ({ ...l, lesson_title: e.target.value }))
                      }
                      placeholder="e.g., The Mystery of the Old Oak Tree"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Difficulty Level</label>
                    <select
                      value={currentLesson.difficulty_level}
                      onChange={(e) =>
                        updateCurrentLesson((l) => ({
                          ...l,
                          difficulty_level: e.target.value as "easy" | "medium" | "hard",
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white outline-none"
                    >
                      <option value="easy">🟢 Easy (Grade 3 Starter)</option>
                      <option value="medium">🟡 Medium (Grade 3 Standard)</option>
                      <option value="hard">🔴 Hard (Grade 3 Challenge)</option>
                    </select>
                  </div>
                </div>

                {/* ── SENTENCE-BY-SENTENCE DUAL-CODING STORY BUILDER ── */}
                <div className="space-y-5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <span>Story Sentences &amp; Dual-Coding Illustrations ({(currentLesson.sentences || []).length} Sentences)</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Each sentence is an individual reading page. Highlight words inside any sentence to define vocabulary!
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowBulkPasteModal(!showBulkPasteModal)}
                        className="h-9 px-3.5 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Paste Full Story</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={addSentence}
                        className="h-9 px-4 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Sentence</span>
                      </Button>
                    </div>
                  </div>

                  {/* Bulk Paste Expander */}
                  {showBulkPasteModal && (
                    <div className="p-5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 space-y-3.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-indigo-950 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>Paste Full Story Passage (Auto-Split into Sentence Cards)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowBulkPasteModal(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={bulkPasteText}
                        onChange={(e) => setBulkPasteText(e.target.value)}
                        placeholder="Paste your whole story paragraph here... It will automatically split into individual sentence cards with image uploaders!"
                        className="w-full p-4 rounded-xl border border-indigo-200 bg-white text-sm font-medium text-slate-800 outline-none leading-relaxed"
                      />
                      <div className="flex justify-end gap-2.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowBulkPasteModal(false)}
                          className="text-xs font-bold text-slate-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleBulkPassageSplit}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2"
                        >
                          Split into Sentence Cards
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Helper Callout Banner for Teachers */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                      <Highlighter className="w-4 h-4" />
                    </div>
                    <div className="text-xs text-amber-950 font-medium leading-normal">
                      <strong>Highlight to Tag Vocabulary:</strong> Simply highlight any word with your mouse inside a sentence box to immediately pop open the vocabulary definition editor!
                    </div>
                  </div>

                  {/* List of Sentences (Expansive Layout) */}
                  <div className="space-y-6">
                    {(currentLesson.sentences || []).map((sentence, sIdx) => (
                      <div
                        key={sentence.sentence_id || sIdx}
                        className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5 hover:border-indigo-300 transition-all"
                      >
                        {/* Sentence Card Top Bar */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                              {sIdx + 1}
                            </span>
                            <span className="text-sm font-black text-slate-800">
                              Sentence {sIdx + 1} of {(currentLesson.sentences || []).length}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setInteractiveModeSentenceIdx(
                                  interactiveModeSentenceIdx === sIdx ? null : sIdx
                                )
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                interactiveModeSentenceIdx === sIdx
                                  ? "bg-indigo-600 text-white shadow-2xs font-black"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              <MousePointerClick className="w-3.5 h-3.5" />
                              <span>{interactiveModeSentenceIdx === sIdx ? "Close Word Clicker" : "Word Click Tagger"}</span>
                            </button>

                            <button
                              type="button"
                              disabled={sIdx === 0}
                              onClick={() => moveSentence(sIdx, "up")}
                              className="p-1.5 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={sIdx === (currentLesson.sentences || []).length - 1}
                              onClick={() => moveSentence(sIdx, "down")}
                              className="p-1.5 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            {(currentLesson.sentences || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSentence(sIdx)}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                                title="Delete Sentence"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sentence Text & Picture Layout (Full-Canvas Wide Columns) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Left: Sentence Text & In-Sentence Vocabulary (7 Cols) */}
                          <div className="lg:col-span-7 space-y-3">
                            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>Sentence Content *</span>
                              <span className="text-[11px] text-indigo-600 font-medium">
                                Highlight any word with your mouse 🖱️
                              </span>
                            </label>

                            <div className="relative">
                              <textarea
                                rows={3}
                                value={sentence.sentence_text}
                                onMouseUp={(e) => handleSentenceTextSelection(sIdx, e)}
                                onTouchEnd={(e) => handleSentenceTextSelection(sIdx, e)}
                                onChange={(e) => updateSentenceText(sIdx, e.target.value)}
                                placeholder={`Type sentence ${sIdx + 1} here (e.g. "Mia walked slowly into her new classroom with her backpack.")... Highlight any word to define it!`}
                                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed min-h-[95px]"
                              />
                            </div>

                            {/* Interactive Word Clicker View (if toggled) */}
                            {interactiveModeSentenceIdx === sIdx && sentence.sentence_text && (
                              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                                <span className="text-xs font-black text-indigo-950 block">
                                  Click on any word below to tag it as vocabulary:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {sentence.sentence_text.split(/\s+/).map((w, wIdx) => {
                                    const clean = w.replace(/^[^\w]+|[^\w]+$/g, "");
                                    const isTagged = (sentence.vocabulary || []).some(
                                      (v) => v.word.toLowerCase() === clean.toLowerCase()
                                    );
                                    return (
                                      <button
                                        key={wIdx}
                                        type="button"
                                        onClick={() => {
                                          if (clean.length >= 2) {
                                            setTaggingSentenceIdx(sIdx);
                                            setNewVocabWord(clean);
                                            setNewVocabDef("");
                                          }
                                        }}
                                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          isTagged
                                            ? "bg-amber-200 border border-amber-400 text-amber-950"
                                            : "bg-white border border-slate-200 text-slate-800 hover:bg-indigo-100 hover:text-indigo-900"
                                        }`}
                                      >
                                        {isTagged && "⭐ "}
                                        {w}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* In-Sentence Tagged Vocabulary Chips */}
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <SpellCheck className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Tagged Words ({(sentence.vocabulary || []).length})</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setTaggingSentenceIdx(taggingSentenceIdx === sIdx ? null : sIdx);
                                    setNewVocabWord("");
                                    setNewVocabDef("");
                                  }}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Word Definition</span>
                                </button>
                              </div>

                              {/* Tagged Words List */}
                              {(sentence.vocabulary || []).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {(sentence.vocabulary || []).map((v, vIdx) => (
                                    <div
                                      key={vIdx}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold shadow-2xs"
                                      title={v.definition}
                                    >
                                      <span>⭐ {v.word}</span>
                                      <span className="text-xs text-amber-800 font-normal">
                                        ({v.definition})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => removeVocabFromSentence(sIdx, vIdx)}
                                        className="text-amber-800 hover:text-rose-600 cursor-pointer ml-0.5"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Inline Word Tagger Form (from Mouse Highlight or Button) */}
                              {taggingSentenceIdx === sIdx && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50 to-blue-50 border-2 border-indigo-400 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                                      <Highlighter className="w-4 h-4 text-indigo-600" />
                                      <span>Define Tagged Word in Sentence {sIdx + 1}:</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTaggingSentenceIdx(null);
                                        setHighlightToast(null);
                                      }}
                                      className="text-slate-400 hover:text-slate-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-4">
                                      <input
                                        type="text"
                                        value={newVocabWord}
                                        onChange={(e) => setNewVocabWord(e.target.value)}
                                        placeholder="Word (e.g. nervous)"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-slate-800 outline-none"
                                      />
                                    </div>
                                    <div className="sm:col-span-8">
                                      <input
                                        ref={vocabInputRef}
                                        type="text"
                                        value={newVocabDef}
                                        onChange={(e) => setNewVocabDef(e.target.value)}
                                        placeholder="Child-friendly meaning (e.g. feeling worried or shy)"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 outline-none"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            addVocabToSentence(sIdx, newVocabWord, newVocabDef);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setTaggingSentenceIdx(null);
                                        setHighlightToast(null);
                                      }}
                                      className="h-8 px-3 text-xs font-bold text-slate-600"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => addVocabToSentence(sIdx, newVocabWord, newVocabDef)}
                                      className="h-8 px-4 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                                    >
                                      Save Word Definition
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Sentence Illustration Picture (5 Cols) */}
                          <div className="lg:col-span-5 space-y-2">
                            <label className="text-xs font-bold text-slate-700 block">
                              Sentence Illustration Picture
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              id={`sentence-file-${sIdx}`}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleSentenceImageFile(sIdx, file);
                              }}
                            />

                            {sentence.image_url ? (
                              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-44 sm:h-48 flex items-center justify-center shadow-2xs">
                                <img
                                  src={sentence.image_url}
                                  alt={`Sentence ${sIdx + 1} Illustration`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                  <label
                                    htmlFor={`sentence-file-${sIdx}`}
                                    className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-slate-100 cursor-pointer shadow-sm"
                                  >
                                    Change Picture
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => updateSentenceImage(sIdx, "")}
                                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 cursor-pointer shadow-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label
                                htmlFor={`sentence-file-${sIdx}`}
                                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl h-44 sm:h-48 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center p-4"
                              >
                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                                  <ImagePlus className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-slate-800 block">
                                  Upload Picture for Sentence {sIdx + 1}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  PNG, JPG, WebP (Max 3MB)
                                </span>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Next Sentence Bottom Button */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={addSentence}
                      variant="outline"
                      className="w-full py-4 border-dashed border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 font-black text-sm rounded-2xl cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Next Sentence to Story</span>
                    </Button>
                  </div>
                </div>

                {/* ── ❓ Lesson Comprehension Questions Builder ── */}
                <div className="space-y-4 pt-5 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-emerald-600" />
                        <span>Story Comprehension Quiz ({currentLesson.questions.length} Questions)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select the radio button on the left to indicate the correct answer.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addQuestion}
                      className="h-9 px-3 text-xs font-bold rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Add Question</span>
                    </Button>
                  </div>

                  {currentLesson.questions.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-2.5">
                      <p className="text-sm text-slate-400 font-medium">
                        No quiz questions added yet for this story.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={addQuestion}
                        className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        <span>Add First Comprehension Question</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentLesson.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                                {qIdx + 1}
                              </span>
                              <span>Question {qIdx + 1}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => removeQuestion(qIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={q.question_text}
                              onChange={(e) => updateQuestion(qIdx, "question_text", e.target.value)}
                              placeholder="Enter question text here..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none"
                            />
                          </div>

                          {/* Choices Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.choices.map((choice, cIdx) => (
                              <div
                                key={cIdx}
                                onClick={() => setQuestionChoiceCorrect(qIdx, cIdx)}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                                  choice.is_correct
                                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                                    : "bg-slate-50 border-slate-200 text-slate-800"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${activeLessonIndex}-${qIdx}`}
                                  checked={choice.is_correct}
                                  onChange={() => setQuestionChoiceCorrect(qIdx, cIdx)}
                                  className="accent-emerald-600 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-500 w-4">
                                  {choice.choice_letter}.
                                </span>
                                <input
                                  type="text"
                                  value={choice.choice_text}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => updateChoiceText(qIdx, cIdx, e.target.value)}
                                  placeholder={`Choice ${choice.choice_letter}`}
                                  className="w-full bg-transparent text-sm outline-none font-medium"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="text-sm font-bold rounded-2xl px-6 py-3.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Back to Badge Identity</span>
                </Button>

                <Button
                  type="button"
                  disabled={!isStep2Valid}
                  onClick={() => setCurrentStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl px-7 py-3.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>Proceed to Final Mastery Quiz (Step 3)</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ════ STEP 3: STAGE FINAL QUIZ & PUBLISH REVIEW ════ */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs space-y-7 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-indigo-600" />
                  <span>Step 3: Stage Final Mastery Quiz &amp; Publish</span>
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Configure the comprehensive stage evaluation exam that awards pupils their Achievement Seal.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Stage Final Quiz Title</label>
                <input
                  type="text"
                  value={finalQuizTitle}
                  onChange={(e) => setFinalQuizTitle(e.target.value)}
                  placeholder="e.g., Adventure Quest Final Evaluation"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none"
                />
              </div>

              {/* Stage Final Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800">
                    Comprehensive Questions ({finalQuizQuestions.length})
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addFinalQuestion}
                    className="h-9 px-3 text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Final Question</span>
                  </Button>
                </div>

                {finalQuizQuestions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2.5">
                    <p className="text-sm text-slate-400 font-medium">
                      No final evaluation questions added yet.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={addFinalQuestion}
                      className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>Add First Final Question</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {finalQuizQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                              {qIdx + 1}
                            </span>
                            <span>Final Exam Question {qIdx + 1}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFinalQuestion(qIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={q.question_text}
                          onChange={(e) =>
                            setFinalQuizQuestions(
                              finalQuizQuestions.map((item, idx) =>
                                idx === qIdx ? { ...item, question_text: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Enter comprehensive question text..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white outline-none"
                        />

                        {/* Choices Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.choices.map((choice, cIdx) => (
                            <div
                              key={cIdx}
                              onClick={() => setFinalChoiceCorrect(qIdx, cIdx)}
                              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                                choice.is_correct
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`final-q-${qIdx}`}
                                checked={choice.is_correct}
                                onChange={() => setFinalChoiceCorrect(qIdx, cIdx)}
                                className="accent-emerald-600 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-500 w-4">
                                {choice.choice_letter}.
                              </span>
                              <input
                                type="text"
                                value={choice.choice_text}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateFinalChoiceText(qIdx, cIdx, e.target.value)}
                                placeholder={`Choice ${choice.choice_letter}`}
                                className="w-full bg-transparent text-sm outline-none font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publication Checklist Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-emerald-50/40 border border-indigo-200/80 space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-indigo-950">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Curriculum Pre-Publish Verification</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white/90 border border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Badge</span>
                    <span className="text-sm font-black text-slate-800 truncate block mt-0.5">
                      {formBadgeName || "Ready"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Stories</span>
                    <span className="text-sm font-black text-slate-800 block mt-0.5">
                      {formLessons.length} Chapters
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Sentences</span>
                    <span className="text-sm font-black text-slate-800 block mt-0.5">
                      {formLessons.reduce((acc, l) => acc + (l.sentences || []).length, 0)} Total
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Reward</span>
                    <span className="text-sm font-black text-indigo-700 block mt-0.5">
                      +{formXpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Publish Action Buttons */}
              <div className="flex items-center justify-between pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="text-sm font-bold rounded-2xl px-6 py-3.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Back to Stories &amp; Sentences</span>
                </Button>

                <Button
                  type="button"
                  disabled={!isStep3Valid || isSaving}
                  onClick={handlePublish}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl px-9 py-4 shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isSaving ? "Publishing Curriculum..." : "Publish Stage Badge to Classroom"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Live Badge Preview Sidebar (3 Cols) ── */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Live Badge Preview</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Pupil View
              </span>
            </div>

            {/* Visual Animated Badge Graphic */}
            <div className="p-6 bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-amber-50/40 rounded-2xl border border-indigo-100/80 flex flex-col items-center justify-center text-center">
              <BadgeGraphic
                badgeIconUrl={formBadgeIconUrl}
                type="star"
                size="lg"
                status="completed"
              />
              <h4 className="text-sm font-black text-slate-900 mt-3">{formBadgeName || "Custom Milestone Badge"}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] line-clamp-2">
                {formDescription || "Classroom learning goal description."}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs font-bold text-slate-700">
                <span className="text-indigo-600">🎖️ {formXpReward} XP</span>
                <span>·</span>
                <span className="text-emerald-600">Pass: {formPassingScore}%</span>
              </div>
            </div>

            {/* Quick Rules Checklist */}
            <div className="space-y-2.5 text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Validation &amp; Requirements
              </span>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isStep1Valid ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isStep1Valid ? "✓" : "1"}
                  </div>
                  <span className={isStep1Valid ? "font-bold text-emerald-950" : ""}>
                    Step 1: Custom Artwork &amp; Title
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isStep2Valid ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isStep2Valid ? "✓" : "2"}
                  </div>
                  <span className={isStep2Valid ? "font-bold text-emerald-950" : ""}>
                    Step 2: Sentences &amp; Visual Illustrations
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isStep3Valid ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isStep3Valid ? "✓" : "3"}
                  </div>
                  <span className={isStep3Valid ? "font-bold text-emerald-950" : ""}>
                    Step 3: Final Mastery Quiz
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
