"use client";

import { useEffect, useState } from "react";
import { driverService } from "@/service/driverService";
import type { Driver } from "@/types/driver.types";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // depotId берём из localStorage (его кладётся при авторизации)
  const depotId = typeof window !== "undefined" ? localStorage.getItem("depotId") : null;

  useEffect(() => {
    const fetchDrivers = async () => {
      if (!depotId) return;
      try {
        const res = await driverService.getByDepotId(depotId);
        if (res.isSuccess && res.value) {
          setDrivers(res.value);
        }
      } catch (err) {
        console.error("Ошибка загрузки водителей:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [depotId]);

  // Экспорт в Excel
  const exportToExcel = () => {
    const worksheetData = drivers.map((d, index) => ({
      "№": index + 1,
      "ФИО": d.fullName,
      "Табельный номер": d.serviceNumber,
      "Сотовый номер": d.phone || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Водители");

    XLSX.writeFile(workbook, "drivers.xlsx");
  };

  if (loading) return <div className="p-6">Загрузка...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Водители автобусного парка</h1>
        <Button onClick={exportToExcel}>Экспорт в Excel</Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-center">№</th>
              <th className="px-4 py-2 border text-left">ФИО</th>
              <th className="px-4 py-2 border text-left">Табельный номер</th>
              <th className="px-4 py-2 border text-left">Сотовый номер</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length > 0 ? (
              drivers.map((d, index) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{index + 1}</td>
                  <td className="px-4 py-2 border">{d.fullName}</td>
                  <td className="px-4 py-2 border">{d.serviceNumber}</td>
                  <td className="px-4 py-2 border">{d.phone || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Водители не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
