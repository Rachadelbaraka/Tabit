import { NextResponse } from "next/server";

import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
    }

    const token = await createSession(user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json({ error: "Impossible de se connecter." }, { status: 500 });
  }
}
