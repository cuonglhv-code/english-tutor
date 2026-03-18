import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log("🔍 Checking Supabase tables...\n");

  for (const table of ["quiz_leaderboard", "trivia_leaderboard", "quiz_questions"]) {
    const { data, error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: false })
      .limit(3);
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists — ${count ?? data?.length ?? 0} rows`);
      if (data && data.length > 0) {
        console.log("   Columns:", Object.keys(data[0]).join(", "));
        console.log("   Sample:", JSON.stringify(data[0]).slice(0, 120));
      }
    }
    console.log();
  }
  // Test write to quiz_leaderboard
  console.log("🔍 Testing write to quiz_leaderboard...");
  const testRow = {
    name: "__diagnostic_test__",
    score: 1, total: 5, time_seconds: 30, question_count: 5,
    test_history: [{question:"test",options:["a","b","c","d"],correctAnswer:0,chosen:0,correct:true}]
  };
  const { data: insertedRow, error: insertErr } = await supabase
    .from("quiz_leaderboard").insert(testRow).select().single();

  if (insertErr) {
    console.log("❌ Write test FAILED:", insertErr.message, "code:", insertErr.code);
  } else {
    console.log("✅ Write test PASSED — row id:", insertedRow?.id);
    // Clean up the test row
    await supabase.from("quiz_leaderboard").delete().eq("id", insertedRow?.id);
    console.log("🧹 Test row cleaned up.");
  }
}

check().catch(console.error);
