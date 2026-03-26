import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as dotenv from "dotenv";

// Load env BEFORE creating the Supabase client
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // ── Env validation ───────────────────────────────────────────────────
  if (!url || !key) {
    console.error("\n❌ Missing environment variables!");
    console.error("   NEXT_PUBLIC_SUPABASE_URL  :", url ? "✅ set" : "❌ MISSING");
    console.error("   SUPABASE_SERVICE_ROLE_KEY :", key ? "✅ set" : "❌ MISSING");
    console.error("\n   Make sure .env.local is in the project root and contains both values.\n");
    process.exit(1);
  }

  console.log("🔗 Connecting to:", url);

  const supabase = createClient(url, key);

  // ── Connectivity test ────────────────────────────────────────────────
  console.log("🔍 Testing Supabase connection...");
  const { error: pingErr } = await supabase
    .from("quiz_questions")
    .select("id")
    .limit(1);

  if (pingErr) {
    if (
      pingErr.message.includes("does not exist") ||
      pingErr.code === "42P01" ||
      pingErr.message.includes("relation")
    ) {
      console.error("\n❌ Table 'quiz_questions' does not exist in Supabase yet!");
      console.error("   Please run these migrations in your Supabase SQL Editor:");
      console.error("   1. supabase/migrations/20260318000003_rename_trivia_to_quiz.sql");
      console.error("   2. supabase/migrations/20260318000004_create_quiz_questions.sql\n");
      process.exit(1);
    }
    console.error("\n❌ Could not connect to Supabase:", pingErr.message);
    console.error("   Code:", pingErr.code);
    console.error("   Make sure your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct.\n");
    process.exit(1);
  }

  console.log("✅ Connected to Supabase successfully!\n");

  // ── Read CSV ─────────────────────────────────────────────────────────
  const csvPath = resolve(process.cwd(), "public/data/quiz_questions_full.csv");
  const raw = readFileSync(csvPath, "utf-8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  console.log(`📄 Found ${records.length} records in CSV`);

  // ── Fetch existing questions to avoid duplicates ──────────────────────
  const { data: existing, error: fetchErr } = await supabase
    .from("quiz_questions")
    .select("question");

  if (fetchErr) {
    console.error("❌ Failed to fetch existing questions:", fetchErr.message);
    process.exit(1);
  }

  const existingSet = new Set(existing?.map((r: any) => r.question.trim()) ?? []);
  console.log(`📊 ${existingSet.size} questions already in DB`);

  const toInsert = records
    .filter((r: any) => !existingSet.has(r.question.trim()))
    .map((r: any) => ({
      question:       r.question,
      options:        typeof r.options === "string"
        ? JSON.parse(r.options.replace(/""/g, '"'))
        : r.options,
      correct_answer: parseInt(r.correct_answer),
      category:       r.category,
      difficulty:     r.difficulty,
      fun_fact:       r.fun_fact   || null,
      source:         r.source     || null,
      grade_range:    r.grade_range || "Y6-Y11",
      active:         r.active !== "false",
    }));

  if (toInsert.length === 0) {
    console.log("\n✅ No new questions to insert — bank is up to date.");
    return;
  }

  console.log(`\n📥 Inserting ${toInsert.length} new questions...\n`);

  // ── Insert in batches of 50 ───────────────────────────────────────────
  const BATCH = 50;
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;
    const { error } = await supabase.from("quiz_questions").insert(batch);
    if (error) {
      failed += batch.length;
      console.error(`❌ Batch ${batchNum}: ${error.message} (code: ${error.code})`);
    } else {
      inserted += batch.length;
      console.log(`✅ Batch ${batchNum}: inserted ${batch.length} rows (total: ${inserted})`);
    }
  }

  console.log(`\n🎉 Done — ${inserted} inserted, ${existingSet.size} skipped as duplicates${failed > 0 ? `, ${failed} failed` : ""}.`);
}

seed().catch((err) => {
  console.error("\n💥 Unexpected error:", err);
  process.exit(1);
});
