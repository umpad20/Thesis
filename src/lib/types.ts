// ============================================
// ReadSmart Type Definitions
// Maps directly to the ERD schema
// ============================================

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  student_id: number;
  user_id: number;
}

export interface TeacherProfile {
  teacher_id: number;
  user_id: number;
  department: string;
}

export type BadgeType = "star" | "ribbon" | "medal";
export type MedalType = "bronze" | "silver" | "gold" | null;

export interface Badge {
  badge_id: number;
  badge_name: string;
  badge_type: BadgeType;
  medal_type: MedalType;
  description: string;
  badge_order: number;
  required_passing_score: number;
  xp_reward: number;
  badge_icon_url?: string | null;
  target_section?: string;
  teacher_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  lesson_id: number;
  badge_id: number;
  teacher_id: number | string;
  lesson_title: string;
  lesson_description: string;
  lesson_order: number;
  difficulty_level: "easy" | "medium" | "hard" | string;
  passing_score: number;
  status: "draft" | "published";
  target_section: string; // 'all' for developer core lessons, or specific section e.g. 'Grade 3-A'
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollmentInput {
  fullName: string;
  email: string;
  password?: string;
  gender: "Male" | "Female" | string;
  section: string;
  teacherId?: string;
}

export interface EnrolledStudent {
  id: string;
  name: string;
  gender: string;
  section: string;
  currentBadge: string;
  comprehension: string;
  accuracyRaw: number;
  quizzesPassed: string;
  status: "Mastering" | "On Track" | "Needs Review" | string;
  readingSpeed: string;
  lastActive: string;
  email?: string;
  avatar?: string;
}

export interface SentenceVisualCue {
  sentence_id: string;
  lesson_id: number;
  page_number: number;
  sentence_text: string;
  speaker: string;
  speaker_avatar: string;
  scene_title: string;
  scene_image_url: string;
  action_tag: string;
  cue_color: string;
}

export interface LessonPage {
  page_id: number;
  lesson_id: number;
  page_number: number;
  page_title: string;
  content: string;
  image_url?: string | null;
  audio_url?: string | null;
  visual_cues?: SentenceVisualCue[];
}

export interface VocabularyWord {
  word_id: number;
  lesson_id: number;
  word: string;
  definition: string;
  example_sentence: string;
  audio_url?: string | null;
}

export interface QuestionChoice {
  choice_id: number;
  question_id: number;
  choice_text: string;
  choice_letter?: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  question_id: number;
  quiz_id: number;
  question_text: string;
  question_type: string;
  points: number;
  hint: string;
  explanation: string;
}

export interface QuizQuestionWithChoices extends QuizQuestion {
  choices: QuestionChoice[];
}

export interface Quiz {
  quiz_id: number;
  lesson_id: number | null;
  badge_id: number | null;
  quiz_type: string;
  quiz_title: string;
  passing_score: number;
  questions?: QuizQuestionWithChoices[];
  created_at?: string;
}

export interface StudentBadgeProgress {
  badge_progress_id?: number | string;
  student_id: number | string;
  badge_id: number;
  status: "locked" | "in_progress" | "completed";
  completion_percentage: number;
  final_quiz_score?: number | null;
  earned_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentLessonProgress {
  progress_id?: number | string;
  student_id: number | string;
  lesson_id: number;
  progress_percentage: number;
  status: "not_started" | "in_progress" | "completed";
  highest_quiz_score?: number;
  last_accessed?: string;
}

export interface QuizAttempt {
  attempt_id?: number | string;
  quiz_id: number;
  student_id: number | string;
  attempt_number?: number;
  score: number;
  percentage: number;
  status: string;
  feedback?: string;
  started_at?: string;
  completed_at?: string;
}

export interface QuizAnswer {
  answer_id: number;
  attempt_id: number;
  question_id: number;
  selected_choice_id: number | null;
  is_correct: boolean;
}

export interface ActivityLog {
  log_id: number;
  user_id: number;
  activity_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Avatar type for the avatar picker
export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  bgColor: string;
}

export type RankTier = "grand_scholar" | "star_explorer" | "rising_reader" | "story_starter";

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatar: string;
  section: string;
  totalXp: number;
  comprehensionPct: number;
  quizzesPassed: number;
  streakDays: number;
  rankTier: RankTier;
  rankTierLabel: string;
  currentBadgeName: string;
}

export type InterventionRiskLevel = "critical" | "watchlist" | "mastering";

export interface InterventionPupil {
  studentId: string;
  studentName: string;
  avatar: string;
  section: string;
  comprehensionPct: number;
  quizzesPassed: number;
  failedAttemptsCount: number;
  lastActiveDate: string;
  daysInactive: number;
  riskLevel: InterventionRiskLevel;
  struggleReason: string;
  recommendedAction: string;
}

export interface InterventionRadarSummary {
  criticalCount: number;
  watchlistCount: number;
  masteringCount: number;
  totalEnrolled: number;
  pupils: InterventionPupil[];
}

