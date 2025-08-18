"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Clock, CheckCircle, User, Shield } from "lucide-react"
import type { Complaint, ComplaintMessage } from "@/lib/db"

interface ComplaintChatDialogProps {
  complaint: Complaint
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function ComplaintChatDialog({ complaint, open, onOpenChange, onUpdate }: ComplaintChatDialogProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ComplaintMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      fetchMessages()
    }
  }, [open, complaint.id])

  useEffect(() => {
    // Автоскролл к последнему сообщению
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/complaints/${complaint.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/complaints/${complaint.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const closeComplaint = async () => {
    try {
      const response = await fetch(`/api/complaints/${complaint.id}/close`, {
        method: "POST",
      })

      if (response.ok) {
        onUpdate()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error closing complaint:", error)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Жалоба #{complaint.id}</DialogTitle>
              <DialogDescription>Чат с администрацией по вашему обращению</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={complaint.status === "active" ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {complaint.status === "active" ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                {complaint.status === "active" ? "Активная" : "Закрыта"}
              </Badge>
              {user?.role === "admin" && complaint.status === "active" && (
                <Button size="sm" variant="outline" onClick={closeComplaint}>
                  Закрыть жалобу
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Информация о жалобе */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Ваш никнейм:</span> {complaint.user_nickname}
            </div>
            <div>
              <span className="font-medium">Нарушитель:</span> {complaint.violator_nickname}
            </div>
          </div>
          <div>
            <span className="font-medium">Дата инцидента:</span>{" "}
            {new Date(complaint.incident_date).toLocaleDateString("ru-RU")}
          </div>
          <div>
            <span className="font-medium">Доказательства:</span>
            <p className="mt-1 text-gray-600">{complaint.evidence}</p>
          </div>
        </div>

        {/* Чат */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4 border rounded-lg" ref={scrollAreaRef}>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Пока нет сообщений</p>
                <p className="text-sm">Начните диалог с администрацией</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? "bg-blue-600 text-white"
                          : message.is_admin_message
                            ? "bg-green-100 text-green-900 border border-green-200"
                            : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.is_admin_message ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        <span className="text-xs font-medium">
                          {message.is_admin_message ? "Администратор" : message.sender_name}
                        </span>
                        <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Форма отправки сообщения */}
          {complaint.status === "active" && (
            <form onSubmit={sendMessage} className="flex gap-2 mt-4">
              <Input
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
