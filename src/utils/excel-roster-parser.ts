import * as XLSX from "xlsx";

export interface ParsedRosterStudent {
  fullName: string;
  gender: "Female" | "Male";
  email: string;
}

/**
 * Normalizes name formatting:
 * Converts "DELA CRUZ, JUAN M." -> "Juan Dela Cruz"
 * Or keeps standard "Juan Dela Cruz" intact with clean capitalization.
 */
export function normalizeStudentName(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();

  // If formatted as "LASTNAME, FIRSTNAME [MIDDLE]"
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map((p) => p.trim());
    const lastName = parts[0] || "";
    let firstName = parts[1] || "";
    
    // Strip trailing single-letter middle initials if present
    firstName = firstName.replace(/\s+[a-zA-Z]\.?$/, "").trim();

    const formatted = `${firstName} ${lastName}`.trim();
    return toTitleCase(formatted);
  }

  return toTitleCase(trimmed);
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Normalizes gender input from various formats (M, F, Male, Female, Lalaki, Babae).
 */
export function normalizeGender(raw: string): "Female" | "Male" {
  if (!raw) return "Female";
  const clean = raw.trim().toLowerCase();
  if (
    clean === "m" ||
    clean === "male" ||
    clean === "lalaki" ||
    clean === "boy" ||
    clean === "1"
  ) {
    return "Male";
  }
  return "Female";
}

/**
 * Generates a clean, simple student login email ending in @gmail.com
 * Easy for elementary Grade 3 students to type!
 * Examples:
 *   "Juan Dela Cruz" -> "juan.delacruz@gmail.com"
 *   "Juanito Santos" -> "juanito.santos@gmail.com"
 *   "Maria Santos"   -> "maria.santos@gmail.com"
 */
export function generateStudentEmail(fullName: string): string {
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return `${parts[0]}@gmail.com`;

  const firstName = parts[0].replace(/[^a-z0-9]/g, "");
  const lastName = parts.slice(1).join("").replace(/[^a-z0-9]/g, "");
  return `${firstName}.${lastName}@gmail.com`;
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV (.csv) file into student roster rows.
 * STRICT SECURITY: Never looks for, parses, or records LRNs or passwords.
 * Only extracts Student Name and Gender.
 */
export async function parseStudentRosterFile(
  file: File,
  targetSection: string
): Promise<ParsedRosterStudent[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("The uploaded spreadsheet contains no sheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false,
  });

  if (!rawJson || rawJson.length === 0) {
    throw new Error("No data found in the uploaded spreadsheet.");
  }

  const results: ParsedRosterStudent[] = [];

  for (const row of rawJson) {
    // 1. Identify Name column
    let rawName = "";
    for (const [key, val] of Object.entries(row)) {
      const cleanKey = key.trim().toLowerCase();
      if (
        cleanKey === "student full name" ||
        cleanKey === "full name" ||
        cleanKey === "student name" ||
        cleanKey === "name" ||
        cleanKey === "learner name" ||
        cleanKey === "pangalan"
      ) {
        rawName = String(val).trim();
        break;
      }
    }

    // 2. Identify Gender column
    let rawGender = "";
    for (const [key, val] of Object.entries(row)) {
      const cleanKey = key.trim().toLowerCase();
      if (
        cleanKey === "gender" ||
        cleanKey === "sex" ||
        cleanKey === "kasarian" ||
        cleanKey === "m/f"
      ) {
        rawGender = String(val).trim();
        break;
      }
    }

    const cleanFullName = normalizeStudentName(rawName);
    if (!cleanFullName) continue; // Skip empty rows

    const gender = normalizeGender(rawGender);
    const email = generateStudentEmail(cleanFullName);

    results.push({
      fullName: cleanFullName,
      gender,
      email,
    });
  }

  return results;
}

/**
 * Generates and downloads a clean 2-student template (.xlsx) for teachers.
 */
export function downloadSampleRosterExcel() {
  const sampleData = [
    {
      "Student Full Name": "Juan Dela Cruz",
      "Gender": "Male",
    },
    {
      "Student Full Name": "Maria Santos",
      "Gender": "Female",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for clean readability
  worksheet["!cols"] = [
    { wch: 25 }, // Student Full Name
    { wch: 15 }, // Gender
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Class Roster");

  // Trigger browser download
  XLSX.writeFile(workbook, "ReadSmart_Student_Roster_Template.xlsx");
}
