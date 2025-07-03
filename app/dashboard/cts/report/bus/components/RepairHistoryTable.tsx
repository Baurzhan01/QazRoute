import { RouteExitRepairDto } from '@/types/routeExitRepair.types'
import { repairTypeLabels } from '@/lib/utils/repair-utils'
import { formatTime } from '@/lib/utils/time-utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Props {
  repairs: RouteExitRepairDto[]
  loading?: boolean
}

export default function RepairHistoryTable({ repairs, loading }: Props) {
  if (loading) return <p className="text-muted-foreground">Загрузка...</p>
  if (!repairs.length) return <p className="text-muted-foreground">Нет данных для отображения</p>

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-xs text-gray-600">Дата</TableHead>
            <TableHead className="text-xs text-gray-600">Время заезда</TableHead>
            <TableHead className="text-xs text-gray-600">Колонна</TableHead>
            <TableHead className="text-xs text-gray-600">Маршрут / Выход</TableHead>
            <TableHead className="text-xs text-gray-600">Водитель</TableHead>
            <TableHead className="text-xs text-gray-600">Тип ремонта</TableHead>
            <TableHead className="text-xs text-gray-600">Причина</TableHead>
            <TableHead className="text-xs text-gray-600">Начало ремонта</TableHead>
            <TableHead className="text-xs text-gray-600">Окончание ремонта</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repairs.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.startDate}</TableCell>
              <TableCell>{formatTime(r.startTime)}</TableCell>
              <TableCell>{r.convoy?.number ? `№${r.convoy.number}` : '—'}</TableCell>
              <TableCell>{r.route?.number ? `${r.route.number} / ${r.busLine?.number ?? ''}` : '—'}</TableCell>
              <TableCell>{r.driver?.fullName || '—'}</TableCell>
              <TableCell>{repairTypeLabels[r.repairType]}</TableCell>
              <TableCell>{r.text || '—'}</TableCell>
              <TableCell>{r.startRepairTime ? formatTime(r.startRepairTime) : '—'}</TableCell>
              <TableCell>{r.endRepairTime ? formatTime(r.endRepairTime) : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
