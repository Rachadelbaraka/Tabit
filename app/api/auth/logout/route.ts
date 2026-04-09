import { NextResponse } from "next/server";

import { deleteSession, getRequestToken } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getRequestToken();
    if (token) {
      await deleteSession(token);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Impossible de fermer la session." }, { status: 500 });
  }
}
