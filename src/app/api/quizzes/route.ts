import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const quizId = searchParams.get("quizId");

    const supabase = createAdminClient();

    let query = supabase.from("quizzes").select("*");
    if (lessonId) {
      query = query.eq("lesson_id", Number(lessonId));
    } else if (quizId) {
      query = query.eq("quiz_id", Number(quizId));
    }

    const { data: quiz, error } = await query.maybeSingle();

    if (error || !quiz) {
      return NextResponse.json({ quiz: null });
    }

    // Fetch questions & choices
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.quiz_id)
      .order("question_id", { ascending: true });

    const qIds = (questions || []).map((q) => q.question_id);
    const { data: choices } = await supabase
      .from("question_choices")
      .select("*")
      .in("question_id", qIds);

    const questionsWithChoices = (questions || []).map((q) => ({
      ...q,
      choices: (choices || []).filter((c) => c.question_id === q.question_id),
    }));

    return NextResponse.json({
      quiz: {
        ...quiz,
        questions: questionsWithChoices,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching quiz";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      quizId,
      lessonId,
      badgeId,
      score,
      totalPoints,
      percentage,
      passed,
      answers,
    } = body;

    if (!studentId || !quizId) {
      return NextResponse.json({ error: "Missing student ID or quiz ID" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Record attempt
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        score: score || 0,
        percentage: percentage || 0,
        status: passed ? "passed" : "failed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select("attempt_id")
      .single();

    if (attemptErr || !attempt) {
      return NextResponse.json({ error: attemptErr?.message || "Failed to record attempt" }, { status: 500 });
    }

    // 2. Record answers
    if (Array.isArray(answers) && answers.length > 0) {
      const answerRows = answers.map((a: { questionId: number; choiceId: number; isCorrect: boolean }) => ({
        attempt_id: attempt.attempt_id,
        question_id: a.questionId,
        selected_choice_id: a.choiceId,
        is_correct: a.isCorrect,
      }));
      await supabase.from("quiz_answers").insert(answerRows);
    }

    // 3. Update student_lesson_progress
    if (lessonId) {
      await supabase.from("student_lesson_progress").upsert(
        {
          student_id: studentId,
          lesson_id: lessonId,
          progress_percentage: 100,
          status: "completed",
          highest_quiz_score: percentage,
          last_accessed: new Date().toISOString(),
        },
        { onConflict: "student_id, lesson_id" }
      );
    }

    // 4. Update student_badge_progress
    if (badgeId) {
      const { data: curProg } = await supabase
        .from("student_badge_progress")
        .select("*")
        .eq("student_id", studentId)
        .eq("badge_id", badgeId)
        .maybeSingle();

      const newPercentage = passed
        ? Math.min(100, (curProg?.completion_percentage || 0) + 50)
        : curProg?.completion_percentage || 0;

      const isCompleted = newPercentage >= 100;

      await supabase.from("student_badge_progress").upsert(
        {
          student_id: studentId,
          badge_id: badgeId,
          status: isCompleted ? "completed" : "in_progress",
          completion_percentage: newPercentage,
          final_quiz_score: percentage,
          earned_date: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id, badge_id" }
      );
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.attempt_id,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error submitting quiz attempt";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
