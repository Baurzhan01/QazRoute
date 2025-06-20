"use client";

import { useRouter } from "next/navigation";
import ConvoySummaryCard from "./ConvoySummaryCard";

interface ConvoySummary {
  id: string;
  number: number;
  driverCount: number;
  busCount: number;
  routeCount: number;
}

interface ConvoyGridProps {
  summaries: ConvoySummary[];
}

export default function ConvoyGrid({ summaries }: ConvoyGridProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {summaries.map((summary) => (
        <ConvoySummaryCard
          key={summary.id}
          convoyNumber={summary.number}
          driverCount={summary.driverCount}
          busCount={summary.busCount}
          routeCount={summary.routeCount}
          onManage={() => router.push(`/dashboard/dispatcher/convoy/${summary.id}`)}
        />
      ))}
    </div>
  );
}