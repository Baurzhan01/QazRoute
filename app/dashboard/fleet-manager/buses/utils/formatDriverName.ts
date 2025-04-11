import type { Driver } from "@/types/driver.types"

export function formatDriverName(driver: Driver): string {
  const firstName = driver.firstName ? `${driver.firstName.charAt(0)}.` : ""
  const middleName = driver.middleName ? `${driver.middleName.charAt(0)}.` : ""

  return `${driver.lastName} ${firstName}${middleName}`
}

