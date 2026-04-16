-- ============================================================
-- Migration 005: Add visual description fields to questions table
--                and re-seed with 50 authoritative questions
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ─── STEP 1: ALTER TABLE ────────────────────────────────────────────────────

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS question_type          TEXT,
  ADD COLUMN IF NOT EXISTS visual_description     TEXT,
  ADD COLUMN IF NOT EXISTS visual_description_json JSONB,
  ADD COLUMN IF NOT EXISTS task_type              TEXT NOT NULL DEFAULT 'task2';

-- Add CHECK constraint (drop first to allow re-running)
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_task_type_check;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_task_type_check CHECK (task_type IN ('task1', 'task2'));


-- ─── STEP 2: RE-SEED ────────────────────────────────────────────────────────

-- Clear all existing rows
TRUNCATE TABLE public.questions RESTART IDENTITY CASCADE;


-- ── TASK 1 QUESTIONS ────────────────────────────────────────────────────────

INSERT INTO public.questions (
  task_number, question_type, task_type, title, body_text, image_url,
  visual_description, visual_description_json, source, is_published, skill
) VALUES

-- 1. UK Telephone Calls Bar Chart
(1, 'Bar Chart', 'task1',
 'UK Telephone Calls (1995–2002)',
 'The chart below shows the total number of minutes (in billions) of telephone calls in the UK, divided into three categories, from 1995–2002. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsadvantage.com/wp-content/uploads/2015/04/ielts-writing-task-1-bar-chart-uk-telephone-calls.png',
 'Horizontal axis shows years 1995–2002. Vertical axis shows minutes in billions. Three categories: Local fixed line (starts at 72 bn, peaks at 90 bn in 1999, drops back to 72 bn in 2002). National/International (steady rise from 38 bn to 61 bn). Mobiles (exponential growth from 3 bn to 45 bn).',
 '{"visual_type":"bar chart","title":"UK Telephone Calls 1995–2002","subject":"Total minutes of telephone calls (in billions) in the UK across three categories from 1995 to 2002","units":"billions of minutes","categories_or_axes":["Local fixed line","National/International","Mobiles","Years 1995–2002"],"key_data_points":["Local fixed line peaked at 90 bn in 1999 before dropping to 72 bn in 2002","National/International calls rose steadily from 38 bn to 61 bn","Mobile calls grew exponentially from 3 bn to 45 bn"],"main_trends_or_features":["Local fixed line dominated throughout but declined after 1999","Mobile calls showed the steepest growth","National/International calls grew modestly and steadily"],"overview_hint":"All three categories grew overall, but mobile calls saw by far the sharpest rise, while local fixed-line calls peaked then fell back to their 1995 level by 2002."}',
 'IELTS Advantage', true, 'writing'),

-- 2. Land Degradation Mixed
(1, 'Mixed Graph', 'task1',
 'Global Land Degradation',
 'The pie chart below shows the main reasons why agricultural land becomes less productive. The table shows how these causes affected three regions of the world during the 1990s. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsadvantage.com/wp-content/uploads/2015/05/ielts-task-1-land-degredation.jpg',
 'Pie chart shows global causes: Over-grazing (35%), Deforestation (30%), Over-cultivation (28%). Table shows regional impact: North America (5% total, mostly over-cultivation); Europe (23% total, mostly deforestation); Oceania (13% total, mostly over-grazing).',
 '{"visual_type":"mixed (pie chart and table)","title":"Causes of Global Land Degradation","subject":"Main reasons agricultural land becomes less productive globally and the regional impact across North America, Europe, and Oceania in the 1990s","units":"percentage of degraded land","categories_or_axes":["Over-grazing","Deforestation","Over-cultivation","North America","Europe","Oceania"],"key_data_points":["Over-grazing is the leading global cause at 35%","Deforestation accounts for 30% globally","Europe has the highest regional degradation at 23%, driven by deforestation","Oceania degradation (13%) mainly caused by over-grazing","North America has the lowest share at 5%, mainly over-cultivation"],"main_trends_or_features":["Over-grazing dominates globally but its impact varies by region","Europe is the most affected region overall","North America is least affected"],"overview_hint":"Over-grazing is the single biggest global cause of land degradation, but the dominant cause varies significantly by region — deforestation drives European degradation while over-grazing is the primary issue in Oceania."}',
 'IELTS Advantage', true, 'writing'),

-- 3. Fast Food Consumption Line Graph
(1, 'Line Graph', 'task1',
 'Fast Food Consumption in Britain (1970–1990)',
 'The line graph below shows the consumption of three different types of fast food in Britain from 1970 to 1990. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xLineGraphFastFood.jpg.pagespeed.ic.CdQv_bmFWo.jpg',
 'Period 1970–1990. Fish and Chips starts at 300g, drops to 220g. Hamburgers rise from 80g to 280g. Pizza rises from 20g to 210g.',
 '{"visual_type":"line graph","title":"Fast Food Consumption in Britain 1970–1990","subject":"Weekly consumption in grams of three fast food types in Britain from 1970 to 1990","units":"grams per week","categories_or_axes":["Fish and Chips","Hamburgers","Pizza","Years 1970–1990"],"key_data_points":["Fish and Chips declined from 300g to 220g","Hamburgers rose dramatically from 80g to 280g","Pizza grew from 20g to 210g","Hamburgers nearly overtook Fish and Chips by 1990"],"main_trends_or_features":["Fish and Chips remained the most consumed food throughout despite falling","Hamburger consumption rose sharply, nearly matching Fish and Chips by 1990","Pizza showed strong growth from a very low base"],"overview_hint":"Fish and Chips declined over the 20-year period while both hamburgers and pizza rose sharply, with hamburgers almost closing the gap with the traditionally dominant fish and chips by 1990."}',
 'IELTS Jacky', true, 'writing'),

-- 4. Marine Life Bar Chart
(1, 'Bar Chart', 'task1',
 'Marine Life in Gormez Straits (2006 & 2018)',
 'The bar chart below shows numbers of seals, whales and dolphins recorded in the Gormez Straits from 2006 to 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xBarChartSealsWhalesDolphins.jpg.pagespeed.ic.vqCu-4sy9Q.jpg',
 'Compares 2006 to 2018. Seals dropped from 42 to 20. Whales remained stable (~25). Dolphins increased from 15 to 52.',
 '{"visual_type":"bar chart","title":"Marine Life in Gormez Straits 2006–2018","subject":"Population counts of seals, whales, and dolphins in the Gormez Straits in 2006 and 2018","units":"number of animals","categories_or_axes":["Seals","Whales","Dolphins","2006","2018"],"key_data_points":["Seals fell from 42 to 20 — a drop of more than half","Whales remained virtually unchanged at around 25","Dolphins grew from 15 to 52, overtaking seals as the most numerous species by 2018"],"main_trends_or_features":["Dolphins showed the most dramatic growth, more than tripling","Seals declined sharply while whales stayed stable","By 2018 dolphins were the most numerous species, reversing the 2006 ranking"],"overview_hint":"The most striking change between 2006 and 2018 was the dramatic rise in dolphin numbers and the sharp decline in seal numbers, while the whale population remained largely unchanged."}',
 'IELTS Jacky', true, 'writing'),

-- 5. India vs China Population Line Graph
(1, 'Line Graph', 'task1',
 'India vs China Population Projections (2000–2050)',
 'The graph below shows the population for India and China since the year 2000 and predicts population growth until 2050. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xLineGraphIndiaChina.jpg.pagespeed.ic.ewaYcNZfKM.jpg',
 'Timeline 2000–2050. China peaks in 2030 at 1.45 bn then declines. India rises steadily, overtakes China in 2030, reaching 1.6 bn by 2050.',
 '{"visual_type":"line graph","title":"India and China Population Projections 2000–2050","subject":"Population growth trends and projections for India and China from 2000 to 2050","units":"billions of people","categories_or_axes":["India","China","Years 2000–2050"],"key_data_points":["China peaks at approximately 1.45 billion around 2030","India overtakes China around 2030","India projected to reach 1.6 billion by 2050","China declines after 2030"],"main_trends_or_features":["India shows continuous growth throughout the entire period","China grows until 2030 then begins to decline","The two populations cross over around 2030, reversing their relative sizes"],"overview_hint":"The most significant trend is the crossover point around 2030 when India is projected to overtake China as the world''s most populous country, with India continuing to grow and China declining thereafter."}',
 'IELTS Jacky', true, 'writing'),

-- 6. World Population Table
(1, 'Table', 'task1',
 'World Population Distribution (1950, 2000, 2050)',
 'The tables below give information about the world population and distribution in 1950 and 2000, with an estimate of the situation in 2050. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xTableWorldPopulationByRegion.jpg.pagespeed.ic.1AeAP0Ls1p.jpg',
 'Data for 1950, 2000, 2050. Total population grows from 2.5 bn to 9 bn. Africa''s share triples (9% to 20% by 2050); Europe''s share collapses (22% to 7% by 2050).',
 '{"visual_type":"table","title":"World Population Distribution 1950–2050","subject":"World population totals and regional percentage shares in 1950 and 2000, with 2050 projections","units":"billions and percentage share","categories_or_axes":["World total","Africa","Europe","Asia","Americas","Oceania","1950","2000","2050"],"key_data_points":["Total population grows from 2.5 bn (1950) to approximately 9 bn (2050)","Africa''s share grows from 9% to 20%","Europe''s share drops from 22% to 7%","Asia remains the most populous region throughout"],"main_trends_or_features":["African share more than doubles while European share collapses","Total world population is projected to nearly quadruple over the century","Asia remains dominant but its relative share changes modestly"],"overview_hint":"The most striking projected changes are the dramatic increase in Africa''s share of world population and the equally dramatic decline of Europe''s share, set against a backdrop of overall global population nearly quadrupling between 1950 and 2050."}',
 'IELTS Jacky', true, 'writing'),

-- 7. Commuter Motivations Pie Chart
(1, 'Pie Chart', 'task1',
 'Reasons for Commuter Transport Choice',
 'The chart below shows the reasons why people travel to work by bicycle or by car. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xPieChartWorkTransport.jpg.pagespeed.ic.RjLLCGXo7L.jpg',
 'Bicycle users cite Health/Fitness and Pollution (30% each). Car users cite Comfort (40%) and Distance (21%).',
 '{"visual_type":"pie chart","title":"Reasons for Commuting by Bicycle or Car","subject":"Main reasons people choose to commute by bicycle versus by car","units":"percentage of respondents","categories_or_axes":["Bicycle: Health/Fitness","Bicycle: Environment/Pollution","Bicycle: Cost","Bicycle: Other","Car: Comfort","Car: Distance","Car: Speed","Car: Other"],"key_data_points":["Health/Fitness is the top reason for cycling at 30%","Environmental concerns also account for 30% of cycling motivation","Comfort is the primary reason for driving at 40%","Distance/no alternative accounts for 21% of driving reasons"],"main_trends_or_features":["Cycling choices are driven by personal wellbeing and environmental concern","Car choices are primarily driven by practical considerations of comfort and distance","Different motivations highlight contrasting priorities between the two groups"],"overview_hint":"The key contrast is that cyclists are primarily motivated by health and environmental benefits, while car commuters cite comfort and the impracticality of cycling the distance as their main reasons."}',
 'IELTS Jacky', true, 'writing'),

-- 8. Wave Power Process
(1, 'Process', 'task1',
 'Wave Power Electricity Generation',
 'The diagrams below show a structure that is used to generate electricity from wave power. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xElectricityFromWavePower.jpg.pagespeed.ic.CFRQMHlVun.jpg',
 'Two-stage diagram. High tide/wave pushes air through a turbine in a cliff chamber. Low tide/retreating wave pulls air back through same turbine. Turbine spins one way to generate electricity regardless of air direction.',
 '{"visual_type":"process diagram","title":"Wave Power Electricity Generation","subject":"Two-stage process by which tidal waves are used to drive a turbine and generate electricity in a cliff-side chamber","units":"N/A","categories_or_axes":["Stage 1: High tide / incoming wave","Stage 2: Low tide / retreating wave","Air column","Turbine","Electricity generator"],"key_data_points":["Incoming wave forces trapped air upward through turbine","Retreating wave draws air back down through the same turbine","Turbine is designed to spin in one direction regardless of airflow direction"],"main_trends_or_features":["The system converts wave energy into electricity through a two-stroke air compression cycle","The bidirectional airflow both drives the turbine in the same rotational direction","No moving parts are submerged — only the air column interacts with water"],"overview_hint":"The wave power generator works by using the alternating compression and expansion of an air column caused by incoming and retreating waves to spin a turbine, which then generates electricity regardless of the direction of air movement."}',
 'IELTS Jacky', true, 'writing'),

-- 9. Queen Mary Hospital Map
(1, 'Map', 'task1',
 'Queen Mary Hospital Changes (1960 & 2000)',
 'The diagrams below show the changes that have taken place at Queen Mary Hospital since its construction in 1960. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xQueenMaryHospitalMaps.jpg.pagespeed.ic._1Ab0aBBV9.jpg',
 'Comparison of 1960 and 2000. 1960: Shopping area and farmland to the East. 2000: Farmland replaced by Cancer Centre; car park reduced; Nursing home added in the South.',
 '{"visual_type":"map","title":"Queen Mary Hospital 1960 and 2000","subject":"Layout changes at Queen Mary Hospital between 1960 and 2000","units":"N/A","categories_or_axes":["Main hospital building","Car park","Farmland","Shopping area","Cancer Centre","Nursing home","Gardens"],"key_data_points":["Farmland to the east was replaced by a new Cancer Centre","A nursing home was added to the south by 2000","The car park was reduced in size","Shopping area remained but gardens replaced some farmland"],"main_trends_or_features":["Medical facilities expanded significantly — Cancer Centre and Nursing Home added","The surrounding land use shifted from agricultural to medical/residential","Car park area was reduced despite overall site expansion"],"overview_hint":"The major changes between 1960 and 2000 were the addition of a Cancer Centre on former farmland and a new nursing home to the south, representing a significant expansion of medical facilities on the site."}',
 'IELTS Jacky', true, 'writing'),

-- 10. Transport in Edmonton Mixed
(1, 'Mixed Graph', 'task1',
 'Transport in Edmonton',
 'The diagrams below give information on transport and car use in Edmonton. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://www.ieltsjacky.com/images/xCombinations1.jpg.pagespeed.ic.Sa9X1ZcySC.jpg',
 'Pie chart: Car (45%), Light Rail (35%). Table: 38% use cars because they have no other choice. Many light rail users (30%) chose it because it is cheaper.',
 '{"visual_type":"mixed (pie chart and table)","title":"Transport Use in Edmonton","subject":"Transport mode shares in Edmonton and the reasons commuters chose their primary mode of transport","units":"percentage of commuters","categories_or_axes":["Car","Light Rail","Bus","Walking/Cycling","No alternative","Cost","Speed","Comfort","Environmental"],"key_data_points":["Cars account for 45% of trips, light rail 35%","38% of car users have no alternative","30% of light rail users cite lower cost","Light rail is the second most used mode of transport"],"main_trends_or_features":["Cars dominate but light rail has a substantial share","A significant proportion of car drivers are captive riders with no alternative","Cost rather than speed or comfort drives light rail adoption"],"overview_hint":"While cars are the most common mode of transport in Edmonton, a large share of car drivers have no alternative, and light rail attracts users primarily because of its lower cost, suggesting that improving alternatives could shift modal share further."}',
 'IELTS Jacky', true, 'writing'),

-- 11. UK News Access 2019 Pie Chart
(1, 'Pie Chart', 'task1',
 'How UK Adults Accessed International News in 2019',
 'The pie chart shows how people in the UK accessed international news in 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
 'https://images.ctfassets.net/unrdeg6se4ke/2yfI6B6w1VgjEcVLMKANYc/66c26f57d4c14c840e5dee3552a13199/2.png',
 'TV (37%) and Online (33%) are dominant. Social media (14%), Radio (10%), Print/Newspaper (6%).',
 '{"visual_type":"pie chart","title":"How UK Adults Accessed International News in 2019","subject":"Proportions of different media channels used by UK adults to access international news in 2019","units":"percentage of adults","categories_or_axes":["Television","Online sources","Social media","Radio","Print/Newspaper"],"key_data_points":["Television is the most common source at 37%","Online sources account for 33%","Together TV and online account for 70% of news access","Social media accounts for 14%","Print newspapers are the least used at 6%"],"main_trends_or_features":["Traditional media (TV) still leads but digital channels together surpass it","Print media has a very small share compared to digital channels","Social media accounts for a notable proportion"],"overview_hint":"Television remained the single most popular way for UK adults to access international news in 2019, but digital channels combined (online and social media) accounted for almost half of all news consumption, dwarfing print media."}',
 'IDP IELTS', true, 'writing'),

-- 12. Recycling Rates Line Graph
(1, 'Line Graph', 'task1',
 'Recycling Rates by Material (1982–2010)',
 'This graph shows the proportion of four different materials that were recycled from 1982 to 2010 in a particular country. Summarise the information by selecting and reporting the main features, making comparisons where relevant.',
 'https://takeielts.britishcouncil.org/sites/default/files/styles/bc-landscape-270x152/public/ac_writing_task_1.png',
 'Paper/Cardboard remains highest (70% throughout). Glass rises from 30% to 50%. Aluminium Cans show fastest growth (2% to 45%). Plastics remain lowest (8% throughout).',
 '{"visual_type":"line graph","title":"Recycling Rates by Material 1982–2010","subject":"Percentage of four materials — paper/cardboard, glass, aluminium cans, and plastics — recycled in one country from 1982 to 2010","units":"percentage recycled","categories_or_axes":["Paper/Cardboard","Glass","Aluminium Cans","Plastics","Years 1982–2010"],"key_data_points":["Paper/Cardboard recycling remained the highest at approximately 70% throughout","Glass recycling rose from around 30% to 50%","Aluminium can recycling grew from just 2% to approximately 45% — the steepest increase","Plastics remained the least recycled material at approximately 8% throughout"],"main_trends_or_features":["Paper/Cardboard consistently dominated recycling rates","Aluminium cans saw the most dramatic growth in recycling","Plastics showed virtually no improvement over the 28-year period","Glass showed steady growth"],"overview_hint":"Paper and cardboard maintained the highest recycling rate throughout the period, while aluminium cans experienced the most dramatic improvement, rising from negligible levels to nearly match glass. Plastics showed almost no progress over the 28 years."}',
 'British Council', true, 'writing');


-- ── TASK 2 QUESTIONS ────────────────────────────────────────────────────────

INSERT INTO public.questions (
  task_number, question_type, task_type, title, body_text, image_url,
  visual_description, visual_description_json, source, is_published, skill
) VALUES
(2, 'Opinion', 'task2', 'Social Networking Negative Impact',
 'Many people believe that social networking sites (such as Facebook) have had a huge negative impact on both individuals and society. To what extent do you agree?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Direct Question', 'task2', 'English vs Local Languages',
 'Learning English at school is often seen as more important than learning local languages. If these are not taught, many are at risk of dying out. In your opinion, is it important for everyone to learn English? Should we try to ensure the survival of local languages and, if so, how?',
 '', NULL, NULL, 'British Council', true, 'writing'),

(2, 'Discussion', 'task2', 'Parents vs Schools for Social Skills',
 'Some people think that parents should teach their children how to be good members of society. Others, however, believe that school is the best place to learn this. Discuss both views and give your own opinion.',
 '', NULL, NULL, 'IELTS Advantage', true, 'writing'),

(2, 'Advantages & Disadvantages', 'task2', 'Couples Choosing Not to Have Children',
 'There is an increasing trend around the world of married couples deciding not to have children. Discuss the advantages and disadvantages for couples who decide to do this.',
 '', NULL, NULL, 'IELTS Advantage', true, 'writing'),

(2, 'Cause/Solution', 'task2', 'Athletes Using Banned Substances',
 'In many professional sports, there is an increase in the number of athletes using banned substances to improve their performance. What are the causes of this phenomenon and what are some of the possible solutions?',
 '', NULL, NULL, 'IELTS Advantage', true, 'writing'),

(2, 'Opinion', 'task2', 'Privacy of Politicians',
 'Details of politicians'' private lives should not be published in newspapers. To what extent do you agree or disagree?',
 '', NULL, NULL, 'IELTS Advantage', true, 'writing'),

(2, 'Opinion', 'task2', 'Importance of Art & Music in Primary School',
 'Some say that music, art and drama are as important as other school subjects, especially at the primary level. Do you agree or disagree?',
 '', NULL, NULL, 'IELTS Advantage', true, 'writing'),

(2, 'Advantages & Disadvantages', 'task2', 'Vegetarian Diet',
 'In some countries, it is becoming increasingly common for people to follow a vegetarian diet. Do the advantages of this outweigh the disadvantages?',
 '', NULL, NULL, 'IELTS Advantage', true, 'writing'),

(2, 'Opinion', 'task2', 'Government Spending on the Arts',
 'Some people think that the government is wasting money on the arts and that this money could be better spent elsewhere. To what extent do you agree with this view?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Positive/Negative', 'task2', 'Parental Pressure on Children to Succeed',
 'Nowadays parents put too much pressure on their children to succeed. What is the reason for doing this? Is this a negative or positive development?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Advantages & Disadvantages', 'task2', 'City vs Countryside Upbringing',
 'Some people think it is better for children to grow up in the city, while others think that life in the countryside is more suitable. What are the advantages and disadvantages of both places?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Direct Question', 'task2', 'Consequences of Less Time with Grandparents',
 'In many modern societies, grandchildren rarely spend any quality time with their grandparents. What do you think are the consequences of this?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Positive/Negative', 'task2', 'Less Time on Family Activities',
 'Nowadays, it seems that different generations within the family spend less time doing activities together. Why is that? Is it a positive or negative development?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Opinion', 'task2', 'Learning via Watching Television',
 'Children can learn effectively by watching television. Therefore they should be encouraged to watch television regularly at home and at school. To what extent do you agree or disagree?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Discussion', 'task2', 'Discipline vs Nurturing as Parental Roles',
 'Some people think that the role of parents is to discipline their children and teach them about right and wrong. Other people consider that the main responsibility of parents is to nurture their children and provide them with a safe environment to grow up in. Discuss both sides and give your opinion.',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Cause/Solution', 'task2', 'Both Parents Working and Child Development',
 'Most modern families have both parents working and as a result children spend less and less time with their parents. What is the reason for this? What problems can this cause?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Advantages & Disadvantages', 'task2', 'Geographical Mobility of Nuclear Families',
 'The nuclear family is well adapted to move geographically due to its size. Do you think children benefit in any way from moving? Do you think the advantages outweigh the disadvantages?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Problem/Solution', 'task2', 'Declining Air and Water Quality in Developing Nations',
 'In many developing countries, there is a problem with declining quality of air and water from both industry and construction. What measures could be taken to prevent this?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Cause/Solution', 'task2', 'Re-offending Rates in Criminals',
 'Many offenders commit more crimes after serving their first punishment. Why is this happening, and what measures can be taken to tackle this problem?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Problem/Solution', 'task2', 'Unsupervised Internet Access for Youngsters',
 'With the development of social media, more and more youngsters are being allowed unsupervised access to the internet in order to meet and chat with friends which can lead to potentially dangerous situations. What solutions can you suggest to deal with this problem?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Cause/Solution', 'task2', 'Urban Overpopulation',
 'Overpopulation in many major urban centres around the world is a major problem. What are the causes of this? How can this problem be solved?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Cause/Solution', 'task2', 'Extinction of Wild Animals',
 'More and more wild animals are on the verge of extinction and others are on the endangered list. What are the reasons for this? What can be done to solve this problem?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Problem/Solution', 'task2', 'Small Local Shops vs Large Supermarkets',
 'Many small, local shops are closing as they are unable to compete with large supermarkets in the area. How does this affect local communities? How could this situation be improved?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Problem/Solution', 'task2', 'Brain Drain of Professionals to Developed Countries',
 'An increasing number of professionals, such as doctors and teachers, are leaving their own poorer countries to work in developed countries. What problems does this cause? What solutions can you suggest to deal with this situation?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Opinion', 'task2', 'Financial Hardship vs Wealth in Preparing for Adult Life',
 'Children who are brought up in families that do not have large amounts of money are better prepared to deal with the problems of adult life than children brought up by wealthy parents. To what extent do you agree or disagree?',
 '', NULL, NULL, 'IELTS Official', true, 'writing'),

(2, 'Opinion', 'task2', 'Future of Classrooms Being Replaced by 2050',
 'Many feel that the common educational system of teachers and students in a classroom will be replaced by the year 2050. Do you agree with this view? Give your opinion.',
 '', NULL, NULL, 'IDP IELTS', true, 'writing'),

(2, 'Opinion', 'task2', 'Free Government-Funded Education for All',
 'Education should be free to all people and should be paid for and managed by the government. Do you agree or disagree with this statement?',
 '', NULL, NULL, 'IDP IELTS', true, 'writing'),

(2, 'Discussion', 'task2', 'Economic Progress vs Environmental Friendliness',
 'Some feel that it is impossible for a country to be economically progressive and environmentally friendly at the same time. Others disagree with this view. Discuss both points of view and give your opinion.',
 '', NULL, NULL, 'IDP IELTS', true, 'writing'),

(2, 'Cause/Solution', 'task2', 'Increasing Water Pollution',
 'Water pollution has become an increasing problem over the past few decades. What causes water pollution? How can we prevent this problem?',
 '', NULL, NULL, 'IDP IELTS', true, 'writing'),

(2, 'Opinion', 'task2', 'Mental Health Impact of TV and Video Games',
 'Nowadays, children watch a lot of TV and play video games. However, some think that these activities are not beneficial for a child''s mental health. To what extent do you agree or disagree?',
 '', NULL, NULL, 'IDP IELTS', true, 'writing'),

(2, 'Opinion', 'task2', 'Rapid Uncontrolled Access to Information',
 'Modern technology now allows rapid and uncontrolled access to information in many countries. This is a danger to our societies. To what extent do you agree or disagree?',
 '', NULL, NULL, 'IDP IELTS', true, 'writing'),

(2, 'Direct Question', 'task2', 'People Working in Jobs They Hate',
 'Many people go through life doing work that they hate or have no talent for. Why does this happen? What are the consequences of this situation?',
 '', NULL, NULL, 'British Council', true, 'writing'),

(2, 'Direct Question', 'task2', 'Benefits of Tourism to Individuals and Society',
 'Tourism is a major industry in many countries. What benefits do you think tourism brings to individuals and society?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Opinion', 'task2', 'Increasing Flight Costs to Reduce Pollution',
 'Raising the cost of international flights is the best way to reduce air pollution. To what extent do you agree or disagree?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Direct Question', 'task2', 'Role and Nature of News',
 'News plays an important part in most people''s lives. Why is news so important to people? Why is so much news dedicated to bad news? Should the news focus on good news instead?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Direct Question', 'task2', 'Defining and Achieving Happiness',
 'Most people agree money cannot buy happiness. Why is happiness difficult to define? How can people achieve happiness?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Direct Question', 'task2', 'Wealth as a Measure of Success',
 'Success is often measured by wealth and material belongings. Do you think wealth is the best measure of success? What makes a successful person?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing'),

(2, 'Direct Question', 'task2', 'Reliability and Control of Internet Information',
 'The internet is a great source of information that has opened opportunities for learning worldwide. Is all information reliable on the internet? What could be done to control information online?',
 '', NULL, NULL, 'IELTS Liz', true, 'writing');
