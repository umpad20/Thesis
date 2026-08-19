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

export interface Badge {
  badge_id: number;
  badge_name: string;
  description: string;
  badge_order: number;
  required_passing_score: number;
  xp_reward: number;
}

export interface Lesson {
  lesson_id: number;
  badge_id: number;
  teacher_id: number;
  lesson_title: string;
  lesson_description: string;
  lesson_order: number;
  difficulty_level: string;
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface LessonPage {
  page_id: number;
  lesson_id: number;
  page_number: number;
  page_title: string;
  content: string;
  image_url: string;
  audio_url: string;
}

export interface VocabularyWord {
  word_id: number;
  lesson_id: number;
  word: string;
  definition: string;
  example_sentence: string;
}

export interface Quiz {
  quiz_id: number;
  lesson_id: number | null;
  badge_id: number | null;
  quiz_type: string;
  quiz_title: string;
  passing_score: number;
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

export interface QuestionChoice {
  choice_id: number;
  question_id: number;
  choice_text: string;
  is_correct: boolean;
}

export interface StudentBadgeProgress {
  badge_progress_id: number;
  student_id: number;
  badge_id: number;
  status: "locked" | "in_progress" | "completed";
  completion_percentage: number;
  final_quiz_score: number | null;
  earned_date: string | null;
}

export interface StudentLessonProgress {
  progress_id: number;
  student_id: number;
  lesson_id: number;
  progress_percentage: number;
  status: "not_started" | "in_progress" | "completed";
  highest_quiz_score: number;
  last_accessed: string;
}

export interface QuizAttempt {
  attempt_id: number;
  quiz_id: number;
  student_id: number;
  attempt_number: number;
  score: number;
  percentage: number;
  status: string;
  feedback: string;
  started_at: string;
  completed_at: string;
}

export interface QuizAnswer {
  answer_id: number;
  attempt_id: number;
  question_id: number;
  selected_choice_id: number;
  is_correct: boolean;
}

// Avatar type for the avatar picker
export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  bgColor: string;
}
