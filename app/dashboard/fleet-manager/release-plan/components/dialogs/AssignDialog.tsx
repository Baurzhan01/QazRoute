"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AvailableDriver {
  id: string
  name: string
}

interface AssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableDrivers: AvailableDriver[]
  selectedDriverId: string | null
  onDriverChange: (id: string) => void
  onSubmit: () => void
}

export default function AssignDialog({
  open,
  onOpenChange,
  availableDrivers,
  selectedDriverId,
  onDriverChange,
  onSubmit,
}: AssignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Назначить водителя</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label htmlFor="driverSelect">Выберите водителя</Label>
          <Select value={selectedDriverId || ""} onValueChange={onDriverChange}>
            <SelectTrigger id="driverSelect">
              <SelectValue placeholder="Выберите водителя" />
            </SelectTrigger>
            <SelectContent>
              {availableDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button onClick={onSubmit} disabled={!selectedDriverId}>
            Назначить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
