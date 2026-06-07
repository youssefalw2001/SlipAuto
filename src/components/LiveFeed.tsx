import { Crosshair, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface Item { id:number; wallet:string; target?:string; amount:number; game:"yoink"|"wheel"; win:boolean; }

const W=["7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x","Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w","Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n"];

const SEED:Item[]=[
  {id:1,wallet:W[0],target:W[5],amount:3.21,game:"yoink",win:true},
  {id:2,wallet:W[1],amount:5.44,game:"wheel",win:true},
  {id:3,wallet:W[2],target:W[3],amount:1.82,game:"yoink",win:true},
  {id:4,wallet:W[7],amount:8.12,game:"wheel",win:true},
  {id:5,wallet:W[4],target:W[6],amount:0.45,game:"yoink",win:false},
  {id:6,wallet:W[9],amount:4.30,game:"wheel",win:true},
  {id:7,wallet:W[10],target:W[8],amount:2.14,game:"yoink",win:true},
  {id:8,wallet:W[11],amount:6.70,game:"wheel",win:true},
  {id:9,wallet:W[3],target:W[0],amount:0.92,game:"yoink",win:true},
  {id:10,wallet:W[5],amount:3.15,game:"wheel",win:true},
];
let uid=100;

export default function LiveFeed() {
  const [items,setItems]=useState<Item[]>(SEED);
  useEffect(()=>{
    const iv=setInterval(()=>{
      uid++;
      const game:"yoink"|"wheel"=Math.random()>0.5?"yoink":"wheel";
      const win=game==="wheel"?true:Math.random()>0.22;
      setItems(p=>[...p.slice(-30),{id:uid,wallet:W[Math.floor(Math.random()*W.length)],target:game==="yoink"?W[Math.floor(Math.random()*W.length)]:undefined,amount:parseFloat((Math.random()*7+0.2).toFixed(2)),game,win}]);
    },5000);
    return()=>clearInterval(iv);
  },[]);

  return (
    <div className="border-b border-y-border overflow-hidden" style={{background:'rgba(7,7,16,0.8)',backdropFilter:'blur(8px)'}}>
      <div className="flex items-stretch h-9">
        <div className="flex-shrink-0 flex items-center gap-2 px-4 border-r border-y-border" style={{background:'rgba(255,77,0,0.06)'}}>
          <span className="w-1.5 h-1.5 rounded-full bg-y-green blink"/>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em]" style={{color:'#00d470'}}>Live</span>
        </div>
        <div className="flex-1 overflow-hidden flex items-center">
          <div className="ticker flex items-center gap-8 whitespace-nowrap px-5">
            {[...items,...items].map((e,i)=>(
              <span key={`${e.id}-${i}`} className="inline-flex items-center gap-2 text-[11px]">
                {e.game==="yoink"
                  ?<Crosshair className="w-3 h-3 flex-shrink-0" style={{color:'#ffd700'}}/>
                  :<RotateCcw className="w-3 h-3 flex-shrink-0" style={{color:'#7000ff'}}/>
                }
                <span className="font-mono" style={{color:'#8892a4'}}>{e.wallet}</span>
                <span className="font-semibold" style={{color:e.win?'#00d470':'#ff7040'}}>
                  {e.win?"+":"-"}{e.amount} SOL
                </span>
                {e.target&&<span style={{color:'#30304a'}}>{e.win?"from":""} {e.target}</span>}
                <span style={{color:'#16162a',margin:'0 6px'}}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
