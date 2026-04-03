import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Play, Clock, Network, Server, HardDrive } from "lucide-react";
import { clsx } from "clsx";

const MOCK_INTERFACES = [
  { id: "eth0", name: "Ethernet (eth0)", type: "wired", ip: "192.168.1.10", traffic: 450, isUp: true },
  { id: "wlan0", name: "Wi-Fi (wlan0)", type: "wireless", ip: "192.168.1.15", traffic: 1200, isUp: true },
  { id: "lo", name: "Loopback (lo)", type: "virtual", ip: "127.0.0.1", traffic: 0, isUp: true },
  { id: "docker0", name: "Docker Bridge", type: "virtual", ip: "172.17.0.1", traffic: 5, isUp: false },
];

const MOCK_RECENT_CAPTURES = [
  { id: "cap_1", name: "Analyse HTTP", date: "2026-04-03 09:15", packets: 12450, size: "14.2 MB" },
  { id: "cap_2", name: "Diagnostic DNS", date: "2026-04-02 14:30", packets: 830, size: "1.1 MB" },
  { id: "cap_3", name: "Trafic suspect TCP", date: "2026-04-01 11:45", packets: 450120, size: "512 MB" },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedInterface, setSelectedInterface] = useState(MOCK_INTERFACES[0].id);

  const handleStartCapture = () => {
    navigate("/capture");
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
            <p className="text-foreground/60 mt-1">Sélectionnez une interface pour commencer l'analyse réseau</p>
          </div>
          <button
            onClick={handleStartCapture}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-primary/20 transition-all active:scale-95 group"
          >
            <Play className="h-5 w-5 fill-current group-hover:animate-pulse" />
            Démarrage Rapide
          </button>
        </div>

        {/* Interfaces Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Interfaces Réseau
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {MOCK_INTERFACES.map((iface) => {
              const isSelected = selectedInterface === iface.id;
              return (
                <div
                  key={iface.id}
                  onClick={() => setSelectedInterface(iface.id)}
                  className={clsx(
                    "relative p-5 rounded-xl border cursor-pointer transition-all duration-200 group",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                      : "border-foreground/10 bg-background/50 hover:border-foreground/30 hover:bg-background"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={clsx("p-2 rounded-lg", isSelected ? "bg-primary/20 text-primary" : "bg-foreground/5 text-foreground/70")}>
                      {iface.type === "wired" ? <Server className="h-5 w-5" /> : 
                       iface.type === "wireless" ? <Activity className="h-5 w-5" /> : 
                       <HardDrive className="h-5 w-5" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={clsx("h-2.5 w-2.5 rounded-full", iface.isUp ? "bg-primary" : "bg-error")} />
                      <span className="text-xs text-foreground/60 uppercase">{iface.isUp ? "Up" : "Down"}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg">{iface.name}</h3>
                  <div className="text-sm text-foreground/60 mt-1 font-mono">{iface.ip}</div>
                  
                  {iface.isUp && (
                    <div className="mt-4 pt-4 border-t border-foreground/10 flex items-center justify-between">
                      <span className="text-xs text-foreground/50">Trafic Actuel</span>
                      <span className="text-sm font-medium text-primary">{iface.traffic} Kbps</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Captures */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-foreground/70" />
            Captures Récentes
          </h2>
          <div className="bg-background/50 border border-foreground/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-foreground/5 border-b border-foreground/10">
                <tr>
                  <th className="px-6 py-3 font-medium text-foreground/70">Nom</th>
                  <th className="px-6 py-3 font-medium text-foreground/70">Date</th>
                  <th className="px-6 py-3 font-medium text-foreground/70">Paquets</th>
                  <th className="px-6 py-3 font-medium text-foreground/70">Taille</th>
                  <th className="px-6 py-3 font-medium text-foreground/70 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {MOCK_RECENT_CAPTURES.map((capture) => (
                  <tr key={capture.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{capture.name}</td>
                    <td className="px-6 py-4 text-foreground/70">{capture.date}</td>
                    <td className="px-6 py-4 text-foreground/70">{capture.packets.toLocaleString('fr-FR')}</td>
                    <td className="px-6 py-4 text-foreground/70">{capture.size}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/analyze/${capture.id}`)}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}