// components/PopoverEditor.tsx
"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { releasePlanService } from "@/service/releasePlanService"
import { formatDate } from "../utils/dateUtils"

interface PopoverEditorProps {
  initialValue: string
  assignmentId: string
  date: Date
  type: "route" | "reserve"
  busId?: string | null
  driverId?: string | null
  readOnly?: boolean
}

export default function PopoverEditor({
  initialValue,
  assignmentId,
  date,
  type,
  busId = null,
  driverId = null,
  readOnly = false,
}: PopoverEditorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialValue || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const formattedDate = formatDate(date)
      if (type === "reserve") {
        await releasePlanService.updateReserveDescription(assignmentId, formattedDate, value.trim())
      } else {
        await releasePlanService.updateBusLineDescription(assignmentId, formattedDate, value.trim())
      }
      toast({ title: "Сохранено", description: "Доп. информация обновлена" })
      setOpen(false)
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="text-xs text-red-600 hover:underline px-1 py-0.5">
          {value ? value : "—"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 space-y-3">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Введите дополнительную информацию"
          className="text-sm"
          disabled={readOnly}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={saving || readOnly}>
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
