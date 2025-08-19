import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
    }

    const users = await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM neon_auth.users_sync
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
