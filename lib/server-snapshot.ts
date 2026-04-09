import { prisma } from "@/lib/db";
import { defaultPreferences, emptySnapshot } from "@/lib/constants";
import type { DayRecord, Snapshot } from "@/lib/types";

export async function serializeSnapshot(userId: string): Promise<Snapshot> {
  const [user, habits, journals, completions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.habit.findMany({ where: { userId }, orderBy: { position: "asc" } }),
    prisma.journalEntry.findMany({ where: { userId } }),
    prisma.habitCompletion.findMany({ where: { habit: { userId } } }),
  ]);

  if (!user) {
    return emptySnapshot;
  }

  const records: Record<string, DayRecord> = {};

  for (const journal of journals) {
    records[journal.date] = {
      date: journal.date,
      mood: journal.mood as DayRecord["mood"],
      journal: journal.text,
      completedHabitIds: [],
      updatedAt: journal.updatedAt.toISOString(),
    };
  }

  for (const completion of completions) {
    if (!completion.completed) {
      continue;
    }

    const current = records[completion.date] ?? {
      date: completion.date,
      mood: "neutral",
      journal: "",
      completedHabitIds: [],
      updatedAt: completion.updatedAt.toISOString(),
    };

    current.completedHabitIds = Array.from(new Set([...current.completedHabitIds, completion.habitId]));
    current.updatedAt = completion.updatedAt.toISOString();
    records[completion.date] = current;
  }

  return {
    habits: habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency as "daily" | "weekly",
      targetDays: (habit.targetDays as number[]) ?? [],
      color: habit.color,
      order: habit.position,
      createdAt: habit.createdAt.toISOString(),
    })),
    records,
    preferences: {
      theme: (user.theme as Snapshot["preferences"]["theme"]) ?? defaultPreferences.theme,
      reminders: user.reminders,
      reminderTime: user.reminderTime,
    },
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function persistSnapshot(userId: string, snapshot: Snapshot) {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        theme: snapshot.preferences.theme,
        reminders: snapshot.preferences.reminders,
        reminderTime: snapshot.preferences.reminderTime,
      },
    });

    await tx.habitCompletion.deleteMany({ where: { habit: { userId } } });
    await tx.journalEntry.deleteMany({ where: { userId } });
    await tx.habit.deleteMany({ where: { userId } });

    for (const habit of snapshot.habits) {
      await tx.habit.create({
        data: {
          id: habit.id,
          userId,
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          targetDays: habit.targetDays,
          color: habit.color,
          position: habit.order,
          createdAt: new Date(habit.createdAt),
        },
      });
    }

    for (const record of Object.values(snapshot.records)) {
      await tx.journalEntry.create({
        data: {
          userId,
          date: record.date,
          mood: record.mood,
          text: record.journal,
          updatedAt: new Date(record.updatedAt),
        },
      });

      for (const habitId of record.completedHabitIds) {
        await tx.habitCompletion.create({
          data: {
            habitId,
            date: record.date,
            completed: true,
            updatedAt: new Date(record.updatedAt),
          },
        });
      }
    }
  });

  return serializeSnapshot(userId);
}
