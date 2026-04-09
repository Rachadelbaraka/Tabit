"use client";

import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { ProtectedShell } from "@/components/protected-shell";
import { useApp } from "@/components/app-provider";
import { moodOptions } from "@/lib/constants";
import { formatLongDate, todayKey } from "@/lib/utils";

const defaultForm = {
  name: "",
  description: "",
  frequency: "daily" as const,
  targetDays: [1, 2, 3, 4, 5],
};

export default function TodayPage() {
  const { snapshot, addHabit, deleteHabit, reorderHabit, toggleHabit, updateHabit, updateJournal, updateMood } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const today = todayKey();
  const todayRecord = snapshot.records[today];
  const habits = [...snapshot.habits].sort((left, right) => left.order - right.order);

  function resetForm() {
    setForm(defaultForm);
    setEditingHabitId(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingHabitId) {
      updateHabit(editingHabitId, form);
    } else {
      addHabit(form);
    }

    resetForm();
  }

  return (
    <ProtectedShell title="Aujourd’hui" subtitle="Cochez vos habitudes, ajustez vos routines et écrivez votre journal avec sauvegarde locale immédiate.">
      <section className="today-grid">
        <article className="panel stack-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Jour actif</span>
              <h2>{formatLongDate(today)}</h2>
            </div>
            <span className="sync-pill">Autosave</span>
          </div>

          <div className="mood-row">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`mood-pill ${todayRecord?.mood === option.value ? "active" : ""}`}
                onClick={() => updateMood(option.value, today)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {habits.length ? (
            <div className="habit-list">
              {habits.map((habit, index) => {
                const done = todayRecord?.completedHabitIds.includes(habit.id);
                return (
                  <div key={habit.id} className={`habit-row ${done ? "done" : ""}`}>
                    <button type="button" className={`check-button ${done ? "done" : ""}`} onClick={() => toggleHabit(habit.id, today)}>
                      {done ? <Check size={18} /> : null}
                    </button>
                    <div className="habit-meta">
                      <div className="habit-meta-top">
                        <strong>{habit.name}</strong>
                        <span className="habit-frequency">{habit.frequency === "daily" ? "Quotidienne" : "Hebdomadaire"}</span>
                      </div>
                      <p>{habit.description || "Ajoutez une intention pour donner du relief à cette routine."}</p>
                    </div>
                    <div className="habit-actions">
                      <button type="button" className="ghost-icon-button" onClick={() => reorderHabit(habit.id, "up")} disabled={index === 0}>
                        <ChevronUp size={16} />
                      </button>
                      <button type="button" className="ghost-icon-button" onClick={() => reorderHabit(habit.id, "down")} disabled={index === habits.length - 1}>
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="ghost-icon-button"
                        onClick={() => {
                          setEditingHabitId(habit.id);
                          setForm({
                            name: habit.name,
                            description: habit.description,
                            frequency: habit.frequency,
                            targetDays: habit.targetDays.length ? habit.targetDays : [1, 2, 3, 4, 5],
                          });
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="ghost-icon-button danger" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Aucune habitude active" body="Ajoutez une première habitude ci-contre pour démarrer votre routine quotidienne." />
          )}
        </article>

        <aside className="stack-column">
          <article className="panel form-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Habitudes</span>
                <h2>{editingHabitId ? "Modifier" : "Ajouter"}</h2>
              </div>
              <Plus size={18} />
            </div>
            <form className="stack-form" onSubmit={handleSubmit}>
              <label>
                <span>Nom</span>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
              <label>
                <span>Description</span>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
              </label>
              <label>
                <span>Fréquence</span>
                <select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value as "daily" | "weekly" })}>
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </label>
              {form.frequency === "weekly" ? (
                <label>
                  <span>Jours ciblés</span>
                  <div className="weekday-grid">
                    {["D", "L", "M", "M", "J", "V", "S"].map((label, index) => {
                      const active = form.targetDays.includes(index);
                      return (
                        <button
                          key={`${label}-${index}`}
                          type="button"
                          className={`weekday-pill ${active ? "active" : ""}`}
                          onClick={() =>
                            setForm({
                              ...form,
                              targetDays: active ? form.targetDays.filter((day) => day !== index) : [...form.targetDays, index].sort(),
                            })
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </label>
              ) : null}
              <div className="form-actions">
                <button type="submit" className="primary-button">{editingHabitId ? "Mettre à jour" : "Ajouter l’habitude"}</button>
                {editingHabitId ? (
                  <button type="button" className="ghost-button" onClick={resetForm}>
                    Annuler
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="panel journal-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Journal quotidien</span>
                <h2>Note du jour</h2>
              </div>
            </div>
            <textarea
              className="journal-editor"
              placeholder="Décrivez votre énergie, vos progrès, un blocage ou un détail à retenir..."
              rows={10}
              value={todayRecord?.journal ?? ""}
              onChange={(event) => updateJournal(event.target.value, today)}
            />
            <p className="subtle-copy">Sauvegarde automatique locale, puis synchronisation dès que le backend revient.</p>
          </article>
        </aside>
      </section>
    </ProtectedShell>
  );
}
