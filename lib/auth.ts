import { cookies } from "next/headers"
import { getUserById } from "./db"
import type { User } from "./db"

const SESSION_COOKIE_NAME = "session"

export async function createSession(userId: string): Promise<void> {
  try {
    const cookieStore = cookies()
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionId) {
      return null
    }

    return await getUserById(sessionId)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
  } catch (error) {
    console.error("Error destroying session:", error)
    throw error
  }
}

export function generateUserId(): string {
  return "user-" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export { getUserByEmail, createUser } from "./db"
