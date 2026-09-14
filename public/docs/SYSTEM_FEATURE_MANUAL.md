# ReadSmart: System Feature Manual & Functional Snippets
**Gamified Reading Comprehension Platform for Grade 3 Pupils**  
*Pedro Victorina Calo Elementary School · DepEd Region XIII (Caraga)*  

---

## Document Overview
This document provides a comprehensive catalog of screen captures ("snippets") and functional explanations for every feature across all user types in the ReadSmart system:
- **Part 1:** Public & Authentication Control
- **Part 2:** Student (Pupil) Portal
- **Part 3:** Teacher (Faculty) Portal

---

## Part 1: Authentication & Access Control

### 01. Unified Secure Sign-In Portal
- **Role:** All User Roles
- **URL Route:** `/login`
- **Screenshot:** `public/docs/snippets/01_login_portal.png`
- **Functional Description:**  
  Authenticates enrolled students and faculty members into their dedicated environments using Supabase Auth. Automatically inspects user roles and redirects students to the Student Dashboard (`/dashboard`) and faculty to the Teacher Reading Hub (`/teacher`).
- **Key Capabilities:**
  - Secure credential validation with session cookies.
  - Role-based automatic routing.
  - Helpful error notifications for unrecognized accounts.

---

### 02. Student Self-Enrollment & Section Assignment
- **Role:** Pupil Registration
- **URL Route:** `/signup`
- **Screenshot:** `public/docs/snippets/02_student_registration.png`
- **Functional Description:**  
  Enables grade school pupils to self-register by providing their full name, learner email, password, and selecting their official school section.
- **Key Capabilities:**
  - Dynamic section assignment (e.g., Grade 3-A, Grade 3-B, Grade 3-C, Twilight).
  - Automatically initializes pupil profile with 0 XP, default streak, and default mascot avatar.
  - Seamless handoff to the sign-in portal upon completion.

---

## Part 2: Student (Pupil) Portal Features

### 03. Student Home Learning Dashboard
- **Role:** Student (Pupil)
- **URL Route:** `/dashboard`
- **Screenshot:** `public/docs/snippets/03_student_dashboard.png`
- **Functional Description:**  
  The central hub for learners, highlighting current learning progress, daily streak consistency, and earned experience points.
- **Key Capabilities:**
  - **Live Reading Streak (`🔥`):** Encourages daily reading discipline.
  - **"Continue Reading" Card:** Direct shortcut resuming the student's in-progress story.
  - **Quick Summary:** Visual display of current XP rank and chapter recommendations.

---

### 04. 5-Stage Storybook Mastery Pathway
- **Role:** Student (Pupil)
- **URL Route:** `/dashboard` (Mastery Section)
- **Screenshot:** `public/docs/snippets/04_mastery_pathway.png`
- **Functional Description:**  
  Visualizes sequential curriculum progression across 5 structured stages: **1st Star**, **2nd Ribbon**, **3rd Bronze**, **4th Silver**, and **5th Gold**.
- **Key Capabilities:**
  - Clear percentage completion toward the active milestone badge.
  - Visual differentiation between mastered, active, and locked stages.
  - Aligned with DepEd Grade 3 developmental reading levels.

---

### 05. Storybook Library & Chapter Catalogue
- **Role:** Student (Pupil)
- **URL Route:** `/dashboard/lessons`
- **Screenshot:** `public/docs/snippets/05_storybook_library.png`
- **Functional Description:**  
  Displays the full library of curated storybook passages categorized by difficulty level (Easy, Medium, Hard).
- **Key Capabilities:**
  - Illustrated story cards with vocabulary word counts and estimated reading durations.
  - Clear status tags indicating whether a story is Completed, Ready to Read, or Locked.
  - Interactive stage filter to focus on specific reading chapters.

---

### 06. Chapter Story Checklist & Checkpoints
- **Role:** Student (Pupil)
- **URL Route:** `/dashboard/lessons` (Chapter Breakdown)
- **Screenshot:** `public/docs/snippets/06_chapter_story_selection.png`
- **Functional Description:**  
  Outlines the required reading passages within a stage that must be completed before the Stage Final Assessment becomes accessible.
- **Key Capabilities:**
  - Historical comprehension scores per passage (e.g., *100% Score*).
  - "Re-read" and "Retake" buttons for self-paced reinforcement.
  - Locked final assessment safeguard ensuring thorough practice before taking stage exams.

---

### 07. Living Storybook Interactive Reader
- **Role:** Student (Pupil) — *Core Feature*
- **URL Route:** `/dashboard/lessons/[id]`
- **Screenshot:** `public/docs/snippets/07_interactive_story_reader.png`
- **Functional Description:**  
  The primary reading environment delivering child-friendly dual-column storytelling with custom scene illustrations and assistive audio tools.
- **Key Capabilities:**
  - **Read Aloud (Text-to-Speech):** Browser-native speech synthesis pronouncing story sentences clearly.
  - **Click-to-Pronounce:** Underlined vocabulary words can be clicked for instant phonics guidance.
  - Sentence-by-sentence progression with visual progress tracking (e.g., *Sentence 2 of 18*).

---

### 08. In-Story Vocabulary Callout & Phonics Support
- **Role:** Student (Pupil) — *Core Feature*
- **URL Route:** `/dashboard/lessons/[id]` (Interactive Modal)
- **Screenshot:** `public/docs/snippets/08_word_vault_definition.png`
- **Functional Description:**  
  Provides immediate scaffolding when a child taps an unfamiliar or highlighted word in a story.
- **Key Capabilities:**
  - Simplified, age-appropriate definitions.
  - Dedicated audio playback button for slow, accurate word pronunciation.
  - Contextual example sentences demonstrating how the word operates in daily language.

---

### 09. Interactive Comprehension Assessment
- **Role:** Student (Pupil) — *Assessment*
- **URL Route:** `/dashboard/quiz/[id]`
- **Screenshot:** `public/docs/snippets/09_comprehension_quiz.png`
- **Functional Description:**  
  Multiple-choice evaluation testing reading recall, deduction, and character motivations directly following each story.
- **Key Capabilities:**
  - Minimalist, distraction-free layout tailored for young learners.
  - Optional "Need a reading hint?" prompt to guide struggling pupils.
  - Point weight indicators displaying potential XP rewards per question.

---

### 10. Instant Evaluation, XP Reward & Educational Rationale
- **Role:** Student (Pupil) — *Assessment*
- **URL Route:** `/dashboard/quiz/[id]` (Answer Feedback)
- **Screenshot:** `public/docs/snippets/10_quiz_instant_evaluation.png`
- **Functional Description:**  
  Delivers immediate visual and cognitive feedback upon answering, reinforcing correct answers with clear educational rationales.
- **Key Capabilities:**
  - Instant reward animation awarding experience points (e.g., *+20 XP Earned*).
  - Teacher-authored explanation reinforcing the lesson's moral or factual takeaway.
  - Real-time score recording to the teacher database to inform intervention metrics.

---

### 11. Trophy Room & Milestone Badges Showcase
- **Role:** Student (Pupil) — *Gamification*
- **URL Route:** `/dashboard/badges`
- **Screenshot:** `public/docs/snippets/11_badges_showcase.png`
- **Functional Description:**  
  A visual trophy showcase celebrating learner milestones and motivating continuous reading engagement.
- **Key Capabilities:**
  - Interactive badges map featuring Star, Ribbon, Bronze, Silver, and Gold accolades.
  - Unlock criteria inspection for upcoming medals.
  - Strengthens motivation through healthy gamified incentives.

---

### 12. Classroom Champions Podium & Leaderboard
- **Role:** Student (Pupil) — *Gamification*
- **URL Route:** `/dashboard/leaderboard`
- **Screenshot:** `public/docs/snippets/12_classroom_leaderboard.png`
- **Functional Description:**  
  Displays classroom peer standings based on total earned XP and active reading streaks.
- **Key Capabilities:**
  - **Champions Podium:** Highlighted Gold, Silver, and Bronze pedestal cards for top readers.
  - **Current Standing Banner:** Shows the pupil's rank and remaining points needed to advance.
  - Filter toggle between Section-level and School-level standings.

---

### 13. Official Star Reader Certificate of Completion
- **Role:** Student (Pupil) — *Accreditation*
- **URL Route:** `/dashboard/quiz` (Grand Milestone Modal)
- **Screenshot:** `public/docs/snippets/13_award_certificate.png`
- **Functional Description:**  
  An official school certificate awarded automatically when a pupil successfully conquers all 5 Storybook stages.
- **Key Capabilities:**
  - Personalized with student name, class section, DepEd Region XIII header, and award date.
  - **"Print Award" Button:** Formats the certificate for physical printing and framing.
  - Celebratory audio fanfare celebrating reading excellence.

---

### 14. Settings Hub & 24 Illustrated Kid Avatar Selector
- **Role:** Student (Pupil) — *Personalization*
- **URL Route:** `/dashboard/settings?tab=account`
- **Screenshot:** `public/docs/snippets/14_kid_avatars_settings.png`
- **Functional Description:**  
  Enables children to personalize their learner identity with 24 custom-illustrated boy and girl character avatars.
- **Key Capabilities:**
  - Instant avatar updates reflected on the leaderboard, header, and roster.
  - Narration voice settings: adjust speech synthesis pitch, gender, and speed.
  - Clear account information display (Section, Role, and Learner ID).

---

## Part 3: Teacher (Faculty) Portal Features

### 15. Grade 3 Classroom Reading Hub & Classroom Analytics
- **Role:** Teacher (Faculty)
- **URL Route:** `/teacher`
- **Screenshot:** `public/docs/snippets/15_teacher_reading_hub.png`
- **Functional Description:**  
  The executive faculty dashboard providing bird's-eye metrics on classroom reading comprehension, active enrollments, and curriculum pacing.
- **Key Capabilities:**
  - **Class Comprehension Gauge:** Compares class average against the DepEd ≥70% benchmark.
  - **Section Switcher:** Easily toggle between Grade 3-A, 3-B, 3-C, and Twilight sections.
  - **Live Progression Distribution:** Visual breakdown of pupils across Star, Ribbon, and Medal stages.

---

### 16. Pupil Early-Intervention & Attention Radar
- **Role:** Teacher (Faculty)
- **URL Route:** `/teacher` (Intervention Module)
- **Screenshot:** `public/docs/snippets/16_teacher_intervention_radar.png`
- **Functional Description:**  
  An algorithmic surveillance tool that identifies struggling learners needing urgent reading intervention or phonics remediation.
- **Key Capabilities:**
  - Automatic classification into **Critical**, **Watchlist**, and **Mastering & On Track**.
  - Actionable pedagogical suggestions (e.g. *Remedial Phonics Support* vs. *Challenge with Next Stage*).
  - Quick action buttons to send praise or guidance notes directly to student accounts.

---

### 17. Pupil Enrollment & Section Roster Management
- **Role:** Teacher (Faculty) — *Administration*
- **URL Route:** `/teacher/students`
- **Screenshot:** `public/docs/snippets/17_teacher_student_roster.png`
- **Functional Description:**  
  Detailed student record table tracking each child's reading comprehension percentage, reading speed (WPM), and cleared quiz milestones.
- **Key Capabilities:**
  - Filterable by section or searchable by pupil name and learner ID.
  - **"Export Roster (CSV)":** Generates spreadsheets for grading and DepEd administrative reports.
  - Fast "+ Enroll New Student" action to create pupil accounts on the fly.

---

### 18. Reading Passages & Story Curriculum Manager
- **Role:** Teacher (Faculty) — *Curriculum Authoring*
- **URL Route:** `/teacher/lessons`
- **Screenshot:** `public/docs/snippets/18_teacher_curriculum_manager.png`
- **Functional Description:**  
  Gives educators complete authority over which reading passages are active, published, or assigned to specific sections.
- **Key Capabilities:**
  - Instant Publish / Unpublish toggles to regulate classroom reading pace.
  - Configuration of minimum passing score thresholds (e.g. *Pass ≥ 70%*).
  - Audio narration enablement and story metadata authoring.

---

### 19. Comprehension Question Bank & Assessment Hub
- **Role:** Teacher (Faculty) — *Assessment Control*
- **URL Route:** `/teacher/quizzes`
- **Screenshot:** `public/docs/snippets/19_teacher_question_bank.png`
- **Functional Description:**  
  A centralized repository for reviewing, editing, and authoring comprehension questions connected to curriculum stories.
- **Key Capabilities:**
  - Story-by-story selector to inspect all quiz items assigned to any passage.
  - Point weight calibrations and verified answer key tags.
  - Direct preview of student hints and teacher explanations.

---

### 20. Question Authoring & Item Calibration Modal
- **Role:** Teacher (Faculty) — *Assessment Control*
- **URL Route:** `/teacher/quizzes` (Authoring Dialog)
- **Screenshot:** `public/docs/snippets/20_teacher_create_question.png`
- **Functional Description:**  
  A structured form enabling educators to construct valid multiple-choice comprehension questions conforming to DepEd reading assessment standards.
- **Key Capabilities:**
  - Radio button selection to assign the single correct answer key (A, B, C, or D).
  - Mandatory "Teacher Explanation" field providing context for correct answers.
  - "Student Hint" field to support struggling readers without revealing the answer.

---

*Compiled for the Faculty of Pedro Victorina Calo Elementary School · Department of Education Region XIII (Caraga)*
