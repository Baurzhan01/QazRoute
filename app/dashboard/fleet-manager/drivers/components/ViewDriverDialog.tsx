import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { User, Phone, MapPin, Calendar, FileText, Bus, Users } from "lucide-react"
import DriverStatusBadge from "./DriverStatusBadge"
import type { Driver } from "@/types/driver.types"
import defaultAvatar from "@/public/images/driver_avatar.png"

interface ViewDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
  busInfo?: any // <--- Добавь это
}

export default function ViewDriverDialog({ open, onOpenChange, driver,  }: ViewDriverDialogProps) {
  if (!driver) return null

  // Получаем инициалы для аватара
  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Форматирование даты рождения
  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Информация о водителе</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={defaultAvatar.src} alt={driver.fullName} />
            <AvatarFallback className="text-2xl">{getInitials(driver.fullName)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{driver.fullName}</h2>
          <div className="mt-2">
            <DriverStatusBadge status={driver.driverStatus} size="lg" />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Табельный номер</div>
                    <div>{driver.serviceNumber}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Телефон</div>
                    <div>{driver.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Адрес</div>
                    <div>{driver.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Дата рождения</div>
                    <div>{formatBirthDate(driver.birthDate)}</div>
                  </div>
                </div>

                {driver.inReserve ? (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Статус резерва</div>
                      <div className="text-amber-600 font-medium">В резерве водителей</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Bus className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Назначен на автобусы</div>
                      {driver.buses && driver.buses.length > 0 ? (
                        <div className="space-y-1">
                          {driver.buses.map((bus) => (
                            <div key={bus.id}>
                              <span className="font-medium">{bus.garageNumber}</span>
                              <span className="text-sm text-gray-500 ml-2">(гос. номер: {bus.govNumber})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">Не назначен</div>
                      )}
                    </div>
                  </div>
                )}

                {driver.additionalInfo && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Дополнительная информация</div>
                      <div className="text-sm">{driver.additionalInfo}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

