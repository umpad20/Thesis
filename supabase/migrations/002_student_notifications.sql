-- ============================================================================
-- Migration 002: Student Notifications & Teacher Guidance Notes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_notifications (
    id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL,
    teacher_id UUID,
    teacher_name VARCHAR(100) DEFAULT 'Teacher',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'guidance_note',
    recommendation TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'student_notifications' AND policyname = 'Allow public read student_notifications'
    ) THEN
        CREATE POLICY "Allow public read student_notifications" ON public.student_notifications FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'student_notifications' AND policyname = 'Allow public insert student_notifications'
    ) THEN
        CREATE POLICY "Allow public insert student_notifications" ON public.student_notifications FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'student_notifications' AND policyname = 'Allow public update student_notifications'
    ) THEN
        CREATE POLICY "Allow public update student_notifications" ON public.student_notifications FOR UPDATE USING (true);
    END IF;
END $$;
