import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  const csvPath = resolve(process.cwd(), "public/data/quiz_questions_full.csv");
  const raw = readFileSync(csvPath, "utf-8");

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Fetch existing questions to avoid duplicates
  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("question");
  
  const existingSet = new Set(existing?.map((r) => r.question.trim()) ?? []);

  const toInsert = records
    .filter((r: any) => !existingSet.has(r.question.trim()))
    .map((r: any) => ({
      question:       r.question,
      options:        typeof r.options === "string" ? JSON.parse(r.options.replace(/""/g, '"')) : r.options,
      correct_answer: parseInt(r.correct_answer),
      category:       r.category,
      difficulty:     r.difficulty,
      fun_fact:       r.fun_fact   || null,
      source:         r.source     || null,
      grade_range:    r.grade_range || "Y6-Y11",
      active:         r.active !== "false",
    }));

  if (toInsert.length === 0) {
    console.log("✅ No new questions to insert — bank is up to date.");
    return;
  }

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from("quiz_questions").insert(batch);
    if (error) {
      console.error(`❌ Batch ${i / BATCH + 1} failed:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`✅ Batch ${i / BATCH + 1}: inserted ${batch.length} rows`);
    }
  }

  console.log(`\n🎉 Done — ${inserted} new questions inserted, ${existingSet.size} duplicates skipped.`);
}

seed().catch(console.error);
