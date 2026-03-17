// lib/tutor/prompts.ts
import type { ProficiencyLevel, SkillArea, LearningGoal } from './types'

// ── Constants ──────────────────────────────────────────────────────────────────

export const LEVELS: ProficiencyLevel[] = [
  'Beginner', 'Elementary', 'Pre-Intermediate',
  'Intermediate', 'Upper-Intermediate', 'Advanced',
]

export const SKILL_AREAS: SkillArea[] = [
  'Free Conversation', 'Grammar Practice', 'Vocabulary Building',
  'IELTS Writing', 'IELTS Speaking', 'Pronunciation',
]

export const SKILL_ICONS: Record<SkillArea, string> = {
  'Free Conversation':   '💬',
  'Grammar Practice':    '📝',
  'Vocabulary Building': '📚',
  'IELTS Writing':       '✍️',
  'IELTS Speaking':      '🎤',
  'Pronunciation':       '🔊',
}

export const LEVEL_COLORS: Record<ProficiencyLevel, string> = {
  'Beginner':           'bg-green-100 text-green-700',
  'Elementary':         'bg-teal-100 text-teal-700',
  'Pre-Intermediate':   'bg-blue-100 text-blue-700',
  'Intermediate':       'bg-yellow-100 text-yellow-700',
  'Upper-Intermediate': 'bg-orange-100 text-orange-700',
  'Advanced':           'bg-red-100 text-red-700',
}

// ── Initial learning goals ─────────────────────────────────────────────────────

export const INITIAL_GOALS: Record<ProficiencyLevel, LearningGoal[]> = {
  Beginner: [
    { id: 1, text: 'Master everyday greetings & small talk',    completed: false, progress: 0 },
    { id: 2, text: 'Use present simple & present continuous',   completed: false, progress: 0 },
    { id: 3, text: 'Build core vocabulary (500 words)',         completed: false, progress: 0 },
  ],
  Elementary: [
    { id: 1, text: 'Use past simple & past continuous',         completed: false, progress: 0 },
    { id: 2, text: 'Write simple paragraphs',                   completed: false, progress: 0 },
    { id: 3, text: 'Understand common phrasal verbs',           completed: false, progress: 0 },
  ],
  'Pre-Intermediate': [
    { id: 1, text: 'Use present perfect correctly',             completed: false, progress: 0 },
    { id: 2, text: 'Write Task 1 descriptions (IELTS)',         completed: false, progress: 0 },
    { id: 3, text: 'Expand vocabulary to 2,000 words',          completed: false, progress: 0 },
  ],
  Intermediate: [
    { id: 1, text: 'Use conditionals (0, 1st, 2nd)',            completed: false, progress: 0 },
    { id: 2, text: 'Write a structured Task 2 essay',           completed: false, progress: 0 },
    { id: 3, text: 'Understand cohesion & coherence',           completed: false, progress: 0 },
  ],
  'Upper-Intermediate': [
    { id: 1, text: 'Master passive voice & reported speech',    completed: false, progress: 0 },
    { id: 2, text: 'Use academic vocabulary (AWL)',             completed: false, progress: 0 },
    { id: 3, text: 'Write at IELTS Band 6.5–7 level',          completed: false, progress: 0 },
  ],
  Advanced: [
    { id: 1, text: 'Achieve IELTS Band 7.5+ writing',          completed: false, progress: 0 },
    { id: 2, text: 'Use complex sentence structures fluently',  completed: false, progress: 0 },
    { id: 3, text: 'Develop idiomatic & natural expression',    completed: false, progress: 0 },
  ],
}

// ── Starter prompts ────────────────────────────────────────────────────────────

export const STARTER_PROMPTS: Record<SkillArea, Record<ProficiencyLevel, string[]>> = {
  'Free Conversation': {
    Beginner:            ['Hello! My name is… and I am from Vietnam.', 'What is your favourite food?', 'I like to… in my free time.'],
    Elementary:          ['Tell me about your family.', 'What did you do last weekend?', 'Describe your hometown.'],
    'Pre-Intermediate':  ['What are the pros and cons of living in a big city?', 'Tell me about a memorable trip you took.', 'How has your life changed in the last few years?'],
    Intermediate:        ['Do you think social media does more harm than good?', 'Describe a challenge you overcame.', 'What would you do if you could live anywhere in the world?'],
    'Upper-Intermediate':['Discuss the impact of technology on human relationships.', 'What does success mean to you?', 'How do cultural differences affect communication?'],
    Advanced:            ['Critically evaluate the role of English as a global lingua franca.', 'To what extent does language shape identity?', 'Argue for or against remote work becoming the new norm.'],
  },
  'Grammar Practice': {
    Beginner:            ['Can you teach me how to use "am / is / are"?', 'What is the difference between "a" and "an"?', 'How do I say what I like using "I like + verb-ing"?'],
    Elementary:          ['Can you explain the past simple tense with examples?', 'What is the difference between "some" and "any"?', 'Teach me how to make questions in English.'],
    'Pre-Intermediate':  ['Explain the present perfect vs past simple.', 'When do I use "used to"?', 'Can you give me a drill on comparative and superlative adjectives?'],
    Intermediate:        ['Explain the difference between all three conditional forms.', 'When should I use the passive voice?', 'Teach me how to use modal verbs for speculation.'],
    'Upper-Intermediate':['How do I use inversion for emphasis in formal writing?', 'Explain mixed conditionals with examples.', 'When can I use "have something done" (causative)?'],
    Advanced:            ['Explain the nuances of aspect in English (simple vs perfect vs continuous).', 'How do cleft sentences add emphasis?', 'Teach me fronting and topicalisation in academic writing.'],
  },
  'Vocabulary Building': {
    Beginner:            ['Teach me 5 words for things in a classroom.', 'What are common words for colours and numbers?', 'How do I describe my feelings in English?'],
    Elementary:          ['Teach me vocabulary for shopping and money.', 'What words do I need for talking about daily routines?', 'Give me 5 common phrasal verbs with "get".'],
    'Pre-Intermediate':  ['Teach me collocations with the word "make" and "do".', 'What are useful linking words for writing?', 'Give me vocabulary for describing graphs and charts.'],
    Intermediate:        ['Teach me 5 idiomatic expressions about time.', 'What Academic Word List (AWL) words should I know?', 'How do I paraphrase sentences without changing the meaning?'],
    'Upper-Intermediate':['Teach me formal synonyms for common words in essays.', 'What are useful hedging phrases for academic writing?', 'Give me 5 idioms related to business and work.'],
    Advanced:            ['Explain connotation differences between "slim / thin / skinny".', 'Teach me nominalisation techniques for formal writing.', 'What are common Latin/Greek roots I should know?'],
  },
  'IELTS Writing': {
    Beginner:            ['Help me write one sentence describing a bar chart.', 'What is the structure of an IELTS Task 1 report?', 'Can you give me a simple Task 2 essay question to try?'],
    Elementary:          ['Check my Task 1: The chart shows internet usage in 2020…', 'How do I write an introduction for Task 2?', 'Teach me linking words for Task 2 paragraphs.'],
    'Pre-Intermediate':  ['Give me feedback on this Task 2 intro: "Nowadays, many people believe that…"', 'How do I describe a trend in Task 1?', 'What is a good structure for an opinion essay?'],
    Intermediate:        ['Please score and give feedback on my Task 2 essay draft.', 'How do I improve my Coherence & Cohesion score?', 'Can you show me a Band 6.5 vs Band 7 Task 1 paragraph?'],
    'Upper-Intermediate':['How can I vary my sentence structures to reach Band 7?', 'Give me a difficult Task 2 topic to write under timed conditions.', 'What are common Lexical Resource mistakes at Band 6–7?'],
    Advanced:            ['Evaluate my essay for Band 8 Grammatical Range & Accuracy.', 'How do I write a nuanced argument that avoids being one-sided?', 'What distinguishes a Band 8 from a Band 7 Task 2 response?'],
  },
  'IELTS Speaking': {
    Beginner:            ['Ask me a Part 1 question about my hometown.', 'How should I start my answer in IELTS Speaking?', 'Can you give me a simple Part 1 topic to practise?'],
    Elementary:          ['Ask me a Part 1 question about hobbies.', "What should I say if I don't understand the question?", 'Practise a Part 2 cue card: Describe a place you like.'],
    'Pre-Intermediate':  ['Give me a Part 2 cue card and help me structure my answer.', 'How do I extend my answers beyond one sentence?', 'Ask me Part 1 questions about work or study.'],
    Intermediate:        ['Ask me a Part 3 question about education and give feedback.', 'How do I sound more natural and less rehearsed?', 'Practise: Describe a time you had to make a difficult decision.'],
    'Upper-Intermediate':['Give me a full mock Part 3 discussion on technology and score me.', 'How do I use hedging language naturally in speaking?', 'What fluency strategies can push me from Band 6.5 to 7?'],
    Advanced:            ['Conduct a full Band 7.5+ level Part 3 discussion on globalisation.', 'How do I demonstrate sophisticated vocabulary naturally?', 'What are the key differences between Band 7 and Band 8 spoken English?'],
  },
  Pronunciation: {
    Beginner:            ['Teach me how to pronounce the alphabet in English.', 'What is the difference between /b/ and /p/ sounds?', 'How do I pronounce "th" correctly?'],
    Elementary:          ['What is word stress and why does it matter?', 'Teach me the pronunciation of common irregular past tenses.', 'How do I pronounce the "-ed" ending correctly?'],
    'Pre-Intermediate':  ['Explain sentence stress and weak forms.', 'Teach me the most common vowel sounds in English.', 'What is linking in spoken English? Give me examples.'],
    Intermediate:        ['What is connected speech and how does it affect listening?', 'Teach me how to use intonation to sound natural.', 'How do I reduce my Vietnamese accent in English?'],
    'Upper-Intermediate':['Explain elision and assimilation in natural English speech.', 'How can I sound more fluent using thought groups?', 'Practise: Say this sentence naturally and I will give feedback.'],
    Advanced:            ['What are the key differences between British and American pronunciation?', 'How do I master the schwa sound /ə/ in unstressed syllables?', 'Teach me the rhythm patterns that make English sound natural.'],
  },
}

// ── System prompt builder (used by the API route) ──────────────────────────────

export function buildSystemPrompt(
  level: ProficiencyLevel,
  skillArea: SkillArea,
): string {
  const skillInstruction: Record<SkillArea, string> = {
    'Free Conversation':   'Keep the conversation natural and flowing. Gently correct errors in context without interrupting the flow.',
    'Grammar Practice':    'Explicitly teach and drill one grammar point per turn. Give clear rules, examples, and a short exercise.',
    'Vocabulary Building': 'Introduce and contextualise new vocabulary. Use example sentences and collocations.',
    'IELTS Writing':       'Give structured writing feedback with band-score reasoning referencing the four official IELTS criteria.',
    'IELTS Speaking':      'Ask an authentic Part 1 / Part 2 / Part 3 style question. Then give model answer tips and fluency feedback.',
    Pronunciation:         'Describe the target sound precisely, give minimal pair examples, and suggest a short drilling exercise.',
  }

  return `You are Jaxtina AI — a warm, encouraging, bilingual English tutor for Vietnamese learners.
Student level: ${level}.
Skill focus: ${skillArea}.
Instruction: ${skillInstruction[skillArea]}

IMPORTANT: You MUST always respond bilingually. Every response must include BOTH:
1. "tutorResponse" — your full teaching reply in English
2. "vietnameseNote" — a Vietnamese translation/explanation of the key teaching point (2–4 sentences). This field must NEVER be empty. Write naturally in Vietnamese, not a word-for-word translation.

After your explanation you MUST also generate a "quiz" array with EXACTLY 3 multiple-choice questions that test understanding of TODAY's specific teaching point. Each question must have:
- "question": a clear question in English
- "choices": exactly 4 answer options as strings (["A. ...", "B. ...", "C. ...", "D. ..."])
- "correctIndex": 0-indexed integer (0=A, 1=B, 2=C, 3=D) of the correct answer
- "explanation": one short sentence of English explanation + Vietnamese translation of WHY it is correct

If the student's message is a CASUAL greeting or small talk with nothing to teach, set "quiz" to an empty array [].

You MUST reply ONLY with a valid JSON object — no markdown fences, no preamble, no trailing text:
{
  "tutorResponse": "<your full English teaching reply>",
  "vietnameseNote": "<Vietnamese explanation of the key point — always required, never empty>",
  "feedback": {
    "positive":     ["<one specific thing the student did well>"],
    "corrections":  ["<one gentle correction showing the correct form>"],
    "suggestions":  ["<one actionable improvement tip for ${level} level>"]
  },
  "newVocabulary": ["<up to 3 useful words or phrases from this exchange>"],
  "accuracyScore": 75,
  "quiz": [
    {
      "question": "<question 1 testing the main teaching point>",
      "choices": ["A. <option>", "B. <option>", "C. <option>", "D. <option>"],
      "correctIndex": 0,
      "explanation": "<why correct — English then Vietnamese>"
    },
    {
      "question": "<question 2>",
      "choices": ["A. <option>", "B. <option>", "C. <option>", "D. <option>"],
      "correctIndex": 1,
      "explanation": "<why correct>"
    },
    {
      "question": "<question 3>",
      "choices": ["A. <option>", "B. <option>", "C. <option>", "D. <option>"],
      "correctIndex": 2,
      "explanation": "<why correct>"
    }
  ]
}`
}

