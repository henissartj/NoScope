import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Square, Trash2, Filter, Search, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { Packet } from "@/utils/mockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const PROTOCOL_COLORS: Record<string, string> = {
  TCP: "bg-emerald-500/10 text-emerald-500",
  UDP: "bg-blue-500/10 text-blue-500",
  HTTP: "bg-green-500/10 text-green-500",
  DNS: "bg-cyan-500/10 text-cyan-500",
  "TLSv1.2": "bg-purple-500/10 text-purple-500",
  ICMP: "bg-pink-500/10 text-pink-500",
};

export default function Capture() {
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [filterText, setFilterText] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCapturing) {
      interval = setInterval(() => {
        try {
          // @ts-ignore
          const cp = window.require ? window.require('child_process') : null;
          if (cp) {
            cp.exec('powershell -Command "Get-NetTCPConnection | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess | Select -First 15 | ConvertTo-Json"', (err: any, stdout: string) => {
              if (!err && stdout) {
                try {
                  const data = JSON.parse(stdout);
                  const conns = Array.isArray(data) ? data : [data];
                  
                  const newPackets = conns.map((c: any, i: number) => ({
                id: `conn_${c.OwningProcess || 0}_${c.LocalPort}_${c.RemotePort}`,
                no: Date.now() % 100000 + i,
                timestamp: new Date().toISOString().split('T')[1].slice(0, -1),
                source: `${c.LocalAddress}:${c.LocalPort}`,
                destination: `${c.RemoteAddress}:${c.RemotePort}`,
                protocol: "TCP",
                length: 0, // Taille de paquet non disponible via Get-NetTCPConnection
                info: `State: ${c.State} | PID: ${c.OwningProcess || 'N/A'}`,
                state: c.State
              }));

                  setPackets((prev) => {
                    const merged = [...prev, ...newPackets];
                    if (merged.length > 1000) return merged.slice(merged.length - 1000);
                    return merged;
                  });
                  setHasFetched(true);
                } catch (e) {}
              }
            });
          }
        } catch (e) {}
      }, 2000); // Poll every 2 seconds for active connections
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  useEffect(() => {
    if (isCapturing && tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [packets, isCapturing]);

  const filteredPackets = packets.filter(
    (p) =>
      p.protocol.toLowerCase().includes(filterText.toLowerCase()) ||
      p.source.includes(filterText) ||
      p.destination.includes(filterText) ||
      p.info.toLowerCase().includes(filterText.toLowerCase())
  );

  const chartData = {
    labels: packets.slice(-20).map((p) => p.timestamp.split('.')[0]),
    datasets: [
      {
        fill: true,
        label: "Bande passante (Octets)",
        data: packets.slice(-20).map((p) => p.length),
        borderColor: "rgb(16, 185, 129)", // Tailwind primary
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: true, border: { display: false }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10 bg-background/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={clsx(
              "p-2 rounded-md transition-colors",
              isCapturing ? "bg-error/20 text-error hover:bg-error/30" : "bg-primary/20 text-primary hover:bg-primary/30"
            )}
            title={isCapturing ? "Arrêter la capture" : "Démarrer la capture"}
          >
            {isCapturing ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>
          <button
            onClick={() => setPackets([])}
            className="p-2 rounded-md bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors"
            title="Effacer les paquets"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <div className="w-px h-6 bg-foreground/10 mx-2" />
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-foreground/50" />
            <input
              type="text"
              placeholder="Appliquer un filtre d'affichage... <Ctrl+/>"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-96 bg-foreground/5 border border-foreground/10 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30"
            />
            {filterText && (
              <span className="absolute right-3 px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">Actif</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <span>Paquets : <span className="font-medium text-foreground">{packets.length}</span></span>
          <span className="mx-2">•</span>
          <span>Affiches : <span className="font-medium text-foreground">{filteredPackets.length}</span></span>
        </div>
      </div>

      {/* Real-time Traffic Graph */}
      <div className="h-24 bg-background/50 border-b border-foreground/10 px-4 py-2">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Packet List */}
      <div className="flex-1 overflow-auto" ref={tableRef}>
        <table className="w-full text-left text-sm whitespace-nowrap table-fixed">
          <thead className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-foreground/10 font-medium text-foreground/70">
            <tr>
              <th className="px-4 py-2 w-16">No.</th>
              <th className="px-4 py-2 w-28">Temps</th>
              <th className="px-4 py-2 w-56">Source</th>
              <th className="px-4 py-2 w-56">Destination</th>
              <th className="px-4 py-2 w-24">Protocole</th>
              <th className="px-4 py-2 w-20">Taille</th>
              <th className="px-4 py-2 w-auto">Info</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13px]">
            {filteredPackets.map((packet, idx) => (
              <tr
                key={packet.id}
                onClick={() => navigate(`/analyze/${packet.id}`)}
                className={clsx(
                  "cursor-pointer border-b border-foreground/5 transition-colors hover:bg-foreground/10",
                  idx % 2 === 0 ? "bg-transparent" : "bg-foreground/[0.02]"
                )}
              >
                <td className="px-4 py-1.5 text-foreground/50 truncate" title={packet.no.toString()}>{packet.no}</td>
                <td className="px-4 py-1.5 text-foreground/70 truncate" title={packet.timestamp}>{packet.timestamp}</td>
                <td className="px-4 py-1.5 truncate" title={packet.source}>{packet.source}</td>
                <td className="px-4 py-1.5 truncate" title={packet.destination}>{packet.destination}</td>
                <td className="px-4 py-1.5 truncate">
                  <span className={clsx("px-2 py-0.5 rounded text-xs font-semibold", PROTOCOL_COLORS[packet.protocol] || "bg-foreground/10")}>
                    {packet.protocol}
                  </span>
                </td>
                <td className="px-4 py-1.5 text-foreground/70 truncate" title={packet.length.toString()}>{packet.length}</td>
                <td className="px-4 py-1.5 text-foreground/90 truncate max-w-[400px]" title={packet.info}>
                  {packet.info}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPackets.length === 0 && !hasFetched && isCapturing && (
          <div className="flex flex-col items-center justify-center h-64 text-foreground/40">
            <Loader2 className="h-12 w-12 mb-4 animate-spin opacity-50" />
            <p>Écoute du trafic réseau en cours...</p>
          </div>
        )}
        
        {filteredPackets.length === 0 && (hasFetched || !isCapturing) && (
          <div className="flex flex-col items-center justify-center h-64 text-foreground/40">
            <Search className="h-12 w-12 mb-4 opacity-50" />
            <p>Aucun paquet ne correspond à ce filtre.</p>
          </div>
        )}
      </div>
    </div>
  );
}