export interface DailyConvoyStat {
    date: string
    plannedCount: number
    plannedRepairCount: number
    unplannedRepairCount: number
    reserveCount: number
    orderCount: number
  }
  
  export interface ConvoyDispatchRepair {
    convoyId: string
    convoyNumber: number
    dailyStats: DailyConvoyStat[]
  }
  
  export type ConvoyDispatchRepairStat = ConvoyDispatchRepair[]
  
  // 👇 Только если всё ещё используешь /statistic/dispatch-repair
  export interface DispatchRepairStat {
    convoyId: string
    convoyNumber: number
    repairs: number
  }
  
  // Один день статистики по депо
export interface DailyDepotStat {
    date: string
    plannedCount: number
    plannedRepairCount: number
    unplannedRepairCount: number
    reserveCount: number
    orderCount: number
  }
  
  // Новый правильный тип ответа от /statistic/dispatch-repair
  export interface DepotDispatchRepairResponse {
    isSuccess: boolean
    error: string | null
    statusCode: number
    value: DailyDepotStat[]
  }
  