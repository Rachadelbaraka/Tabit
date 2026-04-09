import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/types";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, original] = storedHash.split(":");
  if (!salt || !original) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(original, "hex");

  return timingSafeEqual(derived, originalBuffer);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function deleteSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getUserFromToken(token: string | null): Promise<SessionUser | null> {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

export async function requireUser() {
  const token = await getRequestToken();
  const user = await getUserFromToken(token);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function getRequestToken() {
  const requestHeaders = await headers();
  const authorization = requestHeaders.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "").trim();
}
