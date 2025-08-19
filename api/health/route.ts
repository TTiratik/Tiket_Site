import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Проверяем подключение к базе данных
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 500 },
    )
  }
}
