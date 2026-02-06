// Sport-specific Ramadan guidance for athletes

export interface SportProtocol {
  sport: string;
  sahoorFocus: string[];
  trainingTiming: string;
  hydrationStrategy: string[];
  gameDayAdvice: string[];
  coachHamzaTip: string;
}

export const SPORT_PROTOCOLS: Record<string, SportProtocol> = {
  football: {
    sport: "Football",
    sahoorFocus: [
      "Complex carbs (oatmeal, whole grain bread) for sustained energy through morning practice",
      "High protein (eggs, lean meat) for muscle maintenance during contact",
      "Healthy fats (avocado, nuts) for slow-release fuel",
      "Banana with peanut butter for potassium and sustained energy",
    ],
    trainingTiming: "Schedule weight room for early morning (post-Fajr) when energy is highest. Move full-pad practice to late afternoon if possible, closer to Iftar. Film study and meetings during midday when physical energy naturally dips.",
    hydrationStrategy: [
      "Start hydrating immediately at Iftar — 2-3 glasses of water first",
      "Coconut water for natural electrolytes post-practice",
      "Pickle juice at Iftar for sodium replenishment",
      "Avoid caffeinated drinks that increase dehydration",
      "Watermelon and cucumber as snacks between Iftar and Sahoor",
    ],
    gameDayAdvice: [
      "Eat a larger, balanced Sahoor if game is in afternoon",
      "Mental preparation through dhikr and dua before the game",
      "Trust your training — your body knows what to do",
      "Break fast immediately at Maghrib if game runs through sunset",
      "Keep dates and water on sideline for emergency Iftar",
    ],
    coachHamzaTip: "I played full-contact NFL practices while fasting. Your body adapts. The first week is hardest, but by week two, you'll feel a clarity and focus you've never experienced. The spiritual discipline translates directly to football discipline.",
  },

  basketball: {
    sport: "Basketball",
    sahoorFocus: [
      "Oatmeal with berries for sustained energy during runs",
      "Greek yogurt for protein and probiotics",
      "Dates and honey for quick energy stores",
      "Hydrating fruits like oranges and grapes",
    ],
    trainingTiming: "Morning shootarounds work well post-Fajr. Save intense scrimmages and conditioning for evening, 1-2 hours before Iftar. Use midday for film study, stretching, and recovery.",
    hydrationStrategy: [
      "Basketball's constant running demands serious hydration focus",
      "Drink at least 3-4 liters between Iftar and Sahoor",
      "Sports drinks with electrolytes during evening practice",
      "Avoid salty foods that increase thirst during fasting hours",
      "Water-rich foods: soup, smoothies, fruit at every meal",
    ],
    gameDayAdvice: [
      "If playing at night, eat light but energy-dense Iftar 2 hours before tip-off",
      "Focus on mental preparation through prayer before games",
      "Trust your conditioning — you've trained for this",
      "Evening games after Iftar can feel like a blessing",
      "Communicate with coaches about energy levels honestly",
    ],
    coachHamzaTip: "Hakeem Olajuwon dominated during Ramadan in the NBA Finals. He said fasting made him feel lighter and quicker. Your sport requires bursts of energy — the spiritual clarity of fasting actually helps you react faster and think clearer on the court.",
  },

  soccer: {
    sport: "Soccer",
    sahoorFocus: [
      "Pasta or rice for complex carbohydrates",
      "Eggs and lean chicken for protein",
      "Fruit smoothie with spinach for vitamins and hydration",
      "Toast with honey for quick energy stores",
    ],
    trainingTiming: "Early morning technical work and light training post-Fajr. Tactical sessions and full matches in the evening, preferably after Iftar or right before when body is used to the timing.",
    hydrationStrategy: [
      "Soccer's 90+ minutes demands extreme hydration prep",
      "Drink consistently throughout non-fasting hours",
      "Oral rehydration solutions after intense training",
      "Avoid anything that acts as a diuretic",
      "Monitor urine color religiously — should be light yellow",
    ],
    gameDayAdvice: [
      "For afternoon matches, maximize Sahoor nutrition",
      "Warm up properly — muscles may feel different while fasting",
      "Communicate with teammates and coach about energy levels",
      "Have Iftar supplies ready for halftime if sunset occurs during match",
      "Focus on positioning and smart play over constant sprinting",
    ],
    coachHamzaTip: "Many Muslim soccer players worldwide compete during Ramadan. Your endurance sport is about pacing — and Ramadan teaches you patience and pacing like nothing else. Use the mental discipline of fasting to play smarter, not just harder.",
  },

  track: {
    sport: "Track & Field",
    sahoorFocus: [
      "Whole grain toast with almond butter for sustained energy",
      "Banana and dates for potassium and natural sugars",
      "Protein shake for muscle support",
      "Oatmeal with nuts for slow-release carbs",
    ],
    trainingTiming: "Sprinters: early morning speed work when fresh. Distance runners: evening runs 1-2 hours before Iftar for optimal hydration timing. Throws and jumps: technical work in morning, power work in evening.",
    hydrationStrategy: [
      "Track athletes lose significant fluids through sweat",
      "Weigh yourself before and after training to measure fluid loss",
      "Replace each pound lost with 16-20 oz of fluid",
      "Electrolyte tablets in water during non-fasting hours",
      "Avoid training in peak heat when possible",
    ],
    gameDayAdvice: [
      "For meet days during fasting, time events strategically if possible",
      "Warm up thoroughly — cold muscles are injury-prone",
      "Mental visualization and dua before each event",
      "Sprint events: short, explosive — fasting impact is minimal",
      "Distance events: pace conservatively, finish strong",
    ],
    coachHamzaTip: "Speed and explosiveness come from discipline and focus. The concentration you develop through fasting — pushing through discomfort for a higher purpose — is the same mental strength that separates good athletes from great ones.",
  },

  swimming: {
    sport: "Swimming",
    sahoorFocus: [
      "Hydrating foods are essential — soups, smoothies, yogurt",
      "Complex carbs for sustained pool time",
      "Protein for muscle recovery after long sessions",
      "Avoid heavy, salty foods that increase thirst",
    ],
    trainingTiming: "Pool time ideally in evening, closer to Iftar. Morning technique work if needed. Avoid midday sessions when dehydration risk is highest. Dry-land training in morning.",
    hydrationStrategy: [
      "Despite being in water, swimmers dehydrate quickly",
      "You sweat in the pool even if you don't feel it",
      "Drink aggressively between Iftar and Sahoor",
      "Coconut water and electrolyte drinks are your friends",
      "Monitor for signs of dehydration: headache, fatigue, dark urine",
    ],
    gameDayAdvice: [
      "Meet timing is crucial — advocate for evening events if possible",
      "Pre-race hydration is even more important than usual",
      "Focus on technique over power when energy is limited",
      "Trust your training — muscle memory carries you through",
      "Dua before diving in: trust in Allah's plan for the race",
    ],
    coachHamzaTip: "Swimming is unique because you're surrounded by water but can't drink it. This is a beautiful metaphor for Ramadan — being surrounded by worldly things but choosing restraint. Your discipline in the pool mirrors your discipline in fasting.",
  },

  mma: {
    sport: "MMA / Combat Sports",
    sahoorFocus: [
      "High protein for muscle maintenance and recovery",
      "Complex carbs for sustained energy during training",
      "Healthy fats for joint and brain health",
      "Avoid heavy foods that slow you down",
    ],
    trainingTiming: "Technical drilling in morning post-Fajr. Sparring and intense sessions in evening, ideally after light Iftar. Strength and conditioning based on energy levels. Listen to your body — combat sports require peak awareness.",
    hydrationStrategy: [
      "Combat sports have weight considerations — work with coaches on strategy",
      "Hydration is critical for reaction time and brain function",
      "Don't use fasting as a weight-cutting tool — it's for worship",
      "Rehydrate immediately and consistently at Iftar",
      "Monitor cognitive function — if foggy, reduce sparring intensity",
    ],
    gameDayAdvice: [
      "Fight timing relative to Ramadan requires planning",
      "If fighting while fasting, adjust strategy for energy conservation",
      "Mental clarity from fasting can be an advantage",
      "Post-Iftar fights: eat light, fight ready",
      "Make dua for safety and honor in competition",
    ],
    coachHamzaTip: "Combat sports teach you to push through discomfort — so does fasting. The mental toughness you build resisting hunger and thirst is the same toughness you need when you're tired in the third round. Ramadan is the ultimate mental training camp.",
  },

  other: {
    sport: "General Athletics",
    sahoorFocus: [
      "Balanced meal with protein, carbs, and healthy fats",
      "Hydrating foods and plenty of water",
      "Foods you know work well for your body",
      "Avoid anything new or experimental during Ramadan",
    ],
    trainingTiming: "Schedule intense training in evening when possible, closer to Iftar. Use morning for technical work and light activity. Midday for recovery, stretching, and mental preparation.",
    hydrationStrategy: [
      "Drink consistently throughout non-fasting hours",
      "Monitor urine color as your hydration gauge",
      "Electrolytes are important — don't just drink water",
      "Eat water-rich foods: fruits, vegetables, soups",
      "Reduce caffeine which can dehydrate you",
    ],
    gameDayAdvice: [
      "Plan nutrition around competition schedule",
      "Communicate with coaches about your fasting",
      "Trust your preparation and training",
      "Make dua for success and safety",
      "Remember: fasting is worship — competition is secondary",
    ],
    coachHamzaTip: "Whatever your sport, the principles are the same: prepare well, train smart, hydrate thoroughly, and trust in Allah's plan. Ramadan doesn't diminish your abilities — it refines them. You're training your spirit alongside your body.",
  },
};

export function getSportProtocol(sport: string): SportProtocol {
  const normalized = sport.toLowerCase();
  return SPORT_PROTOCOLS[normalized] || SPORT_PROTOCOLS.other;
}

export function formatSportProtocolForAI(sport: string): string {
  const protocol = getSportProtocol(sport);
  return `
## ${protocol.sport}-Specific Ramadan Protocol

### Sahoor Focus
${protocol.sahoorFocus.map((item) => `- ${item}`).join("\n")}

### Training Timing
${protocol.trainingTiming}

### Hydration Strategy
${protocol.hydrationStrategy.map((item) => `- ${item}`).join("\n")}

### Game Day Advice
${protocol.gameDayAdvice.map((item) => `- ${item}`).join("\n")}

### Coach Hamza's Tip
"${protocol.coachHamzaTip}"
`;
}
