import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

// Seeded random so numbers feel consistent
function seededRand(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

const BASE_PLAYERS   = 61284;
const BASE_ROOMS     = 5107;
const BASE_STOLEN_PM = 48.2; // SOL per minute
const BASE_WAGERED   = 4841209; // USD all time

export default function GlobalStats() {
  const [players, setPlayers]     = useState(BASE_PLAYERS);
  const [rooms, setRooms]         = useState(BASE_ROOMS);
  const [stolenPm, setStolenPm]   = useState(BASE_STOLEN_PM);
  const [wagered, setWagered]     = useState(BASE_WAGERED);
  const [tick, setTick]           = useState(0);

  // Slowly tick up players + wagered
  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      const delta = seededRand(Date.now() % 9999, 1, 4);
      setPlayers(p => p + delta);
      setRooms(r => r + (Math.random() > 0.6 ? 1 : 0));
      setStolenPm(s => parseFloat((s + (Math.random() * 2 - 0.5)).toFixed(1)));
      setWagered(w => w + seededRand(Date.now() % 777, 200, 900));
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="border-b border-y-border bg-y-base/60 backdrop-blur-md overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center gap-0 overflow-x-auto no-scrollbar py-2">

          {/* Players online */}
          <div className="flex items-center gap-2 pr-5 border-r border-y-border flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" />
            <span className="font-mono text-[11px] font-bold" style={{ color: '#00d470' }}>
              <NumberFlow value={players} />
            </span>
            <span className="text-[11px]" style={{ color: '#6060a0' }}>online</span>
          </div>

          {/* Active rooms */}
          <div className="flex items-center gap-2 px-5 border-r border-y-border flex-shrink-0">
            <span className="text-[11px] font-mono font-bold text-white">
              <NumberFlow value={rooms} />
            </span>
            <span className="text-[11px]" style={{ color: '#6060a0' }}>active rooms</span>
          </div>

          {/* SOL stolen/min */}
          <div className="flex items-center gap-2 px-5 border-r border-y-border flex-shrink-0">
            <span className="font-mono text-[11px] font-bold" style={{ color: '#ff7040' }}>
              <NumberFlow value={stolenPm} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
            </span>
            <span className="text-[11px]" style={{ color: '#6060a0' }}>SOL stolen/min</span>
          </div>

          {/* All-time wagered */}
          <div className="flex items-center gap-2 px-5 flex-shrink-0">
            <span className="font-mono text-[11px] font-bold text-white">
              ${<NumberFlow value={wagered} />}
            </span>
            <span className="text-[11px]" style={{ color: '#6060a0' }}>wagered all time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
