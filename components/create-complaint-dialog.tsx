"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CreateComplaintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplaintCreated: () => void
}

export function CreateComplaintDialog({ open, onOpenChange, onComplaintCreated }: CreateComplaintDialogProps) {
  const [form, setForm] = useState({
    userNickname: "",
    violatorNickname: "",
    incidentDate: "",
    evidence: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        setForm({ userNickname: "", violatorNickname: "", incidentDate: "", evidence: "" })
        onComplaintCreated()
      } else {
        const data = await response.json()
        setError(data.error || "Ошибка при создании жалобы")
      }
    } catch (error) {
      setError("Ошибка сети")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Создать новую жалобу</DialogTitle>
          <DialogDescription>Заполните все поля для подачи жалобы на нарушителя</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userNickname">Ваш никнейм</Label>
            <Input
              id="userNickname"
              placeholder="Введите ваш игровой никнейм"
              value={form.userNickname}
              onChange={(e) => setForm({ ...form, userNickname: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="violatorNickname">Никнейм нарушителя</Label>
            <Input
              id="violatorNickname"
              placeholder="Введите никнейм нарушителя"
              value={form.violatorNickname}
              onChange={(e) => setForm({ ...form, violatorNickname: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incidentDate">Дата инцидента</Label>
            <Input
              id="incidentDate"
              type="date"
              value={form.incidentDate}
              onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Доказательства</Label>
            <Textarea
              id="evidence"
              placeholder="Опишите нарушение и приложите ссылки на скриншоты, видео или другие доказательства"
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
              rows={4}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Создание..." : "Создать жалобу"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
