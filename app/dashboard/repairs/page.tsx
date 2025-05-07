    "use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// Мок данные ремонта
const repairs = [
  {
    id: 1,
    busNumber: "1234",
    licensePlate: "A123BC",
    column: "1",
    reason: "Замена тормозных колодок",
    mechanic: "Иванов А.С.",
    status: "Завершен",
    date: "2025-05-06T09:30",
  },
  {
    id: 2,
    busNumber: "2345",
    licensePlate: "B234CD",
    column: "2",
    reason: "Проблемы с электрикой",
    mechanic: "Петров И.К.",
    status: "В процессе",
    date: "2025-05-07T11:00",
  },
  {
    id: 3,
    busNumber: "3456",
    licensePlate: "C345DE",
    column: "3",
    reason: "Утечка масла",
    mechanic: "Сидоров В.П.",
    status: "Завершен",
    date: "2025-05-05T14:20",
  },
];

export default function RepairsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="h-7 w-7 text-sky-500" />
          Журнал ремонтов
        </h1>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Добавить ремонт
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список ремонтов</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Автобус</TableHead>
                <TableHead>Колонна</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Механик</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата и время</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>
                    {repair.busNumber} / {repair.licensePlate}
                  </TableCell>
                  <TableCell>{repair.column}</TableCell>
                  <TableCell>{repair.reason}</TableCell>
                  <TableCell>{repair.mechanic}</TableCell>
                  <TableCell>
                    <Badge className={repair.status === "Завершен" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {repair.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(repair.date), "d MMMM yyyy, HH:mm", { locale: ru })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
