// types/analytics.types.ts
export interface FleetStats {
    totalBuses: number;
    activeRoutes: number;
    drivers: number;
    maintenanceBuses: number;
  }
  
  export interface FleetStatus {
    operational: number;
    inMaintenance: number;
    outOfService: number;
  }