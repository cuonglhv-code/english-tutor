// Comprehensive Question Bank - 50 Questions per Level
// Basic (A1-A2): 50 Questions
// Intermediate (B1-B2): 50 Questions
// Advanced (C1-C2): 50 Questions

const questionBank = {
    basic: [
        // Nouns & Articles (10 questions)
        {
            id: 'basic-1',
            topic: 'Nouns & Articles',
            question: 'Choose the correct article: "I saw ___ elephant at the zoo."',
            options: ['a', 'an', 'the', 'no article'],
            correct: 1,
            explanation: 'We use "an" before words that start with a vowel sound. "Elephant" starts with the vowel "e", so we say "an elephant."',
            difficulty: 1
        },
        {
            id: 'basic-2',
            topic: 'Nouns & Articles',
            question: 'Fill in the blank: "She is ___ teacher."',
            options: ['a', 'an', 'the', 'no article'],
            correct: 1,
            explanation: '"An" is used before words beginning with a vowel sound. "Teacher" starts with "t" which sounds like "uh", so we use "an".',
            difficulty: 1
        },
        {
            id: 'basic-3',
            topic: 'Nouns & Articles',
            question: 'Which sentence is correct?',
            options: ['I need an water bottle.', 'I need a water bottle.', 'I need the water bottle.', 'I need water bottle.'],
            correct: 1,
            explanation: 'We use "a" before words that start with a consonant sound. "Water" starts with "w" which is a consonant sound.',
            difficulty: 1
        },
        {
            id: 'basic-4',
            topic: 'Nouns & Articles',
            question: 'Choose the correct option: "___ sun is shining today."',
            options: ['A', 'An', 'The', 'No article'],
            correct: 2,
            explanation: 'We use "the" with unique things that are one of a kind, like the sun, the moon, the sky, etc.',
            difficulty: 1
        },
        {
            id: 'basic-5',
            topic: 'Nouns & Articles',
            question: 'Complete: "I want to be ___ doctor when I grow up."',
            options: ['a', 'an', 'the', 'no article'],
            correct: 0,
            explanation: 'We use "a" before words that begin with a consonant sound. "Doctor" starts with "d", a consonant sound.',
            difficulty: 1
        },
        {
            id: 'basic-6',
            topic: 'Nouns & Articles',
            question: '"___ United States is a large country." - Which article is correct?',
            options: ['A', 'An', 'The', 'No article'],
            correct: 2,
            explanation: 'We use "the" with countries that have plural names or include descriptors like "United States," "United Kingdom," etc.',
            difficulty: 2
        },
        {
            id: 'basic-7',
            topic: 'Nouns & Articles',
            question: 'Select the correct sentence:',
            options: ['She is a honest person.', 'She is an honest person.', 'She is the honest person.', 'She is honest person.'],
            correct: 1,
            explanation: '"An" is used before words that start with a vowel sound. "Honest" starts with a silent "h", making the sound "oh" - a vowel sound.',
            difficulty: 2
        },
        {
            id: 'basic-8',
            topic: 'Nouns & Articles',
            question: '"I saw ___ interesting movie yesterday." What goes in the blank?',
            options: ['a', 'an', 'the', 'no article'],
            correct: 1,
            explanation: 'We use "an" before words that start with a vowel sound. "Interesting" starts with "i", a vowel.',
            difficulty: 1
        },
        {
            id: 'basic-9',
            topic: 'Nouns & Articles',
            question: 'Which is the correct sentence?',
            options: ['He is best student.', 'He is a best student.', 'He is the best student.', 'He is an best student.'],
            correct: 2,
            explanation: 'When using superlatives (best, tallest, most beautiful), we always use "the" before them.',
            difficulty: 2
        },
        {
            id: 'basic-10',
            topic: 'Nouns & Articles',
            question: '"I bought ___ umbrella because it was raining."',
            options: ['a', 'an', 'the', 'no article'],
            correct: 1,
            explanation: '"An" is used before words starting with a vowel sound. "Umbrella" starts with "u" which sounds like "uhn".',
            difficulty: 1
        },
        // Subject-Verb Agreement (10 questions)
        {
            id: 'basic-11',
            topic: 'Subject-Verb Agreement',
            question: 'Select the correct verb: "She ___ to school every day."',
            options: ['go', 'goes', 'going', 'gone'],
            correct: 1,
            explanation: 'With third-person singular subjects (he/she/it), we add -s or -es to the base verb in Present Simple tense.',
            difficulty: 1
        },
        {
            id: 'basic-12',
            topic: 'Subject-Verb Agreement',
            question: 'Complete: "The cats ___ in the garden."',
            options: ['sleeps', 'sleep', 'sleeping', 'is sleeping'],
            correct: 1,
            explanation: 'With plural subjects (cats), we use the base form of the verb without -s.',
            difficulty: 1
        },
        {
            id: 'basic-13',
            topic: 'Subject-Verb Agreement',
            question: 'Choose the correct verb: "He ___ football every weekend."',
            options: ['play', 'plays', 'playing', 'played'],
            correct: 1,
            explanation: 'Third-person singular (he) requires the verb with -s in Present Simple tense.',
            difficulty: 1
        },
        {
            id: 'basic-14',
            topic: 'Subject-Verb Agreement',
            question: 'Which sentence has correct subject-verb agreement?',
            options: ['She don\'t like fish.', 'She doesn\'t like fish.', 'She not like fish.', 'She doesn\'t likes fish.'],
            correct: 1,
            explanation: 'With third-person singular subjects, we use "does not" (doesn\'t) + base verb.',
            difficulty: 2
        },
        {
            id: 'basic-15',
            topic: 'Subject-Verb Agreement',
            question: 'Fill in: "My brother and I ___ in the same school."',
            options: ['studies', 'study', 'studying', 'studied'],
            correct: 1,
            explanation: 'When two subjects are joined by "and," the verb stays in the plural form (base form).',
            difficulty: 2
        },
        {
            id: 'basic-16',
            topic: 'Subject-Verb Agreement',
            question: '"Tom ___ a new computer." What verb fits best?',
            options: ['have', 'has', 'having', 'had'],
            correct: 1,
            explanation: '"Tom" is a singular subject (he), so we use "has" for Present Simple.',
            difficulty: 1
        },
        {
            id: 'basic-17',
            topic: 'Subject-Verb Agreement',
            question: 'Select the correct sentence:',
            options: ['The dog likes to bark.', 'The dog like to bark.', 'The dog liking to bark.', 'The dog liked to bark.'],
            correct: 0,
            explanation: 'With singular third-person subjects, add -s to the verb: "likes."',
            difficulty: 1
        },
        {
            id: 'basic-18',
            topic: 'Subject-Verb Agreement',
            question: 'Complete: "Neither the teacher nor the students ___ happy."',
            options: ['is', 'are', 'was', 'been'],
            correct: 1,
            explanation: 'With "neither...nor," the verb agrees with the subject closest to it. "Students" is plural, so use "are."',
            difficulty: 3
        },
        {
            id: 'basic-19',
            topic: 'Subject-Verb Agreement',
            question: '"Everyone ___ to pass the exam."',
            options: ['want', 'wants', 'wanting', 'wanted'],
            correct: 1,
            explanation: '"Everyone" is grammatically singular (it refers to every individual), so we use "wants."',
            difficulty: 2
        },
        {
            id: 'basic-20',
            topic: 'Subject-Verb Agreement',
            question: 'Which is grammatically correct?',
            options: ['The news are good.', 'The news is good.', 'The news be good.', 'The news been good.'],
            correct: 1,
            explanation: '"The news" is uncountable and always takes a singular verb, even though it ends in -s.',
            difficulty: 2
        },
        // Present Simple Tense (10 questions)
        {
            id: 'basic-21',
            topic: 'Present Simple Tense',
            question: '"I usually ___ breakfast at 7 o\'clock."',
            options: ['have', 'has', 'having', 'had'],
            correct: 0,
            explanation: 'With "I" (first person singular), we use the base form of the verb without -s.',
            difficulty: 1
        },
        {
            id: 'basic-22',
            topic: 'Present Simple Tense',
            question: 'Which sentence is in Present Simple?',
            options: ['She is eating dinner.', 'She eats dinner.', 'She ate dinner.', 'She will eat dinner.'],
            correct: 1,
            explanation: 'Present Simple describes habits and routines. "Eats" without auxiliary is Present Simple.',
            difficulty: 1
        },
        {
            id: 'basic-23',
            topic: 'Present Simple Tense',
            question: 'Complete: "He always ___ his shoes before leaving."',
            options: ['washes', 'wash', 'washing', 'washed'],
            correct: 0,
            explanation: 'Present Simple for habits: he + verb with -s = "washes."',
            difficulty: 1
        },
        {
            id: 'basic-24',
            topic: 'Present Simple Tense',
            question: 'Choose the correct negative sentence:',
            options: ['She not works here.', 'She doesn\'t work here.', 'She don\'t work here.', 'She no work here.'],
            correct: 1,
            explanation: 'Negative Present Simple: Subject + doesn\'t (3rd person singular) + base verb.',
            difficulty: 2
        },
        {
            id: 'basic-25',
            topic: 'Present Simple Tense',
            question: 'Form a question: "___ she ___ French?"',
            options: ['Does, speaks', 'Do, speaks', 'Does, speak', 'Do, speak'],
            correct: 2,
            explanation: 'Question form: Does + she + base verb (speak)?',
            difficulty: 2
        },
        {
            id: 'basic-26',
            topic: 'Present Simple Tense',
            question: 'The water ___ cold in winter.',
            options: ['gets', 'get', 'getting', 'got'],
            correct: 0,
            explanation: 'Singular subject "water" requires verb with -s in Present Simple.',
            difficulty: 1
        },
        {
            id: 'basic-27',
            topic: 'Present Simple Tense',
            question: '"Where ___ your sister ___?" (work)',
            options: ['does, works', 'do, works', 'does, work', 'do, work'],
            correct: 2,
            explanation: 'Question: Does + she + base verb = "does she work"?',
            difficulty: 2
        },
        {
            id: 'basic-28',
            topic: 'Present Simple Tense',
            question: 'Select the correct sentence:',
            options: ['He goes to school everyday.', 'He goes to school every day.', 'He go to school everyday.', 'He going to school every day.'],
            correct: 1,
            explanation: '"Every day" means each day (two words), while "everyday" is an adjective meaning common/daily.',
            difficulty: 2
        },
        {
            id: 'basic-29',
            topic: 'Present Simple Tense',
            question: 'My father ___ coffee every morning.',
            options: ['drinks', 'drink', 'drinking', 'drank'],
            correct: 0,
            explanation: 'Third-person singular "father" requires "drinks" in Present Simple.',
            difficulty: 1
        },
        {
            id: 'basic-30',
            topic: 'Present Simple Tense',
            question: '"How often ___ you ___ exercise?"',
            options: ['does, do', 'do, does', 'does, does', 'do, do'],
            correct: 3,
            explanation: 'Question with "you": Do + you + base verb = "do you do"?',
            difficulty: 2
        },
        // Basic Adjectives (10 questions)
        {
            id: 'basic-31',
            topic: 'Basic Adjectives',
            question: 'Choose the correct adjective: "She has a ___ dog."',
            options: ['big', 'bigger', 'biggest', 'more big'],
            correct: 0,
            explanation: 'When describing a noun without comparison, use the base form of the adjective.',
            difficulty: 1
        },
        {
            id: 'basic-32',
            topic: 'Basic Adjectives',
            question: 'Which sentence is correct?',
            options: ['The tall boy is my brother.', 'The tall tall boy is my brother.', 'The boy tall is my brother.', 'Tall the boy is my brother.'],
            correct: 0,
            explanation: 'Adjectives come before nouns and stay in base form. "Tall boy" not "tall tall boy."',
            difficulty: 1
        },
        {
            id: 'basic-33',
            topic: 'Basic Adjectives',
            question: 'Fill in: "This is ___ book I\'ve ever read."',
            options: ['interesting', 'more interesting', 'most interesting', 'interestinger'],
            correct: 2,
            explanation: ' superlative form ("most interesting") is used when comparing with all others.',
            difficulty: 2
        },
        {
            id: 'basic-34',
            topic: 'Basic Adjectives',
            question: '"The sky is ___" - Choose the color adjective',
            options: ['beautiful', 'blue', 'happily', 'beauty'],
            correct: 1,
            explanation: 'Only "blue" is a color adjective. "Beautiful" is a general adjective, "happily" is adverb, "beauty" is noun.',
            difficulty: 1
        },
        {
            id: 'basic-35',
            topic: 'Basic Adjectives',
            question: 'Select the correct order: "a ___ ___ house"',
            options: ['beautiful, big', 'big, beautiful', 'beautiful, a', 'a, big beautiful'],
            correct: 0,
            explanation: 'Opinion adjectives (beautiful) usually come before size adjectives (big). Order: opinion + size + noun.',
            difficulty: 2
        },
        {
            id: 'basic-36',
            topic: 'Basic Adjectives',
            question: '"She looks ___" - Complete with feeling adjective',
            options: ['happy', 'happily', 'happiness', 'happier'],
            correct: 0,
            explanation: 'After "looks" (linking verb), use an adjective, not an adverb.',
            difficulty: 2
        },
        {
            id: 'basic-37',
            topic: 'Basic Adjectives',
            question: 'Which sentence is correct?',
            options: ['It is a unique situation.', 'It is an unique situation.', 'It is the unique situation.', 'It is unique a situation.'],
            correct: 0,
            explanation: 'We say "a unique" not "an unique" because "unique" starts with a consonant sound (yoo).',
            difficulty: 2
        },
        {
            id: 'basic-38',
            topic: 'Basic Adjectives',
            question: '"He\'s ___ man I know." Complete:',
            options: ['a good', 'good a', 'the good', 'good the'],
            correct: 0,
            explanation: 'Article + opinion adjective (good) + noun: "a good man."',
            difficulty: 1
        },
        {
            id: 'basic-39',
            topic: 'Basic Adjectives',
            question: '"This cake is ___ than that one."',
            options: ['delicious', 'more delicious', 'most delicious', 'deliciouser'],
            correct: 1,
            explanation: 'For comparing two things when adjective has 3+ syllables, use "more + adjective."',
            difficulty: 2
        },
        {
            id: 'basic-40',
            topic: 'Basic Adjectives',
            question: '"The weather today is ___ yesterday."',
            options: ['hotter', 'hotter than', 'hot that', 'more hot that'],
            correct: 1,
            explanation: 'Comparative form: adjective + "than" to compare two things.',
            difficulty: 2
        },
        // Question Words (10 questions)
        {
            id: 'basic-41',
            topic: 'Question Words',
            question: 'What is the correct question form? "___ do you live?"',
            options: ['Who', 'Where', 'How', 'What'],
            correct: 1,
            explanation: '"Where" is used to ask about locations or places.',
            difficulty: 1
        },
        {
            id: 'basic-42',
            topic: 'Question Words',
            question: 'Choose the right question word: "___ is your phone number?"',
            options: ['Where', 'What', 'Which', 'Who'],
            correct: 1,
            explanation: '"What" is used to ask about specific information like phone numbers, names, etc.',
            difficulty: 1
        },
        {
            id: 'basic-43',
            topic: 'Question Words',
            question: '"___ did you meet at the party?" - Complete',
            options: ['Where', 'Who', 'When', 'Why'],
            correct: 1,
            explanation: '"Who" asks about people - we want to know which person.',
            difficulty: 1
        },
        {
            id: 'basic-44',
            topic: 'Question Words',
            question: 'Select the correct sentence:',
            options: ['What time is it?', 'What time is it?.', 'What time is it!', 'What the time is it?'],
            correct: 0,
            explanation: 'The standard question word for asking time is "What time."',
            difficulty: 1
        },
        {
            id: 'basic-45',
            topic: 'Question Words',
            question: '"___ are you so happy?" - Why or How?',
            options: ['Why', 'How', 'What', 'When'],
            correct: 0,
            explanation: '"Why" asks for reasons/causes. "How" asks about manner, state, or condition.',
            difficulty: 1
        },
        {
            id: 'basic-46',
            topic: 'Question Words',
            question: '"___ did you learn this?" - Asking for manner',
            options: ['What', 'Why', 'How', 'Where'],
            correct: 2,
            explanation: '"How" asks about the manner or method of doing something.',
            difficulty: 1
        },
        {
            id: 'basic-47',
            topic: 'Question Words',
            question: '"___ is your birthday?"',
            options: ['When', 'What date', 'Where', 'Which date'],
            correct: 1,
            explanation: 'For specific dates, use "What date." "When" is for general time references.',
            difficulty: 2
        },
        {
            id: 'basic-48',
            topic: 'Question Words',
            question: 'Choose the correct question: "___ color do you like best?"',
            options: ['What', 'Which', 'Whose', 'Who'],
            correct: 1,
            explanation: '"Which" is used when choosing from a limited set of options (colors available).',
            difficulty: 2
        },
        {
            id: 'basic-49',
            topic: 'Question Words',
            question: '"___ bag is this?" - Asking about possession',
            options: ['Who', 'Whose', 'Which', 'What'],
            correct: 1,
            explanation: '"Whose" is the possessive question word for asking about ownership.',
            difficulty: 1
        },
        {
            id: 'basic-50',
            topic: 'Question Words',
            question: '"___ tall are you?" - Fill in the blank',
            options: ['What', 'How', 'Which', 'Where'],
            correct: 1,
            explanation: '"How tall" asks about height. "How" is also used for age, weight, distance, etc.',
            difficulty: 2
        }
    ],

    intermediate: [
        // Past Tense (10 questions)
        {
            id: 'inter-1',
            topic: 'Past Tense',
            question: '"Yesterday, I ___ to the cinema." Complete with past form:',
            options: ['go', 'went', 'gone', 'going'],
            correct: 1,
            explanation: '"Went" is the past tense of "go." This is an irregular verb.',
            difficulty: 2
        },
        {
            id: 'inter-2',
            topic: 'Past Tense',
            question: 'Which sentence uses past continuous correctly?',
            options: ['I was watching TV when you called.', 'I were watching TV when you called.', 'I was watch TV when you called.', 'I was watched TV when you called.'],
            correct: 0,
            explanation: 'Past continuous: was/were + verb-ing. With "I," use "was."',
            difficulty: 2
        },
        {
            id: 'inter-3',
            topic: 'Past Tense',
            question: '"She ___ the book yesterday." (finish)',
            options: ['finished', 'finish', 'finishes', 'finishing'],
            correct: 0,
            explanation: '"Yesterday" indicates past tense. Use the past form "finished."',
            difficulty: 2
        },
        {
            id: 'inter-4',
            topic: 'Past Tense',
            question: 'Select the correct sentence:',
            options: ['He didn\'t went to school.', 'He didn\'t go to school.', 'He don\'t go to school.', 'He not go to school.'],
            correct: 1,
            explanation: 'Past negative: didn\'t + base verb (not past tense).',
            difficulty: 2
        },
        {
            id: 'inter-5',
            topic: 'Past Tense',
            question: 'Past simple vs Past continuous: "I ___ TV when the phone ___."',
            options: ['watched, rang', 'was watching, rang', 'watched, was ringing', 'was watching, was ringing'],
            correct: 1,
            explanation: 'Past continuous (was watching) for the longer action, past simple (rang) for the shorter action.',
            difficulty: 3
        },
        {
            id: 'inter-6',
            topic: 'Past Tense',
            question: '"They ___ in Paris for 5 years." (live) - Which is correct?',
            options: ['lived', 'have lived', 'had lived', 'was living'],
            correct: 0,
            explanation: 'When specifying a finished time period (5 years ago, last year), use past simple.',
            difficulty: 2
        },
        {
            id: 'inter-7',
            topic: 'Past Tense',
            question: 'Identify the correctly formed past question:',
            options: ['Did she went home?', 'Did she go home?', 'Does she go home?', 'Was she go home?'],
            correct: 1,
            explanation: 'Past question: Did + subject + base verb = "Did she go?"',
            difficulty: 2
        },
        {
            id: 'inter-8',
            topic: 'Past Tense',
            question: '"The train ___ already ___ when we arrived."',
            options: ['has, left', 'had, left', 'was, left', 'have, left'],
            correct: 1,
            explanation: 'Past perfect (had + past participle) for action completed before another past action.',
            difficulty: 3
        },
        {
            id: 'inter-9',
            topic: 'Past Tense',
            question: 'Choose the correct sentence:',
            options: ['I saw a film yesterday.', 'I seed a film yesterday.', 'I see a film yesterday.', 'I seeing a film yesterday.'],
            correct: 0,
            explanation: '"Saw" is the past tense of "see." This is an irregular verb.',
            difficulty: 2
        },
        {
            id: 'inter-10',
            topic: 'Past Tense',
            question: '"How long ___ you ___ there?" - Past tense question',
            options: ['did, work', 'do, work', 'does, work', 'was, working'],
            correct: 0,
            explanation: 'Past question: Did + you + base verb = "did you work"?',
            difficulty: 2
        },
        // Future Tense (10 questions)
        {
            id: 'inter-11',
            topic: 'Future Tense',
            question: '"I ___ see the dentist tomorrow."',
            options: ['will', 'am going to', 'both are possible', 'neither is possible'],
            correct: 2,
            explanation: 'With "tomorrow" (specified future time), both "will" and "going to" are grammatically correct.',
            difficulty: 2
        },
        {
            id: 'inter-12',
            topic: 'Future Tense',
            question: 'Which sentence shows a prediction?',
            options: ['I will call you at 8.', 'Look at those clouds! It will rain.', 'I\'m meeting Sarah tomorrow.', 'The train leaves at 9 PM.'],
            correct: 1,
            explanation: '"It will rain" is a prediction based on present evidence (clouds). Use "will" for predictions.',
            difficulty: 2
        },
        {
            id: 'inter-13',
            topic: 'Future Tense',
            question: '"I ___ buy a new car next month." (plan)',
            options: ['will', 'am going to', 'both A and B', 'none'],
            correct: 2,
            explanation: '"Going to" and "will" both show plans, but "going to" emphasizes the plan already made.',
            difficulty: 2
        },
        {
            id: 'inter-14',
            topic: 'Future Tense',
            question: 'Future continuous: "This time next week, I ___ in Paris."',
            options: ['will be staying', 'am going to stay', 'will stay', 'stayed'],
            correct: 0,
            explanation: 'Future continuous (will be + verb-ing) for actions in progress at a specific future time.',
            difficulty: 3
        },
        {
            id: 'inter-15',
            topic: 'Future Tense',
            question: 'Which is a spontaneous decision?',
            options: ['I have decided to study medicine.', 'I will study medicine.', 'I\'m going to study medicine.', 'I study medicine.'],
            correct: 1,
            explanation: '"Will" is used for spontaneous decisions made at the moment of speaking.',
            difficulty: 2
        },
        {
            id: 'inter-16',
            topic: 'Future Tense',
            question: '"By next year, I ___ here for ten years."',
            options: ['will work', 'will be working', 'will have worked', 'will had worked'],
            correct: 2,
            explanation: 'Future perfect (will have + past participle) for action completed by a future time.',
            difficulty: 3
        },
        {
            id: 'inter-17',
            topic: 'Future Tense',
            question: 'Choose the correct sentence:',
            options: ['She will arrives tomorrow.', 'She will arrive tomorrow.', 'She will arriving tomorrow.', 'She arriving tomorrow.'],
            correct: 1,
            explanation: 'With "will," use base verb (arrive) not -s form.',
            difficulty: 2
        },
        {
            id: 'inter-18',
            topic: 'Future Tense',
            question: '"The train ___ at 10 PM." (departure - scheduled)',
            options: ['will depart', 'is going to depart', 'departs', 'both B and C'],
            correct: 3,
            explanation: 'For scheduled events (timetables), both "going to" and present simple are acceptable.',
            difficulty: 2
        },
        {
            id: 'inter-19',
            topic: 'Future Tense',
            question: '"If it rains, I ___ stay home."',
            options: ['will', 'would', 'am going to', 'can'],
            correct: 0,
            explanation: 'In first conditional, use will (not would) in the main clause.',
            difficulty: 2
        },
        {
            id: 'inter-20',
            topic: 'Future Tense',
            question: 'Future in the past: "She told me she ___ help."',
            options: ['will', 'would', 'is going to', 'can'],
            correct: 1,
            explanation: '"Would" is used instead of "will" when quoting future events from the past.',
            difficulty: 3
        },
        // Modals (10 questions)
        {
            id: 'inter-21',
            topic: 'Modals',
            question: 'Which modal expresses ability in the past?',
            options: ['can', 'could', 'may', 'might'],
            correct: 1,
            explanation: '"Could" is the past form of "can" for ability in the past.',
            difficulty: 2
        },
        {
            id: 'inter-22',
            topic: 'Modals',
            question: '"You ___ smoke here. It\'s forbidden."',
            options: ['mustn\'t', 'can\'t', 'both A and B', 'none'],
            correct: 2,
            explanation: 'Both "mustn\'t" and "can\'t" mean prohibition, but "can\'t" is more common in spoken English.',
            difficulty: 2
        },
        {
            id: 'inter-23',
            topic: 'Modals',
            question: 'Which modal is used for polite requests?',
            options: ['can', 'could', 'must', 'might'],
            correct: 1,
            explanation: '"Could" is more polite than "can" for requests.',
            difficulty: 2
        },
        {
            id: 'inter-24',
            topic: 'Modals',
            question: '"It ___ rain later. The sky is dark." (possibility)',
            options: ['might', 'must', 'should', 'need'],
            correct: 0,
            explanation: '"Might" shows possibility based on present evidence.',
            difficulty: 2
        },
        {
            id: 'inter-25',
            topic: 'Modals',
            question: 'Select the sentence with correct modal use:',
            options: ['You should to study harder.', 'You should study harder.', 'You should studied harder.', 'You should studying harder.'],
            correct: 1,
            explanation: 'Modals are followed directly by base verb (no -s, -ed, or -ing).',
            difficulty: 2
        },
        {
            id: 'inter-26',
            topic: 'Modals',
            question: '"You ___ hand in your homework tomorrow." (obligation)',
            options: ['have to', 'must', 'both A and B', 'none'],
            correct: 2,
            explanation: 'Both "have to" and "must" express obligation, but "must" is stronger.',
            difficulty: 2
        },
        {
            id: 'inter-27',
            topic: 'Modals',
            question: '"She ___ be at home now. I just saw her." (certainty)',
            options: ['might', 'must', 'can', 'shouldn\'t'],
            correct: 1,
            explanation: '"Must" expresses strong certainty about something believed to be true.',
            difficulty: 2
        },
        {
            id: 'inter-28',
            topic: 'Modals',
            question: 'Which modal is NOT used for present ability?',
            options: ['can', 'could', 'be able to', 'must'],
            correct: 3,
            explanation: '"Must" expresses obligation, not ability. Use "can" for present ability.',
            difficulty: 2
        },
        {
            id: 'inter-29',
            topic: 'Modals',
            question: '"You ___ worry. Everything will be fine." (absence of necessity)',
            options: ['mustn\'t', 'don\'t have to', 'can\'t', 'shouldn\'t'],
            correct: 1,
            explanation: '"Don\'t have to" = no necessity, not required. "Mustn\'t" = forbidden.',
            difficulty: 3
        },
        {
            id: 'inter-30',
            topic: 'Modals',
            question: '"I ___ have finished, but I didn\'t." (past ability not used)',
            options: ['can', 'could', 'might', 'would'],
            correct: 1,
            explanation: '"Could" expresses past ability that was not exercised.',
            difficulty: 3
        },
        // Comparatives & Superlatives (10 questions)
        {
            id: 'inter-31',
            topic: 'Comparatives & Superlatives',
            question: '"This book is ___ than that one."',
            options: ['more interesting', 'interestinger', 'interestinger', 'most interesting'],
            correct: 0,
            explanation: 'For adjectives with 3+ syllables, use "more + adjective" for comparison.',
            difficulty: 2
        },
        {
            id: 'inter-32',
            topic: 'Comparatives & Superlatives',
            question: 'Superlative: "She is the ___ student in the class."',
            options: ['clever', 'cleverest', 'most clever', 'more clever'],
            correct: 1,
            explanation: 'Two-syllable adjectives ending in -y use -er/-est (clever → cleverest).',
            difficulty: 2
        },
        {
            id: 'inter-33',
            topic: 'Comparatives & Superlatives',
            question: 'Choose the correct sentence:',
            options: ['Tokyo is bigger than any other city in Japan.', 'Tokyo is biggest than any other city in Japan.', 'Tokyo is more big than any other city in Japan.', 'Tokyo is biger than any other city in Japan.'],
            correct: 0,
            explanation: 'When comparing one thing to all others, use "bigger than any other."',
            difficulty: 3
        },
        {
            id: 'inter-34',
            topic: 'Comparatives & Superlatives',
            question: '"He is getting ___" - Complete with comparative',
            options: ['tall', 'taller', 'tallest', 'more tall'],
            correct: 1,
            explanation: '"Getting" + comparative shows change (becoming taller).',
            difficulty: 2
        },
        {
            id: 'inter-35',
            topic: 'Comparatives & Superlatives',
            question: 'Which adjective uses "more" for comparison?',
            options: ['fast', 'careful', 'expensive', 'happy'],
            correct: 2,
            explanation: 'Three-syllable adjectives that don\'t end in -y use "more." "Expensive" has 4 syllables.',
            difficulty: 2
        },
        {
            id: 'inter-36',
            topic: 'Comparatives & Superlatives',
            question: '"The ___ the merrier!" Complete the saying:',
            options: ['more', 'most', 'much', 'many'],
            correct: 0,
            explanation: 'Double comparative: "the + adjective, the + adjective" = "the more...the merrier."',
            difficulty: 3
        },
        {
            id: 'inter-37',
            topic: 'Comparatives & Superlatives',
            question: 'Select the correct comparative form: "good"',
            options: ['gooder', 'more good', 'better', 'best'],
            correct: 2,
            explanation: '"Good" is an irregular adjective. Its comparative is "better."',
            difficulty: 2
        },
        {
            id: 'inter-38',
            topic: 'Comparatives & Superlatives',
            question: '"My car runs ___ than it used to."',
            options: ['more efficiently', 'more efficient', 'efficientlier', 'most efficiently'],
            correct: 0,
            explanation: 'With "runs" (verb), use adverb comparative: "more efficiently."',
            difficulty: 3
        },
        {
            id: 'inter-39',
            topic: 'Comparatives & Superlatives',
            question: 'Superlative of "bad" is:',
            options: ['badder', 'baddest', 'worse', 'worst'],
            correct: 3,
            explanation: '"Bad" is irregular: comparative = worse, superlative = worst.',
            difficulty: 2
        },
        {
            id: 'inter-40',
            topic: 'Comparatives & Superlatives',
            question: '"This is by far the ___ movie I\'ve ever seen."',
            options: ['exciting', 'more exciting', 'most exciting', 'excitingest'],
            correct: 2,
            explanation: '"By far" emphasizes the superlative. Use "most + adjective" for 3+ syllable adjectives.',
            difficulty: 3
        },
        // Passive Voice (10 questions)
        {
            id: 'inter-41',
            topic: 'Passive Voice',
            question: 'Change to passive: "They built this house in 2010."',
            options: ['This house was built in 2010.', 'This house is built in 2010.', 'This house built in 2010.', 'This house was build in 2010.'],
            correct: 0,
            explanation: 'Passive: object + be + past participle. "Built" (past) → "was built."',
            difficulty: 2
        },
        {
            id: 'inter-42',
            topic: 'Passive Voice',
            question: 'Present perfect passive: "They have finished the work."',
            options: ['The work has been finished.', 'The work have been finished.', 'The work has finished.', 'The work is finished.'],
            correct: 0,
            explanation: 'Present perfect passive: has/have + been + past participle.',
            difficulty: 3
        },
        {
            id: 'inter-43',
            topic: 'Passive Voice',
            question: 'Which sentence is in passive voice?',
            options: ['The dog bit the man.', 'The man was bitten by the dog.', 'The man bit the dog.', 'The dog is biting the man.'],
            correct: 1,
            explanation: 'Passive voice: subject receives the action. "The man" receives the biting.',
            difficulty: 2
        },
        {
            id: 'inter-44',
            topic: 'Passive Voice',
            question: '"French ___ in many countries." (speak)',
            options: ['is speaking', 'is spoken', 'speaks', 'spoke'],
            correct: 1,
            explanation: 'Present simple passive: am/is/are + past participle.',
            difficulty: 2
        },
        {
            id: 'inter-45',
            topic: 'Passive Voice',
            question: 'Agent in passive: "The play ___ by Shakespeare."',
            options: ['wrote', 'was wrote', 'was written', 'were written'],
            correct: 2,
            explanation: '"Was written" is past simple passive. "By Shakespeare" is the agent.',
            difficulty: 2
        },
        {
            id: 'inter-46',
            topic: 'Passive Voice',
            question: 'Choose the correct passive sentence:',
            options: ['The cake ate by the children.', 'The cake was eaten by the children.', 'The cake were eaten by the children.', 'The cake is ate by the children.'],
            correct: 1,
            explanation: 'Past simple passive: was/were + past participle.',
            difficulty: 2
        },
        {
            id: 'inter-47',
            topic: 'Passive Voice',
            question: '"The letter ___ yesterday." - Past simple passive',
            options: ['sent', 'was sent', 'is sent', 'was send'],
            correct: 1,
            explanation: '"Was sent" = past simple passive.',
            difficulty: 2
        },
        {
            id: 'inter-48',
            topic: 'Passive Voice',
            question: 'Future passive: "They will announce the results tomorrow."',
            options: ['The results will be announced.', 'The results will announced.', 'The results announcing.', 'The results are announced.'],
            correct: 0,
            explanation: 'Future passive: will + be + past participle.',
            difficulty: 2
        },
        {
            id: 'inter-49',
            topic: 'Passive Voice',
            question: 'Which is the correct transformation? "Someone stole my bike."',
            options: ['My bike was stolen.', 'My bike stolen was.', 'My bike is stolen.', 'My bike was being stolen.'],
            correct: 0,
            explanation: 'Past simple passive for completed past action.',
            difficulty: 2
        },
        {
            id: 'inter-50',
            topic: 'Passive Voice',
            question: '"English ___ in over 50 countries worldwide."',
            options: ['speaks', 'is spoke', 'is spoken', 'spoke'],
            correct: 2,
            explanation: 'Present simple passive: "is spoken."',
            difficulty: 2
        }
    ],

    advanced: [
        // Perfect Tenses (10 questions)
        {
            id: 'adv-1',
            topic: 'Perfect Tenses',
            question: 'Present perfect: "I ___ here since 9 o\'clock."',
            options: ['am', 'have been', 'was', 'had been'],
            correct: 1,
            explanation: 'Present perfect for actions starting in the past and continuing to now.',
            difficulty: 3
        },
        {
            id: 'adv-2',
            topic: 'Perfect Tenses',
            question: 'Past perfect: "By the time I arrived, she ___ already left."',
            options: ['has', 'had', 'have', 'having'],
            correct: 1,
            explanation: 'Past perfect (had + past participle) for action before another past action.',
            difficulty: 3
        },
        {
            id: 'adv-3',
            topic: 'Perfect Tenses',
            question: 'Present perfect continuous: "She ___ for 3 hours."',
            options: ['has been working', 'has been work', 'has working', 'have working'],
            correct: 0,
            explanation: 'Present perfect continuous: has/have + been + verb-ing.',
            difficulty: 3
        },
        {
            id: 'adv-4',
            topic: 'Perfect Tenses',
            question: 'Which sentence uses present perfect correctly?',
            options: ['I have went there.', 'I have gone there.', 'I have been there yesterday.', 'I have be there.'],
            correct: 1,
            explanation: 'Present perfect: has/have + past participle (gone). Don\'t use with specific past time.',
            difficulty: 3
        },
        {
            id: 'adv-5',
            topic: 'Perfect Tenses',
            question: 'Future perfect: "By 2027, I ___ here for 10 years."',
            options: ['will work', 'will be working', 'will have worked', 'work'],
            correct: 2,
            explanation: 'Future perfect (will have + past participle) for action completed by a future time.',
            difficulty: 3
        },
        {
            id: 'adv-6',
            topic: 'Perfect Tenses',
            question: 'Past perfect continuous: "She ___ all day."',
            options: ['had been painting', 'had been paint', 'has been painting', 'was painting'],
            correct: 0,
            explanation: 'Past perfect continuous: had + been + verb-ing.',
            difficulty: 3
        },
        {
            id: 'adv-7',
            topic: 'Perfect Tenses',
            question: '"___ you ever ___ skydiving?"',
            options: ['Have, tried', 'Had, tried', 'Have, try', 'Did, try'],
            correct: 0,
            explanation: 'Present perfect for life experiences. "Have you ever tried...?"',
            difficulty: 3
        },
        {
            id: 'adv-8',
            topic: 'Perfect Tenses',
            question: 'Present perfect vs Past simple: "I ___ to Paris three times."',
            options: ['have been', 'went', 'was', 'had been'],
            correct: 0,
            explanation: 'Present perfect for unspecified number of times. Past simple for specific past.',
            difficulty: 3
        },
        {
            id: 'adv-9',
            topic: 'Perfect Tenses',
            question: '"It ___ all day yesterday." (continuous rain)',
            options: ['rained', 'had been raining', 'has rained', 'was raining'],
            correct: 3,
            explanation: 'Past continuous for prolonged action in past, especially with "all day."',
            difficulty: 3
        },
        {
            id: 'adv-10',
            topic: 'Perfect Tenses',
            question: 'Choose the correct sentence:',
            options: ['I have lived here since 2010 and I still live here.', 'I have lived here since 2010.', 'I lived here since 2010.', 'I have been living here since 2010.'],
            correct: 1,
            explanation: 'Present perfect for actions continuing to present. All options except C are correct if completing the thought.',
            difficulty: 3
        },
        // Complex Conditionals (10 questions)
        {
            id: 'adv-11',
            topic: 'Conditionals',
            question: 'Zero conditional: "If you ___ heat water, it boils."',
            options: ['heat', 'heated', 'will heat', 'would heat'],
            correct: 0,
            explanation: 'Zero conditional: present simple + present simple. General truth.',
            difficulty: 3
        },
        {
            id: 'adv-12',
            topic: 'Conditionals',
            question: 'First conditional: "If it ___ tomorrow, we\'ll cancel."',
            options: ['rains', 'rained', 'will rain', 'would rain'],
            correct: 0,
            explanation: 'First conditional: if + present simple, will + base verb.',
            difficulty: 2
        },
        {
            id: 'adv-13',
            topic: 'Conditionals',
            question: 'Second conditional: "If I ___ rich, I would travel."',
            options: ['were', 'was', 'am', 'be'],
            correct: 0,
            explanation: 'Second conditional for unreal/hypothetical: if + past simple (were for all subjects).',
            difficulty: 3
        },
        {
            id: 'adv-14',
            topic: 'Conditionals',
            question: 'Third conditional: "If she ___ harder, she would have passed."',
            options: ['studied', 'had studied', 'has studied', 'would study'],
            correct: 1,
            explanation: 'Third conditional for past unreal: if + past perfect, would have + past participle.',
            difficulty: 3
        },
        {
            id: 'adv-15',
            topic: 'Conditionals',
            question: 'Mixed conditional: "If I ___ awake, I would be at the party now."',
            options: ['am', 'were', 'had been', 'was'],
            correct: 1,
            explanation: 'Mixed: past condition (were) with present result (would be).',
            difficulty: 3
        },
        {
            id: 'adv-16',
            topic: 'Conditionals',
            question: 'Which is a zero conditional statement?',
            options: ['If water boils at 100 degrees, it produces steam.', 'If it rains, we stay inside.', 'If I were you, I would go.', 'If you had studied, you would pass.'],
            correct: 0,
            explanation: 'Zero conditional expresses general truths and scientific facts.',
            difficulty: 3
        },
        {
            id: 'adv-17',
            topic: 'Conditionals',
            question: '"I would have helped if I ___ there."',
            options: ['was', 'were', 'had been', 'am'],
            correct: 2,
            explanation: 'Past unreal condition: if + past perfect. "Had been" is correct.',
            difficulty: 3
        },
        {
            id: 'adv-18',
            topic: 'Conditionals',
            question: 'Inversion for emphasis: "___ rain, we\'ll stay inside."',
            options: ['Should it', 'If it should', 'Might it', 'Could it'],
            correct: 0,
            explanation: 'Inversion: "Should + subject + verb" replaces "if" for emphasis.',
            difficulty: 3
        },
        {
            id: 'adv-19',
            topic: 'Conditionals',
            question: 'Which conditional expresses a past habit?',
            options: ['First conditional', 'Second conditional', 'Third conditional', 'Zero conditional'],
            correct: 3,
            explanation: 'Zero conditional can also express past habits that are always true.',
            difficulty: 3
        },
        {
            id: 'adv-20',
            topic: 'Conditionals',
            question: '"Had I known, I ___ the invitation."',
            options: ['would accept', 'would have accepted', 'would had accepted', 'accept'],
            correct: 1,
            explanation: 'Inverted conditional for past result: would have + past participle.',
            difficulty: 3
        },
        // Subjunctive Mood (10 questions)
        {
            id: 'adv-21',
            topic: 'Subjunctive Mood',
            question: '"I suggest that he ___ more time."',
            options: ['studies', 'study', 'studied', 'will study'],
            correct: 1,
            explanation: 'Subjunctive after "suggest": base form of verb (study, not studies).',
            difficulty: 3
        },
        {
            id: 'adv-22',
            topic: 'Subjunctive Mood',
            question: '"It\'s essential that she ___ present."',
            options: ['is', 'be', 'was', 'being'],
            correct: 1,
            explanation: 'Subjunctive "be" is used after expressions of importance/necessity.',
            difficulty: 3
        },
        {
            id: 'adv-23',
            topic: 'Subjunctive Mood',
            question: 'Which sentence uses the subjunctive correctly?',
            options: ['I wish I was taller.', 'I wish I were taller.', 'I wish I am taller.', 'I wish I be taller.'],
            correct: 1,
            explanation: '"Were" is the subjunctive form for unreal wishes.',
            difficulty: 3
        },
        {
            id: 'adv-24',
            topic: 'Subjunctive Mood',
            question: '"The doctor recommended that he ___ smoking."',
            options: ['quit', 'quits', 'quit', 'quitted'],
            correct: 0,
            explanation: 'After "recommend," use base form (quit) not third person.',
            difficulty: 3
        },
        {
            id: 'adv-25',
            topic: 'Subjunctive Mood',
            question: 'Wishes about present: "I wish I ___ the answer."',
            options: ['know', 'knew', 'known', 'will know'],
            correct: 1,
            explanation: 'Wish about present: past simple (knew), not past participle.',
            difficulty: 3
        },
        {
            id: 'adv-26',
            topic: 'Subjunctive Mood',
            question: '"If only I ___ the exam!" (past regret)',
            options: ['passed', 'had passed', 'have passed', 'would pass'],
            correct: 1,
            explanation: 'Past regret: if only + past perfect.',
            difficulty: 3
        },
        {
            id: 'adv-27',
            topic: 'Subjunctive Mood',
            question: '"She insists that he ___ on time."',
            options: ['arrives', 'arrive', 'arrived', 'arriving'],
            correct: 1,
            explanation: 'Subjunctive "arrive" (base form) after "insists that."',
            difficulty: 3
        },
        {
            id: 'adv-28',
            topic: 'Subjunctive Mood',
            question: '"It\'s crucial that we ___ immediate action."',
            options: ['take', 'takes', 'took', 'taking'],
            correct: 0,
            explanation: 'Subjunctive after "crucial" (important/essential): base form "take."',
            difficulty: 3
        },
        {
            id: 'adv-29',
            topic: 'Subjunctive Mood',
            question: 'Choose the correct sentence:',
            options: ['I wish I were rich.', 'I wish I was rich.', 'I wish I am rich.', 'I wish I be rich.'],
            correct: 0,
            explanation: '"Were" is traditionally preferred for subjunctive in all persons.',
            difficulty: 3
        },
        {
            id: 'adv-30',
            topic: 'Subjunctive Mood',
            question: '"The committee demands that the report ___ by Friday."',
            options: ['is submitted', 'be submitted', 'submitted', 'submitting'],
            correct: 1,
            explanation: 'Subjunctive "be submitted" after demands/requirements.',
            difficulty: 3
        },
        // Advanced Clause Structure (10 questions)
        {
            id: 'adv-31',
            topic: 'Clause Structure',
            question: 'Identify the noun clause: "___ you need help is clear."',
            options: ['That', 'What', 'Whether', 'If'],
            correct: 0,
            explanation: '"That you need help" is a noun clause functioning as subject.',
            difficulty: 3
        },
        {
            id: 'adv-32',
            topic: 'Clause Structure',
            question: '"The reason ___ she called was urgent."',
            options: ['why', 'because', 'which', 'that'],
            correct: 0,
            explanation: '"The reason why" is standard. Also "the reason that."',
            difficulty: 3
        },
        {
            id: 'adv-33',
            topic: 'Clause Structure',
            question: 'Reduced relative clause: "The man ___ here is my father."',
            options: ['who is standing', 'standing', 'to stand', 'stood'],
            correct: 1,
            explanation: 'Present participle "standing" can replace "who is standing."',
            difficulty: 3
        },
        {
            id: 'adv-34',
            topic: 'Clause Structure',
            question: '"She failed ___ she studied hard." Connect with:',
            options: ['because of', 'despite', 'although', 'however'],
            correct: 2,
            explanation: '"Although" introduces a contrast clause. "Despite" needs noun/object.',
            difficulty: 3
        },
        {
            id: 'adv-35',
            topic: 'Clause Structure',
            question: 'Cleft sentence: "It was John ___ helped me."',
            options: ['which', 'that', 'whom', 'who'],
            correct: 3,
            explanation: '"It was John who helped me" - "who" introduces the defining clause.',
            difficulty: 3
        },
        {
            id: 'adv-36',
            topic: 'Clause Structure',
            question: '"No sooner ___ arrived than it started to rain."',
            options: ['he had', 'had he', 'he was', 'was he'],
            correct: 1,
            explanation: 'Inversion after "no sooner": had + subject + past participle.',
            difficulty: 3
        },
        {
            id: 'adv-37',
            topic: 'Clause Structure',
            question: '"___ hard I try, I can\'t succeed."',
            options: ['Whatever', 'However', 'No matter', 'Although'],
            correct: 1,
            explanation: '"However hard" = "No matter how hard" = "Whatever way hard."',
            difficulty: 3
        },
        {
            id: 'adv-38',
            topic: 'Clause Structure',
            question: 'Which contains a dangling modifier?',
            options: ['Walking down the street, the trees were beautiful.', 'While I was walking, the trees were beautiful.', 'The trees were beautiful while I walked.', 'Walking, I saw the beautiful trees.'],
            correct: 0,
            explanation: '"Walking down the street" should modify the subject, but it\'s "the trees" instead.',
            difficulty: 3
        },
        {
            id: 'adv-39',
            topic: 'Clause Structure',
            question: '"Hardly ___ when the phone rang."',
            options: ['I had sat down', 'had I sat down', 'did I sit down', 'I sit down'],
            correct: 1,
            explanation: 'Inversion after "hardly": Hardly + had + subject + past participle.',
            difficulty: 3
        },
        {
            id: 'adv-40',
            topic: 'Clause Structure',
            question: '"Not only ___ the exam, but she also got the highest score."',
            options: ['she passed', 'did she pass', 'she did pass', 'passed she'],
            correct: 1,
            explanation: 'Inversion after "not only": Not only + did + subject + base verb.',
            difficulty: 3
        },
        // Complex Passive (10 questions)
        {
            id: 'adv-41',
            topic: 'Complex Passive',
            question: '"It is said that he ___ a genius."',
            options: ['is', 'was', 'is being', 'has been'],
            correct: 0,
            explanation: 'Passive infinitive: "is said to be." Stative passive.',
            difficulty: 3
        },
        {
            id: 'adv-42',
            topic: 'Complex Passive',
            question: '"He is believed ___ the crime."',
            options: ['to commit', 'to have committed', 'committed', 'committing'],
            correct: 1,
            explanation: 'Perfect infinitive "to have committed" for past action.',
            difficulty: 3
        },
        {
            id: 'adv-43',
            topic: 'Complex Passive',
            question: 'Which is a personal passive? "___"',
            options: ['The work is done.', 'It is said that he is kind.', 'He is said to be kind.', 'The book is being read.'],
            correct: 2,
            explanation: 'Personal passive: subject + passive verb + infinitive.',
            difficulty: 3
        },
        {
            id: 'adv-44',
            topic: 'Complex Passive',
            question: '"She is known ___ excellent music."',
            options: ['for composing', 'to compose', 'composing', 'to have composed'],
            correct: 0,
            explanation: '"Known for" + verb-ing shows reputation/action.',
            difficulty: 3
        },
        {
            id: 'adv-45',
            topic: 'Complex Passive',
            question: '"The bridge is said ___ last year."',
            options: ['to build', 'to have been built', 'to be built', 'building'],
            correct: 1,
            explanation: 'Perfect infinitive passive: to have been + past participle.',
            difficulty: 3
        },
        {
            id: 'adv-46',
            topic: 'Complex Passive',
            question: 'Which sentence shows causative passive?',
            options: ['He was seen leaving.', 'The work was got done.', 'The hair was dyed.', 'The car was repaired.'],
            correct: 1,
            explanation: 'Causative passive: get/have + object + past participle.',
            difficulty: 3
        },
        {
            id: 'adv-47',
            topic: 'Complex Passive',
            question: '"The window is reported ___ yesterday."',
            options: ['to break', 'to have broken', 'to have been broken', 'breaking'],
            correct: 2,
            explanation: 'Passive perfect infinitive for past action.',
            difficulty: 3
        },
        {
            id: 'adv-48',
            topic: 'Complex Passive',
            question: '"I had my car ___ yesterday." (repair)',
            options: ['repair', 'to repair', 'repaired', 'repairs'],
            correct: 2,
            explanation: 'Causative: have + object + past participle.',
            difficulty: 3
        },
        {
            id: 'adv-49',
            topic: 'Complex Passive',
            question: 'Which contains a true passive construction?',
            options: ['The door opened.', 'The door is open.', 'The door was opened by him.', 'The door seems opened.'],
            correct: 2,
            explanation: '"Was opened by him" is the passive voice with agent.',
            difficulty: 3
        },
        {
            id: 'adv-50',
            topic: 'Complex Passive',
            question: '"The student is expected ___ the assignment."',
            options: ['to submit', 'to have submitted', 'submitting', 'submitted'],
            correct: 0,
            explanation: 'Passive infinitive "to submit" after expectation.',
            difficulty: 3
        }
    ]
};

// Helper function to get questions by topic
function getQuestionsByTopic(level, topic) {
    return questionBank[level].filter(q => q.topic === topic);
}

// Helper function to get all topics for a level
function getTopicsForLevel(level) {
    const topics = new Set();
    questionBank[level].forEach(q => topics.add(q.topic));
    return Array.from(topics);
}

// Export for use in main app
window.questionBank = questionBank;
window.getQuestionsByTopic = getQuestionsByTopic;
window.getTopicsForLevel = getTopicsForLevel;
