"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, LogOut, Shield, Clock, CheckCircle, MessageSquare, Settings } from "lucide-react"
import type { Complaint } from "@/lib/db"
import { CreateComplaintDialog } from "@/components/create-complaint-dialog"
import { ComplaintCard } from "@/components/complaint-card"
import { AdminComplaintCard } from "@/components/admin-complaint-card"
import { UsersManagement } from "@/components/users-management"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/complaints")
      if (response.ok) {
        const data = await response.json()
        setComplaints(data.complaints)
      }
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplaintCreated = () => {
    fetchComplaints()
    setShowCreateDialog(false)
  }

  const activeComplaints = complaints.filter((c) => c.status === "active")
  const closedComplaints = complaints.filter((c) => c.status === "closed")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user?.role === "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">Панель администратора</h1>
                  <p className="text-purple-100">
                    Добро пожаловать, {user?.name}
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
                      Администратор
                    </Badge>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего жалоб</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complaints.length}</div>
                <p className="text-xs text-muted-foreground">За все время</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{activeComplaints.length}</div>
                <p className="text-xs text-muted-foreground">Активные жалобы</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Обработано</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{closedComplaints.length}</div>
                <p className="text-xs text-muted-foreground">Закрытые жалобы</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Эффективность</CardTitle>
                <Settings className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {complaints.length > 0 ? Math.round((closedComplaints.length / complaints.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Решенных жалоб</p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">Активные ({activeComplaints.length})</TabsTrigger>
              <TabsTrigger value="closed">Закрытые ({closedComplaints.length})</TabsTrigger>
              <TabsTrigger value="all">Все жалобы ({complaints.length})</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Активные жалобы
                  </CardTitle>
                  <CardDescription>Жалобы, требующие вашего внимания и ответа</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeComplaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Нет активных жалоб</p>
                      <p className="text-sm">Отличная работа! Все жалобы обработаны.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeComplaints.map((complaint) => (
                        <AdminComplaintCard key={complaint.id} complaint={complaint} onUpdate={fetchComplaints} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Закрытые жалобы
                  </CardTitle>
                  <CardDescription>Архив обработанных жалоб</CardDescription>
                </CardHeader>
                <CardContent>
                  {closedComplaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Нет закрытых жалоб</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {closedComplaints.map((complaint) => (
                        <AdminComplaintCard key={complaint.id} complaint={complaint} onUpdate={fetchComplaints} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Все жалобы
                  </CardTitle>
                  <CardDescription>Полный архив всех поданных жалоб</CardDescription>
                </CardHeader>
                <CardContent>
                  {complaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Пока нет жалоб в системе</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {complaints.map((complaint) => (
                        <AdminComplaintCard key={complaint.id} complaint={complaint} onUpdate={fetchComplaints} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <UsersManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Обычный пользовательский интерфейс
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
                <p className="text-sm text-gray-600">Добро пожаловать, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Новая жалоба
              </Button>
              <Button variant="outline" onClick={logout} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего жалоб</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{activeComplaints.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Закрытые</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{closedComplaints.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Мои жалобы</CardTitle>
            <CardDescription>Управляйте своими обращениями и отслеживайте их статус</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">Активные ({activeComplaints.length})</TabsTrigger>
                <TabsTrigger value="closed">Закрытые ({closedComplaints.length})</TabsTrigger>
                <TabsTrigger value="all">Все ({complaints.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeComplaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>У вас нет активных жалоб</p>
                  </div>
                ) : (
                  activeComplaints.map((complaint) => (
                    <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={fetchComplaints} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="closed" className="space-y-4">
                {closedComplaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>У вас нет закрытых жалоб</p>
                  </div>
                ) : (
                  closedComplaints.map((complaint) => (
                    <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={fetchComplaints} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {complaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>У вас пока нет жалоб</p>
                    <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                      Создать первую жалобу
                    </Button>
                  </div>
                ) : (
                  complaints.map((complaint) => (
                    <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={fetchComplaints} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CreateComplaintDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onComplaintCreated={handleComplaintCreated}
      />
    </div>
  )
}
