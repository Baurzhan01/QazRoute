"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Driver } from "@/types/driver.types"

interface DeleteDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
  onConfirm: (id: string) => Promise<boolean>
}

export default function DeleteDriverDialog({ open, onOpenChange, driver, onConfirm }: DeleteDriverDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!driver) return

    setIsDeleting(true)
    const success = await onConfirm(driver.id as string)

    if (success) {
      onOpenChange(false)
    }

    setIsDeleting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить водителя</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Вы уверены, что хотите удалить водителя «{driver?.fullName}»?</p>
          <p className="text-sm text-gray-500 mt-2">Это действие нельзя отменить.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

