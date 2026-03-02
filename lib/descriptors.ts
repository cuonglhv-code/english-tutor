type BandLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const TA_ACADEMIC_T1: Record<BandLevel, string> = {
  9: "Fully satisfies all requirements of the task. Clearly presents a fully developed response with precise and accurate data throughout.",
  8: "Covers all requirements of the task sufficiently. Key features are highlighted and illustrated effectively. Minor inaccuracies may occur in detail but do not detract from the overall response.",
  7: "Covers the requirements of the task. Key features are highlighted and illustrated, though there may be a tendency to over-generalise or some inaccuracies in detail.",
  6: "Addresses the requirements of the task. Key features are indicated with some detail, though there may be a tendency to over-generalise or to lose clarity. The format is generally appropriate.",
  5: "Generally addresses the task; format may be inappropriate in places. Key features are selected but details may not be reported accurately. Overview may be unclear or absent.",
  4: "Attempts to address the task but does not cover all key features. There may be a tendency to describe details rather than selecting and comparing main trends. Data may be inaccurate.",
  3: "Fails to adequately address the task, which may have been misunderstood. Presents limited data. May attempt to present a personal opinion rather than describing data.",
  2: "Barely responds to the task. May copy substantial portions from the prompt. Fails to select relevant data.",
  1: "Answers are totally unrelated to the task. No meaningful data is communicated.",
  0: "Did not attempt the task or wrote fewer than 10 words.",
};

export const TR_TASK2: Record<BandLevel, string> = {
  9: "Fully addresses all parts of the task. Presents a clear, well-developed position throughout. Develops ideas fully with relevant, extended and well-supported arguments.",
  8: "Sufficiently addresses all parts of the task. Presents a well-developed response with relevant, extended and supported ideas. Minor lapses in development may occur.",
  7: "Addresses all parts of the task. Presents a clear position throughout. Presents, extends and supports main ideas, but there may be a tendency to over-generalise or support is not always precise.",
  6: "Addresses all parts of the task, though some more fully than others. Presents a relevant position, though the conclusions may be unclear or the position may not be consistently maintained.",
  5: "Addresses the task only partially. Expresses a position but the development is not always clear. Some main ideas are put forward but not fully developed.",
  4: "Responds to the task only in a minimal way or the format is inappropriate. A position is discernible but it is not developed. Main ideas are difficult to identify.",
  3: "Does not adequately address any part of the task. Does not express a clear viewpoint. Few ideas are presented and there is little attempt at development.",
  2: "Barely responds to the task. May copy from the prompt. Fails to identify the task type or topic.",
  1: "Answers are totally unrelated to the task. No position is expressed.",
  0: "Did not attempt the task or wrote fewer than 10 words.",
};

export const TA_GENERAL_T1: Record<BandLevel, string> = {
  9: "Fully achieves the purpose of the task with a sophisticated response. Tone is wholly appropriate. All bullet points are fully addressed and extended.",
  8: "Successfully achieves the purpose of the task. Tone is appropriate. All bullet points are covered and extended, with only minor omissions.",
  7: "Successfully achieves the purpose of the task. Tone is generally appropriate. All bullet points are covered with some extension, though not always consistently.",
  6: "Achieves the purpose of the task with an appropriate format. Tone is generally appropriate. All bullet points are addressed, though some more fully than others.",
  5: "Generally achieves the purpose of the task; tone may not always be appropriate. Some bullet points are addressed but not always clearly.",
  4: "Attempts to achieve the purpose of the task but the result is not fully successful. The tone may be inappropriate. Some bullet points are not adequately covered.",
  3: "Fails to achieve the purpose. The tone may be inappropriate throughout. Not all bullet points are addressed.",
  2: "Barely communicates the message. The format is inappropriate. Bullet points are largely ignored.",
  1: "No communication is achieved.",
  0: "Did not attempt the task or wrote fewer than 10 words.",
};

export const CC_DESCRIPTORS: Record<BandLevel, string> = {
  9: "Sequences information and ideas logically. Manages all aspects of cohesion skillfully. Uses paragraphing seamlessly and appropriately with a natural, effortless progression throughout.",
  8: "Sequences information and ideas logically. Manages all aspects of cohesion well, though there may be occasional lapses. Uses paragraphing sufficiently and appropriately.",
  7: "Logically organises information and ideas; clear overall progression. Uses a range of cohesive devices appropriately, although there may be some under- or over-use.",
  6: "Arranges information and ideas coherently and there is a clear overall progression. Uses cohesive devices effectively but cohesion within and between sentences may be faulty or mechanical. Uses paragraphing, but not always logically.",
  5: "Presents information with some organisation but there may be a lack of overall progression. Makes inadequate, inaccurate or over-use of cohesive devices. May be repetitive because of lack of referencing and substitution.",
  4: "Presents information and ideas but these are not arranged coherently and there is no clear progression. Uses some basic cohesive devices but these may be inaccurate or repetitive. May not write in paragraphs or paragraphing may be illogical.",
  3: "Does not organise ideas logically. May use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas.",
  2: "Has very little control of organisational features.",
  1: "Fails to communicate any message.",
  0: "Did not attempt the task.",
};

export const LR_DESCRIPTORS: Record<BandLevel, string> = {
  9: "Uses a wide range of vocabulary with very natural and sophisticated control of lexical features. Rare minor errors occur only as 'slips'. Word choice and collocation demonstrate mastery.",
  8: "Uses a wide resource with fluency and flexibility. Vocabulary is sophisticated and used with good control. Occasional errors in word choice, spelling and collocation occur but do not impede communication.",
  7: "Uses a sufficient range of vocabulary to allow some flexibility and precision. Uses less common vocabulary with some awareness of style and collocation, though occasional inaccuracies occur.",
  6: "Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with some inaccuracy. Makes some errors in spelling and/or word formation, but they do not impede communication.",
  5: "Uses a limited range of vocabulary. Repetition of the same words may occur. Makes noticeable errors in spelling and/or word form, which may cause some difficulty for the reader.",
  4: "Uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task. Has limited ability to use word forms correctly. Makes frequent errors in spelling and/or word formation.",
  3: "Uses only a very limited range of words and expressions. Frequent errors in spelling and word formation distort meaning.",
  2: "Uses an extremely limited range of vocabulary. Essentially no control of word formation and/or spelling.",
  1: "Can only use a few isolated words with no control over word formation or spelling.",
  0: "Did not attempt the task.",
};

export const GRA_DESCRIPTORS: Record<BandLevel, string> = {
  9: "Uses a wide range of structures with full flexibility and accuracy; rare errors occur only as 'slips'. Punctuation is expertly handled. Sentence variety is natural and sophisticated.",
  8: "Uses a wide range of structures. The majority of sentences are error-free, and punctuation is well managed. Occasional inappropriacies or non-systematic errors occur but do not impede communication.",
  7: "Uses a variety of complex structures. Produces frequent error-free sentences. Has good control of grammar and punctuation but may make a few errors. Agreement, tense, and articles are generally accurate.",
  6: "Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation, but they rarely reduce communication. Complex structures are attempted but not always accurately controlled.",
  5: "Uses only a limited range of structures. Attempts complex sentences but these tend to be less accurate than simple sentences. Makes frequent grammatical errors which may cause some difficulty for the reader.",
  4: "Uses only a very limited range of structures with only rare use of subordinate clauses. Some structures are accurate but errors predominate and punctuation is often faulty.",
  3: "Attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning.",
  2: "Cannot use sentence forms except in memorised phrases.",
  1: "Cannot use sentence forms at all.",
  0: "Did not attempt the task.",
};

export function getDescriptor(
  criterion: "ta" | "cc" | "lr" | "gra",
  band: number,
  taskType: "academic" | "general",
  taskNumber: "1" | "2"
): string {
  const b = Math.min(9, Math.max(0, Math.floor(band))) as BandLevel;
  if (criterion === "ta") {
    if (taskNumber === "2") return TR_TASK2[b];
    if (taskType === "general") return TA_GENERAL_T1[b];
    return TA_ACADEMIC_T1[b];
  }
  if (criterion === "cc") return CC_DESCRIPTORS[b];
  if (criterion === "lr") return LR_DESCRIPTORS[b];
  return GRA_DESCRIPTORS[b];
}

export function getNextDescriptor(
  criterion: "ta" | "cc" | "lr" | "gra",
  band: number,
  taskType: "academic" | "general",
  taskNumber: "1" | "2"
): string {
  const nextBand = Math.min(9, Math.ceil(band) + 1);
  return getDescriptor(criterion, nextBand, taskType, taskNumber);
}
