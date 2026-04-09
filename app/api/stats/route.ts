import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { serializeSnapshot } from "@/lib/server-snapshot";
import { computeStats } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireUser();
    const snapshot = await serializeSnapshot(user.id);
    const stats = computeStats(snapshot);
    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
    }

    return NextResponse.json({ error: "Impossible de calculer les statistiques." }, { status: 500 });
  }
}
