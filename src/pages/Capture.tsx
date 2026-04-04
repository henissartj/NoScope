import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Square, Trash2, Filter, Search, Loader2, HelpCircle, X } from "lucide-react";
import { clsx } from "clsx";
import { Packet } from "@/utils/types";
import { useNetwork } from "@/contexts/NetworkContext";
import { compileFilter } from "../services/filterEngine";
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
  const { isCapturing, setIsCapturing, packets, clearPackets } = useNetwork();
  const [filterText, setFilterText] = useState("");
  const [isFilterValid, setIsFilterValid] = useState(true);
  const [filterError, setFilterError] = useState("");
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCapturing && tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [packets, isCapturing]);

  // Apply advanced filtering
  const filteredPackets = useMemo(() => {
    if (!filterText) {
      setIsFilterValid(true);
      setFilterError("");
      return packets;
    }

    const { isValid, error, evaluate } = compileFilter(filterText);
    setIsFilterValid(isValid);
    if (!isValid && error) {
      setFilterError(error);
      return packets; // Or return empty array depending on preference. Returning all to not break UI completely during typing.
    } else {
      setFilterError("");
    }

    return packets.filter(evaluate);
  }, [packets, filterText]);

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
            onClick={clearPackets}
            className="p-2 rounded-md bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors"
            title="Effacer les paquets"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <div className="w-px h-6 bg-foreground/10 mx-2" />
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
              className={clsx(
                "p-1.5 rounded-md transition-colors hover:bg-foreground/5",
                showSyntaxHelp ? "text-primary bg-primary/10" : "text-foreground/50"
              )}
              title="Aide syntaxe de filtre"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Filtre (ex: tcp.port == 443 || ip.src == 192.168.1.1)..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className={clsx(
                  "pl-9 pr-4 py-1.5 w-96 bg-foreground/5 border rounded-md text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-foreground/30 font-mono",
                  !isFilterValid && filterText 
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500 text-red-400" 
                    : filterText 
                      ? "border-primary/50 focus:border-primary focus:ring-primary text-primary/90"
                      : "border-foreground/10 focus:border-primary focus:ring-primary text-foreground"
                )}
              />
              {filterText && isFilterValid && (
                <span className="absolute right-3 px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">Actif</span>
              )}
              {filterText && !isFilterValid && filterError && (
                <div className="absolute top-full mt-1 right-0 text-xs text-red-500 bg-[#0d0d1a] border border-red-500/20 px-3 py-2 rounded shadow-2xl z-50 whitespace-nowrap">
                  {filterError}
                </div>
              )}
              
              {/* Syntax Help Popup */}
              {showSyntaxHelp && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-[#0d0d1a] border border-foreground/10 rounded-lg shadow-2xl z-50 p-4 text-sm animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3 border-b border-foreground/10 pb-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" /> Syntaxe de filtrage
                    </h4>
                    <button onClick={() => setShowSyntaxHelp(false)} className="text-foreground/50 hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-foreground/50 mb-1 uppercase font-semibold">Champs supportés</p>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <span className="text-primary/80 bg-primary/10 px-1 rounded">ip.addr</span>
                        <span className="text-primary/80 bg-primary/10 px-1 rounded">ip.src / ip.dst</span>
                        <span className="text-primary/80 bg-primary/10 px-1 rounded">tcp.port</span>
                        <span className="text-primary/80 bg-primary/10 px-1 rounded">tcp.srcport</span>
                        <span className="text-primary/80 bg-primary/10 px-1 rounded">protocol</span>
                        <span className="text-primary/80 bg-primary/10 px-1 rounded">frame.len</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground/50 mb-1 uppercase font-semibold">Opérateurs</p>
                      <div className="text-xs font-mono flex flex-wrap gap-2">
                        <span className="bg-foreground/10 px-1 rounded">==</span>
                        <span className="bg-foreground/10 px-1 rounded">!=</span>
                        <span className="bg-foreground/10 px-1 rounded">&gt;</span>
                        <span className="bg-foreground/10 px-1 rounded">&lt;</span>
                        <span className="bg-foreground/10 px-1 rounded">&amp;&amp;</span>
                        <span className="bg-foreground/10 px-1 rounded">||</span>
                        <span className="bg-foreground/10 px-1 rounded">contains</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-foreground/50 mb-1 uppercase font-semibold">Exemples</p>
                      <ul className="text-xs space-y-1 font-mono text-foreground/80">
                        <li className="cursor-pointer hover:text-primary transition-colors" onClick={() => {setFilterText("tcp.port == 443"); setShowSyntaxHelp(false);}}>tcp.port == 443</li>
                        <li className="cursor-pointer hover:text-primary transition-colors" onClick={() => {setFilterText("ip.addr == 192.168.1.1"); setShowSyntaxHelp(false);}}>ip.addr == 192.168.1.1</li>
                        <li className="cursor-pointer hover:text-primary transition-colors" onClick={() => {setFilterText("protocol == TCP && frame.len > 100"); setShowSyntaxHelp(false);}}>protocol == TCP && frame.len &gt; 100</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                  "cursor-pointer border-b border-foreground/10 transition-colors hover:bg-foreground/10",
                  idx % 2 === 0 ? "bg-background" : "bg-foreground/5"
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
        
        {filteredPackets.length === 0 && packets.length === 0 && isCapturing && (
          <div className="flex flex-col items-center justify-center h-64 text-foreground/40">
            <Loader2 className="h-12 w-12 mb-4 animate-spin opacity-50" />
            <p>Écoute du trafic réseau en cours...</p>
          </div>
        )}
        
        {filteredPackets.length === 0 && (packets.length > 0 || !isCapturing) && (
          <div className="flex flex-col items-center justify-center h-64 text-foreground/40">
            <Search className="h-12 w-12 mb-4 opacity-50" />
            <p>Aucun paquet ne correspond à ce filtre.</p>
          </div>
        )}
      </div>
    </div>
  );
}