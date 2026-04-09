"use client";

import { emptySnapshot } from "@/lib/constants";
import type { AuthState, Snapshot } from "@/lib/types";

const SNAPSHOT_KEY = "tabit.snapshot";
const AUTH_KEY = "tabit.auth";

export function readSnapshot(): Snapshot {
  if (typeof window === "undefined") {
    return emptySnapshot;
  }

  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    return raw ? { ...emptySnapshot, ...JSON.parse(raw) } : emptySnapshot;
  } catch {
    return emptySnapshot;
  }
}

export function writeSnapshot(snapshot: Snapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function readAuth(): AuthState {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export function writeAuth(auth: AuthState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_KEY);
}
