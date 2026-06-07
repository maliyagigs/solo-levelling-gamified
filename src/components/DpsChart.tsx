import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { Award } from "lucide-react";

interface DpsChartProps {
  currentLobby: any;
  memberProfiles: { [key: string]: any };
}

export default function DpsChart({ currentLobby, memberProfiles }: DpsChartProps) {
  if (!currentLobby) return null;

  const contributions = currentLobby.contributions || {};
  const chartColors = ["#06b6d4", "#d946ef", "#6366f1", "#a855f7", "#ec4899"];
  
  // Extract and format data
  const rawChartData = Object.keys(contributions).map(member => ({
    name: member,
    value: contributions[member]?.damage || 0
  })).filter(item => item.value > 0);

  // Graceful fallback to simulated realistic proportions if no active damage recorded
  const isSimulated = rawChartData.length === 0;
  const finalChartData = !isSimulated ? rawChartData : (currentLobby.members || []).map((m: string, idx: number) => {
    const simulatedValues = [4650, 3120, 2480, 1850];
    return {
      name: m,
      value: simulatedValues[idx % simulatedValues.length]
    };
  });

  // Compute total damage
  const totalDmgPool = finalChartData.reduce((acc, curr) => acc + curr.value, 0);

  // Identify the top DPS MVP
  let mvpPlayer = "None";
  let mvpDamage = 0;
  let mvpPercentage = 0;

  finalChartData.forEach(item => {
    if (item.value > mvpDamage) {
      mvpDamage = item.value;
      mvpPlayer = item.name;
    }
  });

  if (totalDmgPool > 0) {
    mvpPercentage = Math.round((mvpDamage / totalDmgPool) * 100);
  }

  const mvpProfile = memberProfiles[mvpPlayer] || {};

  return (
    <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-[2.5rem] space-y-6 relative z-10 w-full">
      <div className="border-b border-slate-850 pb-4 text-center">
        <h3 className="font-mono font-black text-xs uppercase tracking-[0.25em] text-indigo-400">
          Damage Contribution Matrix (DPS Allocation)
        </h3>
        <p className="text-[9px] text-slate-500 font-mono uppercase mt-1">
          Tactical combat damage profiling completed by Sovereign mainframe
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts Pie Chart representation */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="h-64 sm:h-72 w-full flex items-center justify-center font-mono relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {finalChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = ((data.value / totalDmgPool) * 100).toFixed(1);
                      return (
                        <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-2xl font-mono text-[10px] space-y-1 shadow-2xl">
                          <p className="text-white font-extrabold uppercase">{data.name}</p>
                          <p className="text-indigo-400 font-bold">{data.value.toLocaleString()} HP DMG</p>
                          <p className="text-slate-400">{percent}% of Total DPS</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value, entry: any) => {
                    const payloadVal = entry?.payload?.value || 0;
                    const pct = totalDmgPool > 0 ? ((payloadVal / totalDmgPool) * 100).toFixed(0) : "0";
                    return (
                      <span className="text-[9.5px] text-slate-300 font-bold font-mono uppercase tracking-wider">
                        {value} <span className="text-slate-500 font-normal">({pct}%)</span>
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Overlay Stats */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] font-mono">Total Output</span>
              <span className="text-xs font-black text-white font-mono mt-0.5">{totalDmgPool.toLocaleString()}</span>
              <span className="text-[7.5px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">HP Damage</span>
            </div>
          </div>
          {isSimulated && (
            <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono uppercase px-2.5 py-1 rounded-full tracking-widest animate-pulse">
              * No manual targets engaged &bull; Simulating class attributes
            </span>
          )}
        </div>

        {/* Right: Combat MVP Highlight Commendation Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/15 via-slate-900/30 to-transparent border border-indigo-500/15 rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-[9.5px] font-mono font-black text-amber-450 uppercase tracking-[0.22em]">TACTICAL COMBAT MVP</span>
          </div>

          {mvpPlayer !== "None" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-amber-500/25 flex items-center justify-center font-mono font-bold text-lg text-amber-450 overflow-hidden shadow-lg relative shrink-0">
                  {mvpProfile.customAvatar ? (
                    <img loading="lazy" src={mvpProfile.customAvatar} alt={mvpPlayer} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    mvpPlayer.substring(0, 2).toUpperCase()
                  )}
                  <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 font-black text-[7.5px] px-1 rounded-br">MVP</div>
                </div>
                
                <div className="font-mono min-w-0">
                  <h4 className="text-sm font-black text-white uppercase italic truncate tracking-wide">{mvpPlayer}</h4>
                  <p className="text-[9px] text-slate-300 uppercase tracking-wider mt-0.5">
                    Fulfilling <span className="text-indigo-400 font-bold">{mvpProfile.hunterClass || "Vanguard"}</span> operations
                  </p>
                </div>
              </div>

              <blockquote className="text-[10px] font-mono text-slate-400 leading-relaxed border-l-2 border-amber-500/30 pl-3 italic">
                &ldquo;This coordinate hunter concentrated massive impact arrays, executing {mvpPercentage}% of the entire fleet dps payload.&rdquo;
              </blockquote>

              <div className="bg-slate-955/80 border border-slate-850/60 p-3.5 rounded-2xl font-mono text-[9.5px] space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Damage Logged:</span>
                  <span className="text-amber-455 font-bold">{mvpDamage.toLocaleString()} DMG</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tactical Share:</span>
                  <span className="text-indigo-400 font-extrabold">{mvpPercentage}% Share</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-1.5 mt-1 text-[8.5px] uppercase text-slate-500">
                  <span>Raid Class Level:</span>
                  <span className="text-slate-300">Level {mvpProfile.level || "15"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              Calculating metrics...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
