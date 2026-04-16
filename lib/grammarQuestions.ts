export interface GrammarQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
  level: "basic" | "intermediate" | "advanced";
  lessons: number;
  xp: number;
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  { id: "nouns-articles", title: "Nouns & Articles", description: "Master a, an, the usage", level: "basic", lessons: 10, xp: 50 },
  { id: "subject-verb", title: "Subject-Verb Agreement", description: "Subject and verb matching", level: "basic", lessons: 10, xp: 50 },
  { id: "tenses", title: "English Tenses", description: "Past, present, future tenses", level: "basic", lessons: 10, xp: 50 },
  { id: "comparatives", title: "Comparatives & Superlatives", description: "Comparing things in English", level: "basic", lessons: 10, xp: 50 },
  { id: "modal-verbs", title: "Modal Verbs", description: "Can, could, may, might, must", level: "intermediate", lessons: 10, xp: 75 },
  { id: "conditionals", title: "Conditionals", description: "If clauses and conditional logic", level: "intermediate", lessons: 10, xp: 75 },
  { id: "passive-voice", title: "Passive Voice", description: "Active vs passive sentences", level: "intermediate", lessons: 10, xp: 75 },
  { id: "reported-speech", title: "Reported Speech", description: "Direct and reported speech", level: "intermediate", lessons: 10, xp: 75 },
  { id: "complex-sentences", title: "Complex Sentences", description: "Compound and complex structures", level: "advanced", lessons: 10, xp: 100 },
  { id: "idioms-phrases", title: "Idioms & Phrases", description: "Common English idioms", level: "advanced", lessons: 10, xp: 100 },
];

export const BASIC_QUESTIONS: GrammarQuestion[] = [
  { id: "basic-1", topic: "Nouns & Articles", question: 'Choose the correct article: "I saw ___ elephant at the zoo."', options: ["a", "an", "the", "no article"], correct: 1, explanation: 'We use "an" before words that start with a vowel sound. "Elephant" starts with the vowel "e", so we say "an elephant."', difficulty: 1 },
  { id: "basic-2", topic: "Nouns & Articles", question: 'Fill in the blank: "She is ___ teacher."', options: ["a", "an", "the", "no article"], correct: 1, explanation: '"An" is used before words beginning with a vowel sound. "Teacher" starts with "t" which sounds like "uh", so we use "an".', difficulty: 1 },
  { id: "basic-3", topic: "Nouns & Articles", question: "Which sentence is correct?", options: ["I need an water bottle.", "I need a water bottle.", "I need the water bottle.", "I need water bottle."], correct: 1, explanation: 'We use "a" before words that start with a consonant sound. "Water" starts with "w" which is a consonant sound.', difficulty: 1 },
  { id: "basic-4", topic: "Nouns & Articles", question: 'Choose the correct option: "___ sun is shining today."', options: ["A", "An", "The", "No article"], correct: 2, explanation: 'We use "the" with unique things that are one of a kind, like the sun, the moon, the sky, etc.', difficulty: 1 },
  { id: "basic-5", topic: "Nouns & Articles", question: 'Complete: "I want to be ___ doctor when I grow up."', options: ["a", "an", "the", "no article"], correct: 0, explanation: 'We use "a" before words that begin with a consonant sound. "Doctor" starts with "d", a consonant sound.', difficulty: 1 },
  { id: "basic-6", topic: "Subject-Verb Agreement", question: "Choose the correct verb: 'She ___ to the store every day.'", options: ["go", "goes", "going", "gone"], correct: 1, explanation: "Third person singular subjects take verbs with -s. So we say 'goes' instead of 'go'.", difficulty: 1 },
  { id: "basic-7", topic: "Subject-Verb Agreement", question: "Which is correct? 'The books ___ on the table.'", options: ["is", "are", "be", "been"], correct: 1, explanation: "'Books' is plural, so we use 'are'.", difficulty: 1 },
  { id: "basic-8", topic: "Subject-Verb Agreement", question: "Complete: 'Either the students or the teacher ___ responsible.'", options: ["is", "are", "was", "were"], correct: 1, explanation: "When using 'or', the subject closest to the verb determines the verb form. 'Teacher' is singular, but we use 'are' here because 'students' is closer.", difficulty: 2 },
  { id: "basic-9", topic: "Tenses", question: "Choose the correct tense: 'I ___ English for 5 years.'", options: ["learn", "learns", "am learning", "have been learning"], correct: 3, explanation: "Use present perfect continuous for actions that started in the past and continue to the present.", difficulty: 2 },
  { id: "basic-10", topic: "Tenses", question: "Which sentence uses past tense correctly?", options: ["She go to school yesterday.", "She went to school yesterday.", "She gone to school yesterday.", "She going to school yesterday."], correct: 1, explanation: "'Went' is the past tense of 'go'.", difficulty: 1 },
];

export const INTERMEDIATE_QUESTIONS: GrammarQuestion[] = [
  { id: "int-1", topic: "Modal Verbs", question: "Choose the correct modal: 'You ___ be at least 18 to vote.'", options: ["must", "can", "may", "could"], correct: 0, explanation: "'Must' expresses a strong requirement or necessity.", difficulty: 1 },
  { id: "int-2", topic: "Modal Verbs", question: "'She ___ speak three languages.' - Which modal shows ability?", options: ["must", "can", "should", "would"], correct: 1, explanation: "'Can' expresses ability or skill.", difficulty: 1 },
  { id: "int-3", topic: "Modal Verbs", question: "Complete: 'You ___ smoke in here. It's prohibited.", options: ["mustn't", "can't", "couldn't", "shouldn't"], correct: 0, explanation: "'Mustn't' expresses prohibition (not allowed).", difficulty: 2 },
  { id: "int-4", topic: "Conditionals", question: "If it ___ tomorrow, I'll stay home.", options: ["rains", "rain", "rained", "raining"], correct: 0, explanation: "First conditional uses present tense after 'if' to talk about future possibilities.", difficulty: 1 },
  { id: "int-5", topic: "Conditionals", question: "If I ___ rich, I'd buy a yacht.", options: ["was", "am", "were", "be"], correct: 2, explanation: "Second conditional (unreal present) uses 'were' for all subjects.", difficulty: 2 },
  { id: "int-6", topic: "Conditionals", question: "If she ___ the exam, she would have passed.", options: ["studies", "studied", "study", "had studied"], correct: 3, explanation: "Third conditional uses past perfect to talk about unreal past situations.", difficulty: 2 },
  { id: "int-7", topic: "Passive Voice", question: "Change to passive: 'The chef prepares the meal.'", options: ["The meal is prepared by the chef.", "The meal was prepared by the chef.", "The meal prepares the chef.", "The meal is preparing by the chef."], correct: 0, explanation: "In passive, the object becomes the subject. Use 'is/are + past participle'.", difficulty: 1 },
  { id: "int-8", topic: "Passive Voice", question: "Complete: 'The house ___ last month.'", options: ["sold", "was sold", "is sold", "sell"], correct: 1, explanation: "Use 'was/were + past participle' for past passive.", difficulty: 2 },
  { id: "int-9", topic: "Reported Speech", question: "Direct: 'I'm hungry,' she said. Reported:", options: ["She said she is hungry.", "She said she was hungry.", "She said she were hungry.", "She said I'm hungry."], correct: 1, explanation: "In reported speech, backshift tenses. 'am' becomes 'was'.", difficulty: 2 },
  { id: "int-10", topic: "Reported Speech", question: "Direct: 'I will call you,' he said. Reported:", options: ["He said he will call me.", "He said he would call me.", "He said he calls me.", "He said he called me."], correct: 1, explanation: "'will' becomes 'would' in reported speech.", difficulty: 2 },
];

export const ADVANCED_QUESTIONS: GrammarQuestion[] = [
  { id: "adv-1", topic: "Complex Sentences", question: "Choose the correct relative clause: 'The book ___ is on the table.'", options: ["I bought it", "that I bought", "bought", "which I bought it"], correct: 1, explanation: "Use relative pronoun + verb to create a defining relative clause.", difficulty: 1 },
  { id: "adv-2", topic: "Complex Sentences", question: "Complete: '___ hard she tried, she couldn't win.'", options: ["However", "Whatever", "No matter how", "Although"], correct: 2, explanation: "'No matter how + adjective/adverb' is used to express contrast.", difficulty: 2 },
  { id: "adv-3", topic: "Complex Sentences", question: "Which sentence has a correct noun clause?", options: ["I don't know where is he.", "I don't know where he is.", "I don't know where him is.", "I don't know he is where."], correct: 1, explanation: "Noun clauses use normal word order (subject + verb), not question word order.", difficulty: 2 },
  { id: "adv-4", topic: "Complex Sentences", question: "Complete: '___ the weather improves, we'll go out.'", options: ["Unless", "If", "Provided that", "Even if"], correct: 2, explanation: "'Provided (that)' means 'on condition that' - a way to express conditions.", difficulty: 2 },
  { id: "adv-5", topic: "Idioms & Phrases", question: "What does 'to beat around the bush' mean?", options: ["To exercise", "To avoid the main topic", "To work hard", "To travel"], correct: 1, explanation: "'Beat around the bush' means to avoid talking about the main topic.", difficulty: 1 },
  { id: "adv-6", topic: "Idioms & Phrases", question: "'To bite the bullet' means:", options: ["To eat something spicy", "To face a difficult situation", "To run away", "To celebrate"], correct: 1, explanation: "'To bite the bullet' means to face a difficult or unpleasant situation.", difficulty: 1 },
  { id: "adv-7", topic: "Idioms & Phrases", question: "Complete: 'It's raining ___ cats and dogs.'", options: ["like", "as", "with", "of"], correct: 0, explanation: "This is an idiom meaning 'raining heavily'.", difficulty: 1 },
  { id: "adv-8", topic: "Complex Sentences", question: "Which uses an inverted conditional correctly?", options: ["Had I known, I would have come.", "If I had known, I would come.", "I would have come if known.", "Known I had, I would come."], correct: 0, explanation: "Inverted conditionals drop 'if' and put the verb first.", difficulty: 2 },
  { id: "adv-9", topic: "Complex Sentences", question: "Use 'unless' correctly: 'You can't enter ___ you have a ticket.'", options: ["unless", "if", "unless not", "whether"], correct: 0, explanation: "'Unless' means 'if not'.", difficulty: 2 },
  { id: "adv-10", topic: "Idioms & Phrases", question: "'To cost an arm and a leg' means:", options: ["To be very cheap", "To be very expensive", "To be injured", "To lose money"], correct: 1, explanation: "'Cost an arm and a leg' means to be very expensive.", difficulty: 1 },
];

export function getQuestionsByTopic(topic: string): GrammarQuestion[] {
  const all = [...BASIC_QUESTIONS, ...INTERMEDIATE_QUESTIONS, ...ADVANCED_QUESTIONS];
  return all.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()));
}

export function getQuestionsByLevel(level: "basic" | "intermediate" | "advanced"): GrammarQuestion[] {
  switch (level) {
    case "basic": return BASIC_QUESTIONS;
    case "intermediate": return INTERMEDIATE_QUESTIONS;
    case "advanced": return ADVANCED_QUESTIONS;
    default: return [];
  }
}