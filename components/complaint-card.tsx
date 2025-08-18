"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, MessageSquare, Calendar, User, AlertTriangle } from "lucide-react"
import type { Complaint } from "@/lib/db"
import { ComplaintChatDialog } from "@/components/complaint-chat-dialog"

interface ComplaintCardProps {
  complaint: Complaint
  onUpdate: () => void
}

export function ComplaintCard({ complaint, onUpdate }: ComplaintCardProps) {
  const [showChat, setShowChat] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    return status === "active" ? "default" : "secondary"
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Жалоба #{complaint.id}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Создана {formatDate(complaint.created_at)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(complaint.status)} className="flex items-center gap-1">
                {getStatusIcon(complaint.status)}
                {complaint.status === "active" ? "Активная" : "Закрыта"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">Ваш никнейм:</span>
                <span>{complaint.user_nickname}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Нарушитель:</span>
                <span className="font-mono">{complaint.violator_nickname}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Дата инцидента:</span>
                <span>{formatDate(complaint.incident_date)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Доказательства:</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{complaint.evidence}</p>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowChat(true)} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Открыть чат
            </Button>
          </div>
        </CardContent>
      </Card>

      <ComplaintChatDialog complaint={complaint} open={showChat} onOpenChange={setShowChat} onUpdate={onUpdate} />
    </>
  )
}
