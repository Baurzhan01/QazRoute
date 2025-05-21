"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { releasePlanService } from "@/service/releasePlanService";
import { prepareFinalDispatchData } from "../../../../../utils/dispatchMapper";
import { getAuthData } from "@/lib/auth-utils";
import { formatDate } from "../../../../../utils/dateUtils";
import FinalDispatchTable from "../../../../../components/FinalDispatchTable";
import type { FinalDispatchData } from "@/types/releasePlanTypes";

export default function PrintFinalDispatchPage() {
  const [data, setData] = useState<FinalDispatchData | null>(null);
  const [driversCount, setDriversCount] = useState(0);
  const [busesCount, setBusesCount] = useState(0);

  const { dayType, date } = useParams() as { dayType: string; date: string };

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuthData();
      const convoyId = auth?.convoyId;
      if (!date || !convoyId) return;

      const formattedDate = formatDate(new Date(date));
      const [dispatchResult, reserveResult] = await Promise.all([
        releasePlanService.getFullDispatchByDate(formattedDate, convoyId),
        releasePlanService.getReserveAssignmentsByDate(formattedDate),
      ]);

      if (!dispatchResult.isSuccess || !reserveResult.isSuccess) return;

      const prepared = prepareFinalDispatchData({
        ...dispatchResult.value,
        reserves: reserveResult.value,
      });

      const uniqueDrivers = new Set<string>();
      const uniqueBuses = new Set<string>();

      prepared.routeGroups.forEach(group =>
        group.assignments.forEach(a => {
          if (a.driver?.serviceNumber) uniqueDrivers.add(a.driver.serviceNumber);
          if (a.shift2Driver?.serviceNumber) uniqueDrivers.add(a.shift2Driver.serviceNumber);
          if (a.garageNumber) uniqueBuses.add(a.garageNumber);
        })
      );

      prepared.reserveAssignments.forEach(r => {
        if (r.driver?.serviceNumber) uniqueDrivers.add(r.driver.serviceNumber);
        if (r.garageNumber) uniqueBuses.add(r.garageNumber);
      });

      setDriversCount(uniqueDrivers.size);
      setBusesCount(uniqueBuses.size);
      setData(prepared);
    };

    fetchData();
  }, [date]);

  return (
    <div className="p-6">
      {data && (
        <FinalDispatchTable
          data={data}
          depotNumber={parseInt(getAuthData()?.convoyNumber || "") || undefined}
          driversCount={driversCount}
          busesCount={busesCount}
        />
      )}
    </div>
  );
}
