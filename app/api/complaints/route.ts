import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getComplaintsByUserId, getAllComplaints, createComplaint } from "@/lib/db"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    let complaints
    if (user.role === "admin") {
      complaints = await getAllComplaints()
    } else {
      complaints = await getComplaintsByUserId(user.id)
    }

    return NextResponse.json({ complaints })
  } catch (error) {
    console.error("Get complaints error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { userNickname, violatorNickname, incidentDate, evidence } = await request.json()

    if (!userNickname || !violatorNickname || !incidentDate || !evidence) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 })
    }

    const complaint = await createComplaint(user.id, userNickname, violatorNickname, incidentDate, evidence)

    return NextResponse.json({ complaint })
  } catch (error) {
    console.error("Create complaint error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
