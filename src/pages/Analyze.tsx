import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, ArrowLeft, Download, ShieldAlert, Cpu, CheckCircle, FileText, Binary, BrainCircuit, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface TreeNode {
  name: string;
  value?: string;
  children?: TreeNode[];
}

const MOCK_PACKET_DETAILS: TreeNode[] = [
  {
    name: "Frame 349: 489 bytes on wire (3912 bits), 489 bytes captured",
    children: [
      { name: "Encapsulation type", value: "Ethernet (1)" },
      { name: "Arrival Time", value: "Apr 3, 2026 10:30:00.123456000 CET" },
      { name: "Frame Number", value: "349" },
      { name: "Frame Length", value: "489 bytes" },
    ]
  },
  {
    name: "Ethernet II, Src: Globalsc_00:3b:0a, Dst: Vizio_14:8a:e1",
    children: [
      { name: "Destination", value: "Vizio_14:8a:e1 (00:19:9d:14:8a:e1)" },
      { name: "Source", value: "Globalsc_00:3b:0a (f0:ad:4e:00:3b:0a)" },
      { name: "Type", value: "IPv4 (0x0800)" },
    ]
  },
  {
    name: "Internet Protocol Version 4, Src: 192.168.0.1, Dst: 192.168.0.21",
    children: [
      { name: "Version", value: "4" },
      { name: "Header Length", value: "20 bytes" },
      { name: "Total Length", value: "475" },
      { name: "Identification", value: "0x1234 (4660)" },
      { name: "Flags", value: "0x02 (Don't Fragment)" },
      { name: "Time to live", value: "64" },
      { name: "Protocol", value: "UDP (17)" },
      { name: "Source", value: "192.168.0.1" },
      { name: "Destination", value: "192.168.0.21" },
    ]
  },
  {
    name: "User Datagram Protocol, Src Port: 53, Dst Port: 34036",
    children: [
      { name: "Source Port", value: "53" },
      { name: "Destination Port", value: "34036" },
      { name: "Length", value: "455" },
      { name: "Checksum", value: "0x8f2a [unverified]" },
    ]
  },
  {
    name: "Domain Name System (response)",
    children: [
      { name: "Transaction ID", value: "0x2188" },
      { name: "Flags", value: "0x8180 Standard query response, No error" },
      { name: "Questions", value: "1" },
      { name: "Answer RRs", value: "4" },
      { name: "Queries", children: [
        { name: "cdn-0.nflximg.com", value: "type A, class IN" }
      ]},
    ]
  }
];

const MOCK_HEX = `0000  00 19 9d 14 8a e1 f0 ad 4e 00 3b 0a 08 00 45 00   ........N.;...E.
0010  01 db 12 34 40 00 40 11 8f 2a c0 a8 00 01 c0 a8   ...4@.@..*......
0020  00 15 00 35 84 f4 01 c7 83 3f 21 88 81 80 00 01   ...5.....?!.....
0030  00 04 00 09 00 09 05 63 64 6e 2d 30 06 6e 66 6c   .......cdn-0.nfl
0040  78 69 6d 67 03 63 6f 6d 00 00 01 00 01 c0 0c 00   ximg.com........
0050  05 00 01 00 00 05 29 00 22 06 69 6d 61 67 65 73   ......)."images
0060  07 6e 65 74 66 6c 69 78 03 63 6f 6d 09 65 64 67   .netflix.com.edg
0070  65 73 75 69 74 65 03 6e 65 74 00 c0 2f 00 05 00   esuite.net../...`;

function TreeView({ node, defaultExpanded = false }: { node: TreeNode; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4 font-mono text-[13px]">
      <div 
        className={clsx(
          "flex items-start py-1 hover:bg-foreground/5 cursor-pointer rounded px-1 transition-colors",
          !hasChildren && "ml-4"
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="mr-1 mt-0.5 text-foreground/50">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </span>
        )}
        <span className="text-foreground/90">
          <span className="font-semibold">{node.name}</span>
          {node.value && <span className="text-foreground/70">: {node.value}</span>}
        </span>
      </div>
      {expanded && hasChildren && (
        <div className="border-l border-foreground/10 ml-1.5 pl-1.5">
          {node.children!.map((child, i) => (
            <TreeView key={i} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Analyze() {
  const { id } = useParams();
  const navigate = useNavigate();

  // States for interactive features
  const [activeTab, setActiveTab] = useState<"smart" | "hex">("smart");
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(null);
    
    // Simulate IDS scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Sécurisé : Aucune menace détectée. Score de confiance: 99%.");
      showToast("Analyse IDS terminée avec succès.");
    }, 1500);
  };

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);

    // Simulate PCAP generation and download
    setTimeout(() => {
      const mockPcapContent = JSON.stringify(MOCK_PACKET_DETAILS, null, 2);
      const blob = new Blob([mockPcapContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id || "packet_349"}.json`; // Using JSON for mock export
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      showToast("Fichier exporté avec succès.");
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10 bg-background/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/capture')}
            className="p-2 hover:bg-foreground/10 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Analyse du Paquet</h1>
            <p className="text-xs text-foreground/60 mt-0.5 font-mono">{id || "pkt_349"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors"
          >
            {isScanning ? <Loader2 className="h-4 w-4 text-primary animate-spin" /> : <ShieldAlert className="h-4 w-4 text-primary" />}
            Scanner (IDS)
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exporter JSON
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Packet Details (Tree) */}
        <div className="flex-1 border-r border-foreground/10 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-foreground/5 border-b border-foreground/10 font-semibold text-sm flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Détails du Protocole
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {MOCK_PACKET_DETAILS.map((node, i) => (
              <TreeView key={i} node={node} defaultExpanded={i === MOCK_PACKET_DETAILS.length - 1} />
            ))}
          </div>
        </div>

        {/* Right: Smart Analysis / Hex Dump */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="flex px-4 py-2 bg-foreground/5 border-b border-foreground/10 gap-4">
            <button 
              onClick={() => setActiveTab("smart")}
              className={clsx(
                "font-semibold text-sm flex items-center gap-2 pb-1 transition-colors border-b-2",
                activeTab === "smart" ? "text-primary border-primary" : "text-foreground/60 border-transparent hover:text-foreground/90"
              )}
            >
              <BrainCircuit className="h-4 w-4" />
              Analyse Intelligente
            </button>
            <button 
              onClick={() => setActiveTab("hex")}
              className={clsx(
                "font-semibold text-sm flex items-center gap-2 pb-1 transition-colors border-b-2",
                activeTab === "hex" ? "text-primary border-primary" : "text-foreground/60 border-transparent hover:text-foreground/90"
              )}
            >
              <Binary className="h-4 w-4" />
              Données Brutes (Hex)
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 relative">
            {activeTab === "smart" && (
              <div className="max-w-3xl space-y-6">
                
                {/* IDS Result Banner */}
                {scanResult && (
                  <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary">
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">Résultat du scan IDS</h3>
                      <p className="text-sm mt-1 opacity-90">{scanResult}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-foreground/10 pb-2">
                    <FileText className="h-5 w-5 text-foreground/50" />
                    <h2 className="text-lg font-bold text-foreground">Résumé du Trafic</h2>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed space-y-3">
                    <p>
                      Ce paquet représente une <strong className="text-foreground">réponse DNS standard</strong> sans erreur.
                    </p>
                    <p>
                      Le serveur local (<span className="font-mono text-primary/90 bg-primary/10 px-1 rounded">192.168.0.1</span>) a répondu à la requête du client (<span className="font-mono text-primary/90 bg-primary/10 px-1 rounded">192.168.0.21</span>) concernant la résolution du domaine <span className="font-mono text-foreground/90 bg-foreground/10 px-1 rounded">cdn-0.nflximg.com</span>.
                    </p>
                    <p>
                      Le serveur indique que ce domaine est un alias (CNAME) qui pointe vers <span className="font-mono text-foreground/90 bg-foreground/10 px-1 rounded">images.netflix.com</span>.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 border-b border-foreground/10 pb-2">
                    <ShieldAlert className="h-5 w-5 text-foreground/50" />
                    <h2 className="text-lg font-bold text-foreground">Aperçu de Sécurité</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-foreground/5 rounded-lg border border-foreground/10">
                      <span className="text-xs text-foreground/50 uppercase tracking-wider">Réputation Source</span>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">Fiable (Serveur Local)</span>
                      </div>
                    </div>
                    <div className="p-4 bg-foreground/5 rounded-lg border border-foreground/10">
                      <span className="text-xs text-foreground/50 uppercase tracking-wider">Analyse Payload</span>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">Taille et format conformes</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "hex" && (
              <div className="bg-[#0d0d1a] p-4 rounded-lg border border-foreground/10 h-full">
                <pre className="font-mono text-[13px] text-foreground/70 whitespace-pre-wrap leading-relaxed">
                  {MOCK_HEX.split('\n').map((line, i) => {
                    const offset = line.substring(0, 6);
                    const hex = line.substring(6, 54);
                    const ascii = line.substring(54);
                    return (
                      <div key={i} className="hover:bg-foreground/10 px-1 rounded">
                        <span className="text-foreground/40">{offset}</span>
                        <span className="text-primary/80">{hex}</span>
                        <span className="text-foreground/60">{ascii}</span>
                      </div>
                    );
                  })}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-background border border-primary/20 text-foreground px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}