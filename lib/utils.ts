import type { DayRecord, Habit, Snapshot, StatsSummary } from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function getHabitProgressForDate(habits: Habit[], record?: DayRecord) {
  if (!habits.length) {
    return 0;
  }

  const count = habits.filter((habit) => record?.completedHabitIds.includes(habit.id)).length;
  return Math.round((count / habits.length) * 100);
}

function eligibleHabitsForDate(habits: Habit[], date: string) {
  const dayIndex = new Date(`${date}T12:00:00`).getDay();
  return habits.filter((habit) => habit.frequency === "daily" || habit.targetDays.includes(dayIndex));
}

function completionRate(snapshot: Snapshot, days: number) {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return date.toISOString().slice(0, 10);
  });

  let completed = 0;
  let total = 0;

  for (const date of dates) {
    const habits = eligibleHabitsForDate(snapshot.habits, date);
    total += habits.length;
    completed += habits.filter((habit) => snapshot.records[date]?.completedHabitIds.includes(habit.id)).length;
  }

  return total ? Math.round((completed / total) * 100) : 0;
}

function journalFrequency(snapshot: Snapshot, days: number) {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return date.toISOString().slice(0, 10);
  });

  const writtenDays = dates.filter((date) => snapshot.records[date]?.journal.trim()).length;
  return Math.round((writtenDays / days) * 100);
}

function currentStreak(snapshot: Snapshot) {
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const date = cursor.toISOString().slice(0, 10);
    const habits = eligibleHabitsForDate(snapshot.habits, date);
    if (!habits.length) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    const record = snapshot.records[date];
    const done = habits.every((habit) => record?.completedHabitIds.includes(habit.id));
    if (!done) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function bestDay(snapshot: Snapshot) {
  const labels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const scores = new Map<number, { completed: number; total: number }>();

  Object.entries(snapshot.records).forEach(([date, record]) => {
    const day = new Date(`${date}T12:00:00`).getDay();
    const habits = eligibleHabitsForDate(snapshot.habits, date);
    const score = scores.get(day) ?? { completed: 0, total: 0 };
    score.completed += record.completedHabitIds.length;
    score.total += habits.length;
    scores.set(day, score);
  });

  let bestLabel = "Aucune donnée";
  let bestValue = -1;

  scores.forEach((score, day) => {
    const value = score.total ? score.completed / score.total : 0;
    if (value > bestValue) {
      bestValue = value;
      bestLabel = labels[day] ?? "Aucune donnée";
    }
  });

  return bestLabel;
}

function trend(snapshot: Snapshot, days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return {
      label: days === 7
        ? new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date)
        : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date),
      value: getHabitProgressForDate(eligibleHabitsForDate(snapshot.habits, key), snapshot.records[key]),
    };
  });
}

export function computeStats(snapshot: Snapshot): StatsSummary {
  const totalJournalDays = Object.values(snapshot.records).filter((record) => record.journal.trim()).length;

  return {
    completionRate7d: completionRate(snapshot, 7),
    completionRate30d: completionRate(snapshot, 30),
    journalFrequency30d: journalFrequency(snapshot, 30),
    currentStreak: currentStreak(snapshot),
    bestDayLabel: bestDay(snapshot),
    totalJournalDays,
    monthlyTrend: trend(snapshot, 30),
    weeklyTrend: trend(snapshot, 7),
  };
}

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
