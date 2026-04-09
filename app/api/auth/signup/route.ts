import { NextResponse } from "next/server";

import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: String(email).toLowerCase(),
        passwordHash: hashPassword(password),
      },
    });

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
    return NextResponse.json({ error: "Impossible de créer le compte." }, { status: 500 });
  }
}
