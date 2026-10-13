export interface EnrichedVocabularyData {
  phonetic: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb";
  synonyms: string[];
  antonyms: string[];
  expandedMeaning: string;
  chapterNumber: number;
  chapterName: string;
  storyTitle: string;
}

export const VOCABULARY_METADATA: Record<string, EnrichedVocabularyData> = {
  // Stage 1 (Sunny Meadows): Phonics & CVC Words
  cat: {
    phonetic: "/kæt/",
    partOfSpeech: "noun",
    synonyms: ["feline", "kitten", "pet"],
    antonyms: [],
    expandedMeaning: "A small, furry domestic animal commonly kept as a friendly household pet.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "Pat and the Cat",
  },
  mat: {
    phonetic: "/mæt/",
    partOfSpeech: "noun",
    synonyms: ["rug", "pad", "carpet"],
    antonyms: [],
    expandedMeaning: "A piece of soft, thick fabric placed on a floor to sit or step on.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "Pat and the Cat",
  },
  rat: {
    phonetic: "/ræt/",
    partOfSpeech: "noun",
    synonyms: ["rodent"],
    antonyms: [],
    expandedMeaning: "A small animal with a long tail that runs quickly.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "Pat and the Cat",
  },
  pan: {
    phonetic: "/pæn/",
    partOfSpeech: "noun",
    synonyms: ["dish", "pot", "bowl"],
    antonyms: [],
    expandedMeaning: "A round metal container used for cooking or serving pet food.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "Pat and the Cat",
  },
  garden: {
    phonetic: "/ˈɡɑːr.dən/",
    partOfSpeech: "noun",
    synonyms: ["park", "yard", "greenery"],
    antonyms: [],
    expandedMeaning: "A piece of ground with blooming flowers, plants, and grass for people to enjoy.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "The Beautiful Garden",
  },
  blooming: {
    phonetic: "/ˈbluː.mɪŋ/",
    partOfSpeech: "verb",
    synonyms: ["flowering", "opening", "flourishing"],
    antonyms: ["wilting", "fading"],
    expandedMeaning: "Opening fresh, colorful flower petals in the warm sunlight.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "The Beautiful Garden",
  },
  fountain: {
    phonetic: "/ˈfaʊn.tən/",
    partOfSpeech: "noun",
    synonyms: ["water feature", "spring"],
    antonyms: [],
    expandedMeaning: "A decorative structure that sprays clean water up into the air.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "The Beautiful Garden",
  },
  bench: {
    phonetic: "/bentʃ/",
    partOfSpeech: "noun",
    synonyms: ["seat", "park bench"],
    antonyms: [],
    expandedMeaning: "A long wooden or stone seat for several people in an outdoor park.",
    chapterNumber: 1,
    chapterName: "Sunny Meadows (Stage 1)",
    storyTitle: "Pat and Mia in the Park",
  },

  // Stage 2 (River Crossing): Action Words & Pronouns
  routine: {
    phonetic: "/ruːˈtiːn/",
    partOfSpeech: "noun",
    synonyms: ["schedule", "habit", "practice"],
    antonyms: ["disorder"],
    expandedMeaning: "A regular pattern of healthy activities done in the same order every day.",
    chapterNumber: 2,
    chapterName: "River Crossing (Stage 2)",
    storyTitle: "Ben's Morning Routine",
  },
  healthy: {
    phonetic: "/ˈhel.θi/",
    partOfSpeech: "adjective",
    synonyms: ["strong", "well", "fit"],
    antonyms: ["sick", "unwell"],
    expandedMeaning: "Having good physical condition and plenty of energy.",
    chapterNumber: 2,
    chapterName: "River Crossing (Stage 2)",
    storyTitle: "Ben's Morning Routine",
  },
  active: {
    phonetic: "/ˈæk.tɪv/",
    partOfSpeech: "adjective",
    synonyms: ["energetic", "lively", "moving"],
    antonyms: ["lazy", "still"],
    expandedMeaning: "Constantly moving, exercising, and participating in fun outdoor games.",
    chapterNumber: 2,
    chapterName: "River Crossing (Stage 2)",
    storyTitle: "Ben's Morning Routine",
  },
  delicacy: {
    phonetic: "/ˈdel.ɪ.kə.si/",
    partOfSpeech: "noun",
    synonyms: ["treat", "specialty", "local food"],
    antonyms: [],
    expandedMeaning: "A choice, delicious, and special food item cherished in a local community.",
    chapterNumber: 2,
    chapterName: "River Crossing (Stage 2)",
    storyTitle: "Ben's Morning Routine",
  },
  trampoline: {
    phonetic: "/ˈtræm.pə.liːn/",
    partOfSpeech: "noun",
    synonyms: ["springboard", "bouncer"],
    antonyms: [],
    expandedMeaning: "A strong sheet held by springs on which children jump high into the air.",
    chapterNumber: 2,
    chapterName: "River Crossing (Stage 2)",
    storyTitle: "A Busy Day at the Park",
  },
  backpack: {
    phonetic: "/ˈbæk.pæk/",
    partOfSpeech: "noun",
    synonyms: ["school bag", "knapsack", "pack"],
    antonyms: [],
    expandedMeaning: "A sturdy bag with shoulder straps carried on the back for school supplies.",
    chapterNumber: 2,
    chapterName: "River Crossing (Stage 2)",
    storyTitle: "Packing for the School Trip",
  },

  // Stage 3 (Autumn Highlands): Proper Nouns, Polite Sentences & Story Elements
  islands: {
    phonetic: "/ˈaɪ.ləndz/",
    partOfSpeech: "noun",
    synonyms: ["isles", "archipelago"],
    antonyms: ["mainland"],
    expandedMeaning: "Bodies of land completely surrounded by beautiful ocean waters.",
    chapterNumber: 3,
    chapterName: "Autumn Highlands (Stage 3)",
    storyTitle: "Exploring Our Beautiful Islands",
  },
  polite: {
    phonetic: "/pəˈlaɪt/",
    partOfSpeech: "adjective",
    synonyms: ["courteous", "respectful", "gentle"],
    antonyms: ["rude", "impolite"],
    expandedMeaning: "Having good manners, speaking gently, and saying please and thank you.",
    chapterNumber: 3,
    chapterName: "Autumn Highlands (Stage 3)",
    storyTitle: "At the School Garden",
  },
  kitten: {
    phonetic: "/ˈkɪt.ən/",
    partOfSpeech: "noun",
    synonyms: ["young cat", "kitty"],
    antonyms: [],
    expandedMeaning: "A young baby cat that needs gentle care and warmth.",
    chapterNumber: 3,
    chapterName: "Autumn Highlands (Stage 3)",
    storyTitle: "The Lost Kitten",
  },
  shivering: {
    phonetic: "/ˈʃɪv.ər.ɪŋ/",
    partOfSpeech: "verb",
    synonyms: ["trembling", "shaking"],
    antonyms: ["still", "calm"],
    expandedMeaning: "Shaking slightly and quickly because of cold weather or damp rain.",
    chapterNumber: 3,
    chapterName: "Autumn Highlands (Stage 3)",
    storyTitle: "The Lost Kitten",
  },

  // Stage 4 (Frostpeak Glades): Chronology, Cause & Effect
  connectors: {
    phonetic: "/kəˈnek.tərz/",
    partOfSpeech: "noun",
    synonyms: ["transitions", "linkers"],
    antonyms: [],
    expandedMeaning: "Words like First, Next, Then, and Finally that link ideas in order.",
    chapterNumber: 4,
    chapterName: "Frostpeak Glades (Stage 4)",
    storyTitle: "A Busy Morning for Mia",
  },
  droop: {
    phonetic: "/druːp/",
    partOfSpeech: "verb",
    synonyms: ["bend", "sag", "wilt"],
    antonyms: ["rise", "stand"],
    expandedMeaning: "To bend or hang downwards due to lack of water or energy.",
    chapterNumber: 4,
    chapterName: "Frostpeak Glades (Stage 4)",
    storyTitle: "Planting Seeds of Care",
  },
  moisture: {
    phonetic: "/ˈmɔɪs.tʃər/",
    partOfSpeech: "noun",
    synonyms: ["dampness", "wetness", "water"],
    antonyms: ["dryness"],
    expandedMeaning: "Tiny drops of water present in soil or air that plants need to thrive.",
    chapterNumber: 4,
    chapterName: "Frostpeak Glades (Stage 4)",
    storyTitle: "Planting Seeds of Care",
  },
  pathway: {
    phonetic: "/ˈpæθ.weɪ/",
    partOfSpeech: "noun",
    synonyms: ["walkway", "path", "trail"],
    antonyms: [],
    expandedMeaning: "A paved track or safe route designed for students to walk along.",
    chapterNumber: 4,
    chapterName: "Frostpeak Glades (Stage 4)",
    storyTitle: "The Broken Branch",
  },

  // Stage 5 (Celestial Summit): Inferences & Context Clues
  footprints: {
    phonetic: "/ˈfʊt.prɪnts/",
    partOfSpeech: "noun",
    synonyms: ["tracks", "paw prints", "marks"],
    antonyms: [],
    expandedMeaning: "Marks left by feet or paws on a wet surface like mud or soft sand.",
    chapterNumber: 5,
    chapterName: "Celestial Summit (Stage 5)",
    storyTitle: "The Mystery Footprints",
  },
  attic: {
    phonetic: "/ˈæt.ɪk/",
    partOfSpeech: "noun",
    synonyms: ["loft", "garret"],
    antonyms: ["basement"],
    expandedMeaning: "A cozy room or space directly beneath the roof of a house.",
    chapterNumber: 5,
    chapterName: "Celestial Summit (Stage 5)",
    storyTitle: "The Secret in the Attic",
  },
  diligent: {
    phonetic: "/ˈdɪl.ə.dʒənt/",
    partOfSpeech: "adjective",
    synonyms: ["hardworking", "studious", "thorough"],
    antonyms: ["careless", "lazy"],
    expandedMeaning: "Showing steady, earnest, and energetic effort in learning and reading.",
    chapterNumber: 5,
    chapterName: "Celestial Summit (Stage 5)",
    storyTitle: "The Reading Champions of Grade 3",
  },
  trophy: {
    phonetic: "/ˈtroʊ.fi/",
    partOfSpeech: "noun",
    synonyms: ["cup", "award", "prize"],
    antonyms: [],
    expandedMeaning: "A decorative prize awarded as a symbol of victory and excellence.",
    chapterNumber: 5,
    chapterName: "Celestial Summit (Stage 5)",
    storyTitle: "The Reading Champions of Grade 3",
  },
};

export function getEnrichedVocab(word: string, fallbackLessonId = 1): EnrichedVocabularyData {
  const key = word.toLowerCase().trim();
  if (VOCABULARY_METADATA[key]) {
    return VOCABULARY_METADATA[key];
  }

  // Graceful fallback dynamically referencing the lesson and stage
  const stageNum = Math.ceil(fallbackLessonId / 3);
  return {
    phonetic: `/${key}/`,
    partOfSpeech: "noun",
    synonyms: ["target word", "vocabulary"],
    antonyms: [],
    expandedMeaning: `Core Grade 3 reading vocabulary term from Lesson ${fallbackLessonId}.`,
    chapterNumber: stageNum,
    chapterName: `Stage ${stageNum}`,
    storyTitle: `Lesson ${fallbackLessonId}`,
  };
}
