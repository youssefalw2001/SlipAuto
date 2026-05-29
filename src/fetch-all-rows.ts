import fetch from "node-fetch";

const SUPABASE_URL = "https://qjvpkkcbscsypymxyker.supabase.co";
const SUPABASE_KEY = "sb_publishable_0EmM78iwc7vHitvHeon28Q_lCU8WCjl";

const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`
};

async function checkTable(tableName: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
      headers
    });
    if (res.ok) {
      const data = await res.json() as any[];
      console.log(`\n[TABLE: ${tableName}]`);
      console.log(`- Count of rows returned: ${data.length}`);
      if (data.length > 0) {
        console.log("- Keys available in row:", Object.keys(data[0]));
        // Unique model_buckets if any
        if (data[0].model_bucket) {
          const buckets = Array.from(new Set(data.map(d => d.model_bucket)));
          console.log("- Unique model_buckets:", buckets);
          buckets.forEach(b => {
            const count = data.filter(d => d.model_bucket === b).length;
            console.log(`  * ${b}: ${count} rows`);
          });
        }
        // Unique strategy_lanes if any
        if (data[0].strategy_lane) {
          const lanes = Array.from(new Set(data.map(d => d.strategy_lane)));
          console.log("- Unique strategy_lanes:", lanes.slice(0, 5), `(total ${lanes.length} unique)`);
        }
        // First set score frequencies
        if (data[0].first_set_score) {
          const scores = Array.from(new Set(data.map(d => d.first_set_score)));
          console.log("- Unique first_set_scores:", scores);
        }
      }
    } else {
      console.log(`\n[TABLE: ${tableName}] Failed to fetch. Status: ${res.status}`);
    }
  } catch (e: any) {
    console.error(`Error checking table ${tableName}:`, e.message);
  }
}

async function run() {
  const tables = [
    "proof_vault_locked_model_rows_v1",
    "proof_vault_locked_model_summary_v1",
    "proof_vault_locked_model_5pct_compound_v1",
    "proof_vault_vip_pocket_booster_rows_v1",
    "proof_vault_vip_pocket_booster_summary_v1",
    "azuro_execution_audit_v1",
    "azuro_bet_orders_v1"
  ];
  for (const t of tables) {
    await checkTable(t);
  }
}

run();
