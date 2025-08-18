import { cookies } from "next/headers"
import { getUserById } from "./db"
import type { User } from "./db"

const SESSION_COOKIE_NAME = "session"

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  })
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  return await getUserById(sessionId)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export function generateUserId(): string {
  return "user-" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export { getUserByEmail, createUser } from "./db"
