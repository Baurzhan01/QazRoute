"use client";

import RouteSection from "./RouteSection";
import ReserveRowSection from "./ReserveRowSection";
import BottomBlocks from "./BottomBlocks";
import type { FinalDispatchData, OrderAssignment, ReserveAssignmentUI, RouteGroup } from "@/types/releasePlanTypes";
import { mapToReserveAssignmentUI } from "../utils/releasePlanUtils";

interface FinalDispatchTableProps {
  data: FinalDispatchData;
  depotNumber?: number;
  driversCount: number;
  busesCount: number;
  convoySummary?: {
    totalDrivers?: number;
    totalBuses?: number;
    driverOnWork?: number;
    busOnWork?: number;
  };
  dayType: string;
  readOnlyMode?: boolean;
  disableLinks?: boolean;
  orderAssignments?: OrderAssignment[];
}

export default function FinalDispatchTable({
  data,
  depotNumber,
  driversCount,
  busesCount,
  convoySummary,
  dayType,
  readOnlyMode = false,
  disableLinks = false,
  orderAssignments = [],
}: FinalDispatchTableProps) {
  const {
    routeGroups = [],
    reserveAssignments = [],
    repairBuses = [],
    dayOffBuses = [],
    driverStatuses = {},
    date,
  } = data;

  const displayDate = new Date(date);

  const mappedReserve: ReserveAssignmentUI[] = reserveAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Reserved")
  );
  const mappedOrders: ReserveAssignmentUI[] = orderAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Order")
  );

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      <div className="flex justify-between border px-6 py-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="space-y-1">
          <div><strong>Водителей в колонне:</strong> {convoySummary?.totalDrivers ?? driversCount}</div>
          <div><strong>Автобусов в колонне:</strong> {convoySummary?.totalBuses ?? busesCount}</div>
          <div><strong>Привл. автобусов:</strong> 0</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg tracking-wide">
            План выпуска · Колонна №{depotNumber ?? "—"}
          </div>
          <div className="text-xl font-bold tracking-wide">
            на {displayDate.toLocaleDateString("ru-RU")}
          </div>
        </div>
      </div>

      {routeGroups.map((group: RouteGroup) => (
        <RouteSection
          key={group.routeId}
          group={group}
          date={date}
          dayType={dayType}
          displayDate={displayDate}
          readOnlyMode={readOnlyMode}
          disableLinks={disableLinks}
        />
      ))}

      <ReserveRowSection
        title="РЕЗЕРВ"
        color="yellow"
        list={mappedReserve}
        dayType={dayType}
        date={date}
        disableLinks={disableLinks}
        readOnlyMode={readOnlyMode}
        displayDate={displayDate}
        linkPath="reserve"
      />

      <ReserveRowSection
        title="ЗАКАЗ"
        color="lime"
        list={mappedOrders}
        dayType={dayType}
        date={date}
        disableLinks={disableLinks}
        readOnlyMode={readOnlyMode}
        displayDate={displayDate}
        linkPath="orders"
      />

      <BottomBlocks
        repairBuses={repairBuses}
        dayOffBuses={dayOffBuses}
        driverStatuses={{
          DayOff: driverStatuses.DayOff ?? [],
          OnVacation: driverStatuses.OnVacation ?? [],
          OnSickLeave: driverStatuses.OnSickLeave ?? [],
          Intern: driverStatuses.Intern ?? [],
          Fired: [],
          total: driversCount,
        }}
        convoySummary={convoySummary}
        date={date}
        disableLinks={disableLinks}
      />
    </div>
  );
}
