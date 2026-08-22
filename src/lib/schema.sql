-- ============================================================================
-- ReadSmart Database Schema Migration
-- Defines the badge-based reading comprehension mastery schema
-- Categorizes BADGES as:
--   - Star Badge (badge_type = 'star', medal_type = NULL)
--   - Ribbon Badge (badge_type = 'ribbon', medal_type = NULL)
--   - Medal Badge (badge_type = 'medal', medal_type = 'bronze' | 'silver' | 'gold')
-- ============================================================================

-- 1. BADGES Table
CREATE TABLE IF NOT EXISTS public.badges (
    badge_id SERIAL PRIMARY KEY,
    badge_name VARCHAR(100) NOT NULL,
    badge_type VARCHAR(20) NOT NULL DEFAULT 'star' CHECK (badge_type IN ('star', 'ribbon', 'medal')),
    medal_type VARCHAR(20) CHECK (medal_type IN ('bronze', 'silver', 'gold') OR medal_type IS NULL),
    description TEXT NOT NULL,
    badge_order INT NOT NULL UNIQUE,
    required_passing_score INT NOT NULL DEFAULT 70 CHECK (required_passing_score >= 0 AND required_passing_score <= 100),
    xp_reward INT NOT NULL DEFAULT 100 CHECK (xp_reward >= 0),
    badge_icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure required columns exist if table was already created
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS badge_type VARCHAR(20) DEFAULT 'star';
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS medal_type VARCHAR(20);
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS badge_icon_url TEXT;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add check constraint for badge_type and medal_type consistency
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_badge_type_valid'
    ) THEN
        ALTER TABLE public.badges ADD CONSTRAINT check_badge_type_valid 
        CHECK (badge_type IN ('star', 'ribbon', 'medal'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_medal_type_valid'
    ) THEN
        ALTER TABLE public.badges ADD CONSTRAINT check_medal_type_valid 
        CHECK (medal_type IN ('bronze', 'silver', 'gold') OR medal_type IS NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_medal_type_consistency'
    ) THEN
        ALTER TABLE public.badges ADD CONSTRAINT check_medal_type_consistency 
        CHECK (
            (badge_type = 'medal' AND medal_type IS NOT NULL) OR
            (badge_type IN ('star', 'ribbon') AND medal_type IS NULL)
        );
    END IF;
END $$;

-- 2. LESSONS Table
CREATE TABLE IF NOT EXISTS public.lessons (
    lesson_id SERIAL PRIMARY KEY,
    badge_id INT NOT NULL REFERENCES public.badges(badge_id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL,
    lesson_title VARCHAR(200) NOT NULL,
    lesson_description TEXT,
    lesson_order INT NOT NULL DEFAULT 1,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    passing_score INT NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    target_section VARCHAR(100) NOT NULL DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS target_section VARCHAR(100) DEFAULT 'all';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section VARCHAR(100) DEFAULT 'Grade 3-A';

-- 2b. TEACHER_SECTIONS Table
CREATE TABLE IF NOT EXISTS public.teacher_sections (
    section_id SERIAL PRIMARY KEY,
    teacher_id UUID,
    section_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.teacher_sections (section_name)
VALUES ('Grade 3-A'), ('Grade 3-B')
ON CONFLICT (section_name) DO NOTHING;

-- 3. LESSON_PAGES Table
CREATE TABLE IF NOT EXISTS public.lesson_pages (
    page_id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES public.lessons(lesson_id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    page_title VARCHAR(150),
    content TEXT NOT NULL,
    image_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(lesson_id, page_number)
);

-- 4. VOCABULARY_WORDS Table
CREATE TABLE IF NOT EXISTS public.vocabulary_words (
    word_id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES public.lessons(lesson_id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    definition TEXT NOT NULL,
    example_sentence TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. QUIZZES Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    quiz_id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES public.lessons(lesson_id) ON DELETE SET NULL,
    badge_id INT REFERENCES public.badges(badge_id) ON DELETE CASCADE,
    quiz_type VARCHAR(50) NOT NULL DEFAULT 'lesson_evaluation' CHECK (quiz_type IN ('lesson_evaluation', 'badge_cumulative_quiz', 'mastery_final_quiz')),
    quiz_title VARCHAR(200) NOT NULL,
    passing_score INT NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. QUIZ_QUESTIONS Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    question_id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'identification')),
    points INT NOT NULL DEFAULT 10,
    hint TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. QUESTION_CHOICES Table
CREATE TABLE IF NOT EXISTS public.question_choices (
    choice_id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES public.quiz_questions(question_id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. STUDENT_BADGE_PROGRESS Table
CREATE TABLE IF NOT EXISTS public.student_badge_progress (
    badge_progress_id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL,
    badge_id INT NOT NULL REFERENCES public.badges(badge_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'completed')),
    completion_percentage INT NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    final_quiz_score NUMERIC CHECK (final_quiz_score IS NULL OR (final_quiz_score >= 0 AND final_quiz_score <= 100)),
    earned_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, badge_id)
);

-- 9. STUDENT_LESSON_PROGRESS Table
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    progress_id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL,
    lesson_id INT NOT NULL REFERENCES public.lessons(lesson_id) ON DELETE CASCADE,
    progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    highest_quiz_score NUMERIC NOT NULL DEFAULT 0 CHECK (highest_quiz_score >= 0 AND highest_quiz_score <= 100),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, lesson_id)
);

-- 10. QUIZ_ATTEMPTS Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    score INT NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed', 'passed')),
    feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 11. QUIZ_ANSWERS Table
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    answer_id SERIAL PRIMARY KEY,
    attempt_id INT NOT NULL REFERENCES public.quiz_attempts(attempt_id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES public.quiz_questions(question_id) ON DELETE CASCADE,
    selected_choice_id INT REFERENCES public.question_choices(choice_id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- 12. ACTIVITY_LOGS Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id UUID,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- SEED DATA: Star, Ribbon, and Medal Badges
-- ============================================================================
INSERT INTO public.badges (badge_id, badge_name, badge_type, medal_type, description, badge_order, required_passing_score, xp_reward, badge_icon_url)
VALUES
    -- Star Badges (Lesson Mastery Milestones)
    (1, 'Reading Star', 'star', NULL, 'Begin your reading journey by completing your first story and comprehension quiz.', 1, 70, 100, '/badges/star_reading.svg'),
    (2, 'Vocabulary Star', 'star', NULL, 'Master contextual grade 3 vocabulary and understand word meanings.', 2, 70, 150, '/badges/star_vocabulary.svg'),
    (3, 'Fluency Star', 'star', NULL, 'Develop fluent narrative pace and accurate story listening skills.', 3, 75, 200, '/badges/star_fluency.svg'),

    -- Ribbon Badges (Stage Milestone Quizzes)
    (4, 'Reading Ribbon', 'ribbon', NULL, 'Awarded for clearing Stage 1 & 2 cumulative comprehension checkpoints.', 4, 75, 250, '/badges/ribbon_reading.svg'),
    (5, 'Comprehension Ribbon', 'ribbon', NULL, 'Awarded for high-level inference and critical reading evaluations.', 5, 80, 300, '/badges/ribbon_comprehension.svg'),

    -- Medal Badges (Final Mastery Accolades)
    (6, 'Bronze Reader Medal', 'medal', 'bronze', 'Demonstrate solid grade-level mastery across foundational reading passages.', 6, 80, 400, '/badges/medal_bronze.svg'),
    (7, 'Silver Reader Medal', 'medal', 'silver', 'Demonstrate advanced comprehension, speed, and analytical reading performance.', 7, 85, 500, '/badges/medal_silver.svg'),
    (8, 'Gold Reader Medal', 'medal', 'gold', 'Highest honor: Perfect or near-perfect mastery across all Grade 3 modules.', 8, 90, 750, '/badges/medal_gold.svg')
ON CONFLICT (badge_id) DO UPDATE SET
    badge_name = EXCLUDED.badge_name,
    badge_type = EXCLUDED.badge_type,
    medal_type = EXCLUDED.medal_type,
    description = EXCLUDED.description,
    badge_order = EXCLUDED.badge_order,
    required_passing_score = EXCLUDED.required_passing_score,
    xp_reward = EXCLUDED.xp_reward,
    badge_icon_url = EXCLUDED.badge_icon_url;
