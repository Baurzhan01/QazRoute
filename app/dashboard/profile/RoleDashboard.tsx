"use client";

import { useEffect, useState } from "react";
import FleetManagerDashboard from "./dashboards/FleetManagerDashboard";
import OnDutyMechanicDashboard from "./dashboards/OnDutyMechanicDashboard";
import SeniorDispatcherDashboard from "./dashboards/SeniorDispatcherDashboard";
import DispatcherDashboard from "./dashboards/DispatcherDashboard";
import HrDashboard from "./dashboards/HrDashboard";
import PayrollDashboard from "./dashboards/PayrollDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import DefaultDashboard from "./dashboards/DefaultDashboard";

type User = {
  fullName: string;
  role: string;
};

export default function RoleDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const parsed = JSON.parse(authData);
      setUser({
        fullName: parsed.fullName,
        role: parsed.role,
      });
    }
  }, []);

  if (!user) return <p>Загрузка данных...</p>;

  switch (user.role) {
    case "FleetManager":
      return <FleetManagerDashboard />;
    case "OnDutyMechanic":
      return <OnDutyMechanicDashboard />;
    case "SeniorDispatcher":
      return <SeniorDispatcherDashboard />;
    case "Dispatcher":
      return <DispatcherDashboard />;
    case "HR":
      return <HrDashboard />;
    case "Payroll":
      return <PayrollDashboard />;
    case "Admin":
      return <AdminDashboard />;
    default:
      return <DefaultDashboard />;
  }
}
