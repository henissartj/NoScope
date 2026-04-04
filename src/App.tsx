import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Capture from "@/pages/Capture";
import Dashboard from "@/pages/Dashboard";
import Analyze from "@/pages/Analyze";
import Export from "@/pages/Export";
import Settings from "@/pages/Settings";
import { NetworkProvider } from "@/contexts/NetworkContext";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 500); // Délai de fin légèrement plus long
          return 100;
        }
        // Avancement fixe de 5% par tick
        return prev + 5;
      });
    }, 180); // Intervalle de temps légèrement plus long entre chaque tick
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-sans">
        <div className="flex flex-col items-center space-y-8 z-10">
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-6xl font-bold tracking-tighter text-[#10b981]">NoScope</h1>
            <p className="text-gray-400 tracking-widest text-sm uppercase">Analyseur Réseau Avancé</p>
          </div>
          
          <div className="w-80 flex flex-col space-y-2">
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>Chargement du système...</span>
              <span>{Math.min(progress, 100)}%</span>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-none overflow-hidden">
              <div 
                className="h-full bg-[#10b981] transition-all duration-150 ease-linear"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="pt-8 text-gray-500 text-sm tracking-wide">
            Développé par le Cartel Amiri & L'EMPRISE
          </div>
        </div>
      </div>
    );
  }

  return (
    <NetworkProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/analyze/:id" element={<Analyze />} />
            <Route path="/export" element={<Export />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </NetworkProvider>
  );
}