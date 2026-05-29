import fetch from "node-fetch";

const SUPABASE_URL = "https://qjvpkkcbscsypymxyker.supabase.co";
const SUPABASE_KEY = "sb_publishable_0EmM78iwc7vHitvHeon28Q_lCU8WCjl";

async function run() {
  console.log("=== DB INSPECTOR START ===");

  // 1. Get stats on proof_vault_locked_model_5pct_compound_v1
  try {
    const urlUniqueBuckets = `${SUPABASE_URL}/rest/v1/proof_vault_locked_model_5pct_compound_v1?select=model_bucket`;
    const res = await fetch(urlUniqueBuckets, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (res.ok) {
      const data = await res.json() as any[];
      console.log("Total rows in proof_vault_locked_model_5pct_compound_v1:", data.length);
      const buckets = Array.from(new Set(data.map(d => d.model_bucket)));
      console.log("Unique buckets in proof_vault_locked_model_5pct_compound_v1:", buckets);
      
      buckets.forEach(bucket => {
        const count = data.filter(d => d.model_bucket === bucket).length;
        console.log(`- Bucket "${bucket}": ${count} rows`);
      });
    } else {
      console.error("Failed to query unique buckets:", res.status, res.statusText);
    }
  } catch (e) {
    console.error("Error querying buckets:", e);
  }

  // 2. Are there other REST tables? Let's check some names
  const potentialTables = [
    "proof_vault_locked_model_rows_v1",
    "proof_vault_vip_pocket_booster_rows_v1",
    "proof_vault_premium_predictions_v1",
    "proof_vault_locked_model_summary_v1"
  ];

  for (const table of potentialTables) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`;
      const res = await fetch(url, {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        // Query count by requesting head
        const urlHead = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
        const resCount = await fetch(urlHead, {
          method: "HEAD",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Prefer": "count=exact"
          }
        });
        const countHeader = resCount.headers.get("content-range");
        console.log(`Table "${table}" exists. Content-range/Count:`, countHeader);
      } else {
        console.log(`Table "${table}" - Check returned status:`, res.status);
      }
    } catch (e) {
      console.log(`Table "${table}" - Error:`, e);
    }
  }

  console.log("=== DB INSPECTOR END ===");
}

run();
