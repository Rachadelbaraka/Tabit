import { NextResponse } from "next/server";

import { getRequestToken, getUserFromToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getRequestToken();
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Impossible de récupérer la session." }, { status: 500 });
  }
}
