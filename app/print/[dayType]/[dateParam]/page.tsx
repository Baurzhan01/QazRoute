"use client"

import { useState, useEffect } from "react"
import FinalDispatchTable from "../../../dashboard/fleet-manager/release-plan/components/FinalDispatchTable"
import { useFinalDispatch } from "../../../dashboard/fleet-manager/release-plan/hooks/useFinalDispatch"
import { useParams } from "next/navigation"

function page() {
    const params = useParams()
    const [displayDate, setDisplayDate] = useState<Date | null>(null)
    const rawDayType = params?.dayType as string | undefined
    const dateParam = params?.dateParam as string | undefined
    const dayType = normalizeDayType(rawDayType)

    useEffect(() => {
        if (dateParam) {
            setDisplayDate(new Date(dateParam))
        }
    }, [dateParam])

    const {
        finalDispatch,
        convoySummary,
        driversCount,
        busesCount,
        convoyNumber,
        loading,
        error,
    } = useFinalDispatch(displayDate, dayType)

    if (loading) {
        return <div>Загрузка...</div>
    }

    if (error) {
        return <div>Ошибка: {error}</div>
    }

    return (
        <div>
            {finalDispatch && (
                <FinalDispatchTable
                    data={finalDispatch}
                    depotNumber={convoyNumber}
                    driversCount={driversCount}
                    busesCount={busesCount}
                    convoySummary={convoySummary}
                    dayType={dayType ?? "workday"}
                />
            )}
        </div>
    )
}

export default page

function normalizeDayType(rawDayType: string | undefined): "workday" | "saturday" | "sunday" | "holiday" | undefined {
    if (!rawDayType) return undefined;
    switch (rawDayType.toLowerCase()) {
        case "workday": return "workday";
        case "saturday": return "saturday";
        case "sunday": return "sunday";
        case "holiday": return "holiday";
        default: return undefined;
    }
}

