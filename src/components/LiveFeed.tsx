import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, RotateCcw, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Item {
  id: number; wallet: string; target?: string;
  amount: number; game: "yoink" | "wheel"; win: boolean; isNew?: boolean;
}

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
];

const SEED: Item[] = [
  { id:1,  wallet:W[0],  target:W[5],  amount:3.21, game:"yoink", win:true  },
  { id:2,  wallet:W[1],                amount:5.44, game:"wheel", win:true  },
  { id:3,  wallet:W[2],  target:W[3],  amount:1.82, game:"yoink", win:true  },
  { id:4,  wallet:W[7],                amount:8.12, game:"wheel", win:true  },
  { id:5,  wallet:W[4],  target:W[6],  amount:0.45, game:"yoink", win:false },
  { id:6,  wallet:W[9],                amount:4.30, game:"wheel", win:true  },
  { id:7,  wallet:W[10], target:W[8],  amount:2.14, game:"yoink", win:true  },
  { id:8,  wallet:W[11],               amount:6.70, game:"wheel", win:true  },
  { id:9,  wallet:W[3],  target:W[0],  amount:0.92, game:"yoink", win:true  },
  { id:10, wallet:W[5],                amount:3.15, game:"wheel", win:true  },
];
let uid = 100;

/* Flash badge for big wins */
function FlashBadge({ amount }: { amount: number }) {
  if (amount < 3) return null;
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-mono font-bold"
      style={{
        background: amount >= 5 ? "rgba(255,215,0,0.2)" : "rgba(0,230,118,0.12)",
        border: `1px solid ${amount >= 5 ? "rgba(255,215,0,0.5)" : "rgba(0,230,118,0.3)"}`,
        color: amount >= 5 ? "#ffd700" : "#00e676",
      }}>
      {amount >= 5 ? <Zap className="w-2 h-2" /> : null}
      {amount >= 5 ? "BIG" : "WIN"}
    </motion.span>
  );
}

export default function LiveFeed() {
  const [items, setItems] = useState<Item[]>(SEED);

  useEffect(() => {
    const iv = setInterval(() => {
      uid++;
      const game: "yoink" | "wheel" = Math.random() > 0.5 ? "yoink" : "wheel";
      const win = game === "wheel" ? true : Math.random() > 0.22;
      const amount = parseFloat((Math.random() * 7 + 0.2).toFixed(2));
      setItems(prev => [
        ...prev.slice(-30),
        {
          id: uid,
          wallet: W[Math.floor(Math.random() * W.length)],
          target: game === "yoink" ? W[Math.floor(Math.random() * W.length)] : undefined,
          amount, game, win, isNew: true,
        },
      ]);
      setTimeout(() => setItems(p => p.map(x => x.id === uid ? { ...x, isNew: false } : x)), 800);
    }, 4800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="border-b overflow-hidden relative"
      style={{
        background: "rgba(5,6,12,0.92)",
        backdropFilter: "blur(10px)",
        borderColor: "rgba(255,255,255,0.05)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.03)",
      }}>
      <div className="flex items-stretch h-9">
        {/* Live label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 border-r"
          style={{ background: "rgba(0,230,118,0.06)", borderColor: "rgba(255,255,255,0.05)" }}>
          <span className="w-1.5 h-1.5 rounded-full blink" style={{ background: "#00e676", boxShadow: "0 0 6px #00e676" }} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em]" style={{ color: "#00e676" }}>
            Live
          </span>
        </div>

        {/* Ticker */}
        <div className="flex-1 overflow-hidden flex items-center">
          <div className="ticker flex items-center gap-10 whitespace-nowrap px-5">
            {[...items, ...items].map((e, i) => (
              <span key={`${e.id}-${i}`} className="inline-flex items-center gap-2 text-[11px]">
                {/* Game icon */}
                {e.game === "yoink"
                  ? <Crosshair className="w-3 h-3 flex-shrink-0" style={{ color: e.win ? "#ffd700" : "#8892a4" }} />
                  : <RotateCcw className="w-3 h-3 flex-shrink-0" style={{ color: "#a060ff" }} />
                }
                {/* Wallet */}
                <span className="font-mono" style={{ color: "#6a7080" }}>{e.wallet}</span>
                {/* Amount */}
                <span className="font-mono font-bold" style={{
                  color: e.win ? (e.amount >= 5 ? "#ffd700" : "#00e676") : "#ff5c7a",
                  textShadow: e.win && e.amount >= 5 ? "0 0 12px rgba(255,215,0,0.6)" : undefined,
                }}>
                  {e.win ? "+" : "-"}{e.amount} SOL
                </span>
                {/* Target */}
                {e.target && e.win && (
                  <span style={{ color: "#30384a" }}>
                    from <span className="font-mono" style={{ color: "#4a5268" }}>{e.target}</span>
                  </span>
                )}
                <FlashBadge amount={e.win ? e.amount : 0} />
                {/* Separator */}
                <span style={{ color: "#1a2030" }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
