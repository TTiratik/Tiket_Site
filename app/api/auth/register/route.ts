import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createUser, createSession, generateUserId } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 })
    }

    // Проверяем, существует ли пользователь
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 })
    }

    // Создаем нового пользователя
    const userId = generateUserId()
    const user = await createUser(userId, email, name)

    // Создаем сессию
    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
