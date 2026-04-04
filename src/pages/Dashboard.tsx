import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ShieldAlert, Activity, Globe, CheckCircle, ShieldX, Server, ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";
import { useNetwork } from "@/contexts/NetworkContext";

export default function Dashboard() {
  const { bandwidthData, totalTraffic, activeConnectionsCount, protocols, threats, threatsBlocked } = useNetwork();

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tableau de Bord & Statistiques</h1>
            <p className="text-sm text-foreground/60 mt-1">Analyse du trafic en temps réel et détection de menaces</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Surveillance Active
            </span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-foreground/60 font-medium">Trafic Total (OS)</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{totalTraffic}</div>
            <div className="flex items-center gap-1 text-xs text-primary mt-2">
              <ArrowUpRight className="h-3 w-3" /> En temps réel
            </div>
          </div>
          
          <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-foreground/60 font-medium">Connexions Actives</span>
              <Server className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{activeConnectionsCount}</div>
            <div className="flex items-center gap-1 text-xs text-blue-500 mt-2">
              <ArrowUpRight className="h-3 w-3" /> TCP Établies
            </div>
          </div>

          <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-foreground/60 font-medium">Menaces Bloquées</span>
              <ShieldX className="h-4 w-4 text-error" />
            </div>
            <div className="text-2xl font-bold">{threatsBlocked}</div>
            <div className="flex items-center gap-1 text-xs text-error mt-2">
              Auto-quarantaine active
            </div>
          </div>

          <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-foreground/60 font-medium">Score de Santé</span>
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">98%</div>
            <div className="flex items-center gap-1 text-xs text-foreground/50 mt-2">
              Réseau sécurisé
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bandwidth Area Chart */}
          <div className="lg:col-span-2 p-5 bg-foreground/5 border border-foreground/10 rounded-xl flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Bande Passante (Mbps)
            </h2>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bandwidthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="currentColor" 
                    opacity={0.3} 
                    fontSize={12} 
                    tickMargin={10} 
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    opacity={0.3} 
                    fontSize={12} 
                    tickFormatter={(value) => `${value}`} 
                    width={40}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-background)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-foreground)' }}
                    itemStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="in" 
                    name="Entrant (Mbps)" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorIn)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="out" 
                    name="Sortant (Mbps)" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOut)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Protocols Pie Chart */}
          <div className="p-5 bg-foreground/5 border border-foreground/10 rounded-xl flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              Répartition Protocoles
            </h2>
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocols}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {protocols.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{protocols.reduce((acc, curr) => acc + curr.value, 0)}</span>
                <span className="text-xs text-foreground/50">Connexions</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {protocols.map(p => (
                <div key={p.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-foreground/70">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Threat Intel */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Threat Intelligence List */}
          <div className="p-5 bg-foreground/5 border border-foreground/10 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-error" />
                Threat Intelligence (IP Distantes)
              </h2>
              <button className="text-xs text-primary hover:underline">Voir tout</button>
            </div>
            <div className="space-y-3">
              {threats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/40 space-y-4">
                  <CheckCircle className="h-12 w-12 text-emerald-500/50" />
                  <p>Aucune menace détectée. Le réseau est sécurisé.</p>
                </div>
              ) : (
                threats.map((threat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "p-2 rounded-full",
                        threat.severity === "high" ? "bg-red-500/10 text-red-500" :
                        threat.severity === "medium" ? "bg-amber-500/10 text-amber-500" :
                        "bg-emerald-500/10 text-emerald-500"
                      )}>
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{threat.type}</p>
                        <div className="flex items-center gap-2 text-xs text-foreground/60 mt-0.5">
                          <span className="font-mono">{threat.source}</span>
                          <span>•</span>
                          <span>{threat.desc}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-foreground/50">{threat.time}</div>
                      <span className={clsx(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block",
                        threat.status === "blocked" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {threat.status === "blocked" ? "Bloqué" : "Actif"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
