import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Play, Clock, Network, Server, HardDrive, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

interface NetInterface {
  id: string;
  name: string;
  type: string;
  ip: string;
  traffic: number;
  isUp: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const [interfaces, setInterfaces] = useState<NetInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInterfaces = () => {
    setLoading(true);
    try {
      // @ts-ignore
      const cp = window.require ? window.require('child_process') : null;
      if (cp) {
        cp.exec('powershell -Command "Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, MacAddress | ConvertTo-Json"', (err: any, stdout: string) => {
          if (!err && stdout) {
            try {
              const data = JSON.parse(stdout);
              const adapters = Array.isArray(data) ? data : [data];
              const realInterfaces = adapters.map((ad: any, i: number) => ({
                id: `eth${i}`,
                name: ad.Name,
                type: ad.InterfaceDescription.toLowerCase().includes('wi-fi') || ad.InterfaceDescription.toLowerCase().includes('wireless') ? 'wireless' : 'wired',
                ip: ad.MacAddress, // Utilisation de l'adresse MAC par défaut si l'IP n'est pas disponible immédiatement
                traffic: 0, // Traffic réel récupéré dans le dashboard
                isUp: ad.Status === "Up"
              }));
              
              // Also fetch IPs
              cp.exec('powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, IPAddress | ConvertTo-Json"', (err2: any, stdout2: string) => {
                if (!err2 && stdout2) {
                  try {
                    const ipData = JSON.parse(stdout2);
                    const ipArr = Array.isArray(ipData) ? ipData : [ipData];
                    realInterfaces.forEach((iface: any) => {
                      const match = ipArr.find((ipInfo: any) => ipInfo.InterfaceAlias === iface.name);
                      if (match) {
                        iface.ip = match.IPAddress;
                      }
                    });
                  } catch (e) {}
                }
                setInterfaces(realInterfaces);
                if (realInterfaces.length > 0) {
                  setSelectedInterface(realInterfaces.find((r: any) => r.isUp)?.id || realInterfaces[0].id);
                }
                setLoading(false);
              });

            } catch (e) {
              console.error("JSON parse error", e);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterfaces();
  }, []);

  const handleStartCapture = () => {
    if (selectedInterface) {
      navigate(`/capture?iface=${selectedInterface}`);
    } else {
      navigate("/capture");
    }
  };

  const RECENT_CAPTURES: any[] = [];

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Interfaces Réseau (OS Réel)
            </h2>
            <button onClick={fetchInterfaces} disabled={loading} className="text-foreground/50 hover:text-primary transition-colors">
              <RefreshCw className={clsx("h-5 w-5", loading && "animate-spin")} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading && interfaces.length === 0 ? (
              <div className="col-span-full py-8 text-center text-foreground/50">Récupération des interfaces...</div>
            ) : interfaces.map((iface) => {
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
                {RECENT_CAPTURES.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-foreground/50">
                      Aucune capture récente. Lancez une analyse pour commencer.
                    </td>
                  </tr>
                ) : (
                  RECENT_CAPTURES.map((capture) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}