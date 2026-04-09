import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { serializeSnapshot } from "@/lib/server-snapshot";

export async function GET() {
  try {
    const user = await requireUser();
    const snapshot = await serializeSnapshot(user.id);
    return NextResponse.json({ snapshot });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
    }

    return NextResponse.json({ error: "Export impossible." }, { status: 500 });
  }
}
