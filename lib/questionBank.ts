// ─── Shared Question Bank data ─────────────────────────────────────────────────
// This module contains the canonical list of practice questions and all the
// catalogue metadata used by the Practice Library page and any future features.

export interface PracticeQuestion {
    id: string;
    task: "Task 1" | "Task 2";
    type: string;
    source: string;
    questionText: string;
    imageUrl: string;
}

export const TASK1_TYPES = [
    "Bar Chart",
    "Line Graph",
    "Pie Chart",
    "Table",
    "Map",
    "Process",
    "Mixed Graph",
    "GT - Formal Letter",
    "GT - Semi-Formal Letter",
    "GT - Informal Letter",
] as const;

export const TASK2_TYPES = [
    "Opinion Essay",
    "Discussion Essay",
    "Problem & Solution",
    "Advantages & Disadvantages",
    "Double Question",
] as const;

export const SOURCES = [
    "Actual Test",
    "Cambridge IELTS",
    "Jaxtina Bank",
    "IELTS Insights",
    "IELTS Liz",
    "IELTS Advantage",
    "IELTS Jacky",
    "British Council",
    "IDP IELTS",
    "IELTS Official",
] as const;

export const TYPE_COLORS: Record<string, string> = {
    "Bar Chart": "bg-blue-100 text-blue-700",
    "Line Graph": "bg-green-100 text-green-700",
    "Pie Chart": "bg-purple-100 text-purple-700",
    "Table": "bg-yellow-100 text-yellow-700",
    "Map": "bg-teal-100 text-teal-700",
    "Process": "bg-orange-100 text-orange-700",
    "Mixed Graph": "bg-pink-100 text-pink-700",
    "GT - Formal Letter": "bg-sky-100 text-sky-700",
    "GT - Semi-Formal Letter": "bg-cyan-100 text-cyan-700",
    "GT - Informal Letter": "bg-indigo-100 text-indigo-700",
    "Opinion Essay": "bg-indigo-100 text-indigo-700",
    "Discussion Essay": "bg-cyan-100 text-cyan-700",
    "Problem & Solution": "bg-rose-100 text-rose-700",
    "Advantages & Disadvantages": "bg-violet-100 text-violet-700",
    "Double Question": "bg-amber-100 text-amber-700",
};

export const SEED_QUESTIONS: PracticeQuestion[] = [
    { id: "seed_1", task: "Task 1", type: "Bar Chart", source: "IELTS Advantage", questionText: "The chart below shows the total number of minutes (in billions) of telephone calls in the UK, divided into three categories, from 1995-2002. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsadvantage.com/wp-content/uploads/2015/04/ielts-writing-task-1-bar-chart-uk-telephone-calls.png" },
    { id: "seed_2", task: "Task 1", type: "Mixed Graph", source: "IELTS Advantage", questionText: "The pie chart below shows the main reasons why agricultural land become less productive. The table shows how these causes affected three regions of the world during the 1990s. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsadvantage.com/wp-content/uploads/2015/05/ielts-task-1-land-degredation.jpg" },
    { id: "seed_3", task: "Task 1", type: "Line Graph", source: "IELTS Jacky", questionText: "The line graph below shows the consumption of 3 different types of fast food in Britain from 1970 to 1990. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xLineGraphFastFood.jpg.pagespeed.ic.CdQv_bmFWo.jpg" },
    { id: "seed_4", task: "Task 1", type: "Bar Chart", source: "IELTS Jacky", questionText: "The bar chart below shows numbers of seals, whales and dolphins recorded in the Gormez Straits from 2006 to 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xBarChartSealsWhalesDolphins.jpg.pagespeed.ic.vqCu-4sy9Q.jpg" },
    { id: "seed_5", task: "Task 1", type: "Line Graph", source: "IELTS Jacky", questionText: "The graph below shows the population for India and China since the year 2000 and predicts population growth until 2050. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xLineGraphIndiaChina.jpg.pagespeed.ic.ewaYcNZfKM.jpg" },
    { id: "seed_6", task: "Task 1", type: "Table", source: "IELTS Jacky", questionText: "The tables below give information about the world population and distribution in 1950 and 2000, with an estimate of the situation in 2050. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xTableWorldPopulationByRegion.jpg.pagespeed.ic.1AeAP0Ls1p.jpg" },
    { id: "seed_7", task: "Task 1", type: "Pie Chart", source: "IELTS Jacky", questionText: "The chart below shows the reasons why people travel to work by bicycle or by car. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xPieChartWorkTransport.jpg.pagespeed.ic.RjLLCGXo7L.jpg" },
    { id: "seed_8", task: "Task 1", type: "Process", source: "IELTS Jacky", questionText: "The diagrams below show a structure that is used to generate electricity from wave power. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xElectricityFromWavePower.jpg.pagespeed.ic.CFRQMHlVun.jpg" },
    { id: "seed_9", task: "Task 1", type: "Map", source: "IELTS Jacky", questionText: "The diagrams below show the changes that have taken place at Queen Mary Hospital since its construction in 1960. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xQueenMaryHospitalMaps.jpg.pagespeed.ic._1Ab0aBBV9.jpg" },
    { id: "seed_10", task: "Task 1", type: "Mixed Graph", source: "IELTS Jacky", questionText: "The diagrams below give information on transport and car use in Edmonton. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://www.ieltsjacky.com/images/xCombinations1.jpg.pagespeed.ic.Sa9X1ZcySC.jpg" },
    { id: "seed_11", task: "Task 1", type: "Pie Chart", source: "IDP IELTS", questionText: "The pie chart shows how people in the UK accessed international news in 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", imageUrl: "https://images.ctfassets.net/unrdeg6se4ke/2yfI6B6w1VgjEcVLMKANYc/66c26f57d4c14c840e5dee3552a13199/2.png?&w=1220" },
    { id: "seed_12", task: "Task 1", type: "Line Graph", source: "British Council", questionText: "This graph shows the proportion of four different materials that were recycled from 1982 to 2010 in a particular country. Summarise the information by selecting and reporting the main features, making comparisons where relevant.", imageUrl: "https://takeielts.britishcouncil.org/sites/default/files/styles/bc-landscape-270x152/public/ac_writing_task_1.png?itok=lHfyefHl" },
    { id: "seed_13", task: "Task 2", type: "Opinion Essay", source: "IELTS Liz", questionText: "Many people believe that social networking sites (such as Facebook) have had a huge negative impact on both individuals and society. To what extent do you agree?", imageUrl: "" },
    { id: "seed_14", task: "Task 2", type: "Double Question", source: "British Council", questionText: "Learning English at school is often seen as more important than learning local languages. If these are not taught, many are at risk of dying out. In your opinion, is it important for everyone to learn English? Should we try to ensure the survival of local languages and, if so, how?", imageUrl: "" },
    { id: "seed_15", task: "Task 2", type: "Discussion Essay", source: "IELTS Advantage", questionText: "Some people think that parents should teach their children how to be good members of society. Others, however, believe that school is the best place to learn this. Discuss both views and give your own opinion.", imageUrl: "" },
    { id: "seed_16", task: "Task 2", type: "Advantages & Disadvantages", source: "IELTS Advantage", questionText: "There is an increasing trend around the world of married couples deciding not to have children. Discuss the advantages and disadvantages for couples who decide to do this.", imageUrl: "" },
    { id: "seed_17", task: "Task 2", type: "Problem & Solution", source: "IELTS Advantage", questionText: "In many professional sports, there is an increase in the number of athletes using banned substances to improve their performance. What are the causes of the phenomenon and what are some of the possible solutions?", imageUrl: "" },
    { id: "seed_18", task: "Task 2", type: "Opinion Essay", source: "IELTS Advantage", questionText: "Details of politicians' private lives should not be published in newspapers. To what extent do you agree or disagree?", imageUrl: "" },
    { id: "seed_19", task: "Task 2", type: "Opinion Essay", source: "IELTS Advantage", questionText: "Some say that music, art and drama are as important as other school subjects, especially at the primary level. Do you agree or disagree?", imageUrl: "" },
    { id: "seed_20", task: "Task 2", type: "Advantages & Disadvantages", source: "IELTS Advantage", questionText: "In some countries, it is becoming increasingly common for people to follow a vegetarian diet. Do the advantages of this outweigh the disadvantages?", imageUrl: "" },
    { id: "seed_21", task: "Task 2", type: "Opinion Essay", source: "IELTS Liz", questionText: "Some people think that the government is wasting money on the arts and that this money could be better spent elsewhere. To what extent do you agree with this view?", imageUrl: "" },
    { id: "seed_22", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "Nowadays parents put too much pressure on their children to succeed. What is the reason for doing this? Is this a negative or positive development?", imageUrl: "" },
    { id: "seed_23", task: "Task 2", type: "Advantages & Disadvantages", source: "IELTS Liz", questionText: "Some people think it is better for children to grow up in the city, while others think that life in the countryside is more suitable. What are the advantages and disadvantages of both places?", imageUrl: "" },
    { id: "seed_24", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "In many modern societies, grandchildren rarely spend any quality time with their grandparents. What do you think are the consequences of this?", imageUrl: "" },
    { id: "seed_25", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "Nowadays, it seems that different generations within the family spend less time doing activities together. Why is that? Is it a positive or negative development?", imageUrl: "" },
    { id: "seed_26", task: "Task 2", type: "Opinion Essay", source: "IELTS Liz", questionText: "Children can learn effectively by watching television. Therefore they should be encouraged to watch television regularly at home and at school. To what extent do you agree or disagree?", imageUrl: "" },
    { id: "seed_27", task: "Task 2", type: "Discussion Essay", source: "IELTS Liz", questionText: "Some people think that the role of parents is to discipline their children and teach them about right and wrong. Other people consider that the main responsibility of parents is to nurture their children and provide them with a safe environment to grow up in. Discuss both sides and give your opinion.", imageUrl: "" },
    { id: "seed_28", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "Most modern families have both parents working and as a result children spend less and less time with their parents. What is the reason for this? What problems can this cause?", imageUrl: "" },
    { id: "seed_29", task: "Task 2", type: "Advantages & Disadvantages", source: "IELTS Liz", questionText: "The nuclear family is well adapted to move geographically due to its size. Do you think children benefit in any way from moving? Do you think the advantages outweigh the disadvantages?", imageUrl: "" },
    { id: "seed_30", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "In many developing countries, there is a problem with declining quality of air and water from both industry and construction. What measures could be taken to prevent this?", imageUrl: "" },
    { id: "seed_31", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "Many offenders commit more crimes after serving their first punishment. Why is this happening, and what measures can be taken to tackle this problem?", imageUrl: "" },
    { id: "seed_32", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "With the development of social media, more and more youngsters are being allowed unsupervised access to the internet in order to meet and chat with friends which can lead to potentially dangerous situations. What solutions can you suggest to deal with this problem?", imageUrl: "" },
    { id: "seed_33", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "Overpopulation in many major urban centers around the world is a major problem. What are the causes of this? How can this problem be solved?", imageUrl: "" },
    { id: "seed_34", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "More and more wild animals are on the verge of extinction and others are on the endangered list. What are the reasons for this? What can be done to solve this problem?", imageUrl: "" },
    { id: "seed_35", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "Many small, local shops are closing as they are unable to compete with large supermarkets in the area. How does this effect local communities? How could this situation be improved?", imageUrl: "" },
    { id: "seed_36", task: "Task 2", type: "Problem & Solution", source: "IELTS Liz", questionText: "An increasing number of professionals, such as doctors and teachers, are leaving their own poorer countries to work in developed countries. What problems does this cause? What solutions can you suggest to deal with this situation?", imageUrl: "" },
    { id: "seed_37", task: "Task 2", type: "Opinion Essay", source: "IELTS Official", questionText: "Children who are brought up in families that do not have large amounts of money are better prepared to deal with the problems of adult life than children brought up by wealthy parents. To what extent do you agree or disagree?", imageUrl: "" },
    { id: "seed_38", task: "Task 2", type: "Opinion Essay", source: "IDP IELTS", questionText: "Many feel that the common educational system of teachers and students in a classroom will be replaced by the year 2050. Do you agree with this view? Give your opinion.", imageUrl: "" },
    { id: "seed_39", task: "Task 2", type: "Opinion Essay", source: "IDP IELTS", questionText: "Education should be free to all people and should be paid for and managed by the government. Do you agree or disagree with this statement?", imageUrl: "" },
    { id: "seed_40", task: "Task 2", type: "Discussion Essay", source: "IDP IELTS", questionText: "Some feel that it is impossible for a country to be economically progressive and environmentally friendly at the same time. Others disagree with this view. Discuss both points of view and give your opinion.", imageUrl: "" },
    { id: "seed_41", task: "Task 2", type: "Problem & Solution", source: "IDP IELTS", questionText: "Water pollution has become an increasing problem over the past few decades. What causes water pollution? How can we prevent this problem?", imageUrl: "" },
    { id: "seed_42", task: "Task 2", type: "Opinion Essay", source: "IDP IELTS", questionText: "Nowadays, children watch a lot of TV and play video games. However, some think that these activities are not beneficial for a child's mental health. To what extent do you agree or disagree?", imageUrl: "" },
    { id: "seed_43", task: "Task 2", type: "Opinion Essay", source: "IDP IELTS", questionText: "Modern technology now allows rapid and uncontrolled access to information in many countries. This is a danger to our societies. To what extent do you agree or disagree?", imageUrl: "" },
    { id: "seed_44", task: "Task 2", type: "Problem & Solution", source: "British Council", questionText: "Many people go through life doing work that they hate or have no talent for. Why does this happen? What are the consequences of this situation?", imageUrl: "" },
    { id: "seed_45", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "Tourism is a major industry in many countries. What benefits do you think tourism brings to individuals and society?", imageUrl: "" },
    { id: "seed_46", task: "Task 2", type: "Opinion Essay", source: "IELTS Liz", questionText: "Raising the cost of international flights is the best way to reduce air pollution. To what extent do you agree or disagree?", imageUrl: "" },
    { id: "seed_47", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "News plays an important part in most people's lives. Why is news so important to people? Why is so much news dedicated to bad news? Should the news focus on good news instead?", imageUrl: "" },
    { id: "seed_48", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "Most people agree money cannot buy happiness. Why is happiness difficult to define? How can people achieve happiness?", imageUrl: "" },
    { id: "seed_49", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "Success is often measured by wealth and material belongings. Do you think wealth is the best measure of success? What makes a successful person?", imageUrl: "" },
    { id: "seed_50", task: "Task 2", type: "Double Question", source: "IELTS Liz", questionText: "The internet is a great source of information that has opened opportunities for learning worldwide. Is all information reliable on the internet? What could be done to control information online?", imageUrl: "" },
];
