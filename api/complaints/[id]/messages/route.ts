import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getComplaintMessages, addComplaintMessage } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const complaintId = Number.parseInt(params.id)
    const messages = await getComplaintMessages(complaintId)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { message } = await request.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 })
    }

    const complaintId = Number.parseInt(params.id)
    const isAdminMessage = user.role === "admin"

    const newMessage = await addComplaintMessage(complaintId, user.id, message, isAdminMessage)

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
