"use client";

import { memo, useMemo } from "react";
import InfoCell from "./InfoCell";

interface AssignmentRowProps {
  a: any;
  i: number;
  readOnlyMode?: boolean;
  displayDate: Date;
}

function formatShortName(fullName?: string, serviceNumber?: string): string {
  if (!fullName) return "—";
  const [last, first = "", middle = ""] = fullName.split(" ");
  const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase();
  const nameShort = `${last} ${initials}`;
  return serviceNumber ? `${nameShort} (№ ${serviceNumber})` : nameShort;
}

const AssignmentRow = memo(function AssignmentRow({ a, i, readOnlyMode, displayDate }: AssignmentRowProps) {
  const primaryDriverName = useMemo(
    () => formatShortName(a.driver?.fullName),
    [a.driver?.fullName]
  );

  const shift2DriverName = useMemo(
    () => formatShortName(a.shift2Driver?.fullName, a.shift2Driver?.serviceNumber),
    [a.shift2Driver?.fullName, a.shift2Driver?.serviceNumber]
  );

  return (
    <tr className="even:bg-gray-50 font-medium text-xl">
      <td className="border px-1 text-center">{a.busLineNumber ?? "—"}</td>
      <td className="border px-1">{a.garageNumber}</td>
      <td className="border px-1">{a.stateNumber}</td>
      <td className="border px-1">{primaryDriverName}</td>
      <td className="border px-1 text-center">{a.driver?.serviceNumber ?? "—"}</td>
      <td className="border px-1 text-center">{a.departureTime}</td>
      <td className="border px-1">
        <InfoCell
          initialValue={a.additionalInfo ?? ""}
          assignmentId={a.dispatchBusLineId}
          date={displayDate}
          type="route"
          busId={null}
          driverId={null}
          textClassName="text-red-600 font-semibold text-sm"
          readOnly={readOnlyMode}
        />
      </td>
      {a.shift2Driver && (
        <>
          <td className="border px-1">{a.shift2AdditionalInfo ?? "—"}</td>
          <td className="border px-1">{shift2DriverName}</td>
          <td className="border px-1 text-center">{a.shift2Driver?.serviceNumber ?? "—"}</td>
        </>
      )}
      <td className="border px-1">{a.endTime}</td>
    </tr>
  );
});

export default AssignmentRow;
