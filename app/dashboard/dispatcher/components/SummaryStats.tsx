interface SummaryStatsProps {
    summaries: {
      driverCount: number;
      busCount: number;
      routeCount: number;
    }[];
  }
  
  export default function SummaryStats({ summaries }: SummaryStatsProps) {
    const totalDrivers = summaries.reduce((sum, c) => sum + c.driverCount, 0);
    const totalBuses = summaries.reduce((sum, c) => sum + c.busCount, 0);
    const totalRoutes = summaries.reduce((sum, c) => sum + c.routeCount, 0);
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Всего водителей</p>
          <p className="text-2xl font-semibold text-green-700">{totalDrivers}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Всего автобусов</p>
          <p className="text-2xl font-semibold text-blue-700">{totalBuses}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Всего маршрутов</p>
          <p className="text-2xl font-semibold text-amber-700">{totalRoutes}</p>
        </div>
      </div>
    );
  }
  