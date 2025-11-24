import { BUS_AGGREGATE_STATUS_LABELS, BusAggregateStatus } from "@/types/busAggregate.types";

export const BUS_AGGREGATE_STATUS_BADGE_VARIANT: Record<
  BusAggregateStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  [BusAggregateStatus.InRepair]: "secondary",
  [BusAggregateStatus.Restored]: "default",
  [BusAggregateStatus.Installed]: "outline",
  [BusAggregateStatus.Decommissioned]: "destructive",
};

export const getBusAggregateStatusLabel = (status?: BusAggregateStatus | null) =>
  status ? BUS_AGGREGATE_STATUS_LABELS[status] ?? status : "—";
