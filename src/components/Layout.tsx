import { Link, useLocation } from "react-router-dom";
import { Activity, Download, Home, Settings, Search, BarChart2 } from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Tableau de Bord", href: "/dashboard", icon: BarChart2 },
  { name: "Capture", href: "/capture", icon: Activity },
  { name: "Analyse", href: "/analyze/latest", icon: Search },
  { name: "Export", href: "/export", icon: Download },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-foreground/10 bg-background/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-foreground/10">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">NoScope</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-foreground/10">
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-foreground/50">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Service Actif
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {children}
      </main>
    </div>
  );
}