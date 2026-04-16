// ─── Shared Question Bank data ─────────────────────────────────────────────────
// This module contains the canonical list of practice questions and all the
// catalogue metadata used by the Practice Library page and any future features.

export interface VisualDescriptionJson {
    visual_type: string;
    title: string;
    subject: string;
    units: string;
    categories_or_axes: string[];
    key_data_points: string[];
    main_trends_or_features: string[];
    overview_hint: string;
}

export interface PracticeQuestion {
    id: string;
    task: "Task 1" | "Task 2";
    type: string;
    source: string;
    questionText: string;
    imageUrl: string;
    // Task 1 visual fields (from DB or pre-seeded)
    visualDescription?: string | null;
    visualDescriptionJson?: VisualDescriptionJson | null;
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
    {
        id: "seed_1", task: "Task 1", type: "Bar Chart", source: "IELTS Advantage",
        questionText: "The chart below shows the total number of minutes (in billions) of telephone calls in the UK, divided into three categories, from 1995-2002. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsadvantage.com/wp-content/uploads/2015/04/ielts-writing-task-1-bar-chart-uk-telephone-calls.png",
        visualDescription: "Horizontal axis shows years 1995–2002. Vertical axis shows minutes in billions. Three categories: Local fixed line (starts at 72 bn, peaks at 90 bn in 1999, drops back to 72 bn in 2002). National/International (steady rise from 38 bn to 61 bn). Mobiles (exponential growth from 3 bn to 45 bn).",
        visualDescriptionJson: { visual_type: "bar chart", title: "UK Telephone Calls 1995–2002", subject: "Total minutes of telephone calls (in billions) in the UK across three categories from 1995 to 2002", units: "billions of minutes", categories_or_axes: ["Local fixed line", "National/International", "Mobiles", "Years 1995–2002"], key_data_points: ["Local fixed line peaked at 90 bn in 1999 before dropping to 72 bn in 2002", "National/International calls rose steadily from 38 bn to 61 bn", "Mobile calls grew exponentially from 3 bn to 45 bn"], main_trends_or_features: ["Local fixed line dominated throughout but declined after 1999", "Mobile calls showed the steepest growth", "National/International calls grew modestly and steadily"], overview_hint: "All three categories grew overall, but mobile calls saw by far the sharpest rise, while local fixed-line calls peaked then fell back to their 1995 level by 2002." }
    },
    {
        id: "seed_2", task: "Task 1", type: "Mixed Graph", source: "IELTS Advantage",
        questionText: "The pie chart below shows the main reasons why agricultural land become less productive. The table shows how these causes affected three regions of the world during the 1990s. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsadvantage.com/wp-content/uploads/2015/05/ielts-task-1-land-degredation.jpg",
        visualDescription: "Pie chart shows global causes: Over-grazing (35%), Deforestation (30%), Over-cultivation (28%). Table shows regional impact: North America (5% total, mostly over-cultivation); Europe (23% total, mostly deforestation); Oceania (13% total, mostly over-grazing).",
        visualDescriptionJson: { visual_type: "mixed (pie chart and table)", title: "Causes of Global Land Degradation", subject: "Main reasons agricultural land becomes less productive globally and the regional impact across North America, Europe, and Oceania in the 1990s", units: "percentage of degraded land", categories_or_axes: ["Over-grazing", "Deforestation", "Over-cultivation", "North America", "Europe", "Oceania"], key_data_points: ["Over-grazing is the leading global cause at 35%", "Deforestation accounts for 30% globally", "Europe has the highest regional degradation at 23%", "Oceania at 13%, mainly over-grazing", "North America lowest share at 5%"], main_trends_or_features: ["Over-grazing dominates globally but its impact varies by region", "Europe is the most affected region", "North America is least affected"], overview_hint: "Over-grazing is the single biggest global cause of land degradation, but the dominant cause varies significantly by region — deforestation drives European degradation while over-grazing is the primary issue in Oceania." }
    },
    {
        id: "seed_3", task: "Task 1", type: "Line Graph", source: "IELTS Jacky",
        questionText: "The line graph below shows the consumption of 3 different types of fast food in Britain from 1970 to 1990. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xLineGraphFastFood.jpg.pagespeed.ic.CdQv_bmFWo.jpg",
        visualDescription: "Period 1970–1990. Fish and Chips starts at 300g, drops to 220g. Hamburgers rise from 80g to 280g. Pizza rises from 20g to 210g.",
        visualDescriptionJson: { visual_type: "line graph", title: "Fast Food Consumption in Britain 1970–1990", subject: "Weekly consumption in grams of three fast food types in Britain from 1970 to 1990", units: "grams per week", categories_or_axes: ["Fish and Chips", "Hamburgers", "Pizza", "Years 1970–1990"], key_data_points: ["Fish and Chips declined from 300g to 220g", "Hamburgers rose from 80g to 280g", "Pizza grew from 20g to 210g", "Hamburgers nearly overtook Fish and Chips by 1990"], main_trends_or_features: ["Fish and Chips remained most consumed despite falling", "Hamburger consumption rose sharply", "Pizza showed strong growth from a low base"], overview_hint: "Fish and Chips declined over the 20-year period while both hamburgers and pizza rose sharply, with hamburgers almost closing the gap with the traditionally dominant fish and chips by 1990." }
    },
    {
        id: "seed_4", task: "Task 1", type: "Bar Chart", source: "IELTS Jacky",
        questionText: "The bar chart below shows numbers of seals, whales and dolphins recorded in the Gormez Straits from 2006 to 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xBarChartSealsWhalesDolphins.jpg.pagespeed.ic.vqCu-4sy9Q.jpg",
        visualDescription: "Compares 2006 to 2018. Seals dropped from 42 to 20. Whales remained stable (~25). Dolphins increased from 15 to 52.",
        visualDescriptionJson: { visual_type: "bar chart", title: "Marine Life in Gormez Straits 2006–2018", subject: "Population counts of seals, whales, and dolphins in the Gormez Straits in 2006 and 2018", units: "number of animals", categories_or_axes: ["Seals", "Whales", "Dolphins", "2006", "2018"], key_data_points: ["Seals fell from 42 to 20", "Whales remained at around 25", "Dolphins grew from 15 to 52"], main_trends_or_features: ["Dolphins showed the most dramatic growth", "Seals declined sharply while whales stayed stable", "By 2018 dolphins were the most numerous species"], overview_hint: "The most striking change between 2006 and 2018 was the dramatic rise in dolphin numbers and the sharp decline in seal numbers, while the whale population remained largely unchanged." }
    },
    {
        id: "seed_5", task: "Task 1", type: "Line Graph", source: "IELTS Jacky",
        questionText: "The graph below shows the population for India and China since the year 2000 and predicts population growth until 2050. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xLineGraphIndiaChina.jpg.pagespeed.ic.ewaYcNZfKM.jpg",
        visualDescription: "Timeline 2000–2050. China peaks in 2030 at 1.45bn then declines. India rises steadily, overtakes China in 2030, reaching 1.6bn by 2050.",
        visualDescriptionJson: { visual_type: "line graph", title: "India and China Population Projections 2000–2050", subject: "Population growth trends and projections for India and China from 2000 to 2050", units: "billions of people", categories_or_axes: ["India", "China", "Years 2000–2050"], key_data_points: ["China peaks at approximately 1.45 billion around 2030", "India overtakes China around 2030", "India projected to reach 1.6 billion by 2050", "China declines after 2030"], main_trends_or_features: ["India shows continuous growth throughout", "China grows until 2030 then begins to decline", "The two populations cross over around 2030"], overview_hint: "The most significant trend is the crossover point around 2030 when India is projected to overtake China as the world's most populous country, with India continuing to grow and China declining thereafter." }
    },
    {
        id: "seed_6", task: "Task 1", type: "Table", source: "IELTS Jacky",
        questionText: "The tables below give information about the world population and distribution in 1950 and 2000, with an estimate of the situation in 2050. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xTableWorldPopulationByRegion.jpg.pagespeed.ic.1AeAP0Ls1p.jpg",
        visualDescription: "Data for 1950, 2000, 2050. Total population grows from 2.5bn to 9bn. Africa's share triples (9% to 20%); Europe's share collapses (22% to 7%).",
        visualDescriptionJson: { visual_type: "table", title: "World Population Distribution 1950–2050", subject: "World population totals and regional percentage shares in 1950 and 2000, with 2050 projections", units: "billions and percentage share", categories_or_axes: ["World total", "Africa", "Europe", "Asia", "Americas", "Oceania", "1950", "2000", "2050"], key_data_points: ["Total population grows from 2.5 bn to approximately 9 bn", "Africa's share grows from 9% to 20%", "Europe's share drops from 22% to 7%"], main_trends_or_features: ["African share more than doubles while European share collapses", "Total world population nearly quadruples over the century", "Asia remains dominant"], overview_hint: "The most striking projected changes are the dramatic increase in Africa's share of world population and the equally dramatic decline of Europe's share, set against a backdrop of overall global population nearly quadrupling between 1950 and 2050." }
    },
    {
        id: "seed_7", task: "Task 1", type: "Pie Chart", source: "IELTS Jacky",
        questionText: "The chart below shows the reasons why people travel to work by bicycle or by car. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xPieChartWorkTransport.jpg.pagespeed.ic.RjLLCGXo7L.jpg",
        visualDescription: "Bicycle users cite Health/Fitness and Pollution (30% each). Car users cite Comfort (40%) and Distance (21%).",
        visualDescriptionJson: { visual_type: "pie chart", title: "Reasons for Commuting by Bicycle or Car", subject: "Main reasons people choose to commute by bicycle versus by car", units: "percentage of respondents", categories_or_axes: ["Bicycle: Health/Fitness", "Bicycle: Environment/Pollution", "Car: Comfort", "Car: Distance"], key_data_points: ["Health/Fitness is the top reason for cycling at 30%", "Environmental concerns also account for 30% of cycling motivation", "Comfort is the primary reason for driving at 40%", "Distance/no alternative accounts for 21% of driving reasons"], main_trends_or_features: ["Cycling choices driven by personal wellbeing and environmental concern", "Car choices driven by practical comfort and distance"], overview_hint: "The key contrast is that cyclists are primarily motivated by health and environmental benefits, while car commuters cite comfort and the impracticality of cycling the distance as their main reasons." }
    },
    {
        id: "seed_8", task: "Task 1", type: "Process", source: "IELTS Jacky",
        questionText: "The diagrams below show a structure that is used to generate electricity from wave power. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xElectricityFromWavePower.jpg.pagespeed.ic.CFRQMHlVun.jpg",
        visualDescription: "Two-stage diagram. High tide/wave pushes air through a turbine in a cliff chamber. Low tide/retreating wave pulls air back through same turbine. Turbine spins one way to generate electricity regardless of air direction.",
        visualDescriptionJson: { visual_type: "process diagram", title: "Wave Power Electricity Generation", subject: "Two-stage process by which tidal waves drive a turbine to generate electricity in a cliff-side chamber", units: "N/A", categories_or_axes: ["Stage 1: High tide / incoming wave", "Stage 2: Low tide / retreating wave", "Air column", "Turbine", "Electricity generator"], key_data_points: ["Incoming wave forces trapped air upward through turbine", "Retreating wave draws air back down through the same turbine", "Turbine spins in one direction regardless of airflow direction"], main_trends_or_features: ["System converts wave energy via a two-stroke air compression cycle", "Bidirectional airflow drives the turbine in the same rotational direction", "No moving parts submerged"], overview_hint: "The wave power generator works by using the alternating compression and expansion of an air column to spin a turbine, which generates electricity regardless of the direction of air movement." }
    },
    {
        id: "seed_9", task: "Task 1", type: "Map", source: "IELTS Jacky",
        questionText: "The diagrams below show the changes that have taken place at Queen Mary Hospital since its construction in 1960. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xQueenMaryHospitalMaps.jpg.pagespeed.ic._1Ab0aBBV9.jpg",
        visualDescription: "Comparison of 1960 and 2000. 1960: Shopping area and farmland to the East. 2000: Farmland replaced by Cancer Centre; car park reduced; Nursing home added in the South.",
        visualDescriptionJson: { visual_type: "map", title: "Queen Mary Hospital 1960 and 2000", subject: "Layout changes at Queen Mary Hospital between 1960 and 2000", units: "N/A", categories_or_axes: ["Main hospital building", "Car park", "Farmland", "Shopping area", "Cancer Centre", "Nursing home", "Gardens"], key_data_points: ["Farmland replaced by a Cancer Centre", "Nursing home added to the south", "Car park reduced in size"], main_trends_or_features: ["Medical facilities expanded significantly", "Surrounding land shifted from agricultural to medical/residential", "Car park reduced despite overall site expansion"], overview_hint: "The major changes between 1960 and 2000 were the addition of a Cancer Centre on former farmland and a new nursing home to the south, representing a significant expansion of medical facilities." }
    },
    {
        id: "seed_10", task: "Task 1", type: "Mixed Graph", source: "IELTS Jacky",
        questionText: "The diagrams below give information on transport and car use in Edmonton. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://www.ieltsjacky.com/images/xCombinations1.jpg.pagespeed.ic.Sa9X1ZcySC.jpg",
        visualDescription: "Pie chart: Car (45%), Light Rail (35%). Table: 38% use cars because they have no other choice. Many light rail users (30%) chose it because it is cheaper.",
        visualDescriptionJson: { visual_type: "mixed (pie chart and table)", title: "Transport Use in Edmonton", subject: "Transport mode shares in Edmonton and the reasons commuters chose their primary mode of transport", units: "percentage of commuters", categories_or_axes: ["Car", "Light Rail", "Bus", "Walking/Cycling"], key_data_points: ["Cars account for 45% of trips, light rail 35%", "38% of car users have no alternative", "30% of light rail users cite lower cost"], main_trends_or_features: ["Cars dominate but light rail has a substantial share", "Many car drivers are captive riders", "Cost drives light rail adoption"], overview_hint: "While cars are the most common mode of transport in Edmonton, a large share of car drivers have no alternative, and light rail attracts users primarily because of its lower cost." }
    },
    {
        id: "seed_11", task: "Task 1", type: "Pie Chart", source: "IDP IELTS",
        questionText: "The pie chart shows how people in the UK accessed international news in 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://images.ctfassets.net/unrdeg6se4ke/2yfI6B6w1VgjEcVLMKANYc/66c26f57d4c14c840e5dee3552a13199/2.png?&w=1220",
        visualDescription: "TV (37%) and Online (33%) are dominant. Social media (14%), Radio (10%), Print/Newspaper (6%).",
        visualDescriptionJson: { visual_type: "pie chart", title: "How UK Adults Accessed International News in 2019", subject: "Proportions of different media channels used by UK adults to access international news in 2019", units: "percentage of adults", categories_or_axes: ["Television", "Online sources", "Social media", "Radio", "Print/Newspaper"], key_data_points: ["Television leads at 37%", "Online sources at 33%", "TV and online together account for 70%", "Social media at 14%", "Print at 6%"], main_trends_or_features: ["Traditional media (TV) still leads", "Digital channels together surpass TV", "Print media has a very small share"], overview_hint: "Television remained the single most popular way for UK adults to access international news, but digital channels combined (online and social media) accounted for almost half of all news consumption." }
    },
    {
        id: "seed_12", task: "Task 1", type: "Line Graph", source: "British Council",
        questionText: "This graph shows the proportion of four different materials that were recycled from 1982 to 2010 in a particular country. Summarise the information by selecting and reporting the main features, making comparisons where relevant.",
        imageUrl: "https://takeielts.britishcouncil.org/sites/default/files/styles/bc-landscape-270x152/public/ac_writing_task_1.png?itok=lHfyefHl",
        visualDescription: "Paper/Cardboard remains highest (70% throughout). Glass rises from 30% to 50%. Aluminium Cans show fastest growth (2% to 45%). Plastics remain lowest (8% throughout).",
        visualDescriptionJson: { visual_type: "line graph", title: "Recycling Rates by Material 1982–2010", subject: "Percentage of four materials — paper/cardboard, glass, aluminium cans, and plastics — recycled in one country from 1982 to 2010", units: "percentage recycled", categories_or_axes: ["Paper/Cardboard", "Glass", "Aluminium Cans", "Plastics", "Years 1982–2010"], key_data_points: ["Paper/Cardboard remained highest at approximately 70%", "Glass rose from 30% to 50%", "Aluminium cans grew from 2% to approximately 45%", "Plastics remained lowest at approximately 8%"], main_trends_or_features: ["Paper/Cardboard consistently dominated", "Aluminium cans saw the most dramatic growth", "Plastics showed virtually no improvement"], overview_hint: "Paper and cardboard maintained the highest recycling rate throughout, while aluminium cans experienced the most dramatic improvement. Plastics showed almost no progress over the 28 years." }
    },
    // ── TASK 2 ───────────────────────────────────────────────────────────────
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
