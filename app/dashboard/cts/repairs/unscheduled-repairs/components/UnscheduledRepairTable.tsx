interface UnscheduledRepairTableProps {
    repairs: any[];
  }
  
  export default function UnscheduledRepairTable({ repairs }: UnscheduledRepairTableProps) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">№</th>
              <th className="p-2 border">Автоколонна</th>
              <th className="p-2 border">Маршрут / Выход</th>
              <th className="p-2 border">ФИО водителя</th>
              <th className="p-2 border">Гос. № (Гаражный №)</th>
              <th className="p-2 border">Причина неисправности</th>
              <th className="p-2 border">Время начала</th>
              <th className="p-2 border">Время окончания</th>
              <th className="p-2 border">Дата окончания</th>
              <th className="p-2 border">Время выезда</th>
              <th className="p-2 border">Пробег</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((r, idx) => (
              <tr key={idx} className={`border ${r.exitTime ? "bg-green-100" : ""}`}>
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border text-center">
                  {r.convoyNumber ? `№${r.convoyNumber}` : "-"}
                </td>
                <td className="p-2 border text-center">
                  {r.routeNumber && r.exitNumber ? `№${r.routeNumber}/${r.exitNumber}` : "-"}
                </td>
                <td className="p-2 border">
                  {r.driverName && r.serviceNumber ? `${r.driverName} (№ ${r.serviceNumber})` : "-"}
                </td>
                <td className="p-2 border text-center">
                  {r.govNumber && r.garageNumber ? `${r.govNumber} (${r.garageNumber})` : "-"}
                </td>
                <td className="p-2 border text-red-600 font-medium">{r.description}</td>
                <td className="p-2 border text-center">{r.repairStartTime || "-"}</td>
                <td className="p-2 border text-center">{r.repairEndTime || "-"}</td>
                <td className="p-2 border text-center">{r.repairEndDate || "-"}</td>
                <td className="p-2 border text-center">{r.exitTime || "-"}</td>
                <td className="p-2 border text-center">{r.odometer || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  