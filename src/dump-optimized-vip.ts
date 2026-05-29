import fetch from "node-fetch";

const SUPABASE_URL = "https://qjvpkkcbscsypymxyker.supabase.co";
const SUPABASE_KEY = "sb_publishable_0EmM78iwc7vHitvHeon28Q_lCU8WCjl";

async function run() {
  const url = `${SUPABASE_URL}/rest/v1/proof_vault_locked_model_5pct_compound_v1?model_bucket=eq.OPTIMIZED_VIP&order=rn.asc`;
  const res = await fetch(url, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    console.error("HTTP error:", res.statusText);
    return;
  }

  const rows = await res.json() as any[];
  console.log(`Loaded ${rows.length} rows for OPTIMIZED_VIP`);
  
  if (rows.length === 0) return;

  // Print columns
  console.log("Columns:", Object.keys(rows[0]));

  let wins = 0;
  let losses = 0;
  let totalUnits = 0;
  let maxLossStreak = 0;
  let currentLossStreak = 0;

  console.log("\n--- DETAILED VIP ROW INSPECTION ---");
  rows.forEach((r, idx) => {
    const isWin = Number(r.unit_result) >= 0;
    if (isWin) {
      wins++;
      currentLossStreak = 0;
    } else {
      losses++;
      currentLossStreak++;
      if (currentLossStreak > maxLossStreak) {
        maxLossStreak = currentLossStreak;
      }
    }
    totalUnits += Number(r.unit_result);
    
    // Quick listing
    if (idx < 10 || idx >= rows.length - 10) {
      console.log(`[Row ${r.rn}] Date: ${r.event_date} | Lane: ${r.strategy_lane} | Match: ${r.match_name} | Score: ${r.first_set_score} | Result: ${r.unit_result}u | PnL: ${r.pnl} | Bal: ${r.balance_after}`);
    } else if (idx === 10) {
      console.log("... [middle rows truncated] ...");
    }
  });

  console.log("\n--- CALCULATED METRICS ---");
  console.log("Total Settled Rows:", rows.length);
  console.log("Wins:", wins);
  console.log("Losses:", losses);
  console.log("Hit Rate:", ((wins / rows.length) * 100).toFixed(2) + "%");
  console.log("Total VIP Units:", totalUnits.toFixed(4));
  console.log("Worst Loss Streak:", maxLossStreak);

  // Check for grading anomalies:
  // Core lanes: target scores are 6:2, 6:3, 6:4. If win, unit_result >= 0. If score is outside but profit >= 0 or vice versa, log it.
  console.log("\n--- GRADING VALIDATION REPORT ---");
  let coreWins = 0, coreTotal = 0;
  let reverseWins = 0, reverseTotal = 0;
  let researchWins = 0, researchTotal = 0;
  let v3Wins = 0, v3Total = 0;
  
  rows.forEach((r) => {
    const lane = r.strategy_lane || "";
    const score = r.first_set_score || "";
    const profit = Number(r.unit_result);
    const win = profit >= 0;
    
    let isCorrectScoreMatch = false;

    if (lane.includes("CORE_P1_")) {
      coreTotal++;
      const coreScores = ["6:2", "6:3", "6:4"];
      isCorrectScoreMatch = coreScores.includes(score);
      if (win) coreWins++;
    } else if (lane.includes("REVERSE")) {
      reverseTotal++;
      const reverseScores = ["2:6", "4:6", "5:7"];
      isCorrectScoreMatch = reverseScores.includes(score);
      if (win) reverseWins++;
    } else if (lane.includes("RESEARCH")) {
      researchTotal++;
      const researchScores = ["2:6", "4:6", "5:7"];
      isCorrectScoreMatch = researchScores.includes(score);
      if (win) researchWins++;
    } else if (lane.includes("V3")) {
      v3Total++;
      const v3Scores = ["3:6", "4:6", "5:7"];
      isCorrectScoreMatch = v3Scores.includes(score);
      if (win) v3Wins++;
    }

    // Verify grading mismatch
    if (win !== isCorrectScoreMatch) {
      console.log(`⚠️ GRADING MISMATCH ALERT for Row ${r.rn} (${lane}): Score=${score} | Profit=${profit}u | Classified as ${win ? "WIN" : "LOSS"} but matches target? ${isCorrectScoreMatch}`);
    }
  });

  console.log("\nLane Distributions & Subgroup Hit Rates:");
  console.log(`- Core: ${coreWins}/${coreTotal} (${coreTotal ? (coreWins/coreTotal*100).toFixed(1) : 0}%)`);
  console.log(`- Reverse: ${reverseWins}/${reverseTotal} (${reverseTotal ? (reverseWins/reverseTotal*100).toFixed(1) : 0}%)`);
  console.log(`- Research P2: ${researchWins}/${researchTotal} (${researchTotal ? (researchWins/researchTotal*100).toFixed(1) : 0}%)`);
  console.log(`- V3 Shape: ${v3Wins}/${v3Total} (${v3Total ? (v3Wins/v3Total*100).toFixed(1) : 0}%)`);
}

run();
