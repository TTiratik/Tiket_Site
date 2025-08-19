import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API работает!",
    timestamp: new Date().toISOString(),
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
  })
}
