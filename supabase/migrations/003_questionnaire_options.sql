-- ============================================================================
-- Migration 003: Questionnaire Enhancements
-- Checkboxes, Matching Type, Question Images, and Choice Images
-- ============================================================================

-- 1. Ensure question_type check constraint is relaxed to allow checkboxes & matching
DO $$
BEGIN
    -- Drop old check constraint on quiz_questions.question_type if it exists
    ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- 2. Add image_url to quiz_questions if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'quiz_questions' 
          AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.quiz_questions ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 3. Add image_url and match_target to question_choices if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'question_choices' 
          AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.question_choices ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'question_choices' 
          AND column_name = 'match_target'
    ) THEN
        ALTER TABLE public.question_choices ADD COLUMN match_target TEXT;
    END IF;
END $$;
