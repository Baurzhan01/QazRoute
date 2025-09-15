"use client";

import { Suspense } from "react";
import MechanicHomePage from "./MechanicHomePage";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-600 gap-4">
      <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-sm font-medium">Загрузка данных...</div>
    </div>
  );
}

export default function MechanicPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MechanicHomePage />
    </Suspense>
  );
}
