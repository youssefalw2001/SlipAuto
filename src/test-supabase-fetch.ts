import fetch from "node-fetch";

const SUPABASE_URL = "https://qjvpkkcbscsypymxyker.supabase.co";
const SUPABASE_KEY = "sb_publishable_0EmM78iwc7vHitvHeon28Q_lCU8WCjl";

async function run() {
  const url = `${SUPABASE_URL}/rest/v1/proof_vault_locked_model_5pct_compound_v1?model_bucket=eq.OPTIMIZED_VIP&order=rn.asc`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const rows = await res.json() as any[];
    console.log(`Successfully fetched ${rows.length} settled bet records!`);
    
    if (rows.length > 0) {
      console.log("\n--- Sample of first 5 settled bets ---");
      rows.slice(0, 5).forEach((r: any, idx: number) => {
        console.log(`\nBet ${idx + 1}:`);
        console.log(`Match Name:       ${r.match_name}`);
        console.log(`Event Date:       ${r.event_date}`);
        console.log(`Strategy Lane:    ${r.strategy_lane}`);
        console.log(`Public Signal:    ${r.public_signal_name}`);
        console.log(`First Set Score:  ${r.first_set_score}`);
        console.log(`Unit Result:      ${r.unit_result}`);
        console.log(`PnL:              ${r.pnl}`);
        console.log(`Balance After:    ${r.balance_after}`);
      });
      
      console.log("\n--- Unique strategy lanes found ---");
      const lanes = Array.from(new Set(rows.map((r: any) => r.strategy_lane)));
      console.log(lanes);

      console.log("\n--- Unique first set scores found ---");
      const scores = Array.from(new Set(rows.map((r: any) => r.first_set_score)));
      console.log(scores);
    }
  } catch (err: any) {
    console.error("Error fetching settled bets from Supabase:", err.message);
  }
}

run();
