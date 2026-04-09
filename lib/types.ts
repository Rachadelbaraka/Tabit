export type ThemeMode = "light" | "dark" | "system";
export type HabitFrequency = "daily" | "weekly";
export type Mood = "great" | "good" | "neutral" | "low" | "tired";

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  targetDays: number[];
  color: string;
  order: number;
  createdAt: string;
}

export interface DayRecord {
  date: string;
  mood: Mood;
  journal: string;
  completedHabitIds: string[];
  updatedAt: string;
}

export interface Preferences {
  theme: ThemeMode;
  reminders: boolean;
  reminderTime: string;
}

export interface Snapshot {
  habits: Habit[];
  records: Record<string, DayRecord>;
  preferences: Preferences;
  lastSyncedAt: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: SessionUser | null;
}

export interface StatsSummary {
  completionRate7d: number;
  completionRate30d: number;
  journalFrequency30d: number;
  currentStreak: number;
  bestDayLabel: string;
  totalJournalDays: number;
  monthlyTrend: Array<{ label: string; value: number }>;
  weeklyTrend: Array<{ label: string; value: number }>;
}
