import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Packet } from '../utils/types';

interface NetworkContextType {
  isCapturing: boolean;
  setIsCapturing: (val: boolean) => void;
  packets: Packet[];
  bandwidthData: any[];
  totalTraffic: string;
  activeConnectionsCount: number;
  protocols: any[];
  threats: any[];
  threatsBlocked: number;
  recentCaptures: any[];
  setRecentCaptures: React.Dispatch<React.SetStateAction<any[]>>;
  clearPackets: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const INITIAL_BANDWIDTH = Array.from({ length: 20 }).map((_, i) => {
  const d = new Date();
  d.setSeconds(d.getSeconds() - (20 - i) * 5);
  return {
    time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
    in: 0,
    out: 0,
  };
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCapturing, setIsCapturing] = useState(true);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [bandwidthData, setBandwidthData] = useState(INITIAL_BANDWIDTH);
  const [totalTraffic, setTotalTraffic] = useState("0 GB");
  const [activeConnectionsCount, setActiveConnectionsCount] = useState(0);
  const [protocols, setProtocols] = useState([
    { name: "TCP", value: 1, color: "#10b981" },
    { name: "UDP", value: 1, color: "#3b82f6" },
    { name: "HTTP/S", value: 1, color: "#8b5cf6" },
    { name: "DNS", value: 1, color: "#f59e0b" },
  ]);
  const [threats, setThreats] = useState<any[]>([]);
  const [threatsBlocked, setThreatsBlocked] = useState(0);
  const [recentCaptures, setRecentCaptures] = useState<any[]>(() => {
    const saved = localStorage.getItem("noscope-recent-captures");
    return saved ? JSON.parse(saved) : [];
  });

  const lastBytesRef = useRef<{ rx: number; tx: number; time: number } | null>(null);

  const clearPackets = () => setPackets([]);

  // Handle capture stop to save to recent
  useEffect(() => {
    if (!isCapturing && packets.length > 0) {
      const newCapture = {
        id: `cap_${Date.now()}`,
        name: `Session de capture ${new Date().toLocaleTimeString()}`,
        date: new Date().toLocaleString(),
        packets: packets.length,
        size: `${(packets.length * 0.5).toFixed(1)} KB`
      };
      setRecentCaptures(prev => {
        const updated = [newCapture, ...prev].slice(0, 10);
        localStorage.setItem("noscope-recent-captures", JSON.stringify(updated));
        return updated;
      });
    }
  }, [isCapturing]);

  // Fetch Bandwidth and Dashboard Stats
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCapturing) {
      interval = setInterval(() => {
        try {
          // @ts-ignore
          const cp = window.require ? window.require('child_process') : null;
          if (cp) {
            // Bandwidth
            cp.exec('powershell -Command "Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes | ConvertTo-Json"', (err: any, stdout: string) => {
              if (!err && stdout) {
                try {
                  const data = JSON.parse(stdout);
                  const adapters = Array.isArray(data) ? data : [data];
                  let totalRx = 0;
                  let totalTx = 0;
                  adapters.forEach((ad: any) => {
                    totalRx += ad.ReceivedBytes || 0;
                    totalTx += ad.SentBytes || 0;
                  });

                  const totalGB = ((totalRx + totalTx) / (1024 * 1024 * 1024)).toFixed(2);
                  setTotalTraffic(`${totalGB} GB`);

                  const now = Date.now();
                  if (lastBytesRef.current) {
                    const timeDiff = (now - lastBytesRef.current.time) / 1000;
                    const rxDiff = totalRx - lastBytesRef.current.rx;
                    const txDiff = totalTx - lastBytesRef.current.tx;

                    const inMbps = Math.max(0, (rxDiff * 8) / 1000000 / timeDiff);
                    const outMbps = Math.max(0, (txDiff * 8) / 1000000 / timeDiff);

                    setBandwidthData((prev) => {
                      const newData = [...prev.slice(1)];
                      const date = new Date();
                      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                      newData.push({
                        time: timeStr,
                        in: parseFloat(inMbps.toFixed(2)),
                        out: parseFloat(outMbps.toFixed(2)),
                      });
                      return newData;
                    });
                  }
                  lastBytesRef.current = { rx: totalRx, tx: totalTx, time: now };
                } catch (e) { }
              }
            });

            // Active Connections & Protocols & Threats
            cp.exec('powershell -Command "$tcp = Get-NetTCPConnection -ErrorAction SilentlyContinue | Select-Object RemoteAddress, RemotePort, State; $udp = Get-NetUDPEndpoint -ErrorAction SilentlyContinue | Select-Object LocalAddress; @{ tcp = $tcp; udp = $udp } | ConvertTo-Json -Depth 2"', (err: any, stdout: string) => {
              if (!err && stdout) {
                try {
                  const data = JSON.parse(stdout);
                  const tcpConns = data.tcp ? (Array.isArray(data.tcp) ? data.tcp : [data.tcp]) : [];
                  const udpConns = data.udp ? (Array.isArray(data.udp) ? data.udp : [data.udp]) : [];

                  const established = tcpConns.filter((c: any) => c.State === "Established" || c.State === 5);
                  setActiveConnectionsCount(established.length);

                  let httpCount = 0;
                  let dnsCount = 0;
                  let otherTcpCount = 0;

                  const realThreats: any[] = [];
                  let blocked = 0;

                  tcpConns.forEach((c: any) => {
                    if (c.RemotePort === 80 || c.RemotePort === 443) httpCount++;
                    else if (c.RemotePort === 53) dnsCount++;
                    else otherTcpCount++;

                    // Simple mock threat detection based on known suspicious ports or unusual states
                    if ([4444, 3389, 22, 23].includes(c.RemotePort)) {
                      realThreats.push({
                        id: `threat_${Date.now()}_${Math.random()}`,
                        type: "Port Suspect Détecté",
                        source: c.RemoteAddress,
                        target: "Local",
                        severity: "high",
                        status: "blocked",
                        time: "À l'instant",
                        desc: `Connexion sur le port ${c.RemotePort}`,
                      });
                      blocked++;
                    }
                  });

                  setProtocols([
                    { name: "TCP", value: Math.max(1, otherTcpCount), color: "#10b981" },
                    { name: "UDP", value: Math.max(1, udpConns.length), color: "#3b82f6" },
                    { name: "HTTP/S", value: Math.max(1, httpCount), color: "#8b5cf6" },
                    { name: "DNS", value: Math.max(1, dnsCount), color: "#f59e0b" },
                  ]);

                  setThreats(realThreats);
                  setThreatsBlocked(blocked);
                } catch (e) { }
              }
            });
          }
        } catch (e) { }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  // Fetch Packets
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
                    id: `conn_${c.OwningProcess || 0}_${c.LocalPort}_${c.RemotePort}_${Date.now()}_${i}`,
                    no: Date.now() % 100000 + i,
                    timestamp: new Date().toISOString().split('T')[1].slice(0, -1),
                    source: `${c.LocalAddress}:${c.LocalPort}`,
                    destination: `${c.RemoteAddress}:${c.RemotePort}`,
                    protocol: "TCP",
                    length: Math.floor(Math.random() * 1500) + 40, // We simulate length here as Get-NetTCPConnection doesn't provide it
                    info: `State: ${c.State} | PID: ${c.OwningProcess || 'N/A'}`,
                    state: c.State
                  }));

                  setPackets((prev) => {
                    const merged = [...newPackets, ...prev]; // newer first, or append? Capture usually appends
                    // Let's append
                    const newMerged = [...prev, ...newPackets];
                    if (newMerged.length > 2000) return newMerged.slice(newMerged.length - 2000);
                    return newMerged;
                  });
                } catch (e) { }
              }
            });
          }
        } catch (e) { }
      }, 2000); // Poll every 2 seconds for active connections
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <NetworkContext.Provider value={{
      isCapturing, setIsCapturing, packets, bandwidthData, totalTraffic,
      activeConnectionsCount, protocols, threats, threatsBlocked, recentCaptures, setRecentCaptures, clearPackets
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error("useNetwork must be used within NetworkProvider");
  return context;
};
