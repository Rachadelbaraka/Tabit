"use client";

import { Flame, PenLine, Target, TrendingUp } from "lucide-react";

import { MiniChart } from "@/components/mini-chart";
import { ProtectedShell } from "@/components/protected-shell";
import { StatCard } from "@/components/stat-card";
import { useApp } from "@/components/app-provider";

export default function StatsPage() {
  const { stats } = useApp();

  return (
    <ProtectedShell title="Statistiques" subtitle="Mesurez votre régularité, vos séries et la fréquence d’écriture sur 7 et 30 jours.">
      <section className="metrics-grid">
        <StatCard label="Taux sur 7 jours" value={`${stats.completionRate7d}%`} detail="Lecture courte pour ajuster rapidement vos routines." icon={<Target size={18} />} />
        <StatCard label="Taux sur 30 jours" value={`${stats.completionRate30d}%`} detail="Vue plus stable sur votre discipline globale." icon={<TrendingUp size={18} />} />
        <StatCard label="Série actuelle" value={`${stats.currentStreak} jours`} detail="Jours complets d’affilée sans rupture." icon={<Flame size={18} />} />
        <StatCard label="Fréquence d’écriture" value={`${stats.journalFrequency30d}%`} detail="Jours écrits sur les 30 derniers jours." icon={<PenLine size={18} />} />
      </section>

      <section className="stats-grid">
        <MiniChart data={stats.weeklyTrend} tone="indigo" />
        <MiniChart data={stats.monthlyTrend} tone="slate" />
        <article className="panel narrative-card">
          <span className="eyebrow">Lecture rapide</span>
          <h2>Signaux utiles</h2>
          <div className="narrative-grid">
            <div>
              <span>Meilleur jour</span>
              <strong>{stats.bestDayLabel}</strong>
            </div>
            <div>
              <span>Entrées journal</span>
              <strong>{stats.totalJournalDays}</strong>
            </div>
            <div>
              <span>Régularité</span>
              <strong>{stats.completionRate30d >= 70 ? "Solide" : stats.completionRate30d >= 40 ? "En progression" : "À stabiliser"}</strong>
            </div>
          </div>
        </article>
      </section>
    </ProtectedShell>
  );
}
