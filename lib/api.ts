"use client";

import { emptySnapshot } from "@/lib/constants";
import type { AuthState, Snapshot, StatsSummary } from "@/lib/types";
import { computeStats } from "@/lib/utils";

async function request<T>(path: string, options: RequestInit = {}, auth?: AuthState): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (auth?.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Une erreur réseau est survenue.");
  }

  return response.json() as Promise<T>;
}

export async function signup(payload: { name: string; email: string; password: string }) {
  return request<{ token: string; user: AuthState["user"] }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<{ token: string; user: AuthState["user"] }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSession(auth: AuthState) {
  return request<{ user: AuthState["user"] }>("/api/auth/session", { method: "GET" }, auth);
}

export async function logout(auth: AuthState) {
  return request<{ success: boolean }>("/api/auth/logout", { method: "POST" }, auth);
}

export async function fetchSnapshot(auth: AuthState): Promise<Snapshot> {
  if (!auth.token) {
    return emptySnapshot;
  }

  const result = await request<{ snapshot: Snapshot }>("/api/snapshot", { method: "GET" }, auth);
  return result.snapshot;
}

export async function syncSnapshot(auth: AuthState, snapshot: Snapshot): Promise<Snapshot> {
  if (!auth.token) {
    return snapshot;
  }

  const result = await request<{ snapshot: Snapshot }>("/api/snapshot", {
    method: "PUT",
    body: JSON.stringify({ snapshot }),
  }, auth);
  return result.snapshot;
}

export async function exportSnapshot(auth: AuthState): Promise<Snapshot> {
  if (!auth.token) {
    return emptySnapshot;
  }

  const result = await request<{ snapshot: Snapshot }>("/api/export", { method: "GET" }, auth);
  return result.snapshot;
}

export async function importSnapshot(auth: AuthState, snapshot: Snapshot): Promise<Snapshot> {
  if (!auth.token) {
    return snapshot;
  }

  const result = await request<{ snapshot: Snapshot }>("/api/import", {
    method: "POST",
    body: JSON.stringify({ snapshot }),
  }, auth);
  return result.snapshot;
}

export async function fetchStats(auth: AuthState, fallback: Snapshot): Promise<StatsSummary> {
  if (!auth.token) {
    return computeStats(fallback);
  }

  try {
    const result = await request<{ stats: StatsSummary }>("/api/stats", { method: "GET" }, auth);
    return result.stats;
  } catch {
    return computeStats(fallback);
  }
}
