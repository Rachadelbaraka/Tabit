"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useApp } from "@/components/app-provider";

export default function HomePage() {
  const router = useRouter();
  const { auth, isReady } = useApp();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    router.replace(auth.user ? "/dashboard" : "/auth");
  }, [auth.user, isReady, router]);

  return (
    <div className="centered-screen">
      <div className="panel loading-panel">
        <div className="pulse-orb" />
        <h1>Initialisation de Tabit</h1>
        <p>Préparation de votre expérience premium et récupération des données locales.</p>
      </div>
    </div>
  );
}
