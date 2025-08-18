import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
    }

    const { role } = await request.json()
    if (!role || !["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Неверная роль" }, { status: 400 })
    }

    await sql`
      UPDATE neon_auth.users_sync 
      SET role = ${role}, updated_at = NOW()
      WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
