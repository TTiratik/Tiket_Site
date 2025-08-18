"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, MessageSquare, Calendar, User, AlertTriangle, Shield } from "lucide-react"
import type { Complaint } from "@/lib/db"
import { ComplaintChatDialog } from "@/components/complaint-chat-dialog"

interface AdminComplaintCardProps {
  complaint: Complaint
  onUpdate: () => void
}

export function AdminComplaintCard({ complaint, onUpdate }: AdminComplaintCardProps) {
  const [showChat, setShowChat] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <Clock className="h-4 w-4 text-orange-500" />
    ) : (
      <CheckCircle className="h-4 w-4 text-green-500" />
    )
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "destructive" : "secondary"
  }

  const getPriorityBadge = (status: string) => {
    if (status === "active") {
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(complaint.created_at).getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysSinceCreated > 2) {
        return (
          <Badge variant="destructive" className="text-xs">
            Высокий приоритет
          </Badge>
        )
      } else if (daysSinceCreated > 0) {
        return (
          <Badge variant="outline" className="text-xs">
            Средний приоритет
          </Badge>
        )
      }
    }
    return null
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Жалоба #{complaint.id}
                </CardTitle>
                {getPriorityBadge(complaint.status)}
              </div>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(complaint.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  ID пользователя: {complaint.user_id}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(complaint.status)} className="flex items-center gap-1">
                {getStatusIcon(complaint.status)}
                {complaint.status === "active" ? "Требует внимания" : "Обработана"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Заявитель</p>
              <p className="font-medium text-gray-900">{complaint.user_nickname}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Нарушитель</p>
              <p className="font-medium text-red-600 font-mono">{complaint.violator_nickname}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Дата инцидента</p>
              <p className="font-medium text-gray-900">
                {new Date(complaint.incident_date).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Доказательства и описание:
            </p>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">{complaint.evidence}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-xs text-gray-500">Последнее обновление: {formatDate(complaint.updated_at)}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowChat(true)} className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {complaint.status === "active" ? "Ответить" : "Просмотреть чат"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ComplaintChatDialog complaint={complaint} open={showChat} onOpenChange={setShowChat} onUpdate={onUpdate} />
    </>
  )
}
