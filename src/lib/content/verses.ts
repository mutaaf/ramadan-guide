// Collection of Quran verses with themes for personalized content selection

import type { ContentTheme } from "./content-engine";

export interface Verse {
  id: string;
  text: string;
  reference: string; // e.g., "2:183"
  theme: ContentTheme;
  transliteration?: string;
}

export const VERSES: Verse[] = [
  // Fasting
  {
    id: "fasting-prescribed",
    text: "O you who have believed, fasting is prescribed for you as it was prescribed for those before you, that you may become righteous.",
    reference: "2:183",
    theme: "fasting",
  },
  {
    id: "ramadan-quran",
    text: "The month of Ramadan is that in which the Quran was revealed, a guidance for the people and clear proofs of guidance and criterion.",
    reference: "2:185",
    theme: "quran",
  },
  {
    id: "fasting-better",
    text: "And to fast is better for you, if you only knew.",
    reference: "2:184",
    theme: "fasting",
  },

  // Trust & Patience
  {
    id: "allah-sufficient",
    text: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
    reference: "65:3",
    theme: "trust",
  },
  {
    id: "hardship-ease",
    text: "For indeed, with hardship comes ease. Indeed, with hardship comes ease.",
    reference: "94:5-6",
    theme: "patience",
  },
  {
    id: "not-burdened",
    text: "Allah does not burden a soul beyond that it can bear.",
    reference: "2:286",
    theme: "patience",
  },
  {
    id: "patient-rewarded",
    text: "Indeed, the patient will be given their reward without account.",
    reference: "39:10",
    theme: "patience",
  },

  // Mercy & Forgiveness
  {
    id: "despair-not-mercy",
    text: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.",
    reference: "39:53",
    theme: "mercy",
  },
  {
    id: "ask-forgiveness",
    text: "And seek forgiveness of Allah. Indeed, Allah is Forgiving and Merciful.",
    reference: "73:20",
    theme: "forgiveness",
  },
  {
    id: "repentance-accepted",
    text: "And it is He who accepts repentance from His servants and pardons misdeeds, and He knows what you do.",
    reference: "42:25",
    theme: "forgiveness",
  },

  // Gratitude
  {
    id: "which-favors",
    text: "So which of the favors of your Lord would you deny?",
    reference: "55:13",
    theme: "gratitude",
  },
  {
    id: "grateful-increase",
    text: "If you are grateful, I will surely increase you in favor.",
    reference: "14:7",
    theme: "gratitude",
  },

  // Strength & Motivation
  {
    id: "not-despair",
    text: "So do not weaken and do not grieve, and you will be superior if you are believers.",
    reference: "3:139",
    theme: "strength",
  },
  {
    id: "seek-help-patience",
    text: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive to Allah.",
    reference: "2:45",
    theme: "strength",
  },
  {
    id: "allah-with-patient",
    text: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
    reference: "2:153",
    theme: "motivation",
  },

  // Reward
  {
    id: "waste-not-reward",
    text: "Indeed, Allah does not allow to be lost the reward of those who do good.",
    reference: "9:120",
    theme: "reward",
  },
  {
    id: "good-deeds-multiplied",
    text: "Whoever comes with a good deed will have ten times the like thereof to his credit.",
    reference: "6:160",
    theme: "reward",
  },
];

// Helper functions
export function getVersesByTheme(theme: ContentTheme): Verse[] {
  return VERSES.filter((v) => v.theme === theme);
}

export function getRandomVerse(): Verse {
  return VERSES[Math.floor(Math.random() * VERSES.length)];
}

export function getVerseById(id: string): Verse | undefined {
  return VERSES.find((v) => v.id === id);
}
