"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";

import { emptySnapshot, habitColors } from "@/lib/constants";
import { exportSnapshot, fetchSession, fetchSnapshot, importSnapshot, login, logout, signup, syncSnapshot } from "@/lib/api";
import { clearAuth, readAuth, readSnapshot, writeAuth, writeSnapshot } from "@/lib/storage";
import type { AuthState, DayRecord, Habit, Mood, Preferences, SessionUser, Snapshot } from "@/lib/types";
import { computeStats, makeId, todayKey } from "@/lib/utils";

type SyncState = "loading" | "online" | "offline" | "syncing";

interface HabitInput {
  name: string;
  description: string;
  frequency: Habit["frequency"];
  targetDays: number[];
}

interface AppContextValue {
  auth: AuthState;
  snapshot: Snapshot;
  syncState: SyncState;
  isReady: boolean;
  error: string | null;
  stats: ReturnType<typeof computeStats>;
  setError: (message: string | null) => void;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  addHabit: (input: HabitInput) => void;
  updateHabit: (habitId: string, input: HabitInput) => void;
  deleteHabit: (habitId: string) => void;
  reorderHabit: (habitId: string, direction: "up" | "down") => void;
  toggleHabit: (habitId: string, date?: string) => void;
  updateJournal: (value: string, date?: string) => void;
  updateMood: (mood: Mood, date?: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  importData: (file: string) => Promise<{ ok: boolean; message: string }>;
  exportData: () => Promise<string>;
  refreshRemote: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function normalizeRecord(date: string, current?: DayRecord): DayRecord {
  return current ?? {
    date,
    journal: "",
    mood: "neutral",
    completedHabitIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authRef = useRef(auth);
  const snapshotRef = useRef(snapshot);
  const syncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    const localAuth = readAuth();
    const localSnapshot = readSnapshot();

    setAuth(localAuth);
    setSnapshot(localSnapshot);
    setTheme(localSnapshot.preferences.theme);
    setIsReady(true);

    const onConnectivityChange = () => {
      if (typeof navigator === "undefined") {
        return;
      }

      setSyncState(navigator.onLine ? "online" : "offline");
      if (navigator.onLine && authRef.current.token) {
        void refreshRemote(authRef.current, false);
      }
    };

    void refreshRemote(localAuth, true);

    window.addEventListener("online", onConnectivityChange);
    window.addEventListener("offline", onConnectivityChange);

    return () => {
      window.removeEventListener("online", onConnectivityChange);
      window.removeEventListener("offline", onConnectivityChange);
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, [setTheme]);

  async function refreshRemote(currentAuth = authRef.current, preserveOffline = false) {
    if (!currentAuth.token) {
      setSyncState(typeof navigator !== "undefined" && navigator.onLine ? "offline" : "offline");
      return;
    }

    try {
      const session = await fetchSession(currentAuth);
      const remoteSnapshot = await fetchSnapshot(currentAuth);
      const mergedAuth = { token: currentAuth.token, user: session.user as SessionUser };
      setAuth(mergedAuth);
      writeAuth(mergedAuth);
      setSnapshot(remoteSnapshot);
      writeSnapshot(remoteSnapshot);
      setTheme(remoteSnapshot.preferences.theme);
      setSyncState("online");
    } catch {
      setSyncState(preserveOffline ? "offline" : "offline");
    }
  }

  function commitSnapshot(nextSnapshot: Snapshot, shouldSync = true) {
    snapshotRef.current = nextSnapshot;
    setSnapshot(nextSnapshot);
    writeSnapshot(nextSnapshot);
    setTheme(nextSnapshot.preferences.theme);

    if (!shouldSync) {
      return;
    }

    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }

    if (!authRef.current.token || typeof navigator === "undefined" || !navigator.onLine) {
      setSyncState("offline");
      return;
    }

    setSyncState("syncing");
    syncTimerRef.current = window.setTimeout(async () => {
      try {
        const savedSnapshot = await syncSnapshot(authRef.current, nextSnapshot);
        snapshotRef.current = savedSnapshot;
        setSnapshot(savedSnapshot);
        writeSnapshot(savedSnapshot);
        setTheme(savedSnapshot.preferences.theme);
        setSyncState("online");
      } catch {
        setSyncState("offline");
      }
    }, 700);
  }

  function mutateSnapshot(mutator: (current: Snapshot) => Snapshot, shouldSync = true) {
    const next = mutator(snapshotRef.current);
    commitSnapshot(next, shouldSync);
  }

  async function signIn(payload: { email: string; password: string }) {
    const result = await login(payload);
    const nextAuth = { token: result.token, user: result.user };
    setAuth(nextAuth);
    writeAuth(nextAuth);
    await refreshRemote(nextAuth, false);
  }

  async function signUp(payload: { name: string; email: string; password: string }) {
    const result = await signup(payload);
    const nextAuth = { token: result.token, user: result.user };
    setAuth(nextAuth);
    writeAuth(nextAuth);
    await refreshRemote(nextAuth, false);
  }

  async function signOut() {
    try {
      if (authRef.current.token) {
        await logout(authRef.current);
      }
    } catch {
      // Ignore logout network failures and clear local session anyway.
    }

    setAuth({ token: null, user: null });
    clearAuth();
    commitSnapshot(emptySnapshot, false);
    setSyncState("offline");
  }

  function addHabit(input: HabitInput) {
    mutateSnapshot((current) => {
      const habit: Habit = {
        id: makeId("habit"),
        name: input.name,
        description: input.description,
        frequency: input.frequency,
        targetDays: input.frequency === "daily" ? [] : input.targetDays,
        color: habitColors[current.habits.length % habitColors.length],
        order: current.habits.length,
        createdAt: new Date().toISOString(),
      };

      return {
        ...current,
        habits: [...current.habits, habit],
        lastSyncedAt: current.lastSyncedAt,
      };
    });
  }

  function updateHabit(habitId: string, input: HabitInput) {
    mutateSnapshot((current) => ({
      ...current,
      habits: current.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              name: input.name,
              description: input.description,
              frequency: input.frequency,
              targetDays: input.frequency === "daily" ? [] : input.targetDays,
            }
          : habit,
      ),
    }));
  }

  function deleteHabit(habitId: string) {
    mutateSnapshot((current) => {
      const habits = current.habits.filter((habit) => habit.id !== habitId).map((habit, index) => ({ ...habit, order: index }));
      const records = Object.fromEntries(
        Object.entries(current.records).map(([date, record]) => [
          date,
          {
            ...record,
            completedHabitIds: record.completedHabitIds.filter((id) => id !== habitId),
          },
        ]),
      );

      return {
        ...current,
        habits,
        records,
      };
    });
  }

  function reorderHabit(habitId: string, direction: "up" | "down") {
    mutateSnapshot((current) => {
      const habits = [...current.habits].sort((left, right) => left.order - right.order);
      const index = habits.findIndex((habit) => habit.id === habitId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= habits.length) {
        return current;
      }

      const [moved] = habits.splice(index, 1);
      habits.splice(targetIndex, 0, moved);

      return {
        ...current,
        habits: habits.map((habit, order) => ({ ...habit, order })),
      };
    });
  }

  function toggleHabit(habitId: string, date = todayKey()) {
    mutateSnapshot((current) => {
      const record = normalizeRecord(date, current.records[date]);
      const completedHabitIds = record.completedHabitIds.includes(habitId)
        ? record.completedHabitIds.filter((id) => id !== habitId)
        : [...record.completedHabitIds, habitId];

      return {
        ...current,
        records: {
          ...current.records,
          [date]: {
            ...record,
            completedHabitIds,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }

  function updateJournal(value: string, date = todayKey()) {
    mutateSnapshot((current) => {
      const record = normalizeRecord(date, current.records[date]);
      return {
        ...current,
        records: {
          ...current.records,
          [date]: {
            ...record,
            journal: value,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }

  function updateMood(mood: Mood, date = todayKey()) {
    mutateSnapshot((current) => {
      const record = normalizeRecord(date, current.records[date]);
      return {
        ...current,
        records: {
          ...current.records,
          [date]: {
            ...record,
            mood,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }

  function updatePreferences(patch: Partial<Preferences>) {
    mutateSnapshot((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...patch,
      },
    }));
  }

  async function exportData() {
    try {
      if (authRef.current.token && typeof navigator !== "undefined" && navigator.onLine) {
        const remoteSnapshot = await exportSnapshot(authRef.current);
        commitSnapshot(remoteSnapshot, false);
        return JSON.stringify(remoteSnapshot, null, 2);
      }
    } catch {
      // Fallback to local snapshot when remote export fails.
    }

    return JSON.stringify(snapshotRef.current, null, 2);
  }

  async function importData(file: string) {
    try {
      const parsed = JSON.parse(file) as Snapshot;
      commitSnapshot(parsed, false);

      if (authRef.current.token && typeof navigator !== "undefined" && navigator.onLine) {
        const saved = await importSnapshot(authRef.current, parsed);
        commitSnapshot(saved, false);
        setSyncState("online");
      } else {
        setSyncState("offline");
      }

      return { ok: true, message: "Les données ont été importées." };
    } catch {
      return { ok: false, message: "Le fichier JSON est invalide." };
    }
  }

  const value: AppContextValue = {
    auth,
    snapshot,
    syncState,
    isReady,
    error,
    stats: computeStats(snapshot),
    setError,
    signIn,
    signUp,
    signOut,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabit,
    toggleHabit,
    updateJournal,
    updateMood,
    updatePreferences,
    importData,
    exportData,
    refreshRemote: async () => {
      await refreshRemote(authRef.current, false);
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}
