"use client";

import { useState } from "react";
import {
  CheckSquare,
  CircleDot,
  Puzzle,
  ImageIcon,
  Trash2,
  Plus,
  HelpCircle,
  Sparkles,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuestionFormItem } from "./badge-creation-studio";

interface QuestionAuthoringCardProps {
  questionNumber: number;
  question: QuestionFormItem;
  isFinalExam?: boolean;
  onChange: (updated: QuestionFormItem) => void;
  onRemove: () => void;
}

export function QuestionAuthoringCard({
  questionNumber,
  question,
  isFinalExam = false,
  onChange,
  onRemove,
}: QuestionAuthoringCardProps) {
  const [showHintExplanation, setShowHintExplanation] = useState(
    Boolean(question.hint || question.explanation)
  );
  const [showQuestionImageInput, setShowQuestionImageInput] = useState(
    Boolean(question.question_image_url)
  );

  const qType = question.question_type || "multiple_choice";

  const handleTypeChange = (newType: "multiple_choice" | "checkboxes" | "matching") => {
    if (newType === qType) return;

    if (newType === "matching") {
      // Convert existing choices or build matching pairs
      const matchingChoices = question.choices.slice(0, 4).map((c, idx) => ({
        choice_letter: String.fromCharCode(65 + idx),
        choice_text: c.choice_text || `Item ${idx + 1}`,
        match_target: c.match_target || `Match ${idx + 1}`,
        is_correct: true,
      }));

      while (matchingChoices.length < 3) {
        const idx = matchingChoices.length;
        matchingChoices.push({
          choice_letter: String.fromCharCode(65 + idx),
          choice_text: "",
          match_target: "",
          is_correct: true,
        });
      }

      onChange({
        ...question,
        question_type: newType,
        choices: matchingChoices,
      });
      return;
    }

    if (newType === "multiple_choice") {
      // Ensure only 1 item is marked correct
      let foundOne = false;
      const updatedChoices = question.choices.map((c) => {
        if (c.is_correct && !foundOne) {
          foundOne = true;
          return { ...c, is_correct: true };
        }
        return { ...c, is_correct: false };
      });
      if (!foundOne && updatedChoices.length > 0) {
        updatedChoices[0].is_correct = true;
      }
      onChange({
        ...question,
        question_type: newType,
        choices: updatedChoices,
      });
      return;
    }

    // checkboxes
    onChange({
      ...question,
      question_type: newType,
    });
  };

  // Handle Question Image Upload
  const handleQuestionImageUpload = (file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image exceeds 3MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        onChange({ ...question, question_image_url: res });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Choice Image Upload
  const handleChoiceImageUpload = (choiceIdx: number, file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image exceeds 3MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        const nextChoices = question.choices.map((c, idx) =>
          idx === choiceIdx ? { ...c, choice_image_url: res } : c
        );
        onChange({ ...question, choices: nextChoices });
      }
    };
    reader.readAsDataURL(file);
  };

  // Choice updates
  const setChoiceCorrect = (choiceIdx: number) => {
    if (qType === "checkboxes") {
      const nextChoices = question.choices.map((c, idx) =>
        idx === choiceIdx ? { ...c, is_correct: !c.is_correct } : c
      );
      onChange({ ...question, choices: nextChoices });
    } else {
      const nextChoices = question.choices.map((c, idx) => ({
        ...c,
        is_correct: idx === choiceIdx,
      }));
      onChange({ ...question, choices: nextChoices });
    }
  };

  const updateChoiceText = (choiceIdx: number, text: string) => {
    const nextChoices = question.choices.map((c, idx) =>
      idx === choiceIdx ? { ...c, choice_text: text } : c
    );
    onChange({ ...question, choices: nextChoices });
  };

  const updateChoiceMatchTarget = (choiceIdx: number, target: string) => {
    const nextChoices = question.choices.map((c, idx) =>
      idx === choiceIdx ? { ...c, match_target: target } : c
    );
    onChange({ ...question, choices: nextChoices });
  };

  const removeChoice = (choiceIdx: number) => {
    if (question.choices.length <= 2) return;
    const nextChoices = question.choices
      .filter((_, idx) => idx !== choiceIdx)
      .map((c, idx) => ({ ...c, choice_letter: String.fromCharCode(65 + idx) }));
    onChange({ ...question, choices: nextChoices });
  };

  const addChoice = () => {
    if (question.choices.length >= 6) return;
    const idx = question.choices.length;
    const newChoice = {
      choice_letter: String.fromCharCode(65 + idx),
      choice_text: "",
      choice_image_url: "",
      match_target: qType === "matching" ? "" : undefined,
      is_correct: qType === "matching" ? true : false,
    };
    onChange({ ...question, choices: [...question.choices, newChoice] });
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${
        isFinalExam
          ? "bg-slate-50/80 border-indigo-200/80 shadow-2xs"
          : "bg-white border-slate-200 shadow-2xs"
      }`}
    >
      {/* ── Top Bar: Question # + Type Tabs + Points + Delete ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-2xs ${
              isFinalExam
                ? "bg-indigo-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {questionNumber}
          </span>
          <span className="text-sm font-black text-slate-900">
            {isFinalExam ? "Final Exam Question" : "Question"} {questionNumber}
          </span>
        </div>

        {/* Question Type Selector Buttons */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1">
          <button
            type="button"
            onClick={() => handleTypeChange("multiple_choice")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              qType === "multiple_choice"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Single choice with radio options"
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Single Choice</span>
            <span className="xs:hidden">Single</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("checkboxes")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              qType === "checkboxes"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Multiple correct answers"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Checkboxes</span>
            <span className="xs:hidden">Multi</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("matching")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              qType === "matching"
                ? "bg-white text-purple-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Match left items with right items"
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Matching</span>
          </button>
        </div>

        {/* XP Points + Delete */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <input
              type="number"
              min={5}
              max={100}
              step={5}
              value={question.points || 10}
              onChange={(e) =>
                onChange({ ...question, points: parseInt(e.target.value, 10) || 10 })
              }
              className="w-10 text-xs font-black text-amber-800 bg-transparent outline-none text-right"
            />
            <span className="text-[10px] font-bold text-amber-700">XP</span>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-rose-50"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Question Prompt & Question Image ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">
            {qType === "matching"
              ? "Matching Instructions / Question Title"
              : "Question Text or Prompt"}
          </label>

          <button
            type="button"
            onClick={() => setShowQuestionImageInput(!showQuestionImageInput)}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>
              {question.question_image_url
                ? "Change Question Image"
                : "+ Add Question Image"}
            </span>
          </button>
        </div>

        <input
          type="text"
          value={question.question_text}
          onChange={(e) => onChange({ ...question, question_text: e.target.value })}
          placeholder={
            qType === "matching"
              ? "e.g., Match each story character to their action in the story:"
              : "e.g., What did Mang Juan harvest from his mango trees?"
          }
          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
        />

        {/* Question Image Input Drawer */}
        {(showQuestionImageInput || question.question_image_url) && (
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2.5 anim-pop-bounce">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Question Prompt Image (Story Picture / Diagram)</span>
              </span>
              {question.question_image_url && (
                <button
                  type="button"
                  onClick={() => onChange({ ...question, question_image_url: "" })}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Thumbnail preview */}
              {question.question_image_url ? (
                <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-blue-300 shadow-2xs flex-shrink-0 bg-white">
                  <img
                    src={question.question_image_url}
                    alt="Question Prompt"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-20 rounded-xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-400 bg-white/70 flex-shrink-0">
                  <ImageIcon className="w-6 h-6 opacity-60" />
                  <span className="text-[10px] font-bold">No Image</span>
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={question.question_image_url || ""}
                    onChange={(e) =>
                      onChange({ ...question, question_image_url: e.target.value })
                    }
                    placeholder="Paste image URL (e.g. /images/stories/l1_s1.jpg)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 outline-none"
                  />
                  <label className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer flex-shrink-0 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleQuestionImageUpload(file);
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-blue-700/80">
                  Students will view this picture clearly right above the question.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mode Specific Options Editor ── */}

      {/* 1. MATCHING TYPE EDITOR */}
      {qType === "matching" ? (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <Puzzle className="w-3.5 h-3.5" />
              <span>Matching Pairs (Left Item ⇄ Right Target)</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Items will be randomly shuffled for students
            </span>
          </div>

          <div className="space-y-2.5">
            {question.choices.map((choice, cIdx) => (
              <div
                key={cIdx}
                className="p-3 rounded-xl bg-purple-50/40 border border-purple-200/80 flex flex-col sm:flex-row items-center gap-2.5 shadow-2xs"
              >
                <span className="w-6 h-6 rounded-lg bg-purple-200 text-purple-800 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {choice.choice_letter}
                </span>

                {/* Left Prompt */}
                <div className="flex-1 w-full space-y-1">
                  <input
                    type="text"
                    value={choice.choice_text}
                    onChange={(e) => updateChoiceText(cIdx, e.target.value)}
                    placeholder={`Left Clue / Word ${choice.choice_letter}`}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200/90 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-center text-purple-500 flex-shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>

                {/* Right Match Target */}
                <div className="flex-1 w-full space-y-1">
                  <input
                    type="text"
                    value={choice.match_target || ""}
                    onChange={(e) => updateChoiceMatchTarget(cIdx, e.target.value)}
                    placeholder={`Right Match Target for ${choice.choice_letter}`}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200/90 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Delete pair */}
                {question.choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(cIdx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer flex-shrink-0"
                    title="Remove Pair"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChoice}
            disabled={question.choices.length >= 6}
            className="w-full border-dashed border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Matching Pair</span>
          </Button>
        </div>
      ) : (
        /* 2. MULTIPLE CHOICE OR CHECKBOXES EDITOR */
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                qType === "checkboxes" ? "text-emerald-700" : "text-blue-700"
              }`}
            >
              {qType === "checkboxes" ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Answer Options (Check ALL that are correct)</span>
                </>
              ) : (
                <>
                  <CircleDot className="w-3.5 h-3.5" />
                  <span>Answer Options (Select the ONE correct answer)</span>
                </>
              )}
            </span>

            <span className="text-[11px] font-medium text-slate-500">
              {qType === "checkboxes"
                ? "Multiple answers can be checked"
                : "1 correct answer"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.choices.map((choice, cIdx) => (
              <div
                key={cIdx}
                className={`p-3 rounded-xl border transition-all space-y-2 ${
                  choice.is_correct
                    ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                    : "bg-slate-50/60 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    onClick={() => setChoiceCorrect(cIdx)}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type={qType === "checkboxes" ? "checkbox" : "radio"}
                      name={`card-q-${questionNumber}`}
                      checked={choice.is_correct}
                      onChange={() => setChoiceCorrect(cIdx)}
                      className="accent-emerald-600 cursor-pointer w-4 h-4"
                    />
                    <span
                      className={`text-xs font-black w-5 h-5 rounded-md flex items-center justify-center ${
                        choice.is_correct
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {choice.choice_letter}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        choice.is_correct ? "text-emerald-800" : "text-slate-500"
                      }`}
                    >
                      {choice.is_correct ? "Correct Answer" : "Incorrect"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Add Image to choice */}
                    <label
                      title="Upload picture for this option"
                      className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChoiceImageUpload(cIdx, file);
                        }}
                      />
                    </label>

                    {/* Delete choice */}
                    {question.choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(cIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Remove choice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Choice Text input */}
                <input
                  type="text"
                  value={choice.choice_text}
                  onChange={(e) => updateChoiceText(cIdx, e.target.value)}
                  placeholder={`Choice ${choice.choice_letter} text...`}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                />

                {/* Choice Image thumbnail (if present) */}
                {choice.choice_image_url ? (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative w-14 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                      <img
                        src={choice.choice_image_url}
                        alt={`Option ${choice.choice_letter}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 block truncate">
                        Option Picture attached
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextChoices = question.choices.map((c, idx) =>
                            idx === cIdx ? { ...c, choice_image_url: "" } : c
                          );
                          onChange({ ...question, choices: nextChoices });
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove Picture
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChoice}
            disabled={question.choices.length >= 6}
            className="w-full border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Choice Option</span>
          </Button>
        </div>
      )}

      {/* ── Hint & Explanation Collapsible ── */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowHintExplanation(!showHintExplanation)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Reading Hint &amp; Answer Explanation</span>
          {showHintExplanation ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showHintExplanation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 anim-pop-bounce">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Reading Hint (Optional)
              </label>
              <input
                type="text"
                value={question.hint || ""}
                onChange={(e) => onChange({ ...question, hint: e.target.value })}
                placeholder="e.g. Look closely at paragraph 2..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Answer Explanation (Shown after submitting)
              </label>
              <input
                type="text"
                value={question.explanation || ""}
                onChange={(e) => onChange({ ...question, explanation: e.target.value })}
                placeholder="e.g. Mang Juan generously distributed the fruit..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
