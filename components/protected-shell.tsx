"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";

export function ProtectedShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const router = useRouter();
  const { auth, isReady } = useApp();

  useEffect(() => {
    if (isReady && !auth.user) {
      router.replace("/auth");
    }
  }, [auth.user, isReady, router]);

  if (!isReady || !auth.user) {
    return (
      <div className="centered-screen">
        <div className="panel loading-panel">
          <div className="pulse-orb" />
          <h1>Préparation de votre espace</h1>
          <p>Chargement du tableau de bord et des données locales.</p>
        </div>
      </div>
    );
  }

  return <AppShell title={title} subtitle={subtitle}>{children}</AppShell>;
}
