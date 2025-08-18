"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Shield, User, Mail, Calendar } from "lucide-react"
import type { User as UserType } from "@/lib/db"

export function UsersManagement() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin"
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Управление пользователями
        </CardTitle>
        <CardDescription>Просмотр и управление пользователями системы</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Всего пользователей</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{users.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Администраторы</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">{users.filter((u) => u.role === "admin").length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <span className="font-medium">Обычные пользователи</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{users.filter((u) => u.role === "user").length}</p>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Пользователи не найдены</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 rounded-full p-3">
                        {user.role === "admin" ? (
                          <Shield className="h-6 w-6 text-purple-600" />
                        ) : (
                          <User className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Администратор" : "Пользователь"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Регистрация: {formatDate(user.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserRole(user.id, user.role)}
                        className="flex items-center gap-2"
                      >
                        {user.role === "admin" ? (
                          <>
                            <User className="h-4 w-4" />
                            Сделать пользователем
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Сделать админом
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
