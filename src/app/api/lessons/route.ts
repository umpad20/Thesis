import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const status = searchParams.get("status");

    const supabase = createAdminClient();
    let query = supabase.from("lessons").select("*").order("lesson_order", { ascending: true });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: lessons, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = lessons || [];
    if (section && section !== "all") {
      filtered = filtered.filter(
        (l) => !l.target_section || l.target_section === "all" || l.target_section === section
      );
    }

    return NextResponse.json({ lessons: filtered });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching lessons";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      lesson_title,
      lesson_description,
      badge_id,
      difficulty_level,
      passing_score,
      status,
      target_section,
      teacher_id,
      pages,
      vocabulary,
      quiz_questions,
    } = body;

    if (!lesson_title) {
      return NextResponse.json({ error: "Lesson title is required." }, { status: 400 });
    }

    const targetBadgeId = Number(badge_id || 1);
    const supabase = createAdminClient();

    // Enforce max 3 lessons per badge rule
    const { data: existingBadgeLessons } = await supabase
      .from("lessons")
      .select("lesson_id")
      .eq("badge_id", targetBadgeId);

    if (existingBadgeLessons && existingBadgeLessons.length >= 3) {
      return NextResponse.json(
        {
          error:
            "This badge has already reached the maximum limit of 3 lessons. Please select another badge or create a new custom badge.",
        },
        { status: 400 }
      );
    }

    // 1. Get current max lesson order
    const { data: maxRow } = await supabase
      .from("lessons")
      .select("lesson_order")
      .order("lesson_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxRow?.lesson_order || 0) + 1;

    // 2. Insert into lessons
    const { data: newLesson, error: lessonErr } = await supabase
      .from("lessons")
      .insert({
        lesson_title: lesson_title.trim(),
        lesson_description: lesson_description?.trim() || "Grade 3 reading passage.",
        badge_id: targetBadgeId,
        difficulty_level: difficulty_level || "easy",
        passing_score: passing_score || 70,
        status: status || "published",
        target_section: target_section || "all",
        teacher_id: teacher_id || null,
        lesson_order: nextOrder,
      })
      .select()
      .single();

    if (lessonErr || !newLesson) {
      return NextResponse.json({ error: lessonErr?.message || "Failed to create lesson" }, { status: 500 });
    }

    // 3. Insert pages if provided
    if (Array.isArray(pages) && pages.length > 0) {
      const pageRows = pages.map((p, idx) => ({
        lesson_id: newLesson.lesson_id,
        page_number: idx + 1,
        page_title: p.page_title || `Page ${idx + 1}`,
        content: p.content || "",
        image_url: p.image_url || "/images/story1.png",
        audio_url: p.audio_url || "",
      }));

      await supabase.from("lesson_pages").insert(pageRows);
    }

    // 4. Insert highlighted vocabulary if provided
    if (Array.isArray(vocabulary) && vocabulary.length > 0) {
      const vocabRows = vocabulary
        .filter((v) => v.word?.trim())
        .map((v) => ({
          lesson_id: newLesson.lesson_id,
          word: v.word.trim(),
          definition: v.definition?.trim() || "",
          example_sentence: v.example_sentence?.trim() || "",
        }));

      if (vocabRows.length > 0) {
        await supabase.from("vocabulary_words").insert(vocabRows);
      }
    }

    // 5. Create Story Quiz if questions provided
    if (Array.isArray(quiz_questions) && quiz_questions.length > 0) {
      const { data: createdQuiz } = await supabase
        .from("quizzes")
        .insert({
          lesson_id: newLesson.lesson_id,
          badge_id: targetBadgeId,
          quiz_title: `${newLesson.lesson_title} - Comprehension Quiz`,
          quiz_type: "lesson",
          passing_score: passing_score || 70,
          total_questions: quiz_questions.length,
          time_limit_minutes: 10,
        })
        .select()
        .single();

      if (createdQuiz) {
        for (let qIdx = 0; qIdx < quiz_questions.length; qIdx++) {
          const q = quiz_questions[qIdx];
          const { data: createdQ } = await supabase
            .from("quiz_questions")
            .insert({
              quiz_id: createdQuiz.quiz_id,
              question_number: qIdx + 1,
              question_text: q.question_text || `Question ${qIdx + 1}`,
              question_type: "multiple_choice",
              points: q.points || 10,
              explanation: q.explanation || "Well done!",
              hint: q.hint || "",
            })
            .select()
            .single();

          if (createdQ && Array.isArray(q.choices)) {
            const choiceRows = q.choices.map((c: { choice_letter: string; choice_text: string; is_correct: boolean }) => ({
              question_id: createdQ.question_id,
              choice_letter: c.choice_letter,
              choice_text: c.choice_text,
              is_correct: !!c.is_correct,
            }));
            await supabase.from("question_choices").insert(choiceRows);
          }
        }
      }
    }

    return NextResponse.json({ success: true, lesson: newLesson });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error creating lesson";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      lesson_id,
      lesson_title,
      lesson_description,
      badge_id,
      difficulty_level,
      passing_score,
      status,
      target_section,
      pages,
      vocabulary,
    } = body;

    if (!lesson_id) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    // Protect default developer lessons (1-15)
    if (Number(lesson_id) <= 15) {
      return NextResponse.json(
        { error: "Protected Core Curriculum stories (Lessons 1-15) cannot be modified." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    const targetBadgeId = Number(badge_id || 1);

    // Enforce max 3 lessons per badge rule (excluding current lesson)
    const { data: existingBadgeLessons } = await supabase
      .from("lessons")
      .select("lesson_id")
      .eq("badge_id", targetBadgeId)
      .neq("lesson_id", Number(lesson_id));

    if (existingBadgeLessons && existingBadgeLessons.length >= 3) {
      return NextResponse.json(
        {
          error:
            "This badge has already reached the maximum limit of 3 lessons. Please select another badge.",
        },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("lessons")
      .update({
        lesson_title,
        lesson_description,
        badge_id: targetBadgeId,
        difficulty_level,
        passing_score,
        status,
        target_section,
        updated_at: new Date().toISOString(),
      })
      .eq("lesson_id", lesson_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update pages if provided
    if (Array.isArray(pages) && pages.length > 0) {
      await supabase.from("lesson_pages").delete().eq("lesson_id", lesson_id);
      const pageRows = pages.map((p, idx) => ({
        lesson_id,
        page_number: idx + 1,
        page_title: p.page_title || `Page ${idx + 1}`,
        content: p.content || "",
        image_url: p.image_url || "/images/story1.png",
        audio_url: p.audio_url || "",
      }));
      await supabase.from("lesson_pages").insert(pageRows);
    }

    // Update vocabulary if provided
    if (Array.isArray(vocabulary)) {
      await supabase.from("vocabulary_words").delete().eq("lesson_id", lesson_id);
      const vocabRows = vocabulary
        .filter((v) => v.word?.trim())
        .map((v) => ({
          lesson_id,
          word: v.word.trim(),
          definition: v.definition?.trim() || "",
          example_sentence: v.example_sentence?.trim() || "",
        }));
      if (vocabRows.length > 0) {
        await supabase.from("vocabulary_words").insert(vocabRows);
      }
    }

    return NextResponse.json({ success: true, lesson: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating lesson";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    // Protect default developer lessons (1-15)
    if (Number(lessonId) <= 15) {
      return NextResponse.json(
        { error: "Protected Core Curriculum stories (Lessons 1-15) cannot be deleted." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("lessons").delete().eq("lesson_id", Number(lessonId));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error deleting lesson";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
