// services/analyticService.ts
import { busService } from './busService';
import { routeService } from './routeService';
import { driverService } from './driverService';
import { Bus, BusStatus } from '../types/bus.types';
import type { FleetStats, FleetStatus } from '../types/analytics.types';

export const analyticService = {
  getFleetStats: async (): Promise<FleetStats> => {
    try {
      const [buses, routes, drivers] = await Promise.all([
        busService.getAll(),
        routeService.getAll(),
        driverService.getAll(),
      ]);

      const maintenanceBuses = buses.value?.filter(
        (bus) => bus.busStatus === BusStatus.UnderRepair || bus.busStatus === BusStatus.LongTermRepair, 
      ).length || 0;

      return {
        totalBuses: buses.value?.length || 0,
        activeRoutes: routes.value?.length || 0,
        drivers: drivers.value?.length || 0,
        maintenanceBuses,
      };
    } catch (error) {
      console.error('Ошибка при получении статистики автопарка:', error);
      throw error;
    }
  },

  getFleetStatus: async (): Promise<FleetStatus> => {
    try {
      const buses = await busService.getAll();

      if (!buses.value || buses.value.length === 0) {
        return { operational: 0, inMaintenance: 0, outOfService: 0 };
      }

      const total = buses.value.length;
      const operational = buses.value.filter((bus) => bus.busStatus === BusStatus.OnWork).length;
      const inMaintenance = buses.value.filter(
        (bus) => bus.busStatus === BusStatus.UnderRepair || bus.busStatus === BusStatus.LongTermRepair,
      ).length;
      const outOfService = total - operational - inMaintenance;

      return {
        operational,
        inMaintenance,
        outOfService,
      };
    } catch (error) {
      console.error('Ошибка при получении статуса автопарка:', error);
      throw error;
    }
  },
};