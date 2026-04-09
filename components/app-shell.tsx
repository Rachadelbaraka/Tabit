"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarDays, LayoutDashboard, LogOut, NotebookPen, Settings2 } from "lucide-react";
import type { ReactNode } from "react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/app-provider";

const navigation = [
  { href: "/dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/today", label: "Aujourd’hui", icon: NotebookPen },
  { href: "/calendar", label: "Calendrier", icon: CalendarDays },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/settings", label: "Paramètres", icon: Settings2 },
];

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, signOut, syncState } = useApp();

  return (
    <div className="app-shell">
      <aside className="sidebar panel">
        <div>
          <div className="brand-mark">T</div>
          <div className="brand-copy">
            <span className="eyebrow">Premium habit journal</span>
            <strong>{APP_NAME}</strong>
          </div>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("nav-item", pathname === item.href && "active")}> 
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="presence-card">
            <span className={cn("status-dot", syncState)} />
            <div>
              <strong>{auth.user?.name ?? "Session locale"}</strong>
              <p>{syncState === "online" ? "Synchronisation active" : syncState === "syncing" ? "Synchronisation en cours" : "Mode local hors ligne"}</p>
            </div>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={async () => {
              await signOut();
              router.replace("/auth");
            }}
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="main-frame">
        <header className="topbar panel">
          <div>
            <span className="eyebrow">Espace personnel</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="sync-pill-group">
            <span className="sync-pill">{syncState === "online" ? "En ligne" : syncState === "syncing" ? "Synchronisation..." : "Local"}</span>
            <span className="sync-pill muted">{auth.user?.email ?? "Compte local"}</span>
          </div>
        </header>
        <main className="content-grid">{children}</main>
        <nav className="mobile-nav panel">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("mobile-nav-item", pathname === item.href && "active")}> 
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
