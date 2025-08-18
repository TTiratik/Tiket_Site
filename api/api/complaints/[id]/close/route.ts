import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateComplaintStatus } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    // Только администраторы могут закрывать жалобы
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
    }

    const complaintId = Number.parseInt(params.id)
    await updateComplaintStatus(complaintId, "closed")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Close complaint error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
