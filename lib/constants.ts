import type { Mood, Preferences, Snapshot } from "@/lib/types";

export const APP_NAME = "Tabit";

export const moodOptions: Array<{ value: Mood; label: string; emoji: string }> = [
  { value: "great", label: "En pleine forme", emoji: "Sparkles" },
  { value: "good", label: "Bien", emoji: "SunMedium" },
  { value: "neutral", label: "Stable", emoji: "CloudSun" },
  { value: "low", label: "Un peu bas", emoji: "CloudDrizzle" },
  { value: "tired", label: "Fatigué", emoji: "MoonStar" },
];

export const habitColors = [
  "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  "linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
  "linear-gradient(135deg, #6366f1 0%, #3730a3 100%)",
  "linear-gradient(135deg, #94a3b8 0%, #475569 100%)",
];

export const defaultPreferences: Preferences = {
  theme: "system",
  reminders: false,
  reminderTime: "20:00",
};

export const emptySnapshot: Snapshot = {
  habits: [],
  records: {},
  preferences: defaultPreferences,
  lastSyncedAt: null,
};
