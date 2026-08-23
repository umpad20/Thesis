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
  nervous: {
    phonetic: "/ˈnɜːr.vəs/",
    partOfSpeech: "adjective",
    synonyms: ["anxious", "worried", "tense", "uneasy"],
    antonyms: ["calm", "confident", "relaxed", "fearless"],
    expandedMeaning:
      "Feeling worried, uneasy, or afraid about a new or uncertain situation, like the first day at a new school.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "The New Classmate",
  },
  noticed: {
    phonetic: "/ˈnoʊ.tɪst/",
    partOfSpeech: "verb",
    synonyms: ["observed", "spotted", "saw", "detected"],
    antonyms: ["ignored", "overlooked", "missed"],
    expandedMeaning:
      "Became aware of someone or something through careful observation and paying attention.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "The New Classmate",
  },
  invited: {
    phonetic: "/ɪnˈvaɪ.tɪd/",
    partOfSpeech: "verb",
    synonyms: ["welcomed", "asked", "included", "requested"],
    antonyms: ["excluded", "rejected", "dismissed"],
    expandedMeaning:
      "Asked someone in a friendly and welcoming way to participate, join an activity, or visit a place.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "The New Classmate",
  },
  classmate: {
    phonetic: "/ˈklæs.meɪt/",
    partOfSpeech: "noun",
    synonyms: ["schoolmate", "peer", "fellow student", "friend"],
    antonyms: ["stranger"],
    expandedMeaning:
      "A student who learns together in the exact same classroom, sharing daily lessons and activities.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "The New Classmate",
  },
  packed: {
    phonetic: "/pækt/",
    partOfSpeech: "verb",
    synonyms: ["filled", "arranged", "stored", "loaded"],
    antonyms: ["unpacked", "emptied", "cleared"],
    expandedMeaning:
      "Carefully placed items, food, or books inside a bag or container so they are ready for school.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "Sharing My Lunch",
  },
  sighed: {
    phonetic: "/saɪd/",
    partOfSpeech: "verb",
    synonyms: ["exhaled", "gasped", "breathed out"],
    antonyms: ["smiled", "cheered"],
    expandedMeaning:
      "Let out a deep, audible breath expressing sadness, tiredness, hunger, or relief.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "Sharing My Lunch",
  },
  divided: {
    phonetic: "/dɪˈvaɪ.dɪd/",
    partOfSpeech: "verb",
    synonyms: ["separated", "split", "partitioned", "shared"],
    antonyms: ["combined", "joined", "united"],
    expandedMeaning:
      "Split something into two or more equal portions so that others can have a share.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "Sharing My Lunch",
  },
  share: {
    phonetic: "/ʃer/",
    partOfSpeech: "verb",
    synonyms: ["give", "distribute", "split", "contribute"],
    antonyms: ["withhold", "keep", "hoard"],
    expandedMeaning:
      "Giving a portion of what you have to someone else to show kindness, care, and friendship.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "Sharing My Lunch",
  },
  heavy: {
    phonetic: "/ˈhev.i/",
    partOfSpeech: "adjective",
    synonyms: ["hefty", "weighty", "bulky", "dense"],
    antonyms: ["light", "weightless", "featherweight"],
    expandedMeaning:
      "Having substantial weight, making it hard or tiring to lift, hold, or carry alone.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "A Friend in Need",
  },
  confused: {
    phonetic: "/kənˈfjuːzd/",
    partOfSpeech: "adjective",
    synonyms: ["puzzled", "perplexed", "baffled", "unsure"],
    antonyms: ["clear", "certain", "confident", "understanding"],
    expandedMeaning:
      "Feeling unable to understand or think clearly about a difficult problem or lesson.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "A Friend in Need",
  },
  explained: {
    phonetic: "/ɪkˈspleɪnd/",
    partOfSpeech: "verb",
    synonyms: ["clarified", "taught", "described", "illustrated"],
    antonyms: ["complicated", "confused", "hid"],
    expandedMeaning:
      "Described an idea or concept step-by-step to make it simple and easy for someone else to grasp.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "A Friend in Need",
  },
  help: {
    phonetic: "/help/",
    partOfSpeech: "verb",
    synonyms: ["assist", "aid", "support", "serve"],
    antonyms: ["hinder", "harm", "prevent"],
    expandedMeaning:
      "Giving someone your time, energy, or knowledge to make their work easier or solve their trouble.",
    chapterNumber: 1,
    chapterName: "Story Starter (Stage 1)",
    storyTitle: "A Friend in Need",
  },
  routine: {
    phonetic: "/ruːˈtiːn/",
    partOfSpeech: "noun",
    synonyms: ["schedule", "habit", "pattern", "custom"],
    antonyms: ["chaos", "disorder", "spontaneity"],
    expandedMeaning:
      "A regular, organized sequence of actions done regularly at specific times every day.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "My Morning Routine",
  },
  finally: {
    phonetic: "/ˈfaɪ.nəl.i/",
    partOfSpeech: "adverb",
    synonyms: ["eventually", "at last", "ultimately"],
    antonyms: ["initially", "firstly"],
    expandedMeaning:
      "At the very end of a period of time, after waiting or working through several steps.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "My Morning Routine",
  },
  discovered: {
    phonetic: "/dɪˈskʌv.ərd/",
    partOfSpeech: "verb",
    synonyms: ["found", "uncovered", "realized", "learned"],
    antonyms: ["lost", "missed", "overlooked"],
    expandedMeaning:
      "Found out or became aware of an important fact, lost object, or new understanding.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "My Morning Routine",
  },
  prepared: {
    phonetic: "/prɪˈperd/",
    partOfSpeech: "adjective",
    synonyms: ["ready", "organized", "equipped", "set"],
    antonyms: ["unready", "unprepared", "disorganized"],
    expandedMeaning:
      "Completely ready for an upcoming task or event because all necessary things were done beforehand.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "My Morning Routine",
  },
  unfinished: {
    phonetic: "/ʌnˈfɪn.ɪʃt/",
    partOfSpeech: "adjective",
    synonyms: ["incomplete", "partial", "undone"],
    antonyms: ["completed", "finished", "done"],
    expandedMeaning:
      "Not completed or brought to its final required state.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "The Forgotten Homework",
  },
  embarrassed: {
    phonetic: "/ɪmˈber.əst/",
    partOfSpeech: "adjective",
    synonyms: ["ashamed", "self-conscious", "uncomfortable", "flustered"],
    antonyms: ["proud", "confident", "unabashed"],
    expandedMeaning:
      "Feeling uncomfortable, shy, or ashamed after making a mistake in front of others.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "The Forgotten Homework",
  },
  differently: {
    phonetic: "/ˈdɪf.ɚ.ənt.li/",
    partOfSpeech: "adverb",
    synonyms: ["in a new way", "distinctly", "alternatively"],
    antonyms: ["identically", "similarly", "the same"],
    expandedMeaning:
      "In a changed, modified, or better manner than how it was performed previously.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "The Forgotten Homework",
  },
  completed: {
    phonetic: "/kəmˈpliː.tɪd/",
    partOfSpeech: "adjective",
    synonyms: ["finished", "accomplished", "done", "perfected"],
    antonyms: ["incomplete", "unfinished", "abandoned"],
    expandedMeaning:
      "Brought to full conclusion with all required parts done successfully.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "The Forgotten Homework",
  },
  responsibility: {
    phonetic: "/rɪˌspɑːn.səˈbɪl.ə.t̬i/",
    partOfSpeech: "noun",
    synonyms: ["duty", "obligation", "accountability", "care"],
    antonyms: ["irresponsibility", "negligence"],
    expandedMeaning:
      "The moral duty, obligation, or commitment to take care of tasks and people dependably.",
    chapterNumber: 2,
    chapterName: "Page Turner (Stage 2)",
    storyTitle: "Keeping Our Classroom Clean",
  },
  persevere: {
    phonetic: "/ˌpɜːr.səˈvɪr/",
    partOfSpeech: "verb",
    synonyms: ["persist", "continue", "endure", "keep going"],
    antonyms: ["give up", "quit", "surrender"],
    expandedMeaning:
      "Continuing firmly on a challenging goal or study task despite difficulties and obstacles.",
    chapterNumber: 5,
    chapterName: "Story Master (Stage 5)",
    storyTitle: "Finding Clues in the Text",
  },
};

export function getEnrichedVocab(word: string, fallbackLessonId = 1): EnrichedVocabularyData {
  const key = word.toLowerCase().trim();
  if (VOCABULARY_METADATA[key]) {
    return VOCABULARY_METADATA[key];
  }

  // Generic fallback with realistic grammar categorization
  return {
    phonetic: `/${key}/`,
    partOfSpeech: "noun",
    synonyms: ["related term", "concept"],
    antonyms: [],
    expandedMeaning: `Key reading vocabulary term from Chapter ${Math.ceil(fallbackLessonId / 3)}.`,
    chapterNumber: Math.ceil(fallbackLessonId / 3),
    chapterName: `Stage ${Math.ceil(fallbackLessonId / 3)}`,
    storyTitle: `Lesson ${fallbackLessonId}`,
  };
}
