// types/busAggregate.types.ts
import type { ApiResponse } from "./api.types";

export enum BusAggregateStatus {
  InRepair = "InRepair", // default
  Restored = "Restored",
  Installed = "Installed",
  Decommissioned = "Decommissioned",
}

export const BUS_AGGREGATE_STATUS_LABELS: Record<BusAggregateStatus, string> = {
  [BusAggregateStatus.InRepair]: "В ремонте",
  [BusAggregateStatus.Restored]: "Восстановлен",
  [BusAggregateStatus.Installed]: "Установлен",
  [BusAggregateStatus.Decommissioned]: "Списан",
};

export interface BusAggregate {
  id: string;
  busId: string;
  busGovNumber: string;
  busGarageNumber: string;
  description: string;
  urls: string[];
  date: string; // format DD-MM-YYYY as provided by backend
  status: BusAggregateStatus;
  urlAct: string | null;
  installedBusId: string | null;
  installedBusGovNumber: string | null;
  installedBusGarageNumber: string | null;
  installedDate: string | null;
}

export interface CreateBusAggregateRequest {
  busId: string;
  description: string;
  urls: string[];
  date: string;
  status: BusAggregateStatus;
  installedBusId?: string | null;
  installedDate?: string | null;
  urlAct?: string | null;
}

export interface UpdateBusAggregateRequest {
  description: string;
  urls: string[];
  date: string;
  status: BusAggregateStatus;
  urlAct?: string | null;
  installedBusId?: string | null;
  installedDate?: string | null;
}

export interface BusAggregateList {
  items: BusAggregate[];
  totalCount: number;
}

export type BusAggregateListResponse = ApiResponse<BusAggregateList>;
export type BusAggregateResponse = ApiResponse<BusAggregate>;
export type BusAggregateByBusResponse = ApiResponse<BusAggregate | BusAggregate[]>;
