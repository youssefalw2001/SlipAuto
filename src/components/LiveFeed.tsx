import { Crosshair, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface FeedItem {
  id: number;
  wallet: string;
  target?: string;
  amount: number;
  game: "yoink" | "wheel";
  success: boolean;
}

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
];

const SEED: FeedItem[] = [
  { id:1, wallet:W[0], target:W[5], amount:3.21, game:"yoink", success:true },
  { id:2, wallet:W[1], amount:5.44, game:"wheel", success:true },
  { id:3, wallet:W[2], target:W[3], amount:1.82, game:"yoink", success:true },
  { id:4, wallet:W[7], amount:8.12, game:"wheel", success:true },
  { id:5, wallet:W[4], target:W[6], amount:0.45, game:"yoink", success:false },
  { id:6, wallet:W[9], amount:4.30, game:"wheel", success:true },
  { id:7, wallet:W[10], target:W[8], amount:2.14, game:"yoink", success:true },
  { id:8, wallet:W[11], amount:6.70, game:"wheel", success:true },
];

let uid = 50;

export default function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>(SEED);

  useEffect(() => {
    const iv = setInterval(() => {
      uid++;
      const game: "yoink"|"wheel" = Math.random() > 0.5 ? "yoink" : "wheel";
      const success = game === "wheel" ? true : Math.random() > 0.2;
      const amount = parseFloat((Math.random() * 6 + 0.2).toFixed(2));
      const wallet = W[Math.floor(Math.random() * W.length)];
      const target = game === "yoink" ? W[Math.floor(Math.random() * W.length)] : undefined;
      setItems(prev => [...prev.slice(-25), { id: uid, wallet, target, amount, game, success }]);
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="border-b border-y-border bg-y-surface/50 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border-r border-y-border">
          <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" />
          <span className="text-[10px] font-mono font-medium text-y-muted uppercase tracking-wider">feed</span>
        </div>
        <div className="flex-1 overflow-hidden py-1.5">
          <div className="ticker-scroll flex items-center gap-6 whitespace-nowrap px-4">
            {[...items, ...items].map((e, i) => (
              <span key={`${e.id}-${i}`} className="inline-flex items-center gap-1.5 text-[11px]">
                {e.game === "yoink"
                  ? <Crosshair className="w-3 h-3 text-y-accent" />
                  : <RotateCcw className="w-3 h-3 text-y-accent2" />}
                <span className="font-mono text-y-muted">{e.wallet}</span>
                <span className={`font-semibold ${e.success ? "text-y-green" : "text-y-accent"}`}>
                  {e.success ? "+" : "-"}{e.amount} SOL
                </span>
                {e.target && (
                  <span className="text-y-dim">{e.success ? "from" : "→"} {e.target}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
