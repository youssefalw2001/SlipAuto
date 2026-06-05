import React, { useState, useEffect, useRef } from "react";
import { Zap, Swords } from "lucide-react";

interface WinEvent {
  id: number;
  wallet: string;
  amount: number;
  game: "surge" | "wars";
  team?: "red" | "blue";
}

const WALLETS = [
  "7xKp...3mNq", "Bz9r...Wf2j", "4tLs...Ck8v", "Hn6d...Yp1x",
  "Qm3a...Rt5u", "Ew7b...Ln0z", "Fs2c...Vg4k", "Jp8e...Ah9w",
  "Ux1f...Dm6y", "Nt4g...Sb7i", "Rk5h...Oc2p", "Wj9i...Ef3n",
];

const INITIAL_EVENTS: WinEvent[] = [
  { id: 1, wallet: "Ew7b...Ln0z", amount: 3.21, game: "surge" },
  { id: 2, wallet: "Rk5h...Oc2p", amount: 5.44, game: "wars", team: "red" },
  { id: 3, wallet: "Bz9r...Wf2j", amount: 1.82, game: "surge" },
  { id: 4, wallet: "Jp8e...Ah9w", amount: 8.12, game: "wars", team: "blue" },
  { id: 5, wallet: "4tLs...Ck8v", amount: 2.55, game: "surge" },
  { id: 6, wallet: "Nt4g...Sb7i", amount: 4.30, game: "wars", team: "red" },
  { id: 7, wallet: "Qm3a...Rt5u", amount: 0.93, game: "surge" },
  { id: 8, wallet: "Ux1f...Dm6y", amount: 6.70, game: "wars", team: "blue" },
];

let nextId = 100;

export default function LiveWinFeed() {
  const [events, setEvents] = useState<WinEvent[]>(INITIAL_EVENTS);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const game: "surge" | "wars" = Math.random() > 0.5 ? "surge" : "wars";
      const amount = parseFloat((Math.random() * 10 + 0.5).toFixed(2));
      const wallet = WALLETS[Math.floor(Math.random() * WALLETS.length)];
      const team: "red" | "blue" | undefined = game === "wars" ? (Math.random() > 0.5 ? "red" : "blue") : undefined;
      nextId++;
      setEvents((prev) => [...prev.slice(-20), { id: nextId, wallet, amount, game, team }]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 bg-black/60 border-b border-white/5 overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-arena-purple/10 border-r border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-arena-green animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase text-arena-purple whitespace-nowrap">Live Wins</span>
        </div>

        {/* Scrolling Ticker */}
        <div className="overflow-hidden flex-1">
          <div
            ref={tickerRef}
            className="flex items-center gap-6 animate-ticker whitespace-nowrap px-4 py-2"
          >
            {[...events, ...events].map((e, i) => (
              <div key={`${e.id}-${i}`} className="flex items-center gap-2 text-xs flex-shrink-0">
                {e.game === "surge" ? (
                  <Zap className="w-3 h-3 text-arena-purple flex-shrink-0" />
                ) : (
                  <Swords className="w-3 h-3 text-arena-blue flex-shrink-0" />
                )}
                <span className="font-mono text-arena-muted">{e.wallet}</span>
                <span className="font-bold text-arena-green">won {e.amount} SOL</span>
                <span className="text-arena-muted/50">
                  {e.game === "surge"
                    ? "on The Surge"
                    : `on SOL Wars (${e.team?.toUpperCase()})`}
                </span>
                <span className="text-white/10 mx-2">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
