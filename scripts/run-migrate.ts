import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await fetch("http://localhost:3000/api/admin/system/migrate", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}` }
    });

    console.log("Status:", res.status);
    console.log("Response:", await res.json());
}

run();
