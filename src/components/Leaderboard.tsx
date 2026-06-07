import { motion } from "framer-motion";
import { Crosshair, Crown, RotateCcw, Trophy } from "lucide-react";
import { useState } from "react";

type P="daily"|"weekly"|"alltime";
interface Player{rank:number;wallet:string;stolen:number;games:number;winRate:number;game:"yoink"|"wheel"|"both";streak:number;}

const DATA:Record<P,Player[]>={
  daily:[
    {rank:1,wallet:"Ew7b...Ln0z",stolen:18.44,games:22,winRate:77,game:"yoink",streak:7},
    {rank:2,wallet:"Rk5h...Oc2p",stolen:12.21,games:31,winRate:65,game:"wheel",streak:4},
    {rank:3,wallet:"7xKp...3mNq",stolen:9.83,games:14,winRate:71,game:"both",streak:3},
    {rank:4,wallet:"Bz9r...Wf2j",stolen:7.50,games:28,winRate:57,game:"yoink",streak:2},
    {rank:5,wallet:"Hn6d...Yp1x",stolen:5.12,games:9,winRate:78,game:"wheel",streak:5},
    {rank:6,wallet:"Qm3a...Rt5u",stolen:4.87,games:17,winRate:53,game:"both",streak:1},
    {rank:7,wallet:"Jp8e...Ah9w",stolen:3.44,games:8,winRate:63,game:"yoink",streak:2},
    {rank:8,wallet:"Fs2c...Vg4k",stolen:2.91,games:24,winRate:46,game:"wheel",streak:0},
    {rank:9,wallet:"Nt4g...Sb7i",stolen:2.30,games:12,winRate:58,game:"yoink",streak:0},
    {rank:10,wallet:"Ux1f...Dm6y",stolen:1.88,games:6,winRate:42,game:"wheel",streak:0},
  ],
  weekly:[
    {rank:1,wallet:"Rk5h...Oc2p",stolen:88.32,games:142,winRate:68,game:"wheel",streak:9},
    {rank:2,wallet:"Ew7b...Ln0z",stolen:71.14,games:89,winRate:72,game:"yoink",streak:6},
    {rank:3,wallet:"Jp8e...Ah9w",stolen:54.20,games:201,winRate:55,game:"both",streak:4},
    {rank:4,wallet:"7xKp...3mNq",stolen:43.88,games:77,winRate:62,game:"yoink",streak:2},
    {rank:5,wallet:"Nt4g...Sb7i",stolen:38.55,games:55,winRate:67,game:"wheel",streak:6},
    {rank:6,wallet:"Wj9i...Ef3n",stolen:29.10,games:113,winRate:49,game:"both",streak:1},
    {rank:7,wallet:"Bz9r...Wf2j",stolen:22.40,games:44,winRate:55,game:"yoink",streak:0},
    {rank:8,wallet:"Qm3a...Rt5u",stolen:18.75,games:88,winRate:44,game:"wheel",streak:2},
    {rank:9,wallet:"Hn6d...Yp1x",stolen:14.22,games:31,winRate:58,game:"both",streak:1},
    {rank:10,wallet:"Fs2c...Vg4k",stolen:10.88,games:66,winRate:41,game:"yoink",streak:0},
  ],
  alltime:[
    {rank:1,wallet:"Jp8e...Ah9w",stolen:441.20,games:1204,winRate:61,game:"both",streak:14},
    {rank:2,wallet:"Rk5h...Oc2p",stolen:388.44,games:892,winRate:65,game:"wheel",streak:9},
    {rank:3,wallet:"Ew7b...Ln0z",stolen:312.80,games:677,winRate:70,game:"yoink",streak:6},
    {rank:4,wallet:"Nt4g...Sb7i",stolen:244.10,games:504,winRate:58,game:"wheel",streak:6},
    {rank:5,wallet:"7xKp...3mNq",stolen:198.60,games:431,winRate:55,game:"yoink",streak:3},
    {rank:6,wallet:"Wj9i...Ef3n",stolen:166.35,games:788,winRate:47,game:"both",streak:1},
    {rank:7,wallet:"Ux1f...Dm6y",stolen:133.90,games:302,winRate:53,game:"wheel",streak:2},
    {rank:8,wallet:"Bz9r...Wf2j",stolen:112.44,games:244,winRate:51,game:"yoink",streak:4},
    {rank:9,wallet:"Hn6d...Yp1x",stolen:88.20,games:188,winRate:49,game:"both",streak:0},
    {rank:10,wallet:"Qm3a...Rt5u",stolen:71.55,games:411,winRate:43,game:"wheel",streak:1},
  ],
};
const PRIZES:Record<P,string[]>={daily:["2 SOL","1 SOL","0.5 SOL"],weekly:["10 SOL","5 SOL","2 SOL"],alltime:["50 SOL","20 SOL","10 SOL"]};

export default function Leaderboard(){
  const[period,setPeriod]=useState<P>("weekly");
  const data=DATA[period];const prizes=PRIZES[period];
  return(
    <div className="space-y-6">
      <div className="card-hero">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[52px] leading-none text-white tracking-[0.06em] mb-1">LEADERBOARD</h1>
            <p className="text-[13px]" style={{color:'#8892a4'}}>Top stealers win SOL from the prize pool</p>
          </div>
          <div className="flex items-center gap-6">
            {prizes.map((p,i)=>(
              <div key={i} className="text-center">
                <p className="text-[10px] font-mono tracking-[0.1em]" style={{color:'#8892a4'}}>{i===0?"1ST":i===1?"2ND":"3RD"}</p>
                <p className="font-display text-[24px]" style={{color:i===0?'#ffd200':i===1?'#c0c0c0':'#cd7f32'}}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
        {(["daily","weekly","alltime"] as P[]).map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} className="px-5 py-2 rounded-lg text-[13px] font-semibold transition-all"
            style={{background:period===p?'#ffd700':'transparent',color:period===p?'#fff':'#8892a4',boxShadow:period===p?'0 4px 16px rgba(255,77,0,0.35)':'none'}}>
            {p==="alltime"?"All Time":p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>

      <div className="card-flat overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                {["#","Player","Game","Stolen","Games","Win%","Streak"].map(h=>(
                  <th key={h} className={`px-4 py-3 text-left font-mono uppercase tracking-[0.1em] ${["Games","Win%","Streak"].includes(h)?"hidden md:table-cell":""}`}
                    style={{color:'#30304a',fontSize:'10px'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((p,i)=>(
                <motion.tr key={p.rank} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                  style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:p.rank<=3?'rgba(255,210,0,0.015)':'transparent'}}
                  className="hover:bg-white/1 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-display text-[20px]" style={{color:p.rank===1?'#ffd200':p.rank===2?'#a0a0a0':p.rank===3?'#cd7f32':'#30304a'}}>{p.rank}</span>
                  </td>
                  <td className="px-4 py-3.5"><span className="font-mono font-medium text-white">{p.wallet}</span></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {(p.game==="yoink"||p.game==="both")&&<span className="pill pill-accent" style={{fontSize:'10px',padding:'2px 7px'}}><Crosshair className="w-2.5 h-2.5"/>Y</span>}
                      {(p.game==="wheel"||p.game==="both")&&<span className="pill pill-violet" style={{fontSize:'10px',padding:'2px 7px'}}><RotateCcw className="w-2.5 h-2.5"/>W</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="font-mono font-bold" style={{color:'#00d470'}}>{p.stolen.toFixed(2)}</span></td>
                  <td className="px-4 py-3.5 hidden md:table-cell" style={{color:'#8892a4'}}>{p.games}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell"><span style={{color:p.winRate>=65?'#00d470':p.winRate>=50?'#ffd200':'#8892a4',fontWeight:600}}>{p.winRate}%</span></td>
                  <td className="px-4 py-3.5 hidden md:table-cell">{p.streak>0?<span className="pill pill-yellow" style={{fontSize:'10px'}}>{p.streak}W</span>:<span style={{color:'#30304a'}}>—</span>}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5" style={{color:'#ffd200'}}/>
          <div>
            <p className="text-[13px] font-semibold text-white">Your Ranking</p>
            <p className="text-[11px]" style={{color:'#8892a4'}}>Connect wallet to see your position and claim prizes</p>
          </div>
        </div>
        <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} className="btn-yoink text-[13px] py-2.5">
          <Trophy className="w-3.5 h-3.5"/> Connect Wallet
        </motion.button>
      </div>
    </div>
  );
}
