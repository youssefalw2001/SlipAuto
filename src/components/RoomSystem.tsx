import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { RefreshCw, Shuffle, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  levelId: number;
  onRoomChange: (roomId: number) => void;
  roomId: number;
  playerCount: number;
  potSOL: number;
}

const ARENA_NAMES  = ["", "Rookie Arena", "Hustler Arena", "Predator Arena", "APEX Arena"];
const ARENA_COLORS = ["", "#a0a0b0", "#00d470", "#a060ff", "#ff4d00"];

// Cap at 500 rooms max — keeps things clean and non-laggy
function roomForLevel(level: number): number {
  const ranges: Record<number, [number, number]> = {
    1: [301, 500],
    2: [151, 300],
    3: [51,  150],
    4: [1,   50 ],
  };
  const [min, max] = ranges[level] ?? [4000, 5100];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function RoomSystem({ levelId, onRoomChange, roomId, playerCount, potSOL }: Props) {
  const [finding, setFinding] = useState(false);

  const arenaColor = ARENA_COLORS[levelId] ?? "#a0a0b0";
  const arenaName  = ARENA_NAMES[levelId]  ?? "Rookie Arena";

  const findBiggerRoom = () => {
    setFinding(true);
    setTimeout(() => {
      // Find a room with a lower number (implies more established, more players)
      const newRoom = roomForLevel(Math.min(4, levelId + (Math.random() > 0.5 ? 1 : 0)));
      onRoomChange(newRoom);
      setFinding(false);
    }, 1200);
  };

  const randomRoom = () => {
    setFinding(true);
    setTimeout(() => {
      onRoomChange(roomForLevel(levelId));
      setFinding(false);
    }, 800);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 px-4 rounded-2xl"
      style={{
        background: `rgba(${arenaColor === '#00d470' ? '0,212,112' : arenaColor === '#a060ff' ? '160,96,255' : arenaColor === '#ff4d00' ? '255,77,0' : '160,160,176'},0.04)`,
        border: `1px solid ${arenaColor}20`,
        borderLeft: `3px solid ${arenaColor}`,
      }}
    >
      {/* Room info */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono tracking-[0.12em]" style={{ color: arenaColor }}>
              {arenaName}
            </span>
            <span className="text-[10px] font-mono" style={{ color: '#30304a' }}>·</span>
            <span className="font-mono text-[11px] font-bold text-white">
              Room #{roomId.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 font-mono" style={{ color: '#6060a0' }}>
              <Users className="w-3 h-3" />
              <NumberFlow value={playerCount} /> players
            </span>
            <span style={{ color: '#30304a' }}>·</span>
            <span className="font-mono" style={{ color: '#6060a0' }}>
              <NumberFlow value={parseFloat(potSOL.toFixed(2))} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /> SOL pot
            </span>
          </div>
        </div>
      </div>

      {/* Room actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          onClick={findBiggerRoom}
          disabled={finding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all disabled:opacity-40"
          style={{
            background: `${arenaColor}10`,
            borderColor: `${arenaColor}30`,
            color: arenaColor,
          }}
        >
          {finding ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Find Bigger Room
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          onClick={randomRoom}
          disabled={finding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all disabled:opacity-40"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.08)',
            color: '#6060a0',
          }}
        >
          <Shuffle className="w-3 h-3" />
          Random
        </motion.button>
      </div>
    </div>
  );
}
