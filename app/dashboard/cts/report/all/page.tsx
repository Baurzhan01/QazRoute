"use client";

import dynamic from "next/dynamic";

const AllRepairsReportPage = dynamic(() => import("@/app/dashboard/cts/report/components/AllRepairsReportPage"), { ssr: false });

export default function AllRepairsReportRoute() {
  return <AllRepairsReportPage />;
}
