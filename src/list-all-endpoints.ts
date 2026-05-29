import fetch from "node-fetch";

const SUPABASE_URL = "https://qjvpkkcbscsypymxyker.supabase.co";
const SUPABASE_KEY = "sb_publishable_0EmM78iwc7vHitvHeon28Q_lCU8WCjl";

async function run() {
  console.log("=== POLLING POSTGREST OPENAPI SCHEMA ===");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    if (res.ok) {
      const doc = await res.json() as any;
      if (doc && doc.paths) {
        console.log("Found REST endpoints in your Supabase schema:");
        const paths = Object.keys(doc.paths);
        paths.forEach(p => {
          console.log(`- ${p}`);
        });
      } else {
        console.log("No paths key found in OpenAPI doc");
      }
    } else {
      console.log("Error querying PostgREST schema root:", res.status, res.statusText);
    }
  } catch (e: any) {
    console.error("Error fetching OpenAPI schema:", e.message);
  }
}

run();
