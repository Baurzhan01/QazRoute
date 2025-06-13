"use client"

import { useEffect, useState } from "react"
import FleetManagerDashboard from "./dashboards/FleetManagerDashboard"
import OnDutyMechanicDashboard from "./dashboards/OnDutyMechanicDashboard"
import SeniorDispatcherDashboard from "./dashboards/SeniorDispatcherDashboard"
import DispatcherDashboard from "./dashboards/DispatcherDashboard"
import HrDashboard from "./dashboards/HrDashboard"
import PayrollDashboard from "./dashboards/PayrollDashboard"
import AdminDashboard from "./dashboards/AdminDashboard"
import DefaultDashboard from "./dashboards/DefaultDashboard"

enum UserRole {
  FleetManager = "fleetmanager",
  OnDutyMechanic = "ondutymechanic",
  SeniorDispatcher = "seniordispatcher",
  Dispatcher = "dispatcher",
  HR = "hr",
  Payroll = "payroll",
  Admin = "admin",
}

type User = {
  fullName: string
  role: string
}

const roleDashboardMap: Record<UserRole, JSX.Element> = {
  [UserRole.FleetManager]: <FleetManagerDashboard />,
  [UserRole.OnDutyMechanic]: <OnDutyMechanicDashboard />,
  [UserRole.SeniorDispatcher]: <SeniorDispatcherDashboard />,
  [UserRole.Dispatcher]: <DispatcherDashboard />,
  [UserRole.HR]: <HrDashboard />,
  [UserRole.Payroll]: <PayrollDashboard />,
  [UserRole.Admin]: <AdminDashboard />,
}

export default function RoleDashboard() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const authData = localStorage.getItem("authData")
    if (authData) {
      const parsed = JSON.parse(authData)
      setUser({
        fullName: parsed.fullName,
        role: parsed.role.toLowerCase(), // нормализация
      })
    }
  }, [])

  if (!user) return <p>Загрузка данных...</p>

  const roleKey = user.role as UserRole
  const Dashboard = roleDashboardMap[roleKey] ?? <DefaultDashboard />

  return Dashboard
}
