"use client";

import { Activity, BookOpenText, Flame, Target } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ProtectedShell } from "@/components/protected-shell";
import { StatCard } from "@/components/stat-card";
import { useApp } from "@/components/app-provider";
import { getHabitProgressForDate, todayKey } from "@/lib/utils";

export default function DashboardPage() {
  const { snapshot, stats } = useApp();
  const today = todayKey();
  const todayRecord = snapshot.records[today];
  const sortedHabits = [...snapshot.habits].sort((left, right) => left.order - right.order);
  const completion = getHabitProgressForDate(sortedHabits, todayRecord);

  return (
    <ProtectedShell
      title="Tableau de bord"
      subtitle="Vue rapide sur votre journée, votre série actuelle et votre régularité globale."
    >
      <section className="metrics-grid">
        <StatCard label="Complétion du jour" value={`${completion}%`} detail="Progression instantanée sur vos habitudes actives." icon={<Target size={18} />} />
        <StatCard label="Série actuelle" value={`${stats.currentStreak} jours`} detail="Jours consécutifs avec toutes les habitudes validées." icon={<Flame size={18} />} />
        <StatCard label="Taux sur 7 jours" value={`${stats.completionRate7d}%`} detail="Vue courte pour détecter une baisse rapide." icon={<Activity size={18} />} />
        <StatCard label="Journal" value={`${stats.totalJournalDays} entrées`} detail="Nombre total de jours avec une note écrite." icon={<BookOpenText size={18} />} />
      </section>

      <section className="dashboard-grid">
        <article className="panel spotlight-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Aujourd’hui</span>
              <h2>Résumé du jour</h2>
            </div>
            <span className="pill-highlight">{todayRecord?.mood ?? "neutral"}</span>
          </div>
          {sortedHabits.length ? (
            <div className="habit-overview-list">
              {sortedHabits.slice(0, 4).map((habit) => {
                const done = todayRecord?.completedHabitIds.includes(habit.id);
                return (
                  <div key={habit.id} className={`habit-overview-item ${done ? "done" : ""}`}>
                    <div className="habit-swatch" style={{ background: habit.color }} />
                    <div>
                      <strong>{habit.name}</strong>
                      <p>{habit.description || "Rituel sans description"}</p>
                    </div>
                    <span>{done ? "Validée" : "À faire"}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Aucune habitude pour l’instant" body="Ajoutez vos premières routines dans la page du jour pour alimenter le tableau de bord." />
          )}
        </article>

        <article className="panel journal-preview-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Journal</span>
              <h2>Aperçu rapide</h2>
            </div>
          </div>
          <p className="journal-preview">{todayRecord?.journal?.trim() || "Votre note du jour apparaîtra ici dès qu’elle sera enregistrée automatiquement."}</p>
        </article>
      </section>
    </ProtectedShell>
  );
}
