import type { DisplayBus, DisplayDriver } from "./driver.types";

// DTO от сервера (id-шные объекты)
export interface RepairDto {
  convoyId: string;
  convoyNumber: number;
  number: number;
  description: string;
  bus: {
    id: string;
    govNumber: string;
    garageNumber: string;
  };
  driver: {
    id: string;
    fullName: string;
    serviceNumber: string;
  };
}

// Расширенная запись с полными объектами
export interface RepairRecord extends Omit<RepairDto, "bus" | "driver"> {
  bus: DisplayBus;
  driver: DisplayDriver;
}

export interface GroupedRepairsByConvoy {
  convoyId: string;
  convoyNumber: number;
  repairs: RepairRecord[];
}
