import { useEffect, useMemo, useState } from "react"

import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { releasePlanService } from "@/service/releasePlanService"

import type { ActionLogStatus } from "@/types/actionLog.types"
import type { StatementStatus } from "@/types/statement.types"

import type { StatusModalResult, StatusModalState } from "../types"
import { ACTION_LOG_STATUS_VALUES } from "../utils/constants"
import { prettifyStatus } from "../utils/helpers"

const titleMap: Record<StatusModalState["mode"], string> = {
  gotOff: "Фиксация схода",
  order: "Отправка на заказ",
  complete: "Завершение рейса",
  remove: "Снятие с маршрута",
}

interface StatementActionModalProps {
  state: StatusModalState
  submitting: boolean
  onClose: () => void
  onSubmit: (result: StatusModalResult) => void | Promise<void>
}

const StatementActionModal = ({ state, submitting, onClose, onSubmit }: StatementActionModalProps) => {
  const { open, mode, row } = state

  const [historyLoading, setHistoryLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [revolutionCount, setRevolutionCount] = useState<string>("")
  const [reason, setReason] = useState<ActionLogStatus | "">(mode === "order" ? "Order" : "")
  const [comment, setComment] = useState("")

  const targetStatus: StatementStatus = useMemo(() => {
    switch (mode) {
      case "gotOff":
        return "GotOff"
      case "order":
        return "OnOrder"
      case "complete":
        return "Completed"
      case "remove":
      default:
        return "Rejected"
    }
  }, [mode])

  useEffect(() => {
    if (!open || !row) return

    setRevolutionCount(row.spokenRevolutions != null ? String(row.spokenRevolutions) : "")
    setComment("")
    setReason(mode === "order" ? "Order" : "")

    if (mode === "gotOff" || mode === "remove") {
      setHistoryLoading(true)
      releasePlanService
        .getDispatchHistory(row.dispatchBusLineId)
        .then(res => {
          const items = (res.value ?? []).map(item => {
            const time = item.replacedAt ? new Date(item.replacedAt) : null
            const formatted = time ? `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}` : "—"
            return `${formatted} — ${item.type}`
          })
          setHistory(items)
        })
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false))
    } else {
      setHistory([])
    }
  }, [mode, open, row])

  const handleConfirm = () => {
    const normalized = revolutionCount.trim() === "" ? null : Number(revolutionCount.replace(",", "."))
    if (normalized !== null && Number.isNaN(normalized)) {
      toast({ title: "Некорректное значение", description: "Введите число", variant: "destructive" })
      return
    }

    if ((mode === "gotOff" || mode === "remove") && !reason) {
      toast({ title: "Укажите причину", variant: "destructive" })
      return
    }

    if (mode === "complete" && normalized == null) {
      toast({ title: "Введите обороты", variant: "destructive" })
      return
    }

    onSubmit({
      status: targetStatus,
      revolutionCount: normalized,
      reason: reason || null,
      comment: comment || null,
      orderDescription: mode === "order" ? comment || null : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titleMap[mode]}</DialogTitle>
          {row && (
            <DialogDescription>
              Маршрут №{row.routeNumber}, выход {row.busLineNumber}
            </DialogDescription>
          )}
        </DialogHeader>

        {(mode === "gotOff" || mode === "remove") && (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium mb-2">История замен</p>
            {historyLoading ? (
              <p className="text-muted-foreground">Загрузка...</p>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground">Записей нет</p>
            ) : (
              <ul className="space-y-1 text-muted-foreground">
                {history.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Обороты</label>
            <Input
              value={revolutionCount}
              onChange={event => setRevolutionCount(event.target.value)}
              inputMode="numeric"
              placeholder="0"
            />
          </div>

          {(mode === "gotOff" || mode === "remove" || mode === "order") && (
            <div>
              <label className="block text-sm font-medium mb-1">Причина</label>
              <Select value={reason} onValueChange={value => setReason(value as ActionLogStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите причину" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_LOG_STATUS_VALUES.map(value => (
                    <SelectItem key={value} value={value}>
                      {prettifyStatus(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              {mode === "order" ? "Описание заказа" : "Комментарий"}
            </label>
            <Textarea
              value={comment}
              onChange={event => setComment(event.target.value)}
              rows={3}
              placeholder={mode === "order" ? "Укажите детали заказа" : "Дополнительная информация"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Сохраняем..." : "Подтвердить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StatementActionModal
