export interface DispatchRepairStat {
    convoyId: string
    convoyNumber: number
    repairs: number
  }
  
  export interface DispatchRepairResponse {
    total: number
    items: DispatchRepairStat[]
  }
  