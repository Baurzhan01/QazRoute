import type { DisplayDriver } from "@/types/driver.types";
import type { DisplayBus } from "@/types/bus.types";

export function filterDrivers({
  drivers,
  assignedIds = [],
  busIds,
  query
}: {
  drivers: DisplayDriver[],
  assignedIds?: string[],
  busIds?: string[],
  query: string
}) {
  const q = query.toLowerCase();

  return drivers.filter(driver => {
    const driverBusIds = (driver as { busIds?: string[] }).busIds;
    const matchesBusIds =
      !busIds ||
      busIds.length === 0 ||
      !driverBusIds ||
      driverBusIds.some((id: string) => busIds.includes(id));

    return (
      ["OnWork", "DayOff"].includes(driver.driverStatus) &&
      !assignedIds.includes(driver.id) &&
      !driver.isAssigned &&
      matchesBusIds &&
      (
        driver.fullName.toLowerCase().includes(q) ||
        driver.serviceNumber.toLowerCase().includes(q)
      )
    );
  });
}

export function filterBuses({
  buses,
  query,
  assignedIds
}: {
  buses: DisplayBus[],
  query: string,
  assignedIds: string[]
}) {
  const q = query.toLowerCase();
  return buses.filter(bus =>
    ["OnWork", "DayOff"].includes(bus.status ?? "") &&
    !assignedIds.includes(bus.id) &&
    !bus.isAssigned &&
    (
      bus.garageNumber.toLowerCase().includes(q) ||
      bus.govNumber.toLowerCase().includes(q) ||
      (bus.stateNumber ?? "").toLowerCase().includes(q)
    )
  );
}
