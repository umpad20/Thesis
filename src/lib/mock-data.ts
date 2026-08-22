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

// ---- Badges (Star, Ribbon, Medal Badges) ----
export const mockBadges: Badge[] = [
  // 1. Star Badges (Lesson Mastery Milestones)
  {
    badge_id: 1,
    badge_name: "Reading Star",
    badge_type: "star",
    medal_type: null,
    description: "Begin your reading adventure by completing Lesson 1 story and evaluation.",
    badge_order: 1,
    required_passing_score: 70,
    xp_reward: 100,
    badge_icon_url: "/badges/star_reading.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 2,
    badge_name: "Vocabulary Star",
    badge_type: "star",
    medal_type: null,
    description: "Master contextual Grade 3 vocabulary definitions and sentence usage.",
    badge_order: 2,
    required_passing_score: 70,
    xp_reward: 150,
    badge_icon_url: "/badges/star_vocabulary.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 3,
    badge_name: "Fluency Star",
    badge_type: "star",
    medal_type: null,
    description: "Build steady narration pace and active listening fluency.",
    badge_order: 3,
    required_passing_score: 75,
    xp_reward: 200,
    badge_icon_url: "/badges/star_fluency.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // 2. Ribbon Badges (Stage Checkpoints & Cumulative Quizzes)
  {
    badge_id: 4,
    badge_name: "Reading Ribbon",
    badge_type: "ribbon",
    medal_type: null,
    description: "Conferred for clearing Stage 1 & 2 cumulative comprehension checkpoints.",
    badge_order: 4,
    required_passing_score: 75,
    xp_reward: 250,
    badge_icon_url: "/badges/ribbon_reading.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 5,
    badge_name: "Comprehension Ribbon",
    badge_type: "ribbon",
    medal_type: null,
    description: "Conferred for high-level inferential reasoning and textual evidence analysis.",
    badge_order: 5,
    required_passing_score: 80,
    xp_reward: 300,
    badge_icon_url: "/badges/ribbon_comprehension.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // 3. Medal Badges (Final Mastery Accolades)
  {
    badge_id: 6,
    badge_name: "Bronze Reader Medal",
    badge_type: "medal",
    medal_type: "bronze",
    description: "Demonstrate solid grade-level mastery across foundational reading passages.",
    badge_order: 6,
    required_passing_score: 80,
    xp_reward: 400,
    badge_icon_url: "/badges/medal_bronze.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 7,
    badge_name: "Silver Reader Medal",
    badge_type: "medal",
    medal_type: "silver",
    description: "Demonstrate advanced comprehension, speed, and analytical reading performance.",
    badge_order: 7,
    required_passing_score: 85,
    xp_reward: 500,
    badge_icon_url: "/badges/medal_silver.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 8,
    badge_name: "Gold Reader Medal",
    badge_type: "medal",
    medal_type: "gold",
    description: "Highest honor: Exceptional mastery across all Grade 3 curriculum modules.",
    badge_order: 8,
    required_passing_score: 90,
    xp_reward: 750,
    badge_icon_url: "/badges/medal_gold.svg",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
];

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
  {
    badge_progress_id: 6,
    student_id: 1,
    badge_id: 6,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 7,
    student_id: 1,
    badge_id: 7,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 8,
    student_id: 1,
    badge_id: 8,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
];

// ---- Lessons (Core Base Lessons & Section-Specific Stories) ----
export const mockLessons: Lesson[] = [
  {
    lesson_id: 1,
    badge_id: 1,
    teacher_id: 1,
    lesson_title: "The Little Maya Bird",
    lesson_description: "Follow the brave little bird on its first morning flight over the rice fields.",
    lesson_order: 1,
    difficulty_level: "easy",
    passing_score: 70,
    status: "published",
    target_section: "all", // Developer Core Lesson: Visible to all sections
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 2,
    badge_id: 1,
    teacher_id: 1,
    lesson_title: "The Brave Carabao",
    lesson_description: "Discover how Kaloy the carabao works hard and cares for his friends.",
    lesson_order: 2,
    difficulty_level: "easy",
    passing_score: 70,
    status: "published",
    target_section: "all", // Developer Core Lesson: Visible to all sections
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 3,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "The Kind Farmer",
    lesson_description: "Learn about Mang Juan, a generous farmer who helps his neighbors in times of need.",
    lesson_order: 3,
    difficulty_level: "easy",
    passing_score: 70,
    status: "published",
    target_section: "all", // Developer Core Lesson: Visible to all sections
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 4,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "The Magic Garden",
    lesson_description: "Discover the colorful vegetables and sweet fruits growing in a secret garden.",
    lesson_order: 4,
    difficulty_level: "easy",
    passing_score: 70,
    status: "published",
    target_section: "all", // Developer Core Lesson: Visible to all sections
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 5,
    badge_id: 3,
    teacher_id: 1,
    lesson_title: "The River Adventure",
    lesson_description: "Sail down the peaceful river and learn about freshwater wildlife and nature.",
    lesson_order: 5,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "all", // Developer Core Lesson: Visible to all sections
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 6,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "The Fiesta of Grade 3-A",
    lesson_description: "Section-exclusive story: Celebrate the colorful barangay festival with Grade 3-A!",
    lesson_order: 6,
    difficulty_level: "easy",
    passing_score: 75,
    status: "published",
    target_section: "Grade 3-A", // Teacher Section Story: Visible ONLY to Grade 3-A
    created_at: "2026-08-15",
    updated_at: "2026-08-15",
  },
  {
    lesson_id: 7,
    badge_id: 3,
    teacher_id: 1,
    lesson_title: "The Science Explorers of Grade 3-B",
    lesson_description: "Section-exclusive story: Join the young Grade 3-B botanists discovering forest ecosystems.",
    lesson_order: 7,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "Grade 3-B", // Teacher Section Story: Visible ONLY to Grade 3-B
    created_at: "2026-08-15",
    updated_at: "2026-08-15",
  },
  {
    lesson_id: 8,
    badge_id: 4,
    teacher_id: 1,
    lesson_title: "The Golden Harvest Tale",
    lesson_description: "Draft story: A tale of community cooperation during festival season.",
    lesson_order: 8,
    difficulty_level: "medium",
    passing_score: 75,
    status: "draft", // Draft: Not visible to students
    target_section: "all",
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
  {
    word_id: 4,
    lesson_id: 2,
    word: "Carabao",
    definition: "A strong water buffalo common in Philippine farms.",
    example_sentence: "Kaloy the carabao helps plow the farm soil.",
  },
  {
    word_id: 5,
    lesson_id: 1,
    word: "Feathers",
    definition: "The soft, light covering on a bird's body.",
    example_sentence: "The little maya bird fluttered its brown feathers.",
  },
  {
    word_id: 6,
    lesson_id: 4,
    word: "Blossom",
    definition: "A flower or cluster of flowers on a tree or plant.",
    example_sentence: "The mango tree began to blossom in spring.",
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
  currentBadge: "Vocabulary Star",
  currentBadgeType: "star" as const,
  lessonsCompleted: 4,
  quizzesPassed: 3,
  streakDays: 5,
};
