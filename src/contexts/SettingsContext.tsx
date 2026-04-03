import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ActionOnMalicious = "quarantine" | "delete";

export interface AppSettings {
  theme: "dark" | "light";
  language: "fr" | "en";
  promiscuousMode: boolean;
  bufferSizeMB: number;
  autoSave: boolean;
  enableIDS: boolean;
  actionOnMalicious: ActionOnMalicious;
  soundNotifications: boolean;
  systemNotifications: boolean;
}

const defaultSettings: AppSettings = {
  theme: "dark",
  language: "fr",
  promiscuousMode: true,
  bufferSizeMB: 100,
  autoSave: false,
  enableIDS: true,
  actionOnMalicious: "quarantine", // Default to quarantine per user preference
  soundNotifications: false,
  systemNotifications: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("noscope-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("noscope-settings", JSON.stringify(settings));
    
    // Apply theme
    if (settings.theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
