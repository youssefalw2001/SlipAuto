import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

function seededRand(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

const BASE_PLAYERS   = 61284;
const BASE_ROOMS     = 487;
const BASE_STOLEN_PM = 48.2;
const BASE_WAGERED   = 4841209;

export default function GlobalStats() {
  const [players,  setPlayers]   = useState(BASE_PLAYERS);
  const [rooms,    setRooms]     = useState(BASE_ROOMS);
  const [stolenPm, setStolenPm]  = useState(BASE_STOLEN_PM);
  const [wagered,  setWagered]   = useState(BASE_WAGERED);
  const [pulse,    setPulse]     = useState(0);   // increment to trigger flash

  useEffect(() => {
    const iv = setInterval(() => {
      const delta = seededRand(Date.now() % 9999, 1, 4);
      setPlayers(p  => p + delta);
      setRooms(r    => Math.min(500, r + (Math.random() > 0.6 ? 1 : 0)));
      setStolenPm(s => parseFloat((s + (Math.random() * 2 - 0.5)).toFixed(1)));
      setWagered(w  => w + seededRand(Date.now() % 777, 200, 900));
      setPulse(p    => p + 1);
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(iv);
  }, []);

  const stats = [
    { label: "online",           value: players,  color: "#00e676", fmt: undefined },
    { label: "active rooms",     value: rooms,    color: "#ffffff", fmt: undefined },
    { label: "SOL/min stolen",   value: stolenPm, color: "#ff5c7a", fmt: { minimumFractionDigits: 1, maximumFractionDigits: 1 } as const },
    { label: "wagered all time", value: wagered,  color: "#ffd700", fmt: undefined },
  ];

  return (
    <div className="border-b overflow-hidden"
      style={{
        background: "rgba(4,5,10,0.88)",
        backdropFilter: "blur(8px)",
        borderColor: "rgba(255,255,255,0.04)",
      }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center gap-0 overflow-x-auto no-scrollbar py-2.5">
          {stats.map((s, i) => (
            <div key={s.label}
              className="flex items-center gap-2 flex-shrink-0"
              style={{
                paddingRight: 20, paddingLeft: i > 0 ? 20 : 0,
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              }}>
              {i === 0 && (
                <motion.span key={pulse}
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  initial={{ scale: 1.8, opacity: 0.9 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ background: "#00e676", boxShadow: "0 0 6px #00e676" }} />
              )}
              <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: s.color }}>
                <NumberFlow value={s.value} format={s.fmt} />
              </span>
              <span className="text-[11px]" style={{ color: "#4a5268" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
