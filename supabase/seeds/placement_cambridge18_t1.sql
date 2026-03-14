-- ─────────────────────────────────────────────────────────────────────────────
-- Cambridge IELTS 18 Academic – Test 1  |  Placement Test Seed Data
-- ─────────────────────────────────────────────────────────────────────────────
-- Prerequisites:
--   1. Migration 008_placement_test.sql must have been run first.
--   2. Run this script in Supabase SQL Editor (Database → SQL Editor → New query).
-- ─────────────────────────────────────────────────────────────────────────────

DO $seed$
DECLARE
  -- ── Passage texts (dollar-quoted – no need to escape apostrophes) ───────────

  p1_title TEXT := 'Urban farming';
  p1_text  TEXT := $p1$Urban farming

In Paris, urban farmers are trying a soil-free approach to agriculture that uses less space and fewer resources. Could it help cities face the threats to our food supplies?

On top of a striking new exhibition hall in southern Paris, the world's largest urban rooftop farm has started to bear fruit. Strawberries that are small, intensely flavoured and resplendently red sprout abundantly from large plastic tubes. Peer inside and you see the tubes are completely hollow, the roots of dozens of strawberry plants dangling down inside them. From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs, such as basil, sage and peppermint. Opposite, in narrow, horizontal trays packed not with soil but with coconut fibre, grow cherry tomatoes, shiny aubergines and brightly coloured chards.

Pascal Hardy, an engineer and sustainable development consultant, began experimenting with vertical farming and aeroponic growing towers – as the soil-free plastic tubes are known – on his Paris apartment block roof five years ago. The urban rooftop space above the exhibition hall is somewhat bigger: 14,000 square metres and almost exactly the size of a couple of football pitches. Already, the team of young urban farmers who tend it have picked, in one day, 3,000 lettuces and 150 punnets of strawberries. When the remaining two thirds of the vast open area are in production, 20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables, every day. 'We're not ever, obviously, going to feed the whole city this way,' cautions Hardy. 'In the urban environment you're working with very significant practical constraints, clearly, on what you can do and where. But if enough unused space can be developed like this, there's no reason why you shouldn't eventually target maybe between 5% and 10% of consumption.'

Perhaps most significantly, however, this is a real-life showcase for the work of Hardy's flourishing urban agriculture consultancy, Agripolis, which is currently fielding enquiries from around the world to design, build and equip a new breed of soil-free inner-city farm. 'The method's advantages are many,' he says. 'First, I don't much like the fact that most of the fruit and vegetables we eat have been treated with something like 17 different pesticides, or that the intensive farming techniques that produced them are such huge generators of greenhouse gases. I don't much like the fact, either, that they've travelled an average of 2,000 refrigerated kilometres to my plate, that their quality is so poor, because the varieties are selected for their capacity to withstand such substantial journeys, or that 80% of the price I pay goes to wholesalers and transport companies, not the producers.'

Produce grown using this soil-free method, on the other hand – which relies solely on a small quantity of water, enriched with organic nutrients, pumped around a closed circuit of pipes, towers and trays – is 'produced up here, and sold locally, just down there. It barely travels at all,' Hardy says. 'You can select crop varieties for their flavour, not their resistance to the transport and storage chain, and you can pick them when they're really at their best, and not before.' No soil is exhausted, and the water that gently showers the plants' roots every 12 minutes is recycled, so the method uses 90% less water than a classic intensive farm for the same yield.

Urban farming is not, of course, a new phenomenon. Inner-city agriculture is booming from Shanghai to Detroit and Tokyo to Bangkok. Strawberries are being grown in disused shipping containers, mushrooms in underground carparks. Aeroponic farming, he says, is 'virtuous'. The equipment weighs little, can be installed on almost any flat surface and is cheap to buy: roughly €100 to €150 per square metre. It is cheap to run, too, consuming a tiny fraction of the electricity used by some techniques.

Produce grown this way typically sells at prices that, while generally higher than those of classic intensive agriculture, are lower than soil-based organic growers. There are limits to what farmers can grow this way, of course, and much of the produce is suited to the summer months. 'Root vegetables we cannot do, at least not yet,' he says. 'Radishes are OK, but carrots, potatoes, that kind of thing – the roots are simply too long. Fruit trees are obviously not an option. And beans tend to take up a lot of space for not much return.' Nevertheless, urban farming of the kind being practised in Paris is one part of a bigger and fast-changing picture that is bringing food production closer to our lives.$p1$;

  -- ────────────────────────────────────────────────────────────────────────────
  p2_title TEXT := 'Forest management in Pennsylvania, USA';
  p2_text  TEXT := $p2$Forest management in Pennsylvania, USA

How managing low-quality wood (also known as low-use wood) for bioenergy can encourage sustainable forest management

[A] A tree's 'value' depends on several factors including its species, size, form, condition, quality, function, and accessibility, and depends on the management goals for a given forest. The same tree can be valued very differently by each person who looks at it. A large, straight black cherry tree has high value as timber to be cut into logs or made into furniture, but for a landowner more interested in wildlife habitat, the real value of that stem (or trunk) may be the food it provides to animals. Likewise, if the tree suffers from black knot disease, its value for timber decreases, but to a woodworker interested in making bowls, it brings an opportunity for a unique and beautiful piece of art.

[B] In the past, Pennsylvania landowners were solely interested in the value of their trees as high-quality timber. The norm was to remove the stems of highest quality and leave behind poorly formed trees that were not as well suited to the site where they grew. This practice, called 'high-grading', has left a legacy of 'low-use wood' in the forests. Some people even call these 'junk trees', and they are abundant in Pennsylvania. These trees have lower economic value for traditional timber markets, compete for growth with higher-value trees, shade out desirable regeneration and decrease the health of a stand leaving it more vulnerable to poor weather and disease. Management that specifically targets low-use wood can help landowners manage these forest health issues, and wood energy markets help promote this.

[C] Wood energy markets can accept less expensive wood material of lower quality than would be suitable for traditional timber markets. Most wood used for energy in Pennsylvania is used to produce heat or electricity through combustion. Many schools and hospitals use wood boiler systems to heat and power their facilities, many homes are primarily heated with wood, and some coal plants incorporate wood into their coal streams to produce electricity. Wood can also be gasified for electrical generation and can even be made into liquid fuels like ethanol and gasoline for lorries and cars. All these products are made primarily from low-use wood. Several tree- and plant-cutting approaches, which could greatly improve the long-term quality of a forest, focus strongly or solely on the use of wood for those markets.

[D] One such approach is called a Timber Stand Improvement (TSI) Cut. In a TSI Cut, really poor-quality tree and plant material is cut down to allow more space, light, and other resources to the highest-valued stems that remain. Removing invasive plants might be another primary goal of a TSI Cut. The stems that are left behind might then grow in size and develop more foliage and larger crowns or tops that produce more coverage for wildlife; they have a better chance to regenerate in a less crowded environment. TSI Cuts can be tailored to one farmer's specific management goals for his or her land.

[E] Another approach that might yield a high amount of low-use wood is a Salvage Cut. With the many pests and pathogens visiting forests including hemlock woolly adelgid, Asian longhorned beetle, emerald ash borer, and gypsy moth, to name just a few, it is important to remember that those working in the forests can help ease these issues through cutting procedures. These types of cut reduce the number of sick trees and seek to manage the future spread of a pest problem. They leave vigorous trees that have stayed healthy enough to survive the outbreak.

[F] A Shelterwood Cut, which only takes place in a mature forest that has already been thinned several times, involves removing all the mature trees when other seedlings have become established. This then allows the forester to decide which tree species are regenerated. It leaves a young forest where all trees are at a similar point in their growth. It can also be used to develop a two-tier forest so that there are two harvests and the money that comes in is spread out over a decade or more.

[G] Thinnings and dense and dead wood removal for fire prevention also center on the production of low-use wood. However, it is important to remember that some retention of what many would classify as low-use wood is very important. The tops of trees that have been cut down should be left on the site so that their nutrients cycle back into the soil. In addition, trees with many cavities are extremely important habitats for insect predators like woodpeckers, bats and small mammals. They help control problem insects and increase the health and resilience of the forest. It is also important to remember that not all small trees are low-use. For example, many species like hawthorn provide food for wildlife. Finally, rare species of trees in a forest should also stay behind as they add to its structural diversity.$p2$;

  -- ────────────────────────────────────────────────────────────────────────────
  p3_title TEXT := 'Conquering Earth''s space junk problem';
  p3_text  TEXT := $p3$Conquering Earth's space junk problem

Satellites, rocket shards and collision debris are creating major traffic risks in orbit around the planet. Researchers are working to reduce these threats.

[A] Last year, commercial companies, military and civil departments and amateurs sent more than 400 satellites into orbit, over four times the yearly average in the previous decade. Numbers could rise even more sharply if leading space companies follow through on plans to deploy hundreds to thousands of large constellations of satellites to space in the next few years.

All that traffic can lead to disaster. Ten years ago, a US commercial Iridium satellite smashed into an inactive Russian communications satellite called Cosmos-2251, creating thousands of new pieces of space shrapnel that now threaten other satellites in low Earth orbit – the zone stretching up to 2,000 kilometres in altitude. Altogether, there are roughly 20,000 human-made objects in orbit, from working satellites to small rocket pieces. And satellite operators can't steer away from every potential crash, because each move consumes time and fuel that could otherwise be used for the spacecraft's main job.

[B] Concern about space junk goes back to the beginning of the satellite era, but the number of objects in orbit is rising so rapidly that researchers are investigating new ways of attacking the problem. Several teams are trying to improve methods for assessing what is in orbit, so that satellite operators can work more efficiently in ever-more-crowded space. Some researchers are now starting to compile a massive data set that includes the best possible information on where everything is in orbit. Others are developing taxonomies of space debris – working on measuring properties such as the shape and size of an object, so that satellite operators know how much to worry about what's coming their way.

The alternative, many say, is unthinkable. Just a few uncontrolled space crashes could generate enough debris to set off a runaway cascade of fragments, rendering near-Earth space unusable. 'If we go on like this, we will reach a point of no return,' says Carolin Frueh, an astrodynamical researcher at Purdue University in West Lafayette, Indiana.

[C] Even as our ability to monitor space objects increases, so too does the total number of items in orbit. That means companies, governments and other players in space are collaborating in new ways to avoid a shared threat. International groups such as the Inter-Agency Space Debris Coordination Committee have developed guidelines on space sustainability. Those include inactivating satellites at the end of their useful life by venting pressurised materials or leftover fuel that might lead to explosions. The intergovernmental groups also advise lowering satellites deep enough into the atmosphere that they will burn up or disintegrate within 25 years. But so far, only about half of all missions have abided by this 25-year goal, says Holger Krag, head of the European Space Agency's space-debris office in Darmstadt, Germany. Operators of the planned large constellations of satellites say they will be responsible stewards in their enterprises in space, but Krag worries that problems could increase, despite their best intentions. 'What happens to those that fail or go bankrupt?' he asks. 'They are probably not going to spend money to remove their satellites from space.'

[D] In theory, given the vastness of space, satellite operators should have plenty of room for all these missions to fly safely without ever nearing another object. So some scientists are tackling the problem of space junk by trying to find out where all the debris is to a high degree of precision. That would alleviate the need for many of the unnecessary manoeuvres that are carried out to avoid potential collisions. 'If you knew precisely where everything was, you would almost never have a problem,' says Marlon Sorge, a space-debris specialist at the Aerospace Corporation in El Segundo, California.

[E] The field is called space traffic management, because it's similar to managing traffic on the roads or in the air. Think about a busy day at an airport, says Moriba Jah, an astrodynamicist at the University of Texas at Austin: planes line up in the sky, landing and taking off close to one another in a carefully choreographed routine. Air-traffic controllers know the location of the planes down to one metre in accuracy. The same can't be said for space debris. Not all objects in orbit are known, and even those included in databases are not tracked consistently.

[F] An additional problem is that there is no authoritative catalogue that accurately lists the orbits of all known space debris. Jah illustrates this with a web-based database that he has developed. It draws on several sources, such as catalogues maintained by the US and Russian governments, to visualise where objects are in space. When he types in an identifier for a particular space object, the database draws a purple line to designate its orbit. Only this doesn't quite work for a number of objects, such as a Russian rocket body designated in the database as object number 32280. When Jah enters that number, the database draws two purple lines: the US and Russian sources contain two completely different orbits for the same object. Jah says that it is almost impossible to tell which is correct, unless a third source of information made it possible to cross-correlate.

Jah describes himself as a space environmentalist: 'I want to make space a place that is safe to operate, that is free and useful for generations to come.' Till that happens, he argues, the space community will continue devolving into a tragedy in which all spaceflight operators are polluting a common resource.$p3$;

  audio_id UUID;

BEGIN

  -- ── Clear existing seed data ────────────────────────────────────────────────
  DELETE FROM public.placement_reading_questions;
  DELETE FROM public.placement_listening_questions;
  DELETE FROM public.placement_listening_audio;
  DELETE FROM public.placement_writing_tasks;

  -- ── READING PASSAGE 1: Urban farming  (Q1–13) ──────────────────────────────

  -- Q1–3: Sentence completion
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p1_title, p1_text, 1, 1,
     'Vertical tubes are used to grow strawberries, _____ and herbs.',
     'fill_blank', NULL, 'lettuces', 1),
    (p1_title, p1_text, 1, 2,
     'There will eventually be a daily harvest of as much as _____ in weight of fruit and vegetables.',
     'fill_blank', NULL, '1,000 kg', 2),
    (p1_title, p1_text, 1, 3,
     'It may be possible that the farm''s produce will account for as much as 10% of the city''s _____ overall.',
     'fill_blank', NULL, 'consumption', 3);

  -- Q4–7: Table completion (Intensive farming vs aeroponic)
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p1_title, p1_text, 1, 4,
     'Intensive farming: a wide range of _____ are used; these techniques also pollute the air.',
     'fill_blank', NULL, 'pesticides', 4),
    (p1_title, p1_text, 1, 5,
     'Intensive farming: quality not good; varieties of fruit and vegetables chosen that can survive long _____.',
     'fill_blank', NULL, 'journeys', 5),
    (p1_title, p1_text, 1, 6,
     'Intensive farming: _____ receive very little of the overall income from sales.',
     'fill_blank', NULL, 'producers', 6),
    (p1_title, p1_text, 1, 7,
     'Aeroponic urban farming: produce is chosen because of its _____.',
     'fill_blank', NULL, 'flavour', 7);

  -- Q8–13: True / False / Not Given
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p1_title, p1_text, 1, 8,  'Urban farming can take place above or below ground.',                                                                         'true_false_ng', NULL, 'TRUE',      8),
    (p1_title, p1_text, 1, 9,  'Some of the equipment used in aeroponic farming can be made by hand.',                                                       'true_false_ng', NULL, 'NOT GIVEN', 9),
    (p1_title, p1_text, 1, 10, 'Urban farming relies more on electricity than some other types of farming.',                                                  'true_false_ng', NULL, 'FALSE',     10),
    (p1_title, p1_text, 1, 11, 'Fruit and vegetables grown on an aeroponic urban farm are cheaper than traditionally grown organic produce.',                 'true_false_ng', NULL, 'TRUE',      11),
    (p1_title, p1_text, 1, 12, 'Most produce can be grown on an aeroponic urban farm at any time of the year.',                                              'true_false_ng', NULL, 'FALSE',     12),
    (p1_title, p1_text, 1, 13, 'Beans take longer to grow on an urban farm than other vegetables.',                                                           'true_false_ng', NULL, 'NOT GIVEN', 13);

  -- ── READING PASSAGE 2: Forest management  (Q14–26) ─────────────────────────

  -- Q14–18: Paragraph matching  (answer = letter A–G)
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p2_title, p2_text, 2, 14,
     'Which paragraph [A–G] contains this information? — Bad outcomes for a forest when people focus only on its financial reward.',
     'multiple_choice', '["Para A","Para B","Para C","Para D","Para E","Para F","Para G"]', 'B', 14),
    (p2_title, p2_text, 2, 15,
     'Which paragraph [A–G] contains this information? — Reference to the aspects of any tree that contribute to its worth.',
     'multiple_choice', '["Para A","Para B","Para C","Para D","Para E","Para F","Para G"]', 'A', 15),
    (p2_title, p2_text, 2, 16,
     'Which paragraph [A–G] contains this information? — Mention of the potential use of wood to help run vehicles.',
     'multiple_choice', '["Para A","Para B","Para C","Para D","Para E","Para F","Para G"]', 'C', 16),
    (p2_title, p2_text, 2, 17,
     'Which paragraph [A–G] contains this information? — Examples of insects that attack trees.',
     'multiple_choice', '["Para A","Para B","Para C","Para D","Para E","Para F","Para G"]', 'E', 17),
    (p2_title, p2_text, 2, 18,
     'Which paragraph [A–G] contains this information? — An alternative name for trees that produce low-use wood.',
     'multiple_choice', '["Para A","Para B","Para C","Para D","Para E","Para F","Para G"]', 'B', 18);

  -- Q19–21: Timber-cut matching  (A=TSI Cut, B=Salvage Cut, C=Shelterwood Cut)
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p2_title, p2_text, 2, 19,
     'Match the purpose to the correct timber cut. — To remove trees that are diseased.',
     'multiple_choice', '["TSI Cut","Salvage Cut","Shelterwood Cut"]', 'B', 19),
    (p2_title, p2_text, 2, 20,
     'Match the purpose to the correct timber cut. — To generate income across a number of years.',
     'multiple_choice', '["TSI Cut","Salvage Cut","Shelterwood Cut"]', 'C', 20),
    (p2_title, p2_text, 2, 21,
     'Match the purpose to the correct timber cut. — To create a forest whose trees are close in age.',
     'multiple_choice', '["TSI Cut","Salvage Cut","Shelterwood Cut"]', 'C', 21);

  -- Q22–26: Sentence completion
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p2_title, p2_text, 2, 22, 'Some dead wood is removed to avoid the possibility of _____.', 'fill_blank', NULL, 'fire',      22),
    (p2_title, p2_text, 2, 23, 'The _____ from the tops of cut trees can help improve soil quality.', 'fill_blank', NULL, 'nutrients', 23),
    (p2_title, p2_text, 2, 24, 'Some damaged trees should be left, as their _____ provide habitats for a range of creatures.', 'fill_blank', NULL, 'cavities', 24),
    (p2_title, p2_text, 2, 25, 'Some trees that are small, such as _____, are a source of food for animals and insects.', 'fill_blank', NULL, 'hawthorn', 25),
    (p2_title, p2_text, 2, 26, 'Any trees that are _____ should be left to grow, as they add to the variety of species in the forest.', 'fill_blank', NULL, 'rare', 26);

  -- ── READING PASSAGE 3: Conquering Earth's space junk problem  (Q27–40) ──────

  -- Q27–31: Section matching  (answer = letter A–F)
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p3_title, p3_text, 3, 27,
     'Which section [A–F] contains this information? — A reference to the cooperation that takes place to try and minimise risk.',
     'multiple_choice', '["Section A","Section B","Section C","Section D","Section E","Section F"]', 'C', 27),
    (p3_title, p3_text, 3, 28,
     'Which section [A–F] contains this information? — An explanation of a person''s aims.',
     'multiple_choice', '["Section A","Section B","Section C","Section D","Section E","Section F"]', 'F', 28),
    (p3_title, p3_text, 3, 29,
     'Which section [A–F] contains this information? — A description of a major collision that occurred in space.',
     'multiple_choice', '["Section A","Section B","Section C","Section D","Section E","Section F"]', 'A', 29),
    (p3_title, p3_text, 3, 30,
     'Which section [A–F] contains this information? — A comparison between tracking objects in space and the efficiency of a transportation system.',
     'multiple_choice', '["Section A","Section B","Section C","Section D","Section E","Section F"]', 'E', 30),
    (p3_title, p3_text, 3, 31,
     'Which section [A–F] contains this information? — A reference to efforts to classify space junk.',
     'multiple_choice', '["Section A","Section B","Section C","Section D","Section E","Section F"]', 'B', 31);

  -- Q32–35: Summary completion
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p3_title, p3_text, 3, 32,
     'The Inter-Agency Space Debris Coordination Committee gives advice on how the _____ of space can be achieved.',
     'fill_blank', NULL, 'sustainability', 32),
    (p3_title, p3_text, 3, 33,
     'When satellites are no longer active, any unused _____ or pressurised material that could cause explosions should be removed.',
     'fill_blank', NULL, 'fuel', 33),
    (p3_title, p3_text, 3, 34,
     'Unused fuel or pressurised material that could cause _____ should be removed from inactive satellites.',
     'fill_blank', NULL, 'explosions', 34),
    (p3_title, p3_text, 3, 35,
     'Holger Krag points out that operators that become _____ are unlikely to prioritise removing their satellites from space.',
     'fill_blank', NULL, 'bankrupt', 35);

  -- Q36–40: People matching  (A=Frueh, B=Krag, C=Sorge, D=Jah)
  INSERT INTO public.placement_reading_questions
    (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
  VALUES
    (p3_title, p3_text, 3, 36,
     'Match the statement to the correct person. — Knowing the exact location of space junk would help prevent any possible danger.',
     'multiple_choice', '["Carolin Frueh","Holger Krag","Marlon Sorge","Moriba Jah"]', 'C', 36),
    (p3_title, p3_text, 3, 37,
     'Match the statement to the correct person. — Space should be available to everyone and should be preserved for the future.',
     'multiple_choice', '["Carolin Frueh","Holger Krag","Marlon Sorge","Moriba Jah"]', 'D', 37),
    (p3_title, p3_text, 3, 38,
     'Match the statement to the correct person. — A recommendation regarding satellites is widely ignored.',
     'multiple_choice', '["Carolin Frueh","Holger Krag","Marlon Sorge","Moriba Jah"]', 'B', 38),
    (p3_title, p3_text, 3, 39,
     'Match the statement to the correct person. — There is conflicting information about where some satellites are in space.',
     'multiple_choice', '["Carolin Frueh","Holger Krag","Marlon Sorge","Moriba Jah"]', 'D', 39),
    (p3_title, p3_text, 3, 40,
     'Match the statement to the correct person. — There is a risk we will not be able to undo the damage that occurs in space.',
     'multiple_choice', '["Carolin Frueh","Holger Krag","Marlon Sorge","Moriba Jah"]', 'A', 40);

  -- ── LISTENING – Part 1: Transport survey  (Q1–10) ───────────────────────────
  INSERT INTO public.placement_listening_audio
    (title, storage_path, public_url, part_number, is_active)
  VALUES (
    'Cambridge IELTS 18 Test 1 – Part 1: Transport survey',
    '18 section1-part1.mp3',
    'https://wuejnsqetupivmidxylv.supabase.co/storage/v1/object/public/placement-audio/18%20section1-part1.mp3',
    1, true
  ) RETURNING id INTO audio_id;

  INSERT INTO public.placement_listening_questions
    (audio_id, question_number, question_text, question_type, options, correct_answer, context_text, display_order)
  VALUES
    (audio_id, 1,  'Postcode: _____',                                                              'fill_blank', NULL, 'DW30 7YZ',    'Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', 1),
    (audio_id, 2,  'Date of bus journey: _____',                                                   'fill_blank', NULL, '24 April',   NULL, 2),
    (audio_id, 3,  'Reason for trip: shopping and visit to the _____',                             'fill_blank', NULL, 'dentist',     NULL, 3),
    (audio_id, 4,  'Travelled by bus because cost of _____ too high',                              'fill_blank', NULL, 'parking',     NULL, 4),
    (audio_id, 5,  'Got on bus at _____ Street',                                                   'fill_blank', NULL, 'Claxby',      NULL, 5),
    (audio_id, 6,  'Complaint: bus today was _____',                                               'fill_blank', NULL, 'late',        NULL, 6),
    (audio_id, 7,  'Complaint: frequency of buses in the _____',                                   'fill_blank', NULL, 'evening',     NULL, 7),
    (audio_id, 8,  'Goes to the _____ by car',                                                     'fill_blank', NULL, 'supermarket', NULL, 8),
    (audio_id, 9,  'Dislikes travelling by bike in the city centre because of the _____',          'fill_blank', NULL, 'pollution',   NULL, 9),
    (audio_id, 10, 'Does not own a bike because of a lack of _____',                               'fill_blank', NULL, 'storage',     NULL, 10);

  -- ── LISTENING – Part 2: Becoming a volunteer for ACE  (Q11–20) ──────────────
  INSERT INTO public.placement_listening_audio
    (title, storage_path, public_url, part_number, is_active)
  VALUES (
    'Cambridge IELTS 18 Test 1 – Part 2: Volunteering for ACE',
    '18 section1-part2.mp3',
    'https://wuejnsqetupivmidxylv.supabase.co/storage/v1/object/public/placement-audio/18%20section1-part2.mp3',
    2, true
  ) RETURNING id INTO audio_id;

  INSERT INTO public.placement_listening_questions
    (audio_id, question_number, question_text, question_type, options, correct_answer, context_text, display_order)
  VALUES
    -- Q11–13: MCQ
    (audio_id, 11, 'Why does the speaker apologise about the seats?',
     'multiple_choice',
     '["A: They are too small.","B: There are not enough of them.","C: Some of them are very close together."]',
     'B', 'Choose the correct letter, A, B or C.', 1),
    (audio_id, 12, 'What does the speaker say about the age of volunteers?',
     'multiple_choice',
     '["A: The age of volunteers is less important than other factors.","B: Young volunteers are less reliable than older ones.","C: Most volunteers are about 60 years old."]',
     'A', NULL, 2),
    (audio_id, 13, 'What does the speaker say about training?',
     'multiple_choice',
     '["A: It is continuous.","B: It is conducted by a manager.","C: It takes place online."]',
     'A', NULL, 3),
    -- Q14–15: Choose TWO letters (each stored as individual answer)
    (audio_id, 14, 'Which TWO issues does the speaker ask the audience to consider before applying? — Write one letter (A–E) per box.',
     'multiple_choice',
     '["A: financial situation","B: level of commitment","C: work experience","D: ambition","E: availability"]',
     'B',
     'Questions 14 and 15 — Choose TWO letters, A–E.', 4),
    (audio_id, 15, 'Which TWO issues does the speaker ask the audience to consider before applying? — Write the second letter.',
     'multiple_choice',
     '["A: financial situation","B: level of commitment","C: work experience","D: ambition","E: availability"]',
     'E', NULL, 5),
    -- Q16–20: Matching (area of work → helpful attribute A–G)
    (audio_id, 16, 'Fundraising',
     'multiple_choice',
     '["A: experience on stage","B: original new ideas","C: parenting skills","D: understanding of food and diet","E: retail experience","F: good memory","G: good level of fitness"]',
     'B', 'What would be helpful for each area of voluntary work? Write the correct letter, A–G.', 6),
    (audio_id, 17, 'Litter collection',
     'multiple_choice',
     '["A: experience on stage","B: original new ideas","C: parenting skills","D: understanding of food and diet","E: retail experience","F: good memory","G: good level of fitness"]',
     'G', NULL, 7),
    (audio_id, 18, 'Playmates',
     'multiple_choice',
     '["A: experience on stage","B: original new ideas","C: parenting skills","D: understanding of food and diet","E: retail experience","F: good memory","G: good level of fitness"]',
     'D', NULL, 8),
    (audio_id, 19, 'Story club',
     'multiple_choice',
     '["A: experience on stage","B: original new ideas","C: parenting skills","D: understanding of food and diet","E: retail experience","F: good memory","G: good level of fitness"]',
     'A', NULL, 9),
    (audio_id, 20, 'First aid',
     'multiple_choice',
     '["A: experience on stage","B: original new ideas","C: parenting skills","D: understanding of food and diet","E: retail experience","F: good memory","G: good level of fitness"]',
     'F', NULL, 10);

  -- ── LISTENING – Part 3: Talk on jobs in fashion design  (Q21–30) ────────────
  INSERT INTO public.placement_listening_audio
    (title, storage_path, public_url, part_number, is_active)
  VALUES (
    'Cambridge IELTS 18 Test 1 – Part 3: Jobs in fashion design',
    '18 section1-part3.mp3',
    'https://wuejnsqetupivmidxylv.supabase.co/storage/v1/object/public/placement-audio/18%20section1-part3.mp3',
    3, true
  ) RETURNING id INTO audio_id;

  INSERT INTO public.placement_listening_questions
    (audio_id, question_number, question_text, question_type, options, correct_answer, context_text, display_order)
  VALUES
    (audio_id, 21, 'What problem did Chantal have at the start of the talk?',
     'multiple_choice',
     '["A: Her view of the speaker was blocked.","B: She was unable to find an empty seat.","C: The students next to her were talking."]',
     'A', 'Choose the correct letter, A, B or C.', 1),
    (audio_id, 22, 'What were Hugo and Chantal surprised to hear about the job market?',
     'multiple_choice',
     '["A: It has become more competitive than it used to be.","B: There is more variety in it than they had realised.","C: Some areas of it are more exciting than others."]',
     'B', NULL, 2),
    (audio_id, 23, 'Hugo and Chantal agree that the speaker''s message was',
     'multiple_choice',
     '["A: unfair to them at times.","B: hard for them to follow.","C: critical of the industry."]',
     'B', NULL, 3),
    (audio_id, 24, 'What do Hugo and Chantal criticise about their school careers advice?',
     'multiple_choice',
     '["A: when they received the advice","B: how much advice was given","C: who gave the advice"]',
     'C', NULL, 4),
    (audio_id, 25, 'When discussing their future, Hugo and Chantal disagree on',
     'multiple_choice',
     '["A: which is the best career in fashion.","B: when to choose a career in fashion.","C: why they would like a career in fashion."]',
     'B', NULL, 5),
    (audio_id, 26, 'How does Hugo feel about being an unpaid assistant?',
     'multiple_choice',
     '["A: He is realistic about the practice.","B: He feels the practice is dishonest.","C: He thinks others want to change the practice."]',
     'A', NULL, 6),
    -- Q27–28: Choose TWO mistakes the speaker admitted (A–E)
    (audio_id, 27, 'Which TWO mistakes did the speaker admit she made in her first job? — Write one letter per box.',
     'multiple_choice',
     '["A: being dishonest to employer","B: paying too much attention to how she looked","C: expecting to become well known","D: trying to earn a lot of money","E: openly disliking her client"]',
     'B', 'Questions 27 and 28 — Choose TWO letters, A–E.', 7),
    (audio_id, 28, 'Which TWO mistakes did the speaker admit she made in her first job? — Write the second letter.',
     'multiple_choice',
     '["A: being dishonest to employer","B: paying too much attention to how she looked","C: expecting to become well known","D: trying to earn a lot of money","E: openly disliking her client"]',
     'E', NULL, 8),
    -- Q29–30: Choose TWO pieces of retail info (A–E)
    (audio_id, 29, 'Which TWO pieces of retail information do Hugo and Chantal agree would be useful? — Write one letter per box.',
     'multiple_choice',
     '["A: reasons people return fashion items","B: how much time people have to shop","C: fashion designs people want but can''t find","D: best time of year for fashion buying","E: most popular fashion sizes"]',
     'A', 'Questions 29 and 30 — Choose TWO letters, A–E.', 9),
    (audio_id, 30, 'Which TWO pieces of retail information do Hugo and Chantal agree would be useful? — Write the second letter.',
     'multiple_choice',
     '["A: reasons people return fashion items","B: how much time people have to shop","C: fashion designs people want but can''t find","D: best time of year for fashion buying","E: most popular fashion sizes"]',
     'C', NULL, 10);

  -- ── LISTENING – Part 4: Elephant translocation  (Q31–40) ────────────────────
  INSERT INTO public.placement_listening_audio
    (title, storage_path, public_url, part_number, is_active)
  VALUES (
    'Cambridge IELTS 18 Test 1 – Part 4: Elephant translocation',
    '18 section1-part4.mp3',
    'https://wuejnsqetupivmidxylv.supabase.co/storage/v1/object/public/placement-audio/18%20section1-part4.mp3',
    4, true
  ) RETURNING id INTO audio_id;

  INSERT INTO public.placement_listening_questions
    (audio_id, question_number, question_text, question_type, options, correct_answer, context_text, display_order)
  VALUES
    (audio_id, 31, 'Problems caused: damage to _____ in the park',                                       'fill_blank', NULL, 'vegetation',  'Complete the notes. Write ONE WORD ONLY for each answer.', 1),
    (audio_id, 32, 'A suitable group of elephants from the same _____ was selected',                     'fill_blank', NULL, 'family',      NULL, 2),
    (audio_id, 33, 'Vets and park staff made use of _____ to guide the elephants into an open plain',    'fill_blank', NULL, 'helicopters', NULL, 3),
    (audio_id, 34, 'Immobilisation had to be completed quickly to reduce _____',                         'fill_blank', NULL, 'stress',      NULL, 4),
    (audio_id, 35, 'Elephants had to be turned on their _____ to avoid damage to their lungs',          'fill_blank', NULL, 'sides',       NULL, 5),
    (audio_id, 36, 'Elephants'' _____ had to be monitored constantly',                                  'fill_blank', NULL, 'breathing',   NULL, 6),
    (audio_id, 37, 'Data including the size of their tusks and _____ was taken',                        'fill_blank', NULL, 'Feet',        NULL, 7),
    (audio_id, 38, 'Advantages at Nkhotakota: _____ opportunities',                                     'fill_blank', NULL, 'Employment',  NULL, 8),
    (audio_id, 39, 'Advantages at Nkhotakota: a reduction in the number of poachers and _____',        'fill_blank', NULL, 'Weapons',     NULL, 9),
    (audio_id, 40, 'Advantages at Nkhotakota: an increase in _____ as a contributor to GDP',           'fill_blank', NULL, 'tourism',     NULL, 10);

  -- ── WRITING – Task 1 (line graph)  ──────────────────────────────────────────
  INSERT INTO public.placement_writing_tasks
    (task_type, prompt_text, visual_description, min_words, recommended_minutes, is_active)
  VALUES
    (
      'task1',
      'You should spend about 20 minutes on this task.

The graph below shows the percentage of urban population in five Asian countries in 1970 and 2000, with projections for 2030.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
      'Line graph: Percentage of urban population in five Asian countries (Philippines, Malaysia, Thailand, Indonesia, and India) across three time periods: 1970, 2000, and projected 2030. All countries show an upward trend. Malaysia starts highest (~25% in 1970) and reaches ~75% by 2030. Philippines starts ~30% and rises to ~65%. Thailand starts ~15% and climbs to ~55%. Indonesia starts ~15% and reaches ~55%. India starts lowest (~10%) and rises to ~45% by 2030.',
      150,
      20,
      true
    );

  -- ── WRITING – Task 2  ────────────────────────────────────────────────────────
  INSERT INTO public.placement_writing_tasks
    (task_type, prompt_text, visual_description, min_words, recommended_minutes, is_active)
  VALUES
    (
      'task2',
      'You should spend about 40 minutes on this task.

Write about the following topic:

The most important aim of science should be to improve people''s lives.

To what extent do you agree or disagree with this statement?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
      NULL,
      250,
      40,
      true
    );

  RAISE NOTICE 'Seed complete — reading: % questions, listening: % questions, writing tasks: %',
    (SELECT COUNT(*) FROM public.placement_reading_questions),
    (SELECT COUNT(*) FROM public.placement_listening_questions),
    (SELECT COUNT(*) FROM public.placement_writing_tasks);

END;
$seed$;
