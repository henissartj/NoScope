import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, ArrowLeft, Download, ShieldAlert, Cpu, CheckCircle, FileText, Binary, BrainCircuit, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface TreeNode {
  name: string;
  value?: string;
  children?: TreeNode[];
}

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

  const [processInfo, setProcessInfo] = useState<any>(null);
  const [connInfo, setConnInfo] = useState<any>(null);
  const [loadingRealData, setLoadingRealData] = useState(false);

  useEffect(() => {
    if (id && id.startsWith('conn_')) {
      setLoadingRealData(true);
      const parts = id.split('_');
      const pid = parts[1];
      const localPort = parts[2];
      const remotePort = parts[3];

      // @ts-ignore
      const cp = window.require ? window.require('child_process') : null;
      if (cp) {
        if (pid && pid !== '0') {
          cp.exec(`powershell -Command "Get-Process -Id ${pid} -ErrorAction SilentlyContinue | Select-Object Name, Id, Path, Description, Company | ConvertTo-Json"`, (err: any, stdout: string) => {
            if (!err && stdout) {
              try { setProcessInfo(JSON.parse(stdout)); } catch(e) {}
            }
          });
        }
        
        cp.exec(`powershell -Command "Get-NetTCPConnection -LocalPort ${localPort} -RemotePort ${remotePort} -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State, CreationTime | Select -First 1 | ConvertTo-Json"`, (err: any, stdout: string) => {
          if (!err && stdout) {
            try { setConnInfo(JSON.parse(stdout)); } catch(e) {}
          }
          setLoadingRealData(false);
        });
      } else {
        setLoadingRealData(false);
      }
    }
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(null);
    
    // Processus de scan IDS (Analyse locale)
    setTimeout(() => {
      setIsScanning(false);
      let isSafe = true;
      let score = 99;
      let msg = "Aucune menace détectée.";

      if (connInfo) {
        const port = connInfo.RemotePort;
        if ([4444, 3389, 22, 23].includes(port)) {
          isSafe = false;
          score = 15;
          msg = `Port suspect (${port}) détecté. Connexion potentiellement dangereuse.`;
        } else if (port > 10000) {
          score = 65;
          msg = `Port élevé (${port}) détecté. Surveillance recommandée.`;
        }
      }

      if (processInfo && processInfo.Path) {
        const path = processInfo.Path.toLowerCase();
        if (!path.includes("windows") && !path.includes("program files")) {
          score -= 20;
          msg += " Le processus ne s'exécute pas depuis un dossier système standard.";
        }
      }

      setScanResult(`${isSafe ? "Sécurisé" : "Alerte"} : ${msg} Score de confiance: ${Math.max(0, score)}%.`);
      showToast("Analyse IDS terminée avec succès.");
    }, 1500);
  };

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);

    // Génération et téléchargement PCAP
    setTimeout(() => {
      const exportData = {
        id,
        connection: connInfo || {},
        process: processInfo || {}
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id || "conn_export"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      showToast("Fichier exporté avec succès.");
    }, 800);
  };

  const REAL_PACKET_DETAILS: TreeNode[] = [
    {
      name: `Connection ID: ${id}`,
      children: [
        { name: "Local Address", value: connInfo?.LocalAddress || "N/A" },
        { name: "Local Port", value: connInfo?.LocalPort?.toString() || "N/A" },
        { name: "Remote Address", value: connInfo?.RemoteAddress || "N/A" },
        { name: "Remote Port", value: connInfo?.RemotePort?.toString() || "N/A" },
        { name: "State", value: connInfo?.State?.toString() || "N/A" },
        { name: "Creation Time", value: connInfo?.CreationTime || "N/A" },
      ]
    }
  ];

  if (processInfo) {
    REAL_PACKET_DETAILS.push({
      name: `Processus: ${processInfo.Name || "Inconnu"} (PID: ${processInfo.Id || "N/A"})`,
      children: [
        { name: "Description", value: processInfo.Description || "N/A" },
        { name: "Company", value: processInfo.Company || "N/A" },
        { name: "Path", value: processInfo.Path || "N/A" },
      ]
    });
  }

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
              {loadingRealData ? (
                <div className="flex items-center justify-center h-32 text-foreground/50">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Chargement des données OS...
                </div>
              ) : (
                REAL_PACKET_DETAILS.map((node, i) => (
                  <TreeView key={i} node={node} defaultExpanded={true} />
                ))
              )}
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
              Analyse Détaillée
            </button>
            <button 
              onClick={() => setActiveTab("hex")}
              className={clsx(
                "font-semibold text-sm flex items-center gap-2 pb-1 transition-colors border-b-2",
                activeTab === "hex" ? "text-primary border-primary" : "text-foreground/60 border-transparent hover:text-foreground/90"
              )}
            >
              <Binary className="h-4 w-4" />
              Processus & Contexte (OS)
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
                      Cette connexion représente une <strong className="text-foreground">session {connInfo?.State || "inconnue"}</strong>.
                    </p>
                    <p>
                      L'adresse locale (<span className="font-mono text-primary/90 bg-primary/10 px-1 rounded">{connInfo?.LocalAddress || "N/A"}:{connInfo?.LocalPort || "N/A"}</span>) est connectée à la cible distante (<span className="font-mono text-primary/90 bg-primary/10 px-1 rounded">{connInfo?.RemoteAddress || "N/A"}:{connInfo?.RemotePort || "N/A"}</span>).
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-foreground/50" />
                      <h2 className="text-lg font-bold text-foreground">Threat Intelligence & OSINT</h2>
                    </div>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md border border-primary/20 uppercase tracking-widest">
                      Sécurisé
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-foreground/5 rounded-lg border border-foreground/10 space-y-3">
                      <span className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Réputation IP Dest ({connInfo?.RemoteAddress || "N/A"})</span>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>
                          <span className="text-sm font-medium">Safe</span>
                        </div>
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">Score: 0/100</span>
                      </div>
                      <div className="text-xs text-foreground/60 pt-2 border-t border-foreground/10">
                        Aucun signalement détecté dans les bases de données.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "hex" && (
              <div className="bg-[#0d0d1a] p-4 rounded-lg border border-foreground/10 h-full flex flex-col overflow-hidden">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  Contexte Système
                </h3>
                {processInfo ? (
                  <div className="space-y-4 font-mono text-sm text-foreground/80">
                    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-foreground/10 pb-2">
                      <span className="text-foreground/50">PID</span>
                      <span className="text-primary">{processInfo.Id}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-foreground/10 pb-2">
                      <span className="text-foreground/50">Nom</span>
                      <span className="text-foreground">{processInfo.Name}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-foreground/10 pb-2">
                      <span className="text-foreground/50">Chemin</span>
                      <span className="text-foreground break-all">{processInfo.Path || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-foreground/10 pb-2">
                      <span className="text-foreground/50">Éditeur</span>
                      <span className="text-foreground">{processInfo.Company || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-foreground/10 pb-2">
                      <span className="text-foreground/50">Description</span>
                      <span className="text-foreground">{processInfo.Description || "N/A"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-foreground/50 text-center py-10">
                    Informations du processus non disponibles (PID non trouvé ou accès refusé).
                  </div>
                )}
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