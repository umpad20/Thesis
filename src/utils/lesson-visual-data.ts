import type { SentenceVisualCue } from "@/lib/types";

/**
 * Curated Sentence-by-Sentence Visual Photo Guidance (NEO Study Dual-Coding Engine)
 * Maps exact sentences of core lessons to character avatars, action tags, and scene guidance.
 */
export const LESSON_SENTENCE_VISUALS: Record<string, SentenceVisualCue[]> = {
  // ── LESSON 1: The New Classmate ──────────────────────────────────────────
  "1-1": [
    {
      sentence_id: "1-1-1",
      lesson_id: 1,
      page_number: 1,
      sentence_text: "It was Monday morning. Mia walked slowly into her new classroom.",
      speaker: "Mia (New Student)",
      speaker_avatar: "👧",
      scene_title: "Mia Arrives at School",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "🚪 Entering Classroom",
      cue_color: "blue",
    },
    {
      sentence_id: "1-1-2",
      lesson_id: 1,
      page_number: 1,
      sentence_text: "She held her school bag tightly and looked around.",
      speaker: "Mia (Nervous Feeling)",
      speaker_avatar: "🎒",
      scene_title: "Holding Bag Tightly",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "🎒 Clutches Backpack",
      cue_color: "indigo",
    },
    {
      sentence_id: "1-1-3",
      lesson_id: 1,
      page_number: 1,
      sentence_text: "Mrs. Reyes smiled at her. \"Class, we have a new student today. Her name is Mia.\"",
      speaker: "Mrs. Reyes (Teacher)",
      speaker_avatar: "👩‍🏫",
      scene_title: "Teacher Introduction",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "👩‍🏫 Warm Welcome",
      cue_color: "emerald",
    },
    {
      sentence_id: "1-1-4",
      lesson_id: 1,
      page_number: 1,
      sentence_text: "\"Good morning, Mia!\" the class said. Mia smiled, but she still felt nervous.",
      speaker: "Grade 3 Classmates",
      speaker_avatar: "👋",
      scene_title: "Class Greeting",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "👋 Friendly Chorus",
      cue_color: "amber",
    },
  ],
  "1-2": [
    {
      sentence_id: "1-2-1",
      lesson_id: 1,
      page_number: 2,
      sentence_text: "During recess, Mia sat alone under a tree. She watched the other children play.",
      speaker: "Mia (Sitting Alone)",
      speaker_avatar: "🌳",
      scene_title: "Under the Acacia Tree",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "🌳 Shady Recess",
      cue_color: "emerald",
    },
    {
      sentence_id: "1-2-2",
      lesson_id: 1,
      page_number: 2,
      sentence_text: "Anna noticed her. \"Would you like to play with us?\" Anna asked.",
      speaker: "Anna (Kind Classmate)",
      speaker_avatar: "🧒",
      scene_title: "Anna Reaches Out",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "🤝 Invitation to Play",
      cue_color: "amber",
    },
    {
      sentence_id: "1-2-3",
      lesson_id: 1,
      page_number: 2,
      sentence_text: "Mia looked surprised. \"Yes, please,\" she answered.",
      speaker: "Mia (Surprised & Relieved)",
      speaker_avatar: "✨",
      scene_title: "Joyful Response",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "✨ Accepts with Joy",
      cue_color: "purple",
    },
    {
      sentence_id: "1-2-4",
      lesson_id: 1,
      page_number: 2,
      sentence_text: "Anna introduced Mia to her friends. They played together until the bell rang.",
      speaker: "Anna & Playground Friends",
      speaker_avatar: "🎈",
      scene_title: "Playground Circle Game",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "🎈 Playing Together",
      cue_color: "blue",
    },
    {
      sentence_id: "1-2-5",
      lesson_id: 1,
      page_number: 2,
      sentence_text: "\"Thank you for inviting me,\" Mia said. Anna replied, \"Everyone needs a friend.\" Mia returned to the classroom feeling much happier.",
      speaker: "Mia & Anna (True Friends)",
      speaker_avatar: "💖",
      scene_title: "Friendship Complete",
      scene_image_url: "/images/stories/lesson1_new_classmate.jpg",
      action_tag: "💖 Happy New Friend",
      cue_color: "pink",
    },
  ],

  // ── LESSON 2: Sharing My Lunch ──────────────────────────────────────────
  "2-1": [
    {
      sentence_id: "2-1-1",
      lesson_id: 2,
      page_number: 1,
      sentence_text: "Ben opened his lunch box during recess. His mother had packed rice, chicken, and mango slices.",
      speaker: "Ben (Lunch Time)",
      speaker_avatar: "🍱",
      scene_title: "Packed Lunchbox",
      scene_image_url: "/images/stories/lesson2_sharing_lunch.jpg",
      action_tag: "🍱 Opening Lunch",
      cue_color: "amber",
    },
    {
      sentence_id: "2-1-2",
      lesson_id: 2,
      page_number: 1,
      sentence_text: "Beside him sat his friend Leo. Leo opened his school bag and looked inside. Then he sighed.",
      speaker: "Leo (Sad Friend)",
      speaker_avatar: "👦",
      scene_title: "Leo Sits Beside",
      scene_image_url: "/images/stories/lesson2_sharing_lunch.jpg",
      action_tag: "😔 Empty Bag",
      cue_color: "blue",
    },
    {
      sentence_id: "2-1-3",
      lesson_id: 2,
      page_number: 1,
      sentence_text: "\"What happened?\" Ben asked. \"I left my lunch at home,\" Leo said.",
      speaker: "Ben & Leo Dialogue",
      speaker_avatar: "💬",
      scene_title: "Forgotten Lunch",
      scene_image_url: "/images/stories/lesson2_sharing_lunch.jpg",
      action_tag: "💬 Caring Question",
      cue_color: "purple",
    },
  ],
  "2-2": [
    {
      sentence_id: "2-2-1",
      lesson_id: 2,
      page_number: 2,
      sentence_text: "Ben looked at his food. He remembered something his mother often told him: \"If you have enough, it is good to share.\"",
      speaker: "Ben (Remembering Mother's Advice)",
      speaker_avatar: "💡",
      scene_title: "Mother's Wisdom",
      scene_image_url: "/images/stories/lesson2_sharing_lunch.jpg",
      action_tag: "💡 Thought of Kindness",
      cue_color: "emerald",
    },
    {
      sentence_id: "2-2-2",
      lesson_id: 2,
      page_number: 2,
      sentence_text: "Ben divided his food into two parts. \"You can have some of mine,\" he said.",
      speaker: "Ben (Sharing Food)",
      speaker_avatar: "🍗",
      scene_title: "Dividing the Lunch",
      scene_image_url: "/images/stories/lesson2_sharing_lunch.jpg",
      action_tag: "🍗 Generous Share",
      cue_color: "amber",
    },
    {
      sentence_id: "2-2-3",
      lesson_id: 2,
      page_number: 2,
      sentence_text: "Leo smiled. \"Thank you!\" The two boys ate together. They talked and laughed until recess was over.",
      speaker: "Ben & Leo Eating Together",
      speaker_avatar: "😄",
      scene_title: "Eating & Laughing",
      scene_image_url: "/images/stories/lesson2_sharing_lunch.jpg",
      action_tag: "😄 Joyful Meal",
      cue_color: "blue",
    },
    {
      sentence_id: "2-2-4",
      lesson_id: 2,
      page_number: 2,
      sentence_text: "When Ben went home, he told his mother what happened. His mother smiled. \"You made a kind choice today,\" she said.",
      speaker: "Ben's Mother (Proud Praise)",
      speaker_avatar: "👩",
      scene_title: "Kind Choice Rewarded",
      scene_image_url: "/images/stories/lesson2_sharing_lunch.jpg",
      action_tag: "🌟 Mother's Praise",
      cue_color: "rose",
    },
  ],
};

/**
 * Retrieve sentence visual cues for any lesson page, with graceful automatic generation for any story.
 */
export function getSentenceVisualCues(
  lessonId: number,
  pageNumber: number,
  pageContent?: string,
  pageImageUrl?: string
): SentenceVisualCue[] {
  const key = `${lessonId}-${pageNumber}`;
  if (LESSON_SENTENCE_VISUALS[key]) {
    return LESSON_SENTENCE_VISUALS[key];
  }

  // Graceful fallback generator for custom teacher stories or other lesson pages
  if (!pageContent) return [];

  const rawSentences = pageContent
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const defaultIcons = ["📖", "👧", "👦", "👩‍🏫", "🌳", "✨", "🤝", "🌟", "💡"];
  const defaultColors = ["blue", "emerald", "amber", "purple", "indigo", "rose"];

  return rawSentences.map((sentence, idx) => {
    const isDialogue = sentence.startsWith('"') || sentence.includes('said') || sentence.includes('asked');
    return {
      sentence_id: `${lessonId}-${pageNumber}-${idx + 1}`,
      lesson_id: lessonId,
      page_number: pageNumber,
      sentence_text: sentence,
      speaker: isDialogue ? "Story Character" : "Story Narrator",
      speaker_avatar: defaultIcons[idx % defaultIcons.length],
      scene_title: `Scene Part ${idx + 1}`,
      scene_image_url: pageImageUrl || `/images/stories/lesson${Math.min(lessonId, 15)}_new_classmate.jpg`,
      action_tag: isDialogue ? "💬 Character Dialogue" : "📖 Story Action",
      cue_color: defaultColors[idx % defaultColors.length],
    };
  });
}
