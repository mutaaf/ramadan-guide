// Collection of Hadiths related to fasting, strength, and Ramadan

export interface Hadith {
  id: string;
  text: string;
  source: string;
  narrator?: string;
  theme: "fasting" | "reward" | "behavior" | "sahoor" | "iftar" | "strength" | "motivation" | "mercy";
  athleteRelevance?: string;
}

export const HADITHS: Hadith[] = [
  // Fasting & Reward
  {
    id: "fasting-shield",
    text: "Fasting is a shield (from Hell-fire). So the person observing fasting should avoid sexual relation with his wife and should not behave foolishly and impudently, and if somebody fights with him or abuses him, he should say, 'I am fasting.'",
    source: "Sahih al-Bukhari 1894",
    narrator: "Abu Hurairah",
    theme: "fasting",
    athleteRelevance: "In competition, when opponents try to get in your head, remember: 'I am fasting.' Let your discipline speak for you.",
  },
  {
    id: "fasting-reward",
    text: "Every action of the son of Adam is for him except fasting, for it is Mine and I will reward for it.",
    source: "Sahih al-Bukhari 5927",
    theme: "reward",
    athleteRelevance: "Unlike trophies that fade, the reward for fasting is from Allah Himself — the ultimate victory.",
  },
  {
    id: "fasting-gates",
    text: "When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.",
    source: "Sahih al-Bukhari 1899",
    theme: "mercy",
    athleteRelevance: "Ramadan is the ultimate home-field advantage for your spiritual game. Everything is set up for your success.",
  },
  {
    id: "two-joys",
    text: "There are two pleasures for the fasting person: one at the time of breaking his fast, and the other at the time when he will meet his Lord.",
    source: "Sahih al-Bukhari 1904",
    narrator: "Abu Hurairah",
    theme: "reward",
    athleteRelevance: "Athletes know the joy of finishing a hard workout. Iftar brings that satisfaction daily, and the ultimate reward awaits.",
  },

  // Sahoor & Iftar
  {
    id: "sahoor-blessing",
    text: "Take Sahoor, for indeed in Sahoor there is blessing.",
    source: "Sahih al-Bukhari 1923",
    narrator: "Anas ibn Malik",
    theme: "sahoor",
    athleteRelevance: "Sahoor is your pre-game meal. Never skip it. The blessing includes the energy you'll need for training.",
  },
  {
    id: "hasten-iftar",
    text: "The people will remain upon goodness as long as they hasten to break the fast.",
    source: "Sahih al-Bukhari 1957",
    theme: "iftar",
    athleteRelevance: "Don't delay Iftar. Your body needs recovery. Breaking fast on time is part of the discipline.",
  },
  {
    id: "iftar-dates",
    text: "When one of you breaks his fast, let him break it with dates, for they are blessed. If he cannot find dates, then let him break it with water, for it is pure.",
    source: "Sunan at-Tirmidhi 658",
    theme: "iftar",
    athleteRelevance: "Dates are nature's energy bar — fast-acting sugars with essential nutrients. The Sunnah is also the science.",
  },
  {
    id: "delay-sahoor",
    text: "We used to take Sahoor with the Prophet, then he would get up for the prayer. I asked, 'How long was there between the Adhan and Sahoor?' He said, 'The time it takes to recite fifty verses.'",
    source: "Sahih al-Bukhari 1921",
    narrator: "Zaid ibn Thabit",
    theme: "sahoor",
    athleteRelevance: "Eat Sahoor as late as possible for maximum benefit during fasting hours. Strategic timing matters.",
  },

  // Strength & Motivation
  {
    id: "strong-believer",
    text: "The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.",
    source: "Sahih Muslim 2664",
    theme: "strength",
    athleteRelevance: "Physical strength combined with spiritual strength is beloved to Allah. Your training is worship.",
  },
  {
    id: "trust-in-allah",
    text: "If you were to rely upon Allah with reliance due to Him, He would provide for you just as He provides for the birds. They go out in the morning with empty stomachs and return full.",
    source: "Sunan at-Tirmidhi 2344",
    theme: "motivation",
    athleteRelevance: "Trust that Allah will provide the energy you need. The birds don't worry about their next meal.",
  },
  {
    id: "body-rights",
    text: "Your body has a right over you.",
    source: "Sahih al-Bukhari 5199",
    theme: "strength",
    athleteRelevance: "Take care of your body. Rest, nutrition, recovery — these are not optional. Islam honors the physical vessel.",
  },
  {
    id: "dont-overburden",
    text: "Do not overburden yourselves, lest you be overburdened. For people (in the past) overburdened themselves and so Allah overburdened them.",
    source: "Sahih al-Bukhari 6463",
    theme: "behavior",
    athleteRelevance: "Adjust your training during Ramadan. Reducing intensity is wisdom, not weakness.",
  },

  // Behavior & Character
  {
    id: "lying-fasting",
    text: "Whoever does not give up false speech and acting upon it, Allah has no need of his giving up food and drink.",
    source: "Sahih al-Bukhari 1903",
    theme: "behavior",
    athleteRelevance: "Fasting is more than food. Your sportsmanship, honesty, and character matter as much as your diet.",
  },
  {
    id: "good-character",
    text: "Nothing is heavier on the Scale of the believer on the Day of Judgment than good character.",
    source: "Sunan at-Tirmidhi 2002",
    theme: "behavior",
    athleteRelevance: "How you treat opponents, teammates, and officials reflects your faith. Character is the real competition.",
  },
  {
    id: "patience-fasting",
    text: "Fasting is half of patience, and patience is half of faith.",
    source: "Sunan Ibn Majah",
    theme: "fasting",
    athleteRelevance: "Every sport requires patience — waiting for the right moment. Fasting trains this skill daily.",
  },
  {
    id: "ramadan-forgiveness",
    text: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Sahih al-Bukhari 38",
    theme: "reward",
    athleteRelevance: "Start fresh. Whatever your past failures — on or off the field — Ramadan is a reset button.",
  },

  // Mercy & Blessing
  {
    id: "laylatul-qadr",
    text: "Whoever stays up on Laylatul Qadr out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Sahih al-Bukhari 1901",
    theme: "reward",
    athleteRelevance: "One night's effort can change everything. Just like clutch performances in sports, seek Laylatul Qadr with everything.",
  },
  {
    id: "ramadan-parts",
    text: "Ramadan is a month whose beginning is mercy, whose middle is forgiveness, and whose end is freedom from the Fire.",
    source: "Bayhaqi",
    theme: "mercy",
    athleteRelevance: "Think of Ramadan like a season: opening games (mercy), mid-season push (forgiveness), playoffs (freedom). Finish strong.",
  },
  {
    id: "dua-fasting",
    text: "Three prayers are not rejected: the prayer of a father, the prayer of a fasting person, and the prayer of a traveler.",
    source: "Sunan al-Bayhaqi",
    theme: "reward",
    athleteRelevance: "Your dua while fasting has extra power. Pray for your goals, your team, your performance.",
  },
  {
    id: "smell-fasting",
    text: "By Him in Whose Hands my soul is, the smell emanating from the mouth of a fasting person is better to Allah than the fragrance of musk.",
    source: "Sahih al-Bukhari 1894",
    theme: "reward",
    athleteRelevance: "Don't be self-conscious about fasting. What you might see as inconvenience, Allah sees as beautiful.",
  },
];

export function getHadithsByTheme(theme: Hadith["theme"]): Hadith[] {
  return HADITHS.filter((h) => h.theme === theme);
}

export function getRandomHadith(): Hadith {
  return HADITHS[Math.floor(Math.random() * HADITHS.length)];
}

export function formatHadithsForAI(): string {
  return `
## Hadith Collection for Fasting Athletes

${HADITHS.map((h) => `
### ${h.text}
**Source:** ${h.source}${h.narrator ? ` (Narrated by ${h.narrator})` : ""}
**Theme:** ${h.theme}
${h.athleteRelevance ? `**For Athletes:** ${h.athleteRelevance}` : ""}
`).join("\n")}
`;
}
