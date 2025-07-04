"use client";

import type { GroupedRepairsByConvoy } from "@/types/repair.types";

interface Props {
  data: GroupedRepairsByConvoy[];
  date: string;
}

export default function RepairTableAllNoActions({ data }: Props) {
  return (
    <div className="space-y-8">
      {data.length === 0 ? (
        <p className="text-gray-500">Нет данных по ремонтам</p>
      ) : (
        data.map(({ convoyId, convoyNumber, repairs }) => (
          <div key={convoyId} className="space-y-2">
            <h3 className="text-xl font-semibold text-sky-700 border-b pb-1">
              🚍 Автоколонна №{convoyNumber}
            </h3>

            {repairs.length === 0 ? (
              <p className="text-gray-400 italic ml-2">Нет ремонтов в этой колонне</p>
            ) : (
              <div className="rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-gray-800">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-2 w-[25%]">🚌 Автобус</th>
                      <th className="px-4 py-2 w-[25%]">👨‍🔧 Водитель</th>
                      <th className="px-4 py-2">🛠 Описание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map((r) => (
                      <tr
                        key={`${r.bus.id}-${r.driver.id}-${r.number}`}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <div className="font-medium">
                            {r.bus?.govNumber || "—"}
                          </div>
                          <div className="text-sm text-gray-500">
                            ({r.bus?.garageNumber || "—"})
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{r.driver?.fullName || "—"}</div>
                          <div className="text-sm text-gray-500">
                            Таб. № {r.driver?.serviceNumber || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-red-600 font-semibold text-base">
                            {r.description || <span className="text-gray-400 italic">—</span>}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
