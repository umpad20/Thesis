import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    const supabase = createAdminClient();

    let query = supabase
      .from("teacher_sections")
      .select("section_name, teacher_id")
      .order("section_id", { ascending: true });

    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ sections: ["Grade 3-A"] });
    }

    let sections = (data || []).map((row) => row.section_name);

    // If teacher has no registered sections yet, default to Grade 3-A
    if (sections.length === 0) {
      if (teacherId) {
        await supabase.from("teacher_sections").insert({
          section_name: "Grade 3-A",
          teacher_id: teacherId,
        });
      }
      sections = ["Grade 3-A"];
    }

    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ sections: ["Grade 3-A"] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionName, teacherId } = body;

    const cleanSection = sectionName?.trim();
    if (!cleanSection) {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Insert section into Supabase for this teacher
    await supabase
      .from("teacher_sections")
      .insert({
        section_name: cleanSection,
        teacher_id: teacherId || null,
      });

    // Fetch updated sections for this teacher
    let query = supabase
      .from("teacher_sections")
      .select("section_name")
      .order("section_id", { ascending: true });

    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    }

    const { data } = await query;
    const sections = (data || []).map((row) => row.section_name);
    if (!sections.includes(cleanSection)) {
      sections.push(cleanSection);
    }

    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: "Failed to add section" }, { status: 500 });
  }
}
