import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    const supabase = createAdminClient();
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (section && section !== "all") {
      query = query.eq("section", section);
    }

    const { data: studentProfiles, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format profiles into EnrolledStudent structure
    const students = (studentProfiles || []).map((p, idx) => ({
      id: p.id ? `STU-${p.id.slice(0, 4).toUpperCase()}` : `STU-${idx + 100}`,
      supabaseUserId: p.id,
      name: p.full_name || p.email.split("@")[0],
      email: p.email,
      gender: p.avatar === "👦" ? "Male" : "Female",
      section: p.section || "Grade 3-A",
      currentBadge: "Reading Star (Star Badge 1)",
      comprehension: "85.0%",
      accuracyRaw: 85.0,
      quizzesPassed: "0 / 0",
      status: "On Track",
      readingSpeed: "95 WPM",
      lastActive: "Enrolled",
      avatar: p.avatar || "👧",
    }));

    return NextResponse.json({ students });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching students";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, gender, section, teacherId } = body;

    const cleanName = fullName?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanSection = section?.trim() || "Grade 3-A";
    const studentPassword = password || "Student2026!";

    if (!cleanName || !cleanEmail) {
      return NextResponse.json(
        { error: "Student full name and email are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Ensure the custom section exists in public.teacher_sections table
    await supabase.from("teacher_sections").upsert(
      {
        section_name: cleanSection,
        teacher_id: teacherId || null,
      },
      { onConflict: "section_name" }
    );

    // 2. Create the user directly in Supabase Auth via Admin API (pre-confirmed email)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: studentPassword,
        email_confirm: true,
        user_metadata: {
          full_name: cleanName,
          role: "student",
          section: cleanSection,
          teacher_id: teacherId || null,
          avatar: gender === "Female" ? "👧" : "👦",
        },
      });

    if (authError) {
      // If user already exists in auth, find existing user id
      if (
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("already exists")
      ) {
        // Update their profile to the new section
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (existingUser?.id) {
          await supabase.from("profiles").upsert({
            id: existingUser.id,
            email: cleanEmail,
            full_name: cleanName,
            role: "student",
            section: cleanSection,
            teacher_id: teacherId || null,
            avatar: gender === "Female" ? "👧" : "👦",
          });
        }
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    const studentUserId = authData?.user?.id;

    // 3. Upsert into public.profiles
    if (studentUserId) {
      await supabase.from("profiles").upsert({
        id: studentUserId,
        email: cleanEmail,
        full_name: cleanName,
        role: "student",
        section: cleanSection,
        teacher_id: teacherId || null,
        avatar: gender === "Female" ? "👧" : "👦",
      });

      // 4. Initialize student_badge_progress (Star Badge 1: in_progress)
      await supabase.from("student_badge_progress").upsert(
        {
          student_id: studentUserId,
          badge_id: 1, // Reading Star
          status: "in_progress",
          completion_percentage: 0,
        },
        { onConflict: "student_id, badge_id" }
      );
    }

    const createdStudent = {
      id: studentUserId ? `STU-${studentUserId.slice(0, 4).toUpperCase()}` : `STU-${Math.floor(100 + Math.random() * 900)}`,
      supabaseUserId: studentUserId,
      name: cleanName,
      email: cleanEmail,
      gender: gender || "Female",
      section: cleanSection,
      currentBadge: "Reading Star (Star Badge 1)",
      comprehension: "0.0%",
      accuracyRaw: 0,
      quizzesPassed: "0 / 0",
      status: "On Track",
      readingSpeed: "—",
      lastActive: "Just Enrolled in Supabase",
      avatar: gender === "Female" ? "👧" : "👦",
      temporaryPassword: studentPassword,
    };

    return NextResponse.json({
      success: true,
      student: createdStudent,
      message: "Student account created and stored in Supabase directly.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
