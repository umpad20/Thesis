// ============================================
// ReadSmart Mock Data
// Realistic placeholder data for UI development
// ============================================

import type {
  Badge,
  Lesson,
  LessonPage,
  VocabularyWord,
  QuizQuestion,
  QuestionChoice,
  StudentBadgeProgress,
  AvatarOption,
} from "./types";

// ---- Avatars ----
export const avatarOptions: AvatarOption[] = [
  { id: "fox", emoji: "🦊", label: "Fox", bgColor: "bg-orange-100" },
  { id: "bear", emoji: "🐻", label: "Bear", bgColor: "bg-amber-100" },
  { id: "bunny", emoji: "🐰", label: "Bunny", bgColor: "bg-pink-100" },
  { id: "owl", emoji: "🦉", label: "Owl", bgColor: "bg-purple-100" },
  { id: "cat", emoji: "🐱", label: "Cat", bgColor: "bg-yellow-100" },
  { id: "dog", emoji: "🐶", label: "Dog", bgColor: "bg-blue-100" },
  { id: "panda", emoji: "🐼", label: "Panda", bgColor: "bg-green-100" },
  { id: "lion", emoji: "🦁", label: "Lion", bgColor: "bg-orange-100" },
];

// ---- Badges ----
export const mockBadges: Badge[] = [
  {
    badge_id: 1,
    badge_name: "Cold Badge",
    description: "Begin your reading adventure!",
    badge_order: 1,
    required_passing_score: 70,
    xp_reward: 100,
  },
  {
    badge_id: 2,
    badge_name: "Fire Badge",
    description: "You are getting warmer!",
    badge_order: 2,
    required_passing_score: 70,
    xp_reward: 150,
  },
  {
    badge_id: 3,
    badge_name: "Water Badge",
    description: "Dive deeper into reading!",
    badge_order: 3,
    required_passing_score: 75,
    xp_reward: 200,
  },
  {
    badge_id: 4,
    badge_name: "Nature Badge",
    description: "Explore the world of words!",
    badge_order: 4,
    required_passing_score: 75,
    xp_reward: 250,
  },
  {
    badge_id: 5,
    badge_name: "Master Reader Badge",
    description: "You are a reading champion!",
    badge_order: 5,
    required_passing_score: 80,
    xp_reward: 500,
  },
];

export const badgeEmojis: Record<number, string> = {
  1: "❄️",
  2: "🔥",
  3: "💧",
  4: "🌿",
  5: "⭐",
};

export const badgeColors: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-700" },
  2: { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700" },
  3: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700" },
  4: { bg: "bg-green-100", border: "border-green-300", text: "text-green-700" },
  5: { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-700" },
};

// ---- Student badge progress ----
export const mockBadgeProgress: StudentBadgeProgress[] = [
  {
    badge_progress_id: 1,
    student_id: 1,
    badge_id: 1,
    status: "completed",
    completion_percentage: 100,
    final_quiz_score: 90,
    earned_date: "2026-08-10",
  },
  {
    badge_progress_id: 2,
    student_id: 1,
    badge_id: 2,
    status: "in_progress",
    completion_percentage: 60,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 3,
    student_id: 1,
    badge_id: 3,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 4,
    student_id: 1,
    badge_id: 4,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 5,
    student_id: 1,
    badge_id: 5,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
];

// ---- Lessons (for badge 2 which is in-progress) ----
export const mockLessons: Lesson[] = [
  {
    lesson_id: 3,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "The Kind Farmer",
    lesson_description: "Learn about a farmer who helps his community.",
    lesson_order: 1,
    difficulty_level: "easy",
    passing_score: 70,
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 4,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "The Magic Garden",
    lesson_description: "Discover what grows in a special garden.",
    lesson_order: 2,
    difficulty_level: "easy",
    passing_score: 70,
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
];

// ---- Lesson pages ----
export const mockLessonPages: LessonPage[] = [
  {
    page_id: 1,
    lesson_id: 3,
    page_number: 1,
    page_title: "Meet Mang Juan",
    content:
      "Mang Juan is a kind farmer. He lives in a small town near the river. Every morning, he wakes up early to take care of his farm. He grows rice, vegetables, and fruits.",
    image_url: "/images/farmer.png",
    audio_url: "/audio/page1.mp3",
  },
  {
    page_id: 2,
    lesson_id: 3,
    page_number: 2,
    page_title: "Helping the Neighbors",
    content:
      "Mang Juan always shares his harvest with his neighbors. He gives rice to families who need food. The children in the town love him because he also gives them fresh mangoes.",
    image_url: "/images/sharing.png",
    audio_url: "/audio/page2.mp3",
  },
  {
    page_id: 3,
    lesson_id: 3,
    page_number: 3,
    page_title: "A Rainy Day",
    content:
      "One rainy day, the river flooded. Mang Juan helped his neighbors move to a safe place. He carried bags of rice and brought blankets. Everyone was thankful for his kindness.",
    image_url: "/images/rainy.png",
    audio_url: "/audio/page3.mp3",
  },
];

// ---- Vocabulary words ----
export const mockVocabularyWords: VocabularyWord[] = [
  {
    word_id: 1,
    lesson_id: 3,
    word: "Harvest",
    definition: "The crops that are collected from the farm.",
    example_sentence: "Mang Juan shared his harvest with his neighbors.",
  },
  {
    word_id: 2,
    lesson_id: 3,
    word: "Flooded",
    definition: "When water covers a place that is usually dry.",
    example_sentence: "The river flooded after the heavy rain.",
  },
  {
    word_id: 3,
    lesson_id: 3,
    word: "Kindness",
    definition: "Being nice and helpful to others.",
    example_sentence: "Everyone was thankful for his kindness.",
  },
];

// ---- Quiz questions ----
export const mockQuizQuestions: QuizQuestion[] = [
  {
    question_id: 1,
    quiz_id: 1,
    question_text: "What does Mang Juan grow on his farm?",
    question_type: "multiple_choice",
    points: 10,
    hint: "Look at the first page of the story!",
    explanation: "Mang Juan grows rice, vegetables, and fruits.",
  },
  {
    question_id: 2,
    quiz_id: 1,
    question_text: "What did Mang Juan give to the children?",
    question_type: "multiple_choice",
    points: 10,
    hint: "Think about what fruit the children love.",
    explanation: "He gave them fresh mangoes.",
  },
  {
    question_id: 3,
    quiz_id: 1,
    question_text: "What happened on the rainy day?",
    question_type: "multiple_choice",
    points: 10,
    hint: "Think about what happened to the river.",
    explanation: "The river flooded and Mang Juan helped his neighbors.",
  },
];

// ---- Question choices ----
export const mockQuestionChoices: Record<number, QuestionChoice[]> = {
  1: [
    { choice_id: 1, question_id: 1, choice_text: "Rice, vegetables, and fruits", is_correct: true },
    { choice_id: 2, question_id: 1, choice_text: "Flowers and trees", is_correct: false },
    { choice_id: 3, question_id: 1, choice_text: "Fish and shrimp", is_correct: false },
    { choice_id: 4, question_id: 1, choice_text: "Candy and toys", is_correct: false },
  ],
  2: [
    { choice_id: 5, question_id: 2, choice_text: "Books", is_correct: false },
    { choice_id: 6, question_id: 2, choice_text: "Fresh mangoes", is_correct: true },
    { choice_id: 7, question_id: 2, choice_text: "Toys", is_correct: false },
    { choice_id: 8, question_id: 2, choice_text: "Money", is_correct: false },
  ],
  3: [
    { choice_id: 9, question_id: 3, choice_text: "The sun was shining", is_correct: false },
    { choice_id: 10, question_id: 3, choice_text: "The river flooded", is_correct: true },
    { choice_id: 11, question_id: 3, choice_text: "A party happened", is_correct: false },
    { choice_id: 12, question_id: 3, choice_text: "School was cancelled", is_correct: false },
  ],
};

// ---- Student stats ----
export const mockStudentStats = {
  full_name: "Maria Santos",
  avatar: "🦊",
  avatarBg: "bg-orange-100",
  totalXp: 250,
  currentBadge: "Fire Badge",
  lessonsCompleted: 4,
  quizzesPassed: 3,
  streakDays: 5,
};
