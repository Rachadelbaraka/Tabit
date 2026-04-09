"use client";

import { useState } from "react";

import { ProtectedShell } from "@/components/protected-shell";
import { useApp } from "@/components/app-provider";
import { getHabitProgressForDate, formatLongDate } from "@/lib/utils";

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

interface CalendarDay {
  key: string;
  currentMonth: boolean;
  dayNumber: number;
}

export default function CalendarPage() {
  const { snapshot } = useApp();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const days: CalendarDay[] = (() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startOffset = start.getDay();
    const total = end.getDate();
    return Array.from({ length: Math.ceil((startOffset + total) / 7) * 7 }, (_, index) => {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), index - startOffset + 1);
      return {
        key: toDateKey(date),
        currentMonth: date.getMonth() === cursor.getMonth(),
        dayNumber: date.getDate(),
      };
    });
  })();

  const selectedRecord = snapshot.records[selectedDate];

  return (
    <ProtectedShell title="Calendrier" subtitle="Visualisez votre rythme mensuel, vos jours écrits et le détail de chaque date en un clic.">
      <section className="calendar-layout">
        <article className="panel calendar-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Vue mensuelle</span>
              <h2>{new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(cursor)}</h2>
            </div>
            <div className="calendar-nav">
              <button type="button" className="ghost-button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>Précédent</button>
              <button type="button" className="ghost-button" onClick={() => setCursor(new Date())}>Aujourd’hui</button>
              <button type="button" className="ghost-button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>Suivant</button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((day) => {
              const record = snapshot.records[day.key];
              const progress = getHabitProgressForDate(snapshot.habits, record);
              return (
                <button
                  key={day.key}
                  type="button"
                  className={`calendar-day ${day.currentMonth ? "" : "muted"} ${selectedDate === day.key ? "selected" : ""}`}
                  onClick={() => setSelectedDate(day.key)}
                >
                  <div className="calendar-day-top">
                    <span>{day.dayNumber}</span>
                    {record?.journal.trim() ? <span className="journal-dot" /> : null}
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <small>{progress}%</small>
                </button>
              );
            })}
          </div>
        </article>

        <article className="panel detail-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Détail</span>
              <h2>{formatLongDate(selectedDate)}</h2>
            </div>
          </div>
          <div className="detail-metrics">
            <div>
              <span>Progression</span>
              <strong>{getHabitProgressForDate(snapshot.habits, selectedRecord)}%</strong>
            </div>
            <div>
              <span>Journal</span>
              <strong>{selectedRecord?.journal.trim() ? "Oui" : "Non"}</strong>
            </div>
            <div>
              <span>Humeur</span>
              <strong>{selectedRecord?.mood ?? "neutral"}</strong>
            </div>
          </div>
          <div className="detail-journal">
            <strong>Note</strong>
            <p>{selectedRecord?.journal.trim() || "Aucune note enregistrée pour cette journée."}</p>
          </div>
          <div className="detail-habits">
            <strong>Habitudes validées</strong>
            <ul>
              {selectedRecord?.completedHabitIds.length
                ? selectedRecord.completedHabitIds.map((habitId) => {
                    const habit = snapshot.habits.find((item) => item.id === habitId);
                    return <li key={habitId}>{habit?.name ?? "Habitude supprimée"}</li>;
                  })
                : [<li key="none">Aucune habitude cochée.</li>]}
            </ul>
          </div>
        </article>
      </section>
    </ProtectedShell>
  );
}
