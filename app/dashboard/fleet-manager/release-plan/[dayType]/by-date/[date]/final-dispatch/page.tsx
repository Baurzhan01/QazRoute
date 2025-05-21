"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import FinalDispatchExport from "./components/FinalDispatchExport";
import FinalDispatchTable from "../../../../components/FinalDispatchTable";
import { useFinalDispatch } from "../../../../hooks/useFinalDispatch";
import { formatDateLabel, formatDayOfWeek, parseDate } from "../../../../utils/dateUtils";

export default function FinalDispatchPage() {
  const params = useParams();
  const router = useRouter();

  const dateParam = params?.date as string | undefined;
  const dayType = params?.dayType as string | undefined;
  const displayDate = useMemo(() => {
    return dateParam ? parseDate(dateParam) : new Date();
  }, [dateParam]);

  const {
    finalDispatch,
    convoySummary,
    convoyNumber,
    driversCount,
    busesCount,
    loading,
    error,
  } = useFinalDispatch(displayDate!);

  const depotName = convoyNumber ? `Автоколонна №${convoyNumber}` : "—";

  const handleGoBack = () => {
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateParam}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 bg-white border-b py-4 px-6 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-3xl font-bold">
            План выпуска автобусов {depotName && `· ${depotName}`}
          </h2>
          {displayDate && (
            <p className="text-gray-600">
              {formatDayOfWeek(displayDate)}, {formatDateLabel(displayDate)}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                `/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateParam}/final-dispatch/print`,
                "_blank"
              )
            }
          >
            📄 Файл для печати
          </Button>
          {finalDispatch && displayDate && (
            <FinalDispatchExport
              date={displayDate}
              data={finalDispatch}
              depotName={depotName}
            />
          )}
          <Button variant="secondary" onClick={handleGoBack}>
            ← Назад к маршрутам
          </Button>
        </div>
      </div>

      <div className="p-6">
        {loading && <p className="text-gray-500">Загрузка данных...</p>}
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        {!loading && !error && finalDispatch && (
          <FinalDispatchTable
            data={finalDispatch}
            depotNumber={convoyNumber}
            driversCount={driversCount}
            busesCount={busesCount}
            convoySummary={convoySummary}
          />
        )}
      </div>
    </div>
  );
}
