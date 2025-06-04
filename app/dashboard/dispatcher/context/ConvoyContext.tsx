"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { convoyService } from "@/service/convoyService"

interface ConvoyContextType {
  convoyId: string | null
  convoyNumber: number | null
  setConvoyId: (id: string) => void
}

const ConvoyContext = createContext<ConvoyContextType>({
  convoyId: null,
  convoyNumber: null,
  setConvoyId: () => {},
})

export const ConvoyProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ id: string }>()
  const idFromUrl = params?.id ?? null

  const [convoyId, setConvoyId] = useState<string | null>(idFromUrl)
  const [convoyNumber, setConvoyNumber] = useState<number | null>(null)

  useEffect(() => {
    const loadConvoy = async () => {
      if (!idFromUrl) return

      try {
        setConvoyId(idFromUrl)
        const res = await convoyService.getById(idFromUrl)
        setConvoyNumber(res.value?.number ?? null)
      } catch (error) {
        console.error("Ошибка при загрузке колонны:", error)
        setConvoyNumber(null)
      }
    }

    loadConvoy()
  }, [idFromUrl])

  return (
    <ConvoyContext.Provider value={{ convoyId, convoyNumber, setConvoyId }}>
      {children}
    </ConvoyContext.Provider>
  )
}

export const useConvoy = () => useContext(ConvoyContext)
