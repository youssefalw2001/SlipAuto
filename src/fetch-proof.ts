import fetch from "node-fetch";

async function run() {
  try {
    const res = await fetch("https://firstsetlab.run.place/proof.html");
    const html = await res.text();
    
    console.log("--- Extracting all script tags in full ---");
    const scripts = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];
    
    scripts.forEach((script, idx) => {
      if (script.toLowerCase().includes("supabase") || script.toLowerCase().includes("db")) {
        console.log(`\n================== SCRIPT TAG ${idx} ==================`);
        console.log(script);
      }
    });

  } catch (err) {
    console.error("Error fetching page:", err);
  }
}

run();
