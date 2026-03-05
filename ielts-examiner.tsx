// @ts-nocheck
// This file is a legacy JS-style React module. Type checking is suppressed because
// it predates the TypeScript migration. The Window interface extension for
// JAXTINA_ADMIN_USER, JAXTINA_ADMIN_PASS, and JAXTINA_API_KEY lives in
// types/jaxtina-window.d.ts and applies project-wide.
import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";


// ─── Config ───────────────────────────────────────────────────────────────────
const CONFIG = {
  ADMIN_USER: (typeof window !== "undefined" && window.JAXTINA_ADMIN_USER) || "admin",
  ADMIN_PASS: (typeof window !== "undefined" && window.JAXTINA_ADMIN_PASS) || "jaxtina2025",
  ANTHROPIC_API_KEY: (typeof window !== "undefined" && window.JAXTINA_API_KEY) || "",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const VIETNAM_CITIES = ["An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"];
const BANDS = ["0", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"];
const TASK1_TYPES = ["Bar Chart", "Line Graph", "Pie Chart", "Table", "Map", "Process", "Mixed Graph", "GT - Formal Letter", "GT - Semi-Formal Letter", "GT - Informal Letter"];
const TASK2_TYPES = ["Opinion Essay", "Discussion Essay", "Problem & Solution", "Advantages & Disadvantages", "Double Question"];
const SOURCES = ["Actual Test", "Cambridge IELTS", "Jaxtina Bank", "IELTS Insights", "IELTS Liz", "IELTS Advantage", "IELTS Jacky", "British Council", "IDP IELTS", "IELTS Official"];
const TYPE_COLORS = {
  "Bar Chart": "bg-blue-100 text-blue-700", "Line Graph": "bg-green-100 text-green-700",
  "Pie Chart": "bg-purple-100 text-purple-700", "Table": "bg-yellow-100 text-yellow-700",
  "Map": "bg-teal-100 text-teal-700", "Process": "bg-orange-100 text-orange-700",
  "Mixed Graph": "bg-pink-100 text-pink-700", "GT - Formal Letter": "bg-sky-100 text-sky-700",
  "GT - Semi-Formal Letter": "bg-cyan-100 text-cyan-700", "GT - Informal Letter": "bg-indigo-100 text-indigo-700",
  "Opinion Essay": "bg-indigo-100 text-indigo-700", "Discussion Essay": "bg-cyan-100 text-cyan-700",
  "Problem & Solution": "bg-rose-100 text-rose-700", "Advantages & Disadvantages": "bg-violet-100 text-violet-700",
  "Double Question": "bg-amber-100 text-amber-700"
};

// ─── Storage ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStorage(key: string, def: any) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setStorage(key: string, val: any) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } }

// ─── Image proxy + component ──────────────────────────────────────────────────
function proxyImg(url: string) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=jpg`;
}

function TaskImage({ url, alt, className }: { url: string; alt?: string; className?: string }) {
  const [status, setStatus] = useState("loading");
  if (!url) return null;
  return (
    <div className={`relative bg-gray-100 rounded-xl overflow-hidden ${className || ""}`} style={{ minHeight: 80 }}>
      {status === "loading" && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">⏳ Loading...</div>}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-3 text-center">
          <div className="text-3xl mb-1">🖼️</div>
          <p className="text-xs font-medium">Image unavailable</p>
          <p className="text-xs mt-0.5">Upload the chart manually below.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1">View original ↗</a>
        </div>
      )}
      <img src={proxyImg(url)} alt={alt || "chart"} className={`w-full object-contain transition-opacity duration-300 ${status === "ok" ? "opacity-100" : "opacity-0"}`} onLoad={() => setStatus("ok")} onError={() => setStatus("error")} />
    </div>
  );
}

// ─── CSV ──────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCSV(users: any[]) {
  const rows = [["ID", "Full Name", "Age", "Location", "Mobile", "Email", "Current Band", "Target Band", "Joined"].join(",")];
  users.forEach(u => {
    rows.push([u.id, u.fullname, u.age, u.location, u.mobile, u.email, u.currentBand, u.targetBand, u.joined].map(v => `"${v || ''}"`).join(","));
    if (u.submissions?.length) {
      rows.push(["", "--- Essays ---"].join(","));
      rows.push(["", "Date", "Task", "Type", "Overall", "TA", "CC", "LR", "GRA"].join(","));
      u.submissions.forEach(s => rows.push(["", s.date, s.task, s.qtype || "", s.scores?.overall || "", s.scores?.TA || "", s.scores?.CC || "", s.scores?.LR || "", s.scores?.GRA || ""].join(",")));
      rows.push([]);
    }
  });
  return rows.join("\n");
}

function parseCSVLine(line: string): string[] {
  const result = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur.trim()); cur = ""; }
    else cur += c;
  }
  result.push(cur.trim()); return result;
}

const TYPE_MAP = {
  "bar chart": "Bar Chart", "bar": "Bar Chart", "line graph": "Line Graph", "line": "Line Graph",
  "pie chart": "Pie Chart", "pie": "Pie Chart", "table": "Table", "map": "Map", "process": "Process",
  "mixed charts": "Mixed Graph", "mixed graph": "Mixed Graph", "multiple graphs": "Mixed Graph", "mixed": "Mixed Graph",
  "opinion (agree/disagree)": "Opinion Essay", "opinion": "Opinion Essay", "agree/disagree": "Opinion Essay",
  "discussion + opinion": "Discussion Essay", "discussion": "Discussion Essay",
  "advantages/disadvantages": "Advantages & Disadvantages", "advantages & disadvantages": "Advantages & Disadvantages",
  "cause/solution": "Problem & Solution", "problem/solution": "Problem & Solution", "problem & solution": "Problem & Solution",
  "direct question": "Double Question", "direct": "Double Question", "positive/negative development": "Double Question",
};

function parseQuestionsCSV(text: string) {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line, i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals = parseCSVLine(line); const obj: Record<string, any> = {};
    headers.forEach((h, idx) => obj[h] = (vals[idx] || "").trim());
    const questionText = obj.question_text || obj.questiontext || "";
    if (!questionText) return null;
    let task = obj.task || "";
    if (task === "1") task = "Task 1"; else if (task === "2") task = "Task 2"; else if (!task.startsWith("Task")) task = "Task 2";
    const rawType = (obj.question_type || obj.type || "").toLowerCase();
    const type = TYPE_MAP[rawType] || obj.type || "";
    let source = obj.source || "Jaxtina Bank";
    if (source.startsWith("http")) {
      try {
        const domain = new URL(source).hostname.replace("www.", "");
        const dm = { "ieltsadvantage.com": "IELTS Advantage", "ieltsjacky.com": "IELTS Jacky", "ieltsliz.com": "IELTS Liz", "takeielts.britishcouncil.org": "British Council", "ielts.idp.com": "IDP IELTS", "ielts.org": "IELTS Official" };
        source = dm[domain] || domain;
      } catch { source = "External"; }
    }
    return { id: `csv_${Date.now()}_${i}`, task, type, questionText, source, imageUrl: obj.image_url || obj.imageurl || "" };
  }).filter(Boolean);
}

// ─── Seed questions ───────────────────────────────────────────────────────────
const SEED_QUESTIONS = [
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

// ─── API helper ───────────────────────────────────────────────────────────────
async function callAnthropicAPI(messages, systemPrompt, maxTokens) {
  if (!CONFIG.ANTHROPIC_API_KEY) throw new Error("API key not configured. Please contact admin.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-ipc": "true",
    },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens || 1200, system: systemPrompt, messages })
  });
  const data = await res.json();
  if (data.error) throw new Error(`API error (${data.error.type}): ${data.error.message}`);
  if (!data.content?.length) throw new Error("Empty response from AI.");
  const raw = data.content.map(i => i.text || "").join("").trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON in response. Raw: ${raw.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
      <input type={type || "text"} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [profile, setProfile] = useState(() => getStorage("ielts_profile", null));
  const [users, setUsers] = useState(() => getStorage("ielts_users", []));
  const [questions, setQuestions] = useState(() => {
    const stored = getStorage("ielts_questions", null);
    if (!stored || stored.length === 0) { setStorage("ielts_questions", SEED_QUESTIONS); return SEED_QUESTIONS; }
    const ids = new Set(stored.map(q => q.id));
    const missing = SEED_QUESTIONS.filter(q => !ids.has(q.id));
    if (missing.length) { const merged = [...missing, ...stored]; setStorage("ielts_questions", merged); return merged; }
    return stored;
  });
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminForm, setAdminForm] = useState({ user: "", pass: "" });
  const [adminError, setAdminError] = useState("");

  useEffect(() => setStorage("ielts_users", users), [users]);
  useEffect(() => setStorage("ielts_profile", profile), [profile]);
  useEffect(() => setStorage("ielts_questions", questions), [questions]);

  const currentUser = profile ? users.find(u => u.id === profile.id) : null;
  function saveUser(u) { setUsers(p => { const i = p.findIndex(x => x.id === u.id); if (i >= 0) { const n = [...p]; n[i] = u; return n; } return [...p, u]; }); }

  if (screen === "home") return <HomeScreen onStart={() => setScreen(profile ? "app" : "register")} onAdmin={() => setScreen("admin")} />;
  if (screen === "register") return <RegisterScreen onDone={p => { const u = { ...p, submissions: [], joined: new Date().toLocaleDateString("vi-VN") }; saveUser(u); setProfile(p); setScreen("app"); }} />;
  if (screen === "admin") return <AdminScreen users={users} questions={questions} setQuestions={setQuestions} auth={adminAuth} form={adminForm} setForm={setAdminForm} error={adminError} onLogin={() => { if (adminForm.user === CONFIG.ADMIN_USER && adminForm.pass === CONFIG.ADMIN_PASS) { setAdminAuth(true); setAdminError(""); } else setAdminError("Sai tài khoản hoặc mật khẩu."); }} onBack={() => { setScreen("home"); setAdminAuth(false); }} onExport={() => { const b = new Blob([toCSV(users)], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "jaxtina_users.csv"; a.click(); }} />;
  if (screen === "app") return <AppScreen profile={profile} currentUser={currentUser} saveUser={saveUser} questions={questions} onLogout={() => { setProfile(null); setScreen("home"); }} />;
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
function HomeScreen({ onStart, onAdmin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-red-600 to-orange-500 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-4xl font-black text-red-600">J</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-1">IELTS Writing Examiner</h1>
        <p className="text-red-100 text-lg font-medium">Jaxtina English Centre</p>
        <p className="text-red-200 mt-2 text-sm">AI-powered scoring · Bilingual feedback · Question Bank</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={onStart} className="bg-white hover:bg-gray-50 text-red-700 font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition">Bắt đầu / Get Started</button>
        <button onClick={onAdmin} className="bg-white/15 hover:bg-white/25 text-white font-semibold py-3 px-8 rounded-xl text-sm border border-white/30 transition">🔐 Admin Panel</button>
      </div>
    </div>
  );
}

// ─── RegisterScreen ───────────────────────────────────────────────────────────
function RegisterScreen({ onDone }) {
  const [form, setForm] = useState({ fullname: "", age: "", location: "", mobile: "", email: "", currentBand: "", targetBand: "" });
  const [err, setErr] = useState("");
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  function submit() { if (Object.values(form).some(v => !v)) { setErr("Vui lòng điền đầy đủ thông tin."); return; } onDone({ ...form, id: Date.now().toString() }); }
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl">J</div>
          <div><h2 className="text-xl font-bold text-gray-800">Tạo hồ sơ học viên</h2><p className="text-gray-400 text-xs">Create your learner profile</p></div>
        </div>
        <div className="space-y-3">
          <Field label="Họ và tên / Full Name" value={form.fullname} onChange={v => upd("fullname", v)} />
          <Field label="Tuổi / Age" type="number" value={form.age} onChange={v => upd("age", v)} />
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Tỉnh/Thành phố</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" value={form.location} onChange={e => upd("location", e.target.value)}>
              <option value="">-- Chọn tỉnh thành --</option>
              {VIETNAM_CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Số điện thoại / Mobile" value={form.mobile} onChange={v => upd("mobile", v)} />
          <Field label="Email" type="email" value={form.email} onChange={v => upd("email", v)} />
          <div className="grid grid-cols-2 gap-3">
            {[["currentBand", "Band hiện tại"], ["targetBand", "Band mục tiêu"]].map(([k, l]) => (
              <div key={k}><label className="text-xs font-semibold text-gray-600 block mb-1">{l}</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" value={form[k]} onChange={e => upd(k, e.target.value)}>
                  <option value="">--</option>{BANDS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            ))}
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <button onClick={submit} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition">Bắt đầu học →</button>
        </div>
      </div>
    </div>
  );
}

// ─── AppScreen ────────────────────────────────────────────────────────────────
function AppScreen({ profile, currentUser, saveUser, questions, onLogout }) {
  const [tab, setTab] = useState("practice");
  const [writingState, setWritingState] = useState(null);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm">J</div>
          <span className="font-bold text-gray-800 text-lg">Jaxtina IELTS</span>
        </div>
        <nav className="hidden md:flex gap-1">
          {[["practice", "✍️ Practice"], ["history", "📋 History"], ["analytics", "📊 Analytics"]].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setWritingState(null); }} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === k ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{l}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">👋 {profile.fullname}</span>
          <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg transition">Đăng xuất</button>
        </div>
      </header>
      <div className="md:hidden flex border-b bg-white px-4 gap-1 py-2">
        {[["practice", "✍️"], ["history", "📋"], ["analytics", "📊"]].map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setWritingState(null); }} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${tab === k ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{l}</button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        {tab === "practice" && (
          writingState?.result ? <ReviewView state={writingState} onBack={() => setWritingState(null)} />
            : writingState?.question ? <WriteView question={writingState.question} currentUser={currentUser} saveUser={saveUser} onBack={() => setWritingState(null)} onResult={r => setWritingState(s => ({ ...s, result: r }))} />
              : <LibraryView questions={questions} onWrite={q => setWritingState({ question: q })} currentUser={currentUser} />
        )}
        {tab === "history" && <HistoryView currentUser={currentUser} />}
        {tab === "analytics" && <AnalyticsView currentUser={currentUser} profile={profile} />}
      </div>
    </div>
  );
}

// ─── LibraryView ──────────────────────────────────────────────────────────────
function LibraryView({ questions, onWrite, currentUser }) {
  const [taskFilter, setTaskFilter] = useState("All");
  const [typeFilters, setTypeFilters] = useState([]);
  const [sourceFilters, setSourceFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [doneTab, setDoneTab] = useState("todo");
  const [showCustom, setShowCustom] = useState(false);
  const doneIds = new Set((currentUser?.submissions || []).map(s => s.qid).filter(Boolean));
  const toggle = (arr, setArr, v) => setArr(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const allTypes = taskFilter === "Task 1" ? TASK1_TYPES : taskFilter === "Task 2" ? TASK2_TYPES : [...TASK1_TYPES, ...TASK2_TYPES];
  const filtered = questions.filter(q => {
    if (taskFilter !== "All" && q.task !== taskFilter) return false;
    if (typeFilters.length && !typeFilters.includes(q.type)) return false;
    if (sourceFilters.length && !sourceFilters.includes(q.source)) return false;
    if (search && !q.questionText.toLowerCase().includes(search.toLowerCase()) && !q.type.toLowerCase().includes(search.toLowerCase())) return false;
    return doneTab === "done" ? doneIds.has(q.id) : !doneIds.has(q.id);
  });
  return (
    <div className="flex h-full">
      <aside className="hidden md:block w-56 bg-white border-r p-4 shrink-0 overflow-y-auto">
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Task Type</p>
          {["All", "Task 1", "Task 2"].map(t => (
            <button key={t} onClick={() => { setTaskFilter(t); setTypeFilters([]); }} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm mb-1 transition ${taskFilter === t ? "bg-red-50 text-red-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{t}</button>
          ))}
        </div>
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Dạng đề / Type</p>
          {allTypes.map(t => (
            <label key={t} className="flex items-center gap-2 text-sm text-gray-600 py-1 cursor-pointer">
              <input type="checkbox" checked={typeFilters.includes(t)} onChange={() => toggle(typeFilters, setTypeFilters, t)} className="accent-red-600" />{t}
            </label>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Nguồn / Source</p>
          {SOURCES.map(s => (
            <label key={s} className="flex items-center gap-2 text-sm text-gray-600 py-1 cursor-pointer">
              <input type="checkbox" checked={sourceFilters.includes(s)} onChange={() => toggle(sourceFilters, setSourceFilters, s)} className="accent-red-600" />{s}
            </label>
          ))}
        </div>
      </aside>
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {[["todo", "Bài chưa làm"], ["done", "Bài đã làm"]].map(([k, l]) => (
              <button key={k} onClick={() => setDoneTab(k)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${doneTab === k ? "bg-white text-red-700 shadow" : "text-gray-500"}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-red-300" placeholder="🔍 Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
            <button onClick={() => setShowCustom(true)} className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition">✏️ Tự nhập đề</button>
          </div>
        </div>
        {!questions.length && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📂</div>
            <p className="font-medium">Chưa có câu hỏi nào</p>
            <button onClick={() => setShowCustom(true)} className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm">✏️ Tự nhập đề bài</button>
          </div>
        )}
        {questions.length > 0 && !filtered.length && <div className="text-center py-16 text-gray-400"><p>Không tìm thấy câu hỏi phù hợp.</p></div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(q => <TaskCard key={q.id} q={q} done={doneIds.has(q.id)} onWrite={onWrite} />)}
        </div>
      </div>
      {showCustom && <CustomQuestionModal onConfirm={q => { setShowCustom(false); onWrite(q); }} onClose={() => setShowCustom(false)} />}
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────
function TaskCard({ q, done, onWrite }) {
  const color = TYPE_COLORS[q.type] || "bg-gray-100 text-gray-600";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
      {q.imageUrl
        ? <TaskImage url={q.imageUrl} alt="task chart" className="h-32 w-full" />
        : <div className={`h-24 flex items-center justify-center text-4xl ${q.task === "Task 1" ? "bg-blue-50" : "bg-orange-50"}`}>{q.task === "Task 1" ? "📊" : "✍️"}</div>
      }
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.task === "Task 1" ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}>{q.task}</span>
          {q.type && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{q.type}</span>}
          {q.source && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{q.source}</span>}
        </div>
        <p className="text-sm text-gray-700 line-clamp-3 flex-1 mb-3">{q.questionText}</p>
        <button onClick={() => onWrite(q)} className={`w-full py-2 rounded-xl text-sm font-bold transition ${done ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-red-600 hover:bg-red-500 text-white"}`}>
          {done ? "✅ Viết lại / Redo" : "✍️ Viết bài / Write now"}
        </button>
      </div>
    </div>
  );
}

// ─── CustomQuestionModal ──────────────────────────────────────────────────────
function CustomQuestionModal({ onConfirm, onClose }) {
  const [task, setTask] = useState("Task 2");
  const [type, setType] = useState("Opinion Essay");
  const [questionText, setQuestionText] = useState("");
  const [err, setErr] = useState("");
  const types = task === "Task 1" ? TASK1_TYPES : TASK2_TYPES;
  function confirm() { if (!questionText.trim()) { setErr("Vui lòng nhập đề bài."); return; } onConfirm({ id: `custom_${Date.now()}`, task, type, source: "Custom", questionText, imageUrl: "" }); }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div><h3 className="text-lg font-bold text-gray-800">✍️ Tự nhập đề bài</h3><p className="text-xs text-gray-400 mt-0.5">Enter your own question</p></div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-semibold text-gray-600 block mb-1">Task</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={task} onChange={e => { setTask(e.target.value); setType(e.target.value === "Task 1" ? TASK1_TYPES[0] : TASK2_TYPES[0]); }}>
              <option>Task 1</option><option>Task 2</option>
            </select>
          </div>
          <div><label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Đề bài / Question Prompt</label>
          <textarea rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300" placeholder="Paste or type the full question prompt here..." value={questionText} onChange={e => setQuestionText(e.target.value)} />
          {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">💡 For Task 1 with a chart, you can upload the image on the next screen.</div>
        <div className="flex gap-2">
          <button onClick={confirm} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition">Tiếp tục →</button>
          <button onClick={onClose} className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl">Huỷ</button>
        </div>
      </div>
    </div>
  );
}

// ─── WriteView ────────────────────────────────────────────────────────────────
function WriteView({ question, currentUser, saveUser, onBack, onResult }) {
  const [essay, setEssay] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(question.imageUrl || null);
  const [imgB64, setImgB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();
  const minWC = question.task === "Task 1" ? 150 : 250;
  const wc = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const wcMet = wc >= minWC;

  function handleImg(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn file ảnh."); return; }
    if (file.size > 4 * 1024 * 1024) { alert("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 4MB."); return; }
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = e => { setImgPreview(e.target.result); setImgB64(e.target.result.split(",")[1]); };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!CONFIG.ANTHROPIC_API_KEY) { setErr("API key not configured. Please contact admin."); return; }
    if (!essay.trim() || wc < 50) { setErr("Bài viết phải ít nhất 50 từ."); return; }
    setErr("");
    const wcPenalty = wc < minWC;
    const sys = `You are an IELTS Writing examiner. Respond with ONLY a valid JSON object — no markdown, no backticks, no text before or after the JSON.`;
    const scorePrompt = `Score this ${question.task} (${question.type || "Essay"}) on 4 IELTS criteria (bands 1-9, 0.5 steps). Word count: ${wc} (min ${minWC})${wcPenalty ? " — UNDER MINIMUM, reduce TA by 1" : ""}.
Task prompt: ${question.questionText}
Essay: ${essay}
Reply ONLY with: {"TA":6,"CC":6,"LR":6,"GRA":6,"overall":6,"wcPenalty":${wcPenalty}}`;
    const feedbackPrompt = sc => `You are an IELTS examiner. Essay scored TA=${sc.TA} CC=${sc.CC} LR=${sc.LR} GRA=${sc.GRA}.
Task: ${question.task} — ${question.type || "Essay"}
Prompt: ${question.questionText}
Essay: ${essay}
Reply ONLY with this JSON (fill every field with real feedback):
{"TA_en":"3-4 sentences","TA_vi":"Vietnamese","CC_en":"3-4 sentences","CC_vi":"Vietnamese","LR_en":"3-4 sentences","LR_vi":"Vietnamese","GRA_en":"3-4 sentences","GRA_vi":"Vietnamese","summary_en":"2 sentences","summary_vi":"Vietnamese","tips_en":"3 improvement tips","tips_vi":"Vietnamese","wcNote_en":"${wcPenalty ? `Essay is ${wc} words, under the ${minWC}-word minimum. TA reduced by 1 band.` : ""}","wcNote_vi":"${wcPenalty ? `Bài viết có ${wc} từ, dưới mức tối thiểu ${minWC} từ. Điểm TA bị trừ 1 band.` : ""}"}`;
    try {
      setLoading("scoring");
      const imgContent = [];
      if (imgB64) { const mt = imgFile?.type?.startsWith("image/") ? imgFile.type : "image/jpeg"; imgContent.push({ type: "image", source: { type: "base64", media_type: mt, data: imgB64 } }); }
      imgContent.push({ type: "text", text: scorePrompt });
      const scores = await callAnthropicAPI([{ role: "user", content: imgContent }], sys, 300);
      const missingS = ["TA", "CC", "LR", "GRA", "overall"].filter(k => scores[k] == null);
      if (missingS.length) throw new Error(`Missing score fields: ${missingS.join(", ")}`);
      setLoading("feedback");
      const fb = await callAnthropicAPI([{ role: "user", content: feedbackPrompt(scores) }], sys, 1500);
      const missingF = ["TA_en", "CC_en", "LR_en", "GRA_en", "summary_en"].filter(k => !fb[k]);
      if (missingF.length) throw new Error(`Missing feedback fields: ${missingF.join(", ")}`);
      const result = {
        scores: { TA: scores.TA, CC: scores.CC, LR: scores.LR, GRA: scores.GRA, overall: scores.overall },
        wordCountNote: { en: fb.wcNote_en || "", vi: fb.wcNote_vi || "" },
        feedback: fb, improvements: { en: fb.tips_en || "", vi: fb.tips_vi || "" }
      };
      const sub = { id: Date.now().toString(), date: new Date().toLocaleDateString("vi-VN"), task: question.task, qtype: question.type, qid: question.id, prompt: question.questionText, essay, scores: result.scores, feedback: fb, improvements: result.improvements, wordCountNote: result.wordCountNote, wordCount: wc };
      saveUser({ ...currentUser, submissions: [...(currentUser?.submissions || []), sub] });
      onResult({ ...result, essay, wc, sub });
    } catch (e) { console.error(e); setErr(`Lỗi: ${e.message}`); }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-5">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-red-600 mb-4 flex items-center gap-1">← Quay lại</button>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${question.task === "Task 1" ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}>{question.task}</span>
            {question.type && <span className={`text-xs font-medium px-2 py-1 rounded-full ${TYPE_COLORS[question.type] || "bg-gray-100 text-gray-600"}`}>{question.type}</span>}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Question / Đề bài</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">{question.questionText}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Chart / Image</p>
            {imgPreview
              ? <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <TaskImage url={imgPreview} alt="uploaded chart" className="max-h-48 w-full" />
                <button onClick={() => { setImgPreview(null); setImgB64(null); setImgFile(null); }} className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg z-10">✕</button>
              </div>
              : <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-red-300 hover:bg-red-50 transition">
                <div className="text-3xl mb-1">🖼️</div>
                <p className="text-sm text-gray-500">Upload chart/image (optional)</p>
                <p className="text-xs text-gray-400 mt-0.5">Click to browse · Max 4MB</p>
              </div>
            }
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImg(e.target.files[0])} />
            {!imgPreview && <button onClick={() => fileRef.current?.click()} className="mt-2 text-xs text-red-600 hover:underline">+ Upload image</button>}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bài viết của bạn</p>
          <textarea className="flex-1 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 min-h-64" placeholder={`Write your ${question.task} response here...`} value={essay} onChange={e => setEssay(e.target.value)} />
          <div className={`mt-2 text-xs font-medium ${wcMet ? "text-green-600" : "text-gray-400"}`}>{wc} / {minWC} words ({question.task} minimum){wcMet ? " ✓" : ""}</div>
          {err && <p className="text-red-500 text-xs mt-2 break-words">{err}</p>}
          <button onClick={submit} disabled={!!loading} className="mt-4 bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white font-bold py-3 rounded-xl transition">
            {loading === "scoring" ? "⏳ Đang tính điểm..." : loading === "feedback" ? "💬 Đang viết nhận xét..." : "🎯 Nộp bài / Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ReviewView ───────────────────────────────────────────────────────────────
function ReviewView({ state, onBack }) {
  const { question, result } = state;
  const { scores, feedback, improvements, wordCountNote, wc } = result;
  const [feedTab, setFeedTab] = useState("TA");
  const cmap = { TA: "Task Achievement", CC: "Coherence & Cohesion", LR: "Lexical Resource", GRA: "Grammar & Accuracy" };
  const bc = b => b >= 7 ? "text-green-600" : b >= 5.5 ? "text-yellow-500" : "text-red-500";
  const bb = b => b >= 7 ? "bg-green-50 border-green-200" : b >= 5.5 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  const wcNoteEn = wordCountNote?.en || feedback?.wcNote_en || "";
  const wcNoteVi = wordCountNote?.vi || feedback?.wcNote_vi || "";
  const tipsEn = improvements?.en || feedback?.tips_en || "";
  const tipsVi = improvements?.vi || feedback?.tips_vi || "";
  return (
    <div className="max-w-5xl mx-auto p-5">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-red-600 mb-4 flex items-center gap-1">← Quay lại thư viện</button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        {wcNoteEn && <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-700">⚠️ <strong>Word count:</strong> {wcNoteEn}{wcNoteVi && <p className="text-red-500 italic text-xs mt-0.5">{wcNoteVi}</p>}</div>}
        <div className="flex items-center justify-between mb-3">
          <div><p className="font-bold text-gray-800">Kết quả chấm bài</p><p className="text-xs text-gray-400">{question.task} · {question.type}{wc ? ` · ${wc} words` : ""}</p></div>
          <div className="text-center"><div className={`text-3xl font-bold ${bc(scores.overall)}`}>{scores.overall}</div><div className="text-xs text-gray-400">Overall Band</div></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(cmap).map(([k, l]) => (
            <div key={k} className={`rounded-xl border p-2 text-center ${bb(scores[k])}`}>
              <div className={`text-xl font-bold ${bc(scores[k])}`}>{scores[k]}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-5 gap-5">
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Question / Đề bài</p>
            {question.imageUrl && <TaskImage url={question.imageUrl} alt="question chart" className="mb-3 max-h-48 w-full" />}
            <p className="text-sm text-gray-700 leading-relaxed">{question.questionText}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Bài viết của bạn</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✅ Đã chấm</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result.essay}</p>
          </div>
          {tipsEn && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 uppercase mb-2">💡 Gợi ý cải thiện</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{tipsEn}</p>
            {tipsVi && <p className="text-sm text-gray-500 italic mt-2 whitespace-pre-line">{tipsVi}</p>}
          </div>}
        </div>
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Nhận xét chi tiết</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {Object.entries(cmap).map(([k]) => (
                <button key={k} onClick={() => setFeedTab(k)} className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${feedTab === k ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{k}</button>
              ))}
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs font-bold text-gray-600 mb-1">{cmap[feedTab]} — Band {scores[feedTab]}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{feedback?.[`${feedTab}_en`] || ""}</p>
                {feedback?.[`${feedTab}_vi`] && <p className="text-sm text-gray-500 italic mt-2">{feedback[`${feedTab}_vi`]}</p>}
              </div>
              {feedback?.summary_en && <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-1">📝 Tổng kết</p>
                <p className="text-sm text-gray-700">{feedback.summary_en}</p>
                {feedback.summary_vi && <p className="text-sm text-gray-500 italic mt-1">{feedback.summary_vi}</p>}
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HistoryView ──────────────────────────────────────────────────────────────
function HistoryView({ currentUser }) {
  const subs = currentUser?.submissions || [];
  if (!subs.length) return <div className="text-center text-gray-400 py-20"><div className="text-5xl mb-3">📭</div><p>Chưa có bài viết nào.</p></div>;
  return (
    <div className="max-w-3xl mx-auto p-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử bài viết</h2>
      <div className="space-y-3">
        {[...subs].reverse().map(s => (
          <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.task === "Task 1" ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}>{s.task}</span>
                {s.qtype && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s.qtype}</span>}
                <span className="text-xs text-gray-400">{s.date}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{s.prompt}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-400">
                {["TA", "CC", "LR", "GRA"].map(k => <span key={k}>{k}: <strong className="text-gray-600">{s.scores?.[k]}</strong></span>)}
              </div>
            </div>
            <div className="text-center shrink-0"><div className="text-2xl font-bold text-red-600">{s.scores?.overall}</div><div className="text-xs text-gray-400">Overall</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AnalyticsView ────────────────────────────────────────────────────────────
function AnalyticsView({ currentUser, profile }) {
  const subs = currentUser?.submissions || [];
  if (!subs.length) return <div className="text-center text-gray-400 py-20"><div className="text-5xl mb-3">📊</div><p>Chưa có dữ liệu. Nộp bài để xem tiến độ.</p></div>;
  if (subs.length < 2) return (
    <div className="text-center text-gray-400 py-20"><div className="text-5xl mb-3">📈</div>
      <p className="font-medium text-gray-600">Nộp ít nhất 2 bài để xem biểu đồ tiến độ.</p>
      <p className="text-sm mt-1">Submit at least 2 essays to see your progress charts.</p>
      <div className="mt-3 text-sm">Bạn đã nộp <strong>{subs.length}</strong> bài. Cần thêm <strong>{2 - subs.length}</strong> bài.</div>
    </div>
  );
  const chartData = subs.map((s, i) => ({ name: `#${i + 1}`, TA: s.scores?.TA, CC: s.scores?.CC, LR: s.scores?.LR, GRA: s.scores?.GRA, Overall: s.scores?.overall }));
  const avg = k => (subs.reduce((a, s) => a + (s.scores?.[k] || 0), 0) / subs.length).toFixed(1);
  const target = parseFloat(profile.targetBand) || 7;
  const latest = subs[subs.length - 1];
  return (
    <div className="max-w-3xl mx-auto p-5 space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Tiến độ học tập</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[["TA", "Task Achievement"], ["CC", "Coherence & Cohesion"], ["LR", "Lexical Resource"], ["GRA", "Grammar"]].map(([k, l]) => (
          <div key={k} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{avg(k)}</div>
            <div className="text-xs text-gray-500 mt-1">{l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">Band Score Progress</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 9]} ticks={[0, 2, 4, 5, 6, 7, 8, 9]} tick={{ fontSize: 11 }} /><Tooltip /><Legend />
            <Line type="monotone" dataKey="Overall" stroke="#dc2626" strokeWidth={2} dot />
            <Line type="monotone" dataKey="TA" stroke="#7c3aed" strokeWidth={1.5} dot />
            <Line type="monotone" dataKey="CC" stroke="#0891b2" strokeWidth={1.5} dot />
            <Line type="monotone" dataKey="LR" stroke="#16a34a" strokeWidth={1.5} dot />
            <Line type="monotone" dataKey="GRA" stroke="#d97706" strokeWidth={1.5} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">Latest Essay Breakdown</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={[{ name: "Latest", TA: latest.scores?.TA, CC: latest.scores?.CC, LR: latest.scores?.LR, GRA: latest.scores?.GRA }]}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 9]} tick={{ fontSize: 11 }} /><Tooltip /><Legend />
            <Bar dataKey="TA" fill="#7c3aed" /><Bar dataKey="CC" fill="#0891b2" /><Bar dataKey="LR" fill="#16a34a" /><Bar dataKey="GRA" fill="#d97706" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
        🎯 Mục tiêu: <strong>{profile.targetBand}</strong> · Trung bình: <strong>{avg("Overall")}</strong> · Còn <strong>{Math.max(0, (target - parseFloat(avg("Overall"))).toFixed(1))}</strong> band
      </div>
    </div>
  );
}

// ─── QuestionBankEditor ───────────────────────────────────────────────────────
const EMPTY_Q = { task: "Task 2", type: "Opinion Essay", source: "Jaxtina Bank", questionText: "", imageUrl: "" };
function QuestionBankEditor({ questions, setQuestions }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_Q);
  const [search, setSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState("All");
  const filtered = questions.filter(q => {
    if (taskFilter !== "All" && q.task !== taskFilter) return false;
    if (search && !q.questionText.toLowerCase().includes(search.toLowerCase()) && !q.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const startEdit = q => { setEditId(q.id); setEditForm({ ...q }); setAdding(false); };
  const saveEdit = () => { setQuestions(p => p.map(q => q.id === editId ? { ...editForm } : q)); setEditId(null); setEditForm(null); };
  const cancelEdit = () => { setEditId(null); setEditForm(null); };
  const deleteQ = id => { if (window.confirm("Delete this question?")) setQuestions(p => p.filter(q => q.id !== id)); };
  const saveAdd = () => { if (!addForm.questionText.trim()) return; setQuestions(p => [...p, { ...addForm, id: `manual_${Date.now()}` }]); setAddForm(EMPTY_Q); setAdding(false); };
  const ue = (k, v) => setEditForm(p => ({ ...p, [k]: v }));
  const ua = (k, v) => setAddForm(p => ({ ...p, [k]: v }));
  const addTypes = addForm.task === "Task 1" ? TASK1_TYPES : TASK2_TYPES;
  const editTypes = editForm ? (editForm.task === "Task 1" ? TASK1_TYPES : TASK2_TYPES) : [];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="font-bold text-gray-800">Questions in Bank <span className="text-gray-400 font-normal">({questions.length})</span></h3>
        <div className="flex gap-2 flex-wrap">
          {["All", "Task 1", "Task 2"].map(t => (
            <button key={t} onClick={() => setTaskFilter(t)} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${taskFilter === t ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{t}</button>
          ))}
          <input className="border border-gray-200 rounded-lg px-3 py-1 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-red-300" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => { setAdding(true); setEditId(null); setAddForm(EMPTY_Q); }} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg">+ Add</button>
          {questions.length > 0 && <button onClick={() => { if (window.confirm("Clear ALL?")) setQuestions([]); }} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1.5 rounded-lg">🗑 Clear all</button>}
        </div>
      </div>
      {adding && (
        <div className="border-2 border-red-200 rounded-2xl p-4 bg-red-50 space-y-3">
          <p className="text-sm font-bold text-red-700">➕ New Question</p>
          <div className="grid grid-cols-3 gap-3">
            {[["Task", "task", "Task 1", "Task 2"], ["Type", "type"], ["Source", "source"]].map(([label, key, ...opts]) => (
              <div key={key}><label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                {key === "task" ? <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={addForm.task} onChange={e => setAddForm(p => ({ ...p, task: e.target.value, type: e.target.value === "Task 1" ? TASK1_TYPES[0] : TASK2_TYPES[0] }))}>
                  <option>Task 1</option><option>Task 2</option></select>
                  : key === "type" ? <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={addForm.type} onChange={e => ua("type", e.target.value)}>{addTypes.map(t => <option key={t}>{t}</option>)}</select>
                    : <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={addForm.source} onChange={e => ua("source", e.target.value)}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select>}
              </div>
            ))}
          </div>
          <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300" placeholder="Question text..." value={addForm.questionText} onChange={e => ua("questionText", e.target.value)} />
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Image URL (optional)" value={addForm.imageUrl} onChange={e => ua("imageUrl", e.target.value)} />
          <div className="flex gap-2">
            <button onClick={saveAdd} disabled={!addForm.questionText.trim()} className="bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white text-sm font-bold px-5 py-2 rounded-xl">Save</button>
            <button onClick={() => setAdding(false)} className="bg-gray-100 text-gray-600 text-sm px-5 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      )}
      {!questions.length && !adding && <p className="text-gray-400 text-sm py-4 text-center">No questions yet.</p>}
      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((q) => (
          <div key={q.id} className="border border-gray-100 rounded-2xl overflow-hidden">
            {editId === q.id ? (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-yellow-700">✏️ Editing</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs font-semibold text-gray-600 block mb-1">Task</label>
                    <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={editForm.task} onChange={e => setEditForm(p => ({ ...p, task: e.target.value, type: e.target.value === "Task 1" ? TASK1_TYPES[0] : TASK2_TYPES[0] }))}>
                      <option>Task 1</option><option>Task 2</option></select></div>
                  <div><label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                    <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={editForm.type} onChange={e => ue("type", e.target.value)}>{editTypes.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs font-semibold text-gray-600 block mb-1">Source</label>
                    <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={editForm.source} onChange={e => ue("source", e.target.value)}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
                </div>
                <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300" value={editForm.questionText} onChange={e => ue("questionText", e.target.value)} />
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={editForm.imageUrl || ""} onChange={e => ue("imageUrl", e.target.value)} placeholder="Image URL (optional)" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-bold px-5 py-2 rounded-xl">💾 Save</button>
                  <button onClick={cancelEdit} className="bg-gray-100 text-gray-600 text-sm px-5 py-2 rounded-xl">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-white transition">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1.5 mb-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.task === "Task 1" ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}>{q.task}</span>
                    {q.type && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[q.type] || "bg-gray-100 text-gray-600"}`}>{q.type}</span>}
                    {q.source && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{q.source}</span>}
                    {q.imageUrl && <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-600">🖼 Image</span>}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{q.questionText}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(q)} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium px-3 py-1.5 rounded-lg">✏️</button>
                  <button onClick={() => deleteQ(q.id)} className="text-xs bg-red-100 hover:bg-red-200 text-red-600 font-medium px-3 py-1.5 rounded-lg">🗑</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AdminScreen ──────────────────────────────────────────────────────────────
function AdminScreen({ users, questions, setQuestions, auth, form, setForm, error, onLogin, onBack, onExport }) {
  const [adminTab, setAdminTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [csvErr, setCsvErr] = useState("");
  const [csvOk, setCsvOk] = useState("");
  const fileRef = useRef();

  function handleCSV(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = parseQuestionsCSV(e.target.result);
        if (!parsed.length) { setCsvErr("Không tìm thấy câu hỏi hợp lệ."); return; }
        setQuestions(prev => { const ids = new Set(prev.map(q => q.questionText)); return [...prev, ...parsed.filter(q => !ids.has(q.questionText))]; });
        setCsvOk(`✅ Đã thêm ${parsed.length} câu hỏi.`); setCsvErr("");
      } catch { setCsvErr("Lỗi đọc file CSV."); }
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const rows = [
      ["task", "type", "source", "question_text", "image_url"],
      ["Task 1", "Bar Chart", "Actual Test", "The chart below shows... Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", "https://example.com/chart.png"],
      ["Task 1", "Line Graph", "Cambridge IELTS", "The graph below shows... Summarise the information.", ""],
      ["Task 1", "GT - Formal Letter", "Jaxtina Bank", "You recently bought a piece of equipment for your kitchen but it did not work. Write a letter to the shop manager.", ""],
      ["Task 2", "Opinion Essay", "Actual Test", "Some people think... To what extent do you agree or disagree?", ""],
      ["Task 2", "Discussion Essay", "Cambridge IELTS", "Some people believe... Discuss both views and give your own opinion.", ""],
      ["Task 2", "Problem & Solution", "Jaxtina Bank", "In many cities... What are the causes? What measures could be taken?", ""],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const b = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "jaxtina_questions_template.csv"; a.click();
  }

  if (!auth) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl">J</div>
          <div><h2 className="text-xl font-bold text-gray-800">Admin Login</h2><p className="text-gray-400 text-xs">Jaxtina IELTS Examiner</p></div>
        </div>
        <div className="space-y-3">
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Username" value={form.user} onChange={e => setForm(p => ({ ...p, user: e.target.value }))} />
          <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Password" value={form.pass} onChange={e => setForm(p => ({ ...p, pass: e.target.value }))} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={onLogin} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl">Đăng nhập</button>
          <button onClick={onBack} className="w-full text-gray-400 hover:text-gray-600 text-sm py-1">← Quay lại</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-lg">🛠️ Admin Panel — Jaxtina IELTS</span>
        <div className="flex gap-3">
          <button onClick={onExport} className="bg-green-500 hover:bg-green-400 text-white text-sm px-4 py-1.5 rounded-lg font-medium">⬇️ Export CSV</button>
          <button onClick={onBack} className="text-gray-300 hover:text-white text-sm border border-gray-600 px-3 py-1.5 rounded-lg">← Exit</button>
        </div>
      </header>
      <div className="flex gap-1 bg-gray-800 px-6 py-2">
        {[["users", "👥 Users"], ["questions", "📚 Question Bank"]].map(([k, l]) => (
          <button key={k} onClick={() => setAdminTab(k)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${adminTab === k ? "bg-white text-gray-900" : "text-gray-300 hover:bg-gray-700"}`}>{l}</button>
        ))}
      </div>
      <div className="max-w-5xl mx-auto p-6">
        {adminTab === "users" && (
          <>
            <div className="flex gap-4 text-sm text-gray-500 mb-4">
              <span>👥 Users: <strong>{users.length}</strong></span>
              <span>📝 Essays: <strong>{users.reduce((a, u) => a + (u.submissions?.length || 0), 0)}</strong></span>
            </div>
            {!users.length && <div className="text-center text-gray-400 py-12">No users yet.</div>}
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-800">{u.fullname} <span className="text-gray-400 font-normal text-sm">— {u.location}</span></div>
                      <div className="text-xs text-gray-500 mt-0.5">{u.email} · {u.mobile} · Age {u.age}</div>
                      <div className="text-xs text-gray-400">Band {u.currentBand} → {u.targetBand} · Joined {u.joined}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">{u.submissions?.length || 0} essays</span>
                      <button onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)} className="text-xs text-red-600 hover:underline">{selectedUser === u.id ? "Hide" : "View"}</button>
                    </div>
                  </div>
                  {selectedUser === u.id && u.submissions?.length > 0 && (
                    <div className="mt-4 border-t pt-4 space-y-2">
                      {u.submissions.map(s => (
                        <div key={s.id} className="bg-gray-50 rounded-xl p-3 text-xs flex justify-between items-start">
                          <div><span className="font-semibold">{s.task}</span> · {s.date} · {s.qtype}<div className="text-gray-400 mt-0.5">TA:{s.scores?.TA} CC:{s.scores?.CC} LR:{s.scores?.LR} GRA:{s.scores?.GRA}</div></div>
                          <span className="text-lg font-bold text-red-600">{s.scores?.overall}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {adminTab === "questions" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-1">Upload Question Bank</h3>
              <p className="text-sm text-gray-500 mb-4">Upload a CSV to add questions. Download the template first.</p>
              <div className="flex flex-wrap gap-3 mb-4">
                <button onClick={downloadTemplate} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium">⬇️ Download Template</button>
                <button onClick={() => fileRef.current?.click()} className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-lg font-medium">⬆️ Upload CSV</button>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => handleCSV(e.target.files[0])} />
              </div>
              {csvErr && <p className="text-red-500 text-sm">{csvErr}</p>}
              {csvOk && <p className="text-green-600 text-sm">{csvOk}</p>}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-500 mt-3">
                <p className="font-semibold text-gray-700 mb-1">CSV Columns:</p>
                <p><strong>task</strong> — Task 1 or Task 2 &nbsp;|&nbsp; <strong>type</strong> — e.g. Bar Chart, Opinion Essay &nbsp;|&nbsp; <strong>source</strong> — e.g. Cambridge IELTS &nbsp;|&nbsp; <strong>question_text</strong> — full prompt &nbsp;|&nbsp; <strong>image_url</strong> — optional</p>
              </div>
            </div>
            <QuestionBankEditor questions={questions} setQuestions={setQuestions} />
          </div>
        )}
      </div>
    </div>
  );
}
