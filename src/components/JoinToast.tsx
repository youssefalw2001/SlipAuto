import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface JoinEvent {
  id: number;
  wallet: string;
  flag: string;
  action: string;
  color: string;
}

const FLAGS = ["🇺🇸","🇧🇷","🇬🇧","🇩🇪","🇯🇵","🇰🇷","🇦🇺","🇨🇦","🇫🇷","🇸🇬","🇳🇱","🇸🇪","🇦🇪","🇲🇽","🇮🇳","🇿🇦","🇵🇭","🇹🇷","🇦🇷","🇨🇭"];

const WALLETS = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];

const ACTIONS = [
  { text: "entered the arena with 0.5 SOL",    color: "#00d470" },
  { text: "just stole 1.2 SOL",                color: "#ff7040" },
  { text: "opened a Rare Crate",               color: "#00d470" },
  { text: "reached PREDATOR level",            color: "#a060ff" },
  { text: "entered with 2.0 SOL",              color: "#00d470" },
  { text: "just got yoinked for 0.8 SOL",      color: "#ff4d00" },
  { text: "won the Swap Wheel — +3.4 SOL",     color: "#ffd200" },
  { text: "opened a Legendary Crate",          color: "#ff4d00" },
  { text: "entered the arena with 1.0 SOL",    color: "#00d470" },
  { text: "just hit a BOUNTY for +4.1 SOL",    color: "#ffd200" },
];

let nextId = 1;

export default function JoinToast() {
  const [events, setEvents] = useState<JoinEvent[]>([]);

  useEffect(() => {
    // First one after 3 seconds
    const first = setTimeout(() => fire(), 3000);

    const iv = setInterval(() => {
      fire();
    }, 18000 + Math.random() * 14000);

    return () => { clearTimeout(first); clearInterval(iv); };
  }, []);

  const fire = () => {
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const event: JoinEvent = {
      id:     nextId++,
      wallet: WALLETS[Math.floor(Math.random() * WALLETS.length)],
      flag:   FLAGS[Math.floor(Math.random() * FLAGS.length)],
      action: action.text,
      color:  action.color,
    };

    setEvents(prev => [...prev.slice(-2), event]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setEvents(prev => prev.filter(e => e.id !== event.id));
    }, 5000);
  };

  return (
    <div className="fixed bottom-5 left-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {events.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,   scale: 1   }}
            exit={{    opacity: 0, x: -30, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl max-w-[280px]"
            style={{
              background: 'rgba(12,12,26,0.95)',
              border: `1px solid ${e.color}25`,
              borderLeft: `3px solid ${e.color}`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            <span className="text-[16px] flex-shrink-0">{e.flag}</span>
            <div className="min-w-0">
              <span className="font-mono text-[10px] font-bold text-white">{e.wallet}</span>
              <p className="text-[11px] leading-tight mt-0.5" style={{ color: e.color }}>
                {e.action}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
