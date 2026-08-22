import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("teacher_sections")
      .select("section_name")
      .order("section_id", { ascending: true });

    if (error) {
      // Fallback default sections
      return NextResponse.json({ sections: ["Grade 3-A", "Grade 3-B"] });
    }

    const sections = (data || []).map((row) => row.section_name);
    if (!sections.includes("Grade 3-A")) sections.unshift("Grade 3-A");
    if (!sections.includes("Grade 3-B")) sections.push("Grade 3-B");

    return NextResponse.json({ sections });
  } catch (err: unknown) {
    return NextResponse.json({ sections: ["Grade 3-A", "Grade 3-B"] });
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

    // Insert section into Supabase
    const { error: insertError } = await supabase
      .from("teacher_sections")
      .upsert(
        {
          section_name: cleanSection,
          teacher_id: teacherId || null,
        },
        { onConflict: "section_name" }
      );

    if (insertError) {
      console.error("Error creating section in Supabase:", insertError);
    }

    // Fetch all current sections
    const { data } = await supabase
      .from("teacher_sections")
      .select("section_name")
      .order("section_id", { ascending: true });

    const sections = (data || []).map((row) => row.section_name);
    if (!sections.includes(cleanSection)) sections.push(cleanSection);

    return NextResponse.json({ success: true, sections });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error saving section";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
