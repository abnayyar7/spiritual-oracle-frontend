export type SourceSlug = "bhagavad_gita" | "ramcharitmanas";

export interface Situation {
  id: number;
  label: string;
  source: SourceSlug;
}

export const SITUATIONS: Situation[] = [
  // Gita-mapped
  { id: 1, label: "Finding my purpose", source: "bhagavad_gita" },
  { id: 2, label: "Making a tough decision", source: "bhagavad_gita" },
  { id: 3, label: "Overthinking & anxiety", source: "bhagavad_gita" },
  { id: 4, label: "Fear of failure", source: "bhagavad_gita" },
  { id: 5, label: "Anger or frustration", source: "bhagavad_gita" },
  { id: 6, label: "Discipline & self-control", source: "bhagavad_gita" },

  // Ramcharitmanas-mapped
  { id: 7, label: "Relationships & family", source: "ramcharitmanas" },
  { id: 8, label: "Staying strong through hardship", source: "ramcharitmanas" },
  { id: 9, label: "Loneliness or separation", source: "ramcharitmanas" },
  { id: 10, label: "Trust & betrayal", source: "ramcharitmanas" },
  { id: 11, label: "Faith & devotion", source: "ramcharitmanas" },
  { id: 12, label: "Facing something that scares me", source: "ramcharitmanas" },
];

export const SOURCE_INFO = {
  bhagavad_gita: {
    title: "Bhagavad Gita",
    subtitle: "Duty, purpose, inner peace",
    totalUnits: 701,
  },
  ramcharitmanas: {
    title: "Ramcharitmanas",
    subtitle: "Relationships, faith, devotion",
    totalUnits: 1074,
  },
};

// Keyword matching for the "Something else" flow
const RAMCHARITMANAS_KEYWORDS = [
  'family', 'mother', 'father', 'parent', 'wife', 'husband',
  'marriage', 'relationship', 'love', 'loyalty', 'trust',
  'betrayal', 'loneliness', 'separation', 'faith', 'devotion',
  'prayer', 'scared', 'fear', 'courage', 'strength', 'child',
  'son', 'daughter', 'brother', 'sister', 'friend'
];

const GITA_KEYWORDS = [
  'career', 'job', 'work', 'purpose', 'decision', 'confused',
  'anxiety', 'overthinking', 'angry', 'anger', 'failure',
  'discipline', 'control', 'direction', 'lost', 'meaning',
  'stress', 'duty', 'responsibility', 'guilt', 'focus',
  'procrastination', 'motivation', 'ambition'
];

export function matchSourceFromKeywords(input: string): SourceSlug {
  const lowerInput = input.toLowerCase();

  let gitaCount = 0;
  let ramCount = 0;

  GITA_KEYWORDS.forEach(keyword => {
    if (lowerInput.includes(keyword)) gitaCount++;
  });

  RAMCHARITMANAS_KEYWORDS.forEach(keyword => {
    if (lowerInput.includes(keyword)) ramCount++;
  });

  // If Ramcharitmanas has more matches, use it; otherwise default to Gita
  return ramCount > gitaCount ? 'ramcharitmanas' : 'bhagavad_gita';
}
