import fetch from "node-fetch";

const SUPABASE_URL = "https://qjvpkkcbscsypymxyker.supabase.co";
const SUPABASE_KEY = "sb_publishable_0EmM78iwc7vHitvHeon28Q_lCU8WCjl";

const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`
};

async function testEndpoint(tableName: string) {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?limit=5`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.log(`❌ Table/View ${tableName}: HTTP ${res.status} (${res.statusText})`);
      return null;
    }
    const data = await res.json() as any[];
    console.log(`✅ Table/View ${tableName}: Found ${data.length} sample rows.`);
    return data;
  } catch (err: any) {
    console.log(`❌ Table/View ${tableName}: Error - ${err.message}`);
    return null;
  }
}

async function testSummary(tableName: string) {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}`;
  try {
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json() as any[];
      console.log(`✅ Table ${tableName} overall size: ${data.length} records`);
      return data;
    }
  } catch (err) {}
  return null;
}

async function run() {
  console.log("=== INSPECTING CURRENT SUPABASE SCHEMAS ===");
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
    await testEndpoint(t);
  }

  console.log("\n=== LOADING FULL LEDGER AND AUDIT FOR REPORT VALIDATION ===");
  const ledger = await testSummary("proof_vault_locked_model_5pct_compound_v1");
  const audit = await testSummary("azuro_execution_audit_v1");

  if (ledger) {
    const modelRows = ledger.filter((r: any) => r.model_bucket === "OPTIMIZED_VIP");
    console.log(`\nFiltered OPTIMIZED_VIP settled rows: ${modelRows.length}`);
    
    // Check lanes present
    const lanes = Array.from(new Set(modelRows.map((r: any) => r.strategy_lane)));
    console.log("Active Lanes:", lanes);
    
    // Look for unexpected lanes
    const mixedUnwantedLanes = modelRows.filter((r: any) => r.strategy_lane === "VIP_P1_ATP_GS_MULTI" || r.strategy_lane === "CORE_P1_MIRROR_WTA_OTHER");
    console.log("Unwanted lanes mixed in:", mixedUnwantedLanes.length);

    // Scan for Grading Anomalies
    console.log("\nGrading sanity check on ledger rows...");
    modelRows.forEach((r: any, idx: number) => {
      const gGroup = r.strategy_lane || "";
      const win = Number(r.unit_result) >= 0;
      const score = r.first_set_score;
      
      // Basic check
      if (score === "6:0" || score === "6:1" || score === "6:2" || score === "6:3" || score === "6:4" || score === "7:5" || score === "7:6") {
        // Standard first set core win?
      }
    });
  }

  if (audit) {
    console.log(`\nAudit rows found: ${audit.length}`);
    const decisions = Array.from(new Set(audit.map((r: any) => r.decision)));
    console.log("Audit Decisions:", decisions);
    
    const decisionCounts: Record<string, number> = {};
    audit.forEach((r: any) => {
      decisionCounts[r.decision] = (decisionCounts[r.decision] || 0) + 1;
    });
    console.log("Decision Counts:", decisionCounts);
  }
}

run();
