import { AnimatePresence, motion } from "framer-motion";
import { Ghost, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FeedEvent {
  id: number;
  wallet: string;
  target?: string;
  amount: number;
  game: "yoink" | "wheel";
  type: "steal" | "win" | "fail";
}

const WALLETS = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
];

const INITIAL: FeedEvent[] = [
  { id:1,  wallet:"Ew7b...Ln0z", target:"Rk5h...Oc2p", amount:3.21, game:"yoink", type:"steal" },
  { id:2,  wallet:"Bz9r...Wf2j",                       amount:5.44, game:"wheel", type:"win"   },
  { id:3,  wallet:"7xKp...3mNq", target:"Hn6d...Yp1x", amount:1.82, game:"yoink", type:"steal" },
  { id:4,  wallet:"Jp8e...Ah9w",                       amount:8.12, game:"wheel", type:"win"   },
  { id:5,  wallet:"4tLs...Ck8v", target:"Qm3a...Rt5u", amount:0.92, game:"yoink", type:"steal" },
  { id:6,  wallet:"Nt4g...Sb7i",                       amount:4.30, game:"wheel", type:"win"   },
  { id:7,  wallet:"Rk5h...Oc2p", target:"Fs2c...Vg4k", amount:2.14, game:"yoink", type:"steal" },
  { id:8,  wallet:"Ux1f...Dm6y",                       amount:6.70, game:"wheel", type:"win"   },
];

let nextFeedId = 100;

export default function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(INITIAL);

  useEffect(() => {
    const iv = setInterval(() => {
      nextFeedId++;
      const game: "yoink" | "wheel" = Math.random() > 0.5 ? "yoink" : "wheel";
      const type: FeedEvent["type"] = game === "yoink"
        ? (Math.random() > 0.25 ? "steal" : "fail")
        : "win";
      const amount = parseFloat((Math.random() * 8 + 0.3).toFixed(2));
      const wallet = WALLETS[Math.floor(Math.random() * WALLETS.length)];
      const target = game === "yoink" ? WALLETS[Math.floor(Math.random() * WALLETS.length)] : undefined;
      setEvents(prev => [...prev.slice(-30), { id: nextFeedId, wallet, target, amount, game, type }]);
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, []);

  const label = (e: FeedEvent) => {
    if (e.game === "yoink" && e.type === "steal") return `😈 YOINKED ${e.target}`;
    if (e.game === "yoink" && e.type === "fail")  return `❌ YOINK failed on ${e.target}`;
    return `🎡 Won Swap Wheel`;
  };

  const amtColor = (e: FeedEvent) =>
    e.type === "fail" ? "text-yoink-pink" : "text-yoink-green";

  return (
    <div className="relative z-20 border-b border-white/5 bg-yoink-bg/70 backdrop-blur-md overflow-hidden">
      <div className="flex items-stretch">
        {/* Label pill */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 bg-yoink-pink/8 border-r border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-yoink-green animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase text-yoink-pink whitespace-nowrap tracking-widest hidden sm:block">
            Live Feed
          </span>
          <Ghost className="w-3 h-3 text-yoink-pink sm:hidden" />
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1 py-2">
          <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
            {[...events, ...events].map((e, i) => (
              <div key={`${e.id}-${i}`} className="flex items-center gap-2 text-xs flex-shrink-0">
                {e.game === "yoink"
                  ? <Ghost className="w-3 h-3 text-yoink-pink flex-shrink-0" />
                  : <RotateCcw className="w-3 h-3 text-yoink-purple flex-shrink-0" />
                }
                <span className="font-mono text-yoink-muted">{e.wallet}</span>
                <span className="font-bold text-white">{label(e)}</span>
                <span className={`font-mono font-bold ${amtColor(e)}`}>
                  {e.type === "fail" ? "-" : "+"}{e.amount} SOL
                </span>
                <span className="text-white/10 mx-1">·</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
