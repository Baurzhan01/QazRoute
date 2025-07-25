"use client"

import { useConvoy } from "../../../../context/ConvoyContext"
import { ConvoyReleasePlanPage } from "./pages/ConvoyReleasePlanPage"



export default function Page() {
  const { convoyId } = useConvoy()

  if (!convoyId) {
    return <div className="text-red-500 p-6">❌ Колонна не выбрана</div>
  }

  // 👇 Ключ заставляет React "пересоздать" страницу при смене колонны
  return <ConvoyReleasePlanPage key={convoyId} />
}
