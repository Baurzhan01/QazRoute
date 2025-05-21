import { ShiftTable } from "./components/ShiftTable"

export default function ShiftTablePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Табель рабочего времени диспетчеров</h1>
      <ShiftTable />
    </div>
  )
}
