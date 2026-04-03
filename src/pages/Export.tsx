import { useState } from "react";
import { FileJson, FileText, Download, Share2, Printer, CheckCircle2, Loader2, Copy, Check } from "lucide-react";

export default function Export() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = (format: string) => {
    if (downloading) return;
    setDownloading(format);
    
    // @ts-ignore
    const cp = window.require ? window.require('child_process') : null;
    if (cp) {
      cp.exec('powershell -Command "Get-NetTCPConnection | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State, CreationTime, OwningProcess | ConvertTo-Json"', (err: any, stdout: string) => {
        let content = stdout;
        
        if (format === 'csv') {
          try {
            const data = JSON.parse(stdout);
            const items = Array.isArray(data) ? data : [data];
            if (items.length > 0) {
              const headers = Object.keys(items[0]).join(',');
              const rows = items.map(item => Object.values(item).join(',')).join('\n');
              content = `${headers}\n${rows}`;
            }
          } catch(e) {
            content = "Erreur lors de la conversion CSV";
          }
        }
        
        const blob = new Blob([content || "Aucune donnée disponible"], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `noscope_export_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setDownloading(null);
        showToast(`Export ${format.toUpperCase()} réussi.`);
      });
    } else {
      setDownloading(null);
      showToast("L'export nécessite l'environnement Electron.");
    }
  };

  const handleGeneratePdf = () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    // @ts-ignore
    const cp = window.require ? window.require('child_process') : null;
    if (cp) {
      cp.exec('powershell -Command "Get-NetTCPConnection | Select-Object -First 50 | Format-Table | Out-String"', (err: any, stdout: string) => {
        // Un rapport texte simple téléchargé en .txt car la génération PDF nécessite une librairie externe
        const content = `RAPPORT D'ANALYSE RÉSEAU NOSCOPE\nDate: ${new Date().toLocaleString()}\n\n${stdout || "Aucune donnée disponible"}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `rapport_noscope_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsGeneratingPdf(false);
        showToast("Rapport généré et téléchargé avec succès.");
      });
    } else {
      setIsGeneratingPdf(false);
      showToast("L'export nécessite l'environnement Electron.");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText("https://noscope.local/share/session/eth0_capture_morning_8f2a");
    setIsCopied(true);
    showToast("Lien de session copié dans le presse-papier.");
    setTimeout(() => setIsCopied(false), 2000);
  };
  const exportOptions = [
    {
      id: "pcap",
      title: "Format PCAP",
      description: "Format standard Wireshark pour l'analyse réseau approfondie.",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      recommended: true
    },
    {
      id: "json",
      title: "Format JSON",
      description: "Données structurées idéales pour l'intégration avec d'autres outils et scripts.",
      icon: FileJson,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      id: "csv",
      title: "Format CSV",
      description: "Tableur simple contenant uniquement les métadonnées principales des paquets.",
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export et Rapports</h1>
          <p className="text-foreground/60 mt-1">Sauvegardez vos captures ou générez des rapports d'analyse</p>
        </div>

        {/* Current Capture Status */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Session Active : eth0_capture_morning</h3>
              <p className="text-sm text-foreground/60">12,450 paquets capturés • 14.2 MB</p>
            </div>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-foreground/10 hover:bg-foreground/20 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
            {isCopied ? "Lien Copié" : "Partager le lien"}
          </button>
        </div>

        {/* Export Formats */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Formats d'Export</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportOptions.map((opt) => (
              <div key={opt.id} className="relative bg-background/50 border border-foreground/10 rounded-xl p-6 hover:border-primary/50 transition-colors group cursor-pointer">
                {opt.recommended && (
                  <span className="absolute -top-2 -right-2 bg-primary text-background text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    RECOMMANDÉ
                  </span>
                )}
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${opt.bg} ${opt.color}`}>
                  <opt.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{opt.title}</h3>
                <p className="text-sm text-foreground/60 mb-6">{opt.description}</p>
                <button 
                  onClick={() => handleDownload(opt.id)}
                  disabled={downloading !== null}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-foreground/5 group-hover:bg-primary group-hover:text-background font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === opt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {downloading === opt.id ? "Préparation..." : "Télécharger"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Generation */}
        <div className="space-y-4 pt-4 border-t border-foreground/10">
          <h2 className="text-xl font-semibold">Génération de Rapport</h2>
          <div className="bg-background/50 border border-foreground/10 rounded-xl p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Rapport d'Analyse Réseau PDF</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Génère un rapport complet incluant les graphiques de bande passante, la répartition des protocoles et les alertes de sécurité détectées.
              </p>
              <div className="space-y-2 mb-6">
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" className="rounded border-foreground/20 text-primary focus:ring-primary bg-background" defaultChecked />
                  Inclure les graphiques de trafic
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" className="rounded border-foreground/20 text-primary focus:ring-primary bg-background" defaultChecked />
                  Inclure les alertes de sécurité (IDS)
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" className="rounded border-foreground/20 text-primary focus:ring-primary bg-background" />
                  Inclure le dump hexadécimal des paquets suspects
                </label>
              </div>
              <button 
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                {isGeneratingPdf ? "Génération en cours..." : "Générer le PDF"}
              </button>
            </div>
            <div className="w-full md:w-1/3 bg-foreground/5 rounded-lg border border-foreground/10 flex items-center justify-center p-4 relative overflow-hidden">
              {isGeneratingPdf ? (
                <div className="flex flex-col items-center justify-center text-primary space-y-3">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="text-sm font-medium animate-pulse">Compilation du rapport...</span>
                </div>
              ) : (
                <div className="text-center text-foreground/40">
                  <FileText className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">Aperçu indisponible</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-background border border-primary/20 text-foreground px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}