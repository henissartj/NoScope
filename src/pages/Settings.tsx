import { useState, useEffect } from "react";
import { Monitor, Shield, HardDrive, Bell, CheckCircle } from "lucide-react";
import { useSettings, AppSettings } from "@/contexts/SettingsContext";

type Tab = "general" | "storage" | "security" | "notifications";

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showToast, setShowToast] = useState(false);

  // Sync local state when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
  };

  const handleChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background relative">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-foreground/60 mt-1">Configurez les options de capture et de sécurité de NoScope</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Nav */}
          <div className="col-span-1 space-y-1">
            <button 
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-foreground/5'}`}
            >
              <Monitor className="h-4 w-4" />
              Général
            </button>
            <button 
              onClick={() => setActiveTab("storage")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'storage' ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-foreground/5'}`}
            >
              <HardDrive className="h-4 w-4" />
              Stockage
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-foreground/5'}`}
            >
              <Shield className="h-4 w-4" />
              Sécurité (IDS)
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-foreground/5'}`}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </div>

          {/* Settings Content */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            
            {activeTab === "general" && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Préférences d'Interface</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-foreground/10">
                    <div>
                      <h3 className="font-medium text-foreground">Thème Sombre</h3>
                      <p className="text-sm text-foreground/60">Utiliser le thème sombre par défaut (Bleu Nuit)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.theme === "dark"}
                        onChange={(e) => handleChange("theme", e.target.checked ? "dark" : "light")}
                      />
                      <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-foreground/10">
                    <div>
                      <h3 className="font-medium text-foreground">Langue de l'interface</h3>
                      <p className="text-sm text-foreground/60">Langue principale de l'application</p>
                    </div>
                    <select 
                      className="bg-background border border-foreground/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                      value={localSettings.language}
                      onChange={(e) => handleChange("language", e.target.value)}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Mode Promiscuité</h3>
                      <p className="text-sm text-foreground/60">Capturer les paquets non destinés à cette machine</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.promiscuousMode}
                        onChange={(e) => handleChange("promiscuousMode", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "storage" && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Stockage et Cache</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-foreground/10">
                    <div className="w-2/3">
                      <h3 className="font-medium text-foreground">Taille du Buffer (MB)</h3>
                      <p className="text-sm text-foreground/60">Taille maximale allouée en mémoire avant écriture disque</p>
                    </div>
                    <input 
                      type="number" 
                      min="10" max="1000" step="10"
                      className="bg-background border border-foreground/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 w-24 text-right"
                      value={localSettings.bufferSizeMB}
                      onChange={(e) => handleChange("bufferSizeMB", Number(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Auto-sauvegarde</h3>
                      <p className="text-sm text-foreground/60">Sauvegarder automatiquement les sessions à la fermeture</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.autoSave}
                        onChange={(e) => handleChange("autoSave", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Sécurité & Détection d'Intrusion (IDS)</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-foreground/10">
                    <div>
                      <h3 className="font-medium text-foreground">Activer le module IDS</h3>
                      <p className="text-sm text-foreground/60">Analyser le trafic pour détecter les anomalies et menaces</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.enableIDS}
                        onChange={(e) => handleChange("enableIDS", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="w-2/3">
                      <h3 className="font-medium text-foreground">Action sur paquet malveillant</h3>
                      <p className="text-sm text-foreground/60">Politique de traitement lors de la détection d'un paquet suspect</p>
                    </div>
                    <select 
                      className="bg-background border border-foreground/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                      value={localSettings.actionOnMalicious}
                      onChange={(e) => handleChange("actionOnMalicious", e.target.value)}
                      disabled={!localSettings.enableIDS}
                    >
                      <option value="quarantine">Mettre en quarantaine (Recommandé)</option>
                      <option value="delete">Supprimer définitivement</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Centre de Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-foreground/10">
                    <div>
                      <h3 className="font-medium text-foreground">Notifications Sonores</h3>
                      <p className="text-sm text-foreground/60">Jouer un son lors de la détection d'une alerte critique</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.soundNotifications}
                        onChange={(e) => handleChange("soundNotifications", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Notifications Système (OS)</h3>
                      <p className="text-sm text-foreground/60">Afficher des bulles de notification natives Windows/macOS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.systemNotifications}
                        onChange={(e) => handleChange("systemNotifications", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/10 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors shadow-lg shadow-primary/20"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-background border border-primary/20 text-foreground px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Paramètres sauvegardés avec succès</span>
        </div>
      )}
    </div>
  );
}