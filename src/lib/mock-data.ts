// ============================================
// ReadSmart Mock Data
// Realistic placeholder data for UI development
// ============================================

import type {
  Badge,
  Lesson,
  LessonPage,
  VocabularyWord,
  QuizQuestion,
  QuestionChoice,
  StudentBadgeProgress,
  AvatarOption,
} from "./types";

// ---- Avatars ----
export const avatarOptions: AvatarOption[] = [
  { id: "fox", emoji: "🦊", label: "Fox", bgColor: "bg-orange-100" },
  { id: "bear", emoji: "🐻", label: "Bear", bgColor: "bg-amber-100" },
  { id: "bunny", emoji: "🐰", label: "Bunny", bgColor: "bg-pink-100" },
  { id: "owl", emoji: "🦉", label: "Owl", bgColor: "bg-purple-100" },
  { id: "cat", emoji: "🐱", label: "Cat", bgColor: "bg-yellow-100" },
  { id: "dog", emoji: "🐶", label: "Dog", bgColor: "bg-blue-100" },
  { id: "panda", emoji: "🐼", label: "Panda", bgColor: "bg-green-100" },
  { id: "lion", emoji: "🦁", label: "Lion", bgColor: "bg-orange-100" },
];

// ---- Badges (Star, Ribbon, Medal Badges) ----
export const mockBadges: Badge[] = [
  // 1. Star Badges (Lesson Mastery Milestones)
  {
    badge_id: 1,
    badge_name: "Reading Star",
    badge_type: "star",
    medal_type: null,
    description: "Begin your reading adventure by completing Lesson 1 story and evaluation.",
    badge_order: 1,
    required_passing_score: 70,
    xp_reward: 100,
    badge_icon_url: "/images/badges/badge_stage_1_star.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 2,
    badge_name: "Vocabulary Star",
    badge_type: "star",
    medal_type: null,
    description: "Master contextual Grade 3 vocabulary definitions and sentence usage.",
    badge_order: 2,
    required_passing_score: 70,
    xp_reward: 150,
    badge_icon_url: "/images/badges/badge_stage_1_star.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 3,
    badge_name: "Fluency Star",
    badge_type: "star",
    medal_type: null,
    description: "Build steady narration pace and active listening fluency.",
    badge_order: 3,
    required_passing_score: 75,
    xp_reward: 200,
    badge_icon_url: "/images/badges/badge_stage_1_star.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // 2. Ribbon Badges (Stage Checkpoints & Cumulative Quizzes)
  {
    badge_id: 4,
    badge_name: "Reading Ribbon",
    badge_type: "ribbon",
    medal_type: null,
    description: "Conferred for clearing Stage 1 & 2 cumulative comprehension checkpoints.",
    badge_order: 4,
    required_passing_score: 75,
    xp_reward: 250,
    badge_icon_url: "/images/badges/badge_stage_2_ribbon.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 5,
    badge_name: "Comprehension Ribbon",
    badge_type: "ribbon",
    medal_type: null,
    description: "Conferred for high-level inferential reasoning and textual evidence analysis.",
    badge_order: 5,
    required_passing_score: 80,
    xp_reward: 300,
    badge_icon_url: "/images/badges/badge_stage_2_ribbon.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // 3. Medal Badges (Final Mastery Accolades)
  {
    badge_id: 6,
    badge_name: "Bronze Reader Medal",
    badge_type: "medal",
    medal_type: "bronze",
    description: "Demonstrate solid grade-level mastery across foundational reading passages.",
    badge_order: 6,
    required_passing_score: 80,
    xp_reward: 400,
    badge_icon_url: "/images/badges/badge_stage_3_bronze.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 7,
    badge_name: "Silver Reader Medal",
    badge_type: "medal",
    medal_type: "silver",
    description: "Demonstrate advanced comprehension, speed, and analytical reading performance.",
    badge_order: 7,
    required_passing_score: 85,
    xp_reward: 500,
    badge_icon_url: "/images/badges/badge_stage_4_silver.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    badge_id: 8,
    badge_name: "Gold Reader Medal",
    badge_type: "medal",
    medal_type: "gold",
    description: "Highest honor: Exceptional mastery across all Grade 3 curriculum modules.",
    badge_order: 8,
    required_passing_score: 90,
    xp_reward: 750,
    badge_icon_url: "/images/badges/badge_stage_5_gold.png",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
];

// ---- Student badge progress ----
export const mockBadgeProgress: StudentBadgeProgress[] = [
  {
    badge_progress_id: 1,
    student_id: 1,
    badge_id: 1,
    status: "completed",
    completion_percentage: 100,
    final_quiz_score: 90,
    earned_date: "2026-08-10",
  },
  {
    badge_progress_id: 2,
    student_id: 1,
    badge_id: 2,
    status: "in_progress",
    completion_percentage: 60,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 3,
    student_id: 1,
    badge_id: 3,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 4,
    student_id: 1,
    badge_id: 4,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 5,
    student_id: 1,
    badge_id: 5,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 6,
    student_id: 1,
    badge_id: 6,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 7,
    student_id: 1,
    badge_id: 7,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
  {
    badge_progress_id: 8,
    student_id: 1,
    badge_id: 8,
    status: "locked",
    completion_percentage: 0,
    final_quiz_score: null,
    earned_date: null,
  },
];

// ---- Lessons (Core DepEd Grade 3 Curriculum: 15 Levels across 5 Chapters) ----
export const mockLessons: Lesson[] = [
  // Chapter 1: Sunny Meadows (Badge 1 - Reading Star | EASY)
  {
    lesson_id: 1,
    badge_id: 1,
    teacher_id: 1,
    lesson_title: "Pat and the Cat",
    lesson_description: "Phonics & Word Recognition: Recognizing Short Vowel CVC Patterns and Letter-Sounds.",
    lesson_order: 1,
    difficulty_level: "easy",
    passing_score: 70,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 2,
    badge_id: 1,
    teacher_id: 1,
    lesson_title: "The Beautiful Garden",
    lesson_description: "Phonics: High-Frequency Sight Words, CVCC/CCVC Consonant Blends, and Syllable Patterns.",
    lesson_order: 2,
    difficulty_level: "easy",
    passing_score: 70,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 3,
    badge_id: 1,
    teacher_id: 1,
    lesson_title: "Pat and Mia in the Park",
    lesson_description: "Phonics Review: Consolidation of CVC words, letter-sounds, and high-frequency sight words.",
    lesson_order: 3,
    difficulty_level: "easy",
    passing_score: 70,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // Chapter 2: River Crossing (Badge 2 - Vocabulary Star | MEDIUM)
  {
    lesson_id: 4,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "Ben's Morning Routine",
    lesson_description: "Vocabulary: Words related to Regional Themes, Health, Science, and Mathematics.",
    lesson_order: 4,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 5,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "A Busy Day at the Park",
    lesson_description: "Grammar: Identifying Action Verbs, Describing Adjectives, and Personal Pronouns.",
    lesson_order: 5,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 6,
    badge_id: 2,
    teacher_id: 1,
    lesson_title: "Packing for the School Trip",
    lesson_description: "Grammar: Possessive and Demonstrative Pronouns, Synonyms, and Antonyms.",
    lesson_order: 6,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // Chapter 3: Autumn Highlands (Badge 3 - Fluency Star | MEDIUM)
  {
    lesson_id: 7,
    badge_id: 3,
    teacher_id: 1,
    lesson_title: "Exploring Our Beautiful Islands",
    lesson_description: "Sentence Structure: Sentences vs. Non-Sentences, and Simple Declarative Sentences.",
    lesson_order: 7,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 8,
    badge_id: 3,
    teacher_id: 1,
    lesson_title: "At the School Garden",
    lesson_description: "Sentence Types: Imperative Commands and Polite Requests.",
    lesson_order: 8,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 9,
    badge_id: 3,
    teacher_id: 1,
    lesson_title: "The Lost Kitten",
    lesson_description: "Reading Comprehension: Story Elements (Characters, Setting, Problem) and Noting Details.",
    lesson_order: 9,
    difficulty_level: "medium",
    passing_score: 75,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // Chapter 4: Frostpeak Glades (Badge 4 - Reading Ribbon | HARD)
  {
    lesson_id: 10,
    badge_id: 4,
    teacher_id: 1,
    lesson_title: "A Busy Morning for Mia",
    lesson_description: "Grammar & Composition: Compound Sentences, Exclamatory Sentences, and Signal Words.",
    lesson_order: 10,
    difficulty_level: "hard",
    passing_score: 80,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 11,
    badge_id: 4,
    teacher_id: 1,
    lesson_title: "Planting Seeds of Care",
    lesson_description: "Reading Comprehension: Identifying Cause and Effect Relationships in Text.",
    lesson_order: 11,
    difficulty_level: "hard",
    passing_score: 80,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 12,
    badge_id: 4,
    teacher_id: 1,
    lesson_title: "The Broken Branch",
    lesson_description: "Analytical Reading Review: Analyzing Cause & Effect with Discourse Signal Words.",
    lesson_order: 12,
    difficulty_level: "hard",
    passing_score: 80,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },

  // Chapter 5: Celestial Summit (Badge 5 - Comprehension Champion | HARD)
  {
    lesson_id: 13,
    badge_id: 5,
    teacher_id: 1,
    lesson_title: "The Mystery Footprints",
    lesson_description: "Higher-Order Thinking: Making Inferences and Using Context Clues.",
    lesson_order: 13,
    difficulty_level: "hard",
    passing_score: 80,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 14,
    badge_id: 5,
    teacher_id: 1,
    lesson_title: "The Secret in the Attic",
    lesson_description: "Advanced Inferences: Finding Text Clues and Contextual Word Meanings.",
    lesson_order: 14,
    difficulty_level: "hard",
    passing_score: 80,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    lesson_id: 15,
    badge_id: 5,
    teacher_id: 1,
    lesson_title: "The Reading Champions of Grade 3",
    lesson_description: "Quarter 1 Capstone Milestone: Comprehensive Reading Comprehension, Phonics, and Reasoning.",
    lesson_order: 15,
    difficulty_level: "hard",
    passing_score: 80,
    status: "published",
    target_section: "all",
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
];

// ---- Lesson pages (3 Pages per Lesson for all 15 DepEd Lessons) ----
export const mockLessonPages: LessonPage[] = [
  // Lesson 1: Pat and the Cat
  { page_id: 1, lesson_id: 1, page_number: 1, page_title: "Pat's Soft Mat", content: "Pat has a fat cat. These short three-letter words follow the CVC pattern (consonant-vowel-consonant) with a short /a/ sound. The cat sat on a soft mat.", image_url: null },
  { page_id: 2, lesson_id: 1, page_number: 2, page_title: "The Big Rat", content: "A big rat ran by the mat. The cat saw the rat run. Words like rat, cat, and mat rhyme with the same sound!", image_url: null },
  { page_id: 3, lesson_id: 1, page_number: 3, page_title: "Catch and Feed", content: "The cat ran fast to catch the rat. Pat fed his cat in a red pan.", image_url: null },

  // Lesson 2: The Beautiful Garden
  { page_id: 4, lesson_id: 2, page_number: 1, page_title: "Visiting the Garden", content: "One sunny morning, Mia and her friend Leo visited the garden near the park. The word 'park' follows the CVCC pattern with two consonants at the end. Mom asked them to find flowers.", image_url: null },
  { page_id: 5, lesson_id: 2, page_number: 2, page_title: "Blooming Flowers", content: "When they arrived, fresh flowers were blooming! The word 'bloom' begins with a two-consonant blend where 'b' and 'l' blend together. Leo asked if they could find a rose.", image_url: null },
  { page_id: 6, lesson_id: 2, page_number: 3, page_title: "Around the Fountain", content: "They walked around the big fountain looking for roses. Finally, they found a rose bush, took pictures, and laughed together.", image_url: null },

  // Lesson 3: Pat and Mia in the Park
  { page_id: 7, lesson_id: 3, page_number: 1, page_title: "A Sunny Day", content: "Pat took his cat to the green park. Mia and Leo were there smelling the pink roses. High-frequency sight words like 'were' appear often in reading!", image_url: null },
  { page_id: 8, lesson_id: 3, page_number: 2, page_title: "Under the Bench", content: "The fat cat ran under a tall wooden bench. Mia gave the cat a soft pat on the back.", image_url: null },
  { page_id: 9, lesson_id: 3, page_number: 3, page_title: "Happy Smiles", content: "They were glad to play in the warm sun. Pat and Mia walked home with big smiles.", image_url: null },

  // Lesson 4: Ben's Morning Routine
  { page_id: 10, lesson_id: 4, page_number: 1, page_title: "Waking Up Early", content: "Ben wakes up early every morning to keep his body healthy and active. Before his exercises, he enjoys eating warm puto, a sweet local delicacy from his town.", image_url: null },
  { page_id: 11, lesson_id: 4, page_number: 2, page_title: "Stretching and Jumping", content: "He starts by stretching his arms and legs to warm up. Then, he runs and jumps in the garden.", image_url: null },
  { page_id: 12, lesson_id: 4, page_number: 3, page_title: "Healthy and Strong", content: "Running helps make Ben's legs strong. Eating a healthy delicacy and exercising regularly keeps Ben full of energy every day.", image_url: null },

  // Lesson 5: A Busy Day at the Park
  { page_id: 13, lesson_id: 5, page_number: 1, page_title: "Active Children", content: "Ben learns about action verbs, which are words that tell what someone does! At the park, the playful dog runs fast while children jump on the big trampoline.", image_url: null },
  { page_id: 14, lesson_id: 5, page_number: 2, page_title: "Dancing and Juice", content: "Describing words, called adjectives, tell about color or size. Maria wears a bright blue dress and dances happily. They drink cold juice under the warm sun.", image_url: null },
  { page_id: 15, lesson_id: 5, page_number: 3, page_title: "Helping Out", content: "A personal pronoun is a word used in place of a person's name. When Ben reads under the tree, he feels happy. They help clean up the park before going home.", image_url: null },

  // Lesson 6: Packing for the School Trip
  { page_id: 16, lesson_id: 6, page_number: 1, page_title: "My Backpack", content: "Anna and Jake were packing bags for a trip. Anna learned that possessive pronouns show ownership. Anna pointed to her bag and said, 'This backpack is mine!'", image_url: null },
  { page_id: 17, lesson_id: 6, page_number: 2, page_title: "The Missing Cap", content: "Demonstrative pronouns like this and that point to objects. Jake pointed to a blue cap and asked, 'Is this cap yours?' Max replied, 'No, that cap is hers.'", image_url: null },
  { page_id: 18, lesson_id: 6, page_number: 3, page_title: "Shared Laughs", content: "Max was glad—which is a synonym for happy—to find his cap on his head! They agreed that these funny moments were ours to share.", image_url: null },

  // Lesson 7: Exploring Our Beautiful Islands
  { page_id: 19, lesson_id: 7, page_number: 1, page_title: "Islands and Festivals", content: "A complete sentence shares a full thought. The Philippines has famous places. Boracay has white sand and clear blue water.", image_url: null },
  { page_id: 20, lesson_id: 7, page_number: 2, page_title: "Terraces and Hills", content: "A declarative sentence states a fact and ends with a period (.). The Banaue Rice Terraces look like giant green steps. Chocolate Hills turn brown during summer.", image_url: null },
  { page_id: 21, lesson_id: 7, page_number: 3, page_title: "Sharing Our Country", content: "Every sentence has a subject and a predicate that tells what the subject does or has. In 'Boracay has white sand,' 'has white sand' is the predicate!", image_url: null },

  // Lesson 8: At the School Garden
  { page_id: 22, lesson_id: 8, page_number: 1, page_title: "Lining Up Politely", content: "Mrs. Cruz taught her Grade 3 class about commands and requests. She gave an imperative command telling them what to do: 'Line up quietly.'", image_url: null },
  { page_id: 23, lesson_id: 8, page_number: 2, page_title: "Cleaning the Ground", content: "An imperative command tells someone directly to do an action: 'Pick up the small trash on the ground.'", image_url: null },
  { page_id: 24, lesson_id: 8, page_number: 3, page_title: "Watering Flowers", content: "Adding the polite word 'please' turns an order into a polite request. Mia asked, 'Please let me water the flowers.' Mrs. Cruz asked everyone to wash their hands.", image_url: null },

  // Lesson 9: The Lost Kitten
  { page_id: 25, lesson_id: 9, page_number: 1, page_title: "A Wet Kitten", content: "Every story has characters, a setting, and a problem. In the backyard on a rainy afternoon (the setting), Sarah (the main character) found a tiny wet kitten. The problem was that the kitten was lost and shivering.", image_url: null },
  { page_id: 26, lesson_id: 9, page_number: 2, page_title: "Care and Warmth", content: "Sarah solved the problem with warmth and care. She wrapped the kitten in a warm dry towel and gave it warm milk. Her brother built a small box bed for it.", image_url: null },
  { page_id: 27, lesson_id: 9, page_number: 3, page_title: "Safe and Sound", content: "The story ended happily when neighbor Mr. Cruz arrived. He smiled happily when he saw his missing kitten safe and sound.", image_url: null },

  // Lesson 10: A Busy Morning for Mia
  { page_id: 28, lesson_id: 10, page_number: 1, page_title: "First Steps", content: "Signal words like First, Next, Then, and Finally show the order of events. First, Mia packed her bag and brushed her teeth.", image_url: null },
  { page_id: 29, lesson_id: 10, page_number: 2, page_title: "Team Achievement", content: "A conjunction like 'and' connects two clauses: 'She ate her breakfast, and her brother helped clean the table.' An exclamatory sentence shows excitement: 'Wow! Our team won the cleanest classroom award!'", image_url: null },
  { page_id: 30, lesson_id: 10, page_number: 3, page_title: "Ready to Learn", content: "Then, Mia walked to school with her friends. Finally, she entered her classroom ready to learn.", image_url: null },

  // Lesson 11: Planting Seeds of Care
  { page_id: 31, lesson_id: 11, page_number: 1, page_title: "Dry Soil", content: "A cause is why something happens, and an effect is what happens as a result. Mark forgot to water his pot of red flowers for five hot days (the cause), so the soil became dry and cracked (the effect).", image_url: null },
  { page_id: 32, lesson_id: 11, page_number: 2, page_title: "Yellow Leaves", content: "The signal word 'because' connects cause and effect! The flower leaves began to droop because they needed moisture. Mark felt sad seeing his wilted plant.", image_url: null },
  { page_id: 33, lesson_id: 11, page_number: 3, page_title: "Blooming Fresh", content: "Mark immediately watered the soil and placed the pot in partial shade. After two days, fresh green leaves started to bloom again.", image_url: null },

  // Lesson 12: The Broken Branch
  { page_id: 34, lesson_id: 12, page_number: 1, page_title: "The Big Wind", content: "A cause always leads to an effect. A strong wind blew across the playground yesterday. The heavy wind caused the old mango branch to snap and fall to the ground.", image_url: null },
  { page_id: 35, lesson_id: 12, page_number: 2, page_title: "Blocked Path", content: "Because the pathway was blocked, the students could not walk safely to the canteen. The teachers gathered together to move the branch.", image_url: null },
  { page_id: 36, lesson_id: 12, page_number: 3, page_title: "Teamwork Clean", content: "The signal word 'Finally' marks the concluding step. Finally, the children helped sweep away the green leaves. The playground was clean again because everyone worked as a team!", image_url: null },

  // Lesson 13: The Mystery Footprints
  { page_id: 37, lesson_id: 13, page_number: 1, page_title: "Muddy Clues", content: "An inference is a smart guess made by looking at clues in a story. Tim saw wet mud prints leading to the porch. Next to the prints lay an empty tin plate with crumbs as clues.", image_url: null },
  { page_id: 38, lesson_id: 13, page_number: 2, page_title: "Behind the Bench", content: "A soft wagging noise and quiet bark came from behind the wooden bench. Tim inferred that a friendly animal was hiding there.", image_url: null },
  { page_id: 39, lesson_id: 13, page_number: 3, page_title: "Puppy Treat", content: "Using context clues, Tim knew his playful puppy Rusty had found a hidden treat! A treat is a special food reward. Tim smiled and reached into his pocket for a biscuit.", image_url: null },

  // Lesson 14: The Secret in the Attic
  { page_id: 40, lesson_id: 14, page_number: 1, page_title: "Curious Steps", content: "Good readers use text clues to make inferences. Mia climbed the wooden attic stairs after hearing a mysterious squeak. The room was dusty, and dim light filtered through a round window.", image_url: null },
  { page_id: 41, lesson_id: 14, page_number: 2, page_title: "The Carved Box", content: "Under an old cloth sat a carved wooden box. Context clues reveal that 'antique' means very old from a past time. Inside lay antique photos and a shiny silver medal.", image_url: null },
  { page_id: 42, lesson_id: 14, page_number: 3, page_title: "Family Legacy", content: "Mia inferred the medal belonged to her grandfather in his teacher's uniform. She had discovered a precious family treasure and proud history!", image_url: null },

  // Lesson 15: The Reading Champions of Grade 3
  { page_id: 43, lesson_id: 15, page_number: 1, page_title: "Festival Morning", content: "The school reading festival arrived with banners waving high above the gymnasium. Grade 3 pupils persevered and practiced reading every single week.", image_url: null },
  { page_id: 44, lesson_id: 15, page_number: 2, page_title: "Diligent Practice", content: "Because they read diligently every morning, their vocabulary grew rich and their answers were clear and confident. Diligent means working hard with care!", image_url: null },
  { page_id: 45, lesson_id: 15, page_number: 3, page_title: "The Golden Trophy", content: "The principal awarded the golden reading trophy to the Grade 3 champions. Everyone cheered because dedication brought great success!", image_url: null },
];

// ---- Vocabulary words (Target Grade 3 DepEd Vocabulary) ----
export const mockVocabularyWords: VocabularyWord[] = [
  // Lesson 1
  { word_id: 1, lesson_id: 1, word: "cat", definition: "A small, furry domestic pet that makes a meow sound.", example_sentence: "The cat sleeps on the warm mat." },
  { word_id: 2, lesson_id: 1, word: "ran", definition: "Moved quickly using legs.", example_sentence: "The energetic boy ran across the green yard." },
  { word_id: 3, lesson_id: 1, word: "big", definition: "Large in size or amount.", example_sentence: "She plays with a big red ball." },

  // Lesson 2
  { word_id: 4, lesson_id: 2, word: "beautiful", definition: "Very pretty and pleasant to look at.", example_sentence: "Mia saw beautiful red roses blooming in the garden." },
  { word_id: 5, lesson_id: 2, word: "lamp", definition: "An object that produces light.", example_sentence: "A small lamp lit up the dark room with warm light." },
  { word_id: 6, lesson_id: 2, word: "trap", definition: "A trick or device used to catch something.", example_sentence: "The fox tried to stay away from the wooden trap." },

  // Lesson 3
  { word_id: 7, lesson_id: 3, word: "park", definition: "A large public green area for play and recreation.", example_sentence: "Children run and play games in the green park." },
  { word_id: 8, lesson_id: 3, word: "jump", definition: "Push oneself off the ground into the air.", example_sentence: "The joyful kids jump high over the skipping rope." },
  { word_id: 9, lesson_id: 3, word: "glad", definition: "Feeling happy and pleased.", example_sentence: "We were glad to see our friends again." },

  // Lesson 4
  { word_id: 10, lesson_id: 4, word: "festival", definition: "A colorful celebration held in a town or region.", example_sentence: "The Ati-Atihan Festival is a colorful celebration in Aklan." },
  { word_id: 11, lesson_id: 4, word: "delicacy", definition: "A special and popular food from a specific place.", example_sentence: "Buko pie is a famous delicacy from Laguna." },
  { word_id: 12, lesson_id: 4, word: "landmark", definition: "A famous place or structure in a region.", example_sentence: "Mayon Volcano is a famous landmark in Albay." },

  // Lesson 5
  { word_id: 13, lesson_id: 5, word: "verb", definition: "An action word that tells what someone or something does.", example_sentence: "The energetic dog runs fast across the park." },
  { word_id: 14, lesson_id: 5, word: "adjective", definition: "A describing word that tells what kind, color, or how many.", example_sentence: "My mother cooked a delicious meal for dinner." },
  { word_id: 15, lesson_id: 5, word: "pronoun", definition: "A word used to replace proper nouns or names.", example_sentence: "Ana is reading a story, so she is quiet." },

  // Lesson 6
  { word_id: 16, lesson_id: 6, word: "possessive", definition: "Words showing ownership or who owns an item.", example_sentence: "This red backpack belongs to me, so it is mine." },
  { word_id: 17, lesson_id: 6, word: "demonstrative", definition: "Words like this, that, these, and those that point to objects.", example_sentence: "Those birds in the sky are flying very high." },
  { word_id: 18, lesson_id: 6, word: "synonym", definition: "A word that has the same or almost the same meaning as another word.", example_sentence: '"Large" and "big" are synonyms.' },

  // Lesson 7
  { word_id: 19, lesson_id: 7, word: "sentence", definition: "A group of words expressing a complete thought.", example_sentence: "The cat is sleeping on the chair." },
  { word_id: 20, lesson_id: 7, word: "predicate", definition: "The part of a sentence that tells what the subject does or is.", example_sentence: 'In "Boracay has white sand," "has white sand" is the predicate.' },
  { word_id: 21, lesson_id: 7, word: "declarative", definition: "A telling sentence that states a fact and ends with a period.", example_sentence: "The Banaue Rice Terraces are beautiful." },

  // Lesson 8
  { word_id: 22, lesson_id: 8, word: "imperative", definition: "A sentence that tells or asks someone to perform an action.", example_sentence: "Close the door quietly." },
  { word_id: 23, lesson_id: 8, word: "command", definition: "A direct instruction telling someone to do something.", example_sentence: "Wash your hands before dinner." },
  { word_id: 24, lesson_id: 8, word: "request", definition: "A polite asking using words like please or kindly.", example_sentence: "Please pass the book to me." },

  // Lesson 9
  { word_id: 25, lesson_id: 9, word: "character", definition: "A person, animal, or creature in a story.", example_sentence: "Sarah is the main character who found the lost animal." },
  { word_id: 26, lesson_id: 9, word: "setting", definition: "The place and time where story events happen.", example_sentence: "The story took place in a quiet garden on a rainy day." },
  { word_id: 27, lesson_id: 9, word: "problem", definition: "A difficulty or challenge that characters need to solve.", example_sentence: "The little kitten got lost in the cold rain." },

  // Lesson 10
  { word_id: 28, lesson_id: 10, word: "clause", definition: "A group of words containing its own subject and verb.", example_sentence: "Maria waters the plants, and Carlo feeds the dog." },
  { word_id: 29, lesson_id: 10, word: "exclamatory", definition: "A sentence expressing strong emotion ending with an exclamation mark.", example_sentence: "Wow! That rainbow is beautiful!" },
  { word_id: 30, lesson_id: 10, word: "signal words", definition: "Words like first, next, then, and finally that show order.", example_sentence: "First, wash your hands thoroughly." },

  // Lesson 11
  { word_id: 31, lesson_id: 11, word: "cause", definition: "The reason why something happens.", example_sentence: "Heavy rain was the cause of the street flooding." },
  { word_id: 32, lesson_id: 11, word: "effect", definition: "What happens as a result or outcome.", example_sentence: "Because she studied hard, her test grade was high." },
  { word_id: 33, lesson_id: 11, word: "because", definition: "A connecting word used to introduce a cause.", example_sentence: "The plants grew well because they got sunshine and water." },

  // Lesson 12
  { word_id: 34, lesson_id: 12, word: "outcome", definition: "The final result of an action or event.", example_sentence: "Good teamwork led to a wonderful outcome." },
  { word_id: 35, lesson_id: 12, word: "storm", definition: "Strong wind with heavy rain and dark clouds.", example_sentence: "The storm passed and the morning sky turned blue." },
  { word_id: 36, lesson_id: 12, word: "nurture", definition: "To care for and encourage the growth of something.", example_sentence: "We nurture small green plants with water and sunlight." },

  // Lesson 13
  { word_id: 37, lesson_id: 13, word: "inference", definition: "A smart guess based on clues in the story and knowledge.", example_sentence: "When I saw wet umbrellas, my inference was that it rained." },
  { word_id: 38, lesson_id: 13, word: "clue", definition: "A hint or piece of information that helps solve a question.", example_sentence: "The dark clouds served as a clue that a storm was coming." },
  { word_id: 39, lesson_id: 13, word: "gigantic", definition: "Extremely large or huge in size.", example_sentence: "The gigantic elephant towered over the small bushes." },

  // Lesson 14
  { word_id: 40, lesson_id: 14, word: "curious", definition: "Eager to know or learn something new.", example_sentence: "The curious girl explored the quiet library shelves." },
  { word_id: 41, lesson_id: 14, word: "antique", definition: "Very old, valuable, and from a past time.", example_sentence: "Grandmother kept an antique silver watch." },
  { word_id: 42, lesson_id: 14, word: "treasure", definition: "Valuable objects or precious memories.", example_sentence: "The old photos were a special family treasure." },

  // Lesson 15
  { word_id: 43, lesson_id: 15, word: "triumph", definition: "A great victory, achievement, or success.", example_sentence: "Winning the quiz bee was a proud triumph for our school." },
  { word_id: 44, lesson_id: 15, word: "persevered", definition: "Continued striving despite difficulties or obstacles.", example_sentence: "Even when the story was long, the pupils persevered." },
  { word_id: 45, lesson_id: 15, word: "proud", definition: "Feeling deep pleasure or satisfaction from achievements.", example_sentence: "The teacher was proud of the reading progress." },
];

// ---- Quiz questions ----
// ---- Quiz questions (Lesson 1: Pat and the Cat Fallback) ----
export const mockQuizQuestions: QuizQuestion[] = [
  {
    question_id: 1,
    quiz_id: 1,
    question_text: "Which of the following is a CVC word with a short /a/ vowel sound?",
    question_type: "multiple_choice",
    question_image_url: null,
    points: 10,
    hint: "Look for a three-letter word following consonant-vowel-consonant.",
    explanation: "'Cat' follows the CVC pattern with a short /a/ sound.",
  },
  {
    question_id: 2,
    quiz_id: 1,
    question_text: "Where did Pat's cat sit in the story?",
    question_type: "multiple_choice",
    question_image_url: null,
    points: 10,
    hint: "Check what soft object the cat rested on.",
    explanation: "The text directly states that the cat sat on a soft mat.",
  },
  {
    question_id: 3,
    quiz_id: 1,
    question_text: "Which word rhymes with the CVC word 'rat'?",
    question_type: "multiple_choice",
    question_image_url: null,
    points: 10,
    hint: "Find a word ending with the same '-at' sound.",
    explanation: "'Rat' and 'mat' end with the exact same '-at' sound.",
  },
  {
    question_id: 4,
    quiz_id: 1,
    question_text: "What animal ran by the mat?",
    question_type: "multiple_choice",
    question_image_url: null,
    points: 10,
    hint: "Recall the animal that hurried past the sleeping cat.",
    explanation: "A big rat ran by the mat.",
  },
  {
    question_id: 5,
    quiz_id: 1,
    question_text: "What did Pat feed his cat in?",
    question_type: "multiple_choice",
    question_image_url: null,
    points: 10,
    hint: "Remember the red dish Pat used for food.",
    explanation: "Pat fed his cat in a red pan.",
  },
];

// ---- Question choices ----
export const mockQuestionChoices: Record<number, QuestionChoice[]> = {
  1: [
    { choice_id: 1, question_id: 1, choice_text: "Cat", is_correct: true },
    { choice_id: 2, question_id: 1, choice_text: "Tree", is_correct: false },
    { choice_id: 3, question_id: 1, choice_text: "Boat", is_correct: false },
    { choice_id: 4, question_id: 1, choice_text: "Fish", is_correct: false },
  ],
  2: [
    { choice_id: 5, question_id: 2, choice_text: "On a soft mat", is_correct: true },
    { choice_id: 6, question_id: 2, choice_text: "In a tall tree", is_correct: false },
    { choice_id: 7, question_id: 2, choice_text: "On the stone table", is_correct: false },
    { choice_id: 8, question_id: 2, choice_text: "Under the wooden bed", is_correct: false },
  ],
  3: [
    { choice_id: 9, question_id: 3, choice_text: "Mat", is_correct: true },
    { choice_id: 10, question_id: 3, choice_text: "Dog", is_correct: false },
    { choice_id: 11, question_id: 3, choice_text: "Sun", is_correct: false },
    { choice_id: 12, question_id: 3, choice_text: "Pig", is_correct: false },
  ],
  4: [
    { choice_id: 13, question_id: 4, choice_text: "A big rat", is_correct: true },
    { choice_id: 14, question_id: 4, choice_text: "A little bird", is_correct: false },
    { choice_id: 15, question_id: 4, choice_text: "A brown dog", is_correct: false },
    { choice_id: 16, question_id: 4, choice_text: "A green frog", is_correct: false },
  ],
  5: [
    { choice_id: 17, question_id: 5, choice_text: "A red pan", is_correct: true },
    { choice_id: 18, question_id: 5, choice_text: "A blue bowl", is_correct: false },
    { choice_id: 19, question_id: 5, choice_text: "A wooden cup", is_correct: false },
    { choice_id: 20, question_id: 5, choice_text: "A big plate", is_correct: false },
  ],
};

// ---- Student stats ----
export const mockStudentStats = {
  full_name: "Maria Santos",
  avatar: "🦊",
  avatarBg: "bg-orange-100",
  totalXp: 250,
  currentBadge: "Vocabulary Star",
  currentBadgeType: "star" as const,
  lessonsCompleted: 4,
  quizzesPassed: 3,
  streakDays: 5,
};
