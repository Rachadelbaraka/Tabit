import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { persistSnapshot, serializeSnapshot } from "@/lib/server-snapshot";
import type { Snapshot } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();
    const snapshot = await serializeSnapshot(user.id);
    return NextResponse.json({ snapshot });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
    }

    return NextResponse.json({ error: "Impossible de récupérer les données." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const snapshot = body.snapshot as Snapshot;

    const savedSnapshot = await persistSnapshot(user.id, snapshot);
    return NextResponse.json({ snapshot: savedSnapshot });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
    }

    return NextResponse.json({ error: "Impossible de synchroniser les données." }, { status: 500 });
  }
}
