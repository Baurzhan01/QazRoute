import apiClient from "@/app/api/apiClient"

export const statementsService = {
  // POST /statements/generate/{dispatchId}
  generate: async (dispatchId: string) => {
    const { data } = await apiClient.post(`/statements/generate/${dispatchId}`)
    return data
  },
} as const
