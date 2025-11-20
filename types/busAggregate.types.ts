// types/busAggregate.types.ts
import type { ApiResponse } from "./api.types";

export interface BusAggregate {
  id: string;
  busId: string;
  busGovNumber: string;
  busGarageNumber: string;
  description: string;
  urls: string[];
  date: string; // format DD-MM-YYYY as provided by backend
}

export interface CreateBusAggregateRequest {
  busId: string;
  description: string;
  urls: string[];
  date: string;
}

export interface UpdateBusAggregateRequest {
  description: string;
  urls: string[];
  date: string;
}

export interface BusAggregateList {
  items: BusAggregate[];
  totalCount: number;
}

export type BusAggregateListResponse = ApiResponse<BusAggregateList>;
export type BusAggregateResponse = ApiResponse<BusAggregate>;
