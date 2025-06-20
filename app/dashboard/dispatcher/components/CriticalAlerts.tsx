interface CriticalAlertsProps {
    summaries: {
      id: string;
      number: number;
      driverCount: number;
      busCount: number;
      routeCount: number;
    }[];
  }
  
  export default function CriticalAlerts({ summaries }: CriticalAlertsProps) {
    // Пример: колонны с 0 водителей, 0 автобусов, 0 маршрутов
    const issues = summaries.filter(
      (s) => s.driverCount === 0 || s.busCount === 0 || s.routeCount === 0
    );
  
    if (issues.length === 0) return null;
  
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <h2 className="text-red-700 font-semibold mb-2">⚠️ Обнаружены проблемы в колоннах</h2>
        <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
          {issues.map((s) => (
            <li key={s.id}>
              Колонна №{s.number}: {s.driverCount === 0 && "нет водителей"}
              {s.driverCount === 0 && s.busCount === 0 && ", "}
              {s.busCount === 0 && "нет автобусов"}
              {(s.driverCount === 0 || s.busCount === 0) && s.routeCount === 0 && ", "}
              {s.routeCount === 0 && "нет маршрутов"}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  