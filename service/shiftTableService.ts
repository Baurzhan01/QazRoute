import { getAuthData } from '../lib/auth-utils'
import apiClient from '../app/api/apiClient'
import { ApiResponse } from '../types/api.types'
import { WorkShiftType, UserWorkShift } from '../types/coordinator.types'

export const shiftTableService = {
    getShiftTable: async (year: number, month: number) => {
      const auth = getAuthData()
      return await apiClient.get<ApiResponse<UserWorkShift[]>>(`/coordinator/work-shift/by-depot`, {
        params: { depotId: auth?.busDepotId, year, month },
      }).then(res => res.data)
    },
  
    updateShift: async (userId: string, date: string, shiftType: WorkShiftType) => {
      return await apiClient.put<ApiResponse<void>>(`/coordinator/work-shift/update-shift`, null, {
        params: { userId, date, shiftType },
      }).then(res => res.data)
    },
  
    generateMonthlyShift: async (depotId: string, year: number, month: number) => {
      return await apiClient.post<ApiResponse<void>>(`/coordinator/work-shift/generate-monthly`, null, {
        params: { depotId, year, month },
      }).then(res => res.data)
    }
  }
  