// hooks/useReleasePlan.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { releasePlanService } from "@/service/releasePlanService"
import { toast } from "@/components/ui/use-toast"

export function useReleasePlan(selectedDate: Date) {
  const queryClient = useQueryClient()
  const dateStr = selectedDate.toISOString().split("T")[0]

  const {
    data: dayPlan,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["releasePlan", dateStr],
    queryFn: async () => {
      const response = await releasePlanService.getFullDispatchByDate(dateStr)
      if (!response.isSuccess || !response.value) throw new Error(response.error)
      return response.value
    }
  })

  const assignToReserve = useMutation({
    mutationFn: (payload) => releasePlanService.assignToReserve(dateStr, payload),
    onSuccess: () => {
      toast({ title: "Назначено в резерв" })
      refetch()
    },
    onError: () => toast({ title: "Ошибка назначения в резерв", variant: "destructive" }),
  })

  const removeFromReserve = useMutation({
    mutationFn: (payload) => releasePlanService.removeFromReserve(dateStr, payload),
    onSuccess: () => {
      toast({ title: "Удалено из резерва" })
      refetch()
    },
    onError: () => toast({ title: "Ошибка удаления из резерва", variant: "destructive" }),
  })

  const assignToBusLine = useMutation({
    mutationFn: (payload) => releasePlanService.assignToBusLine(dateStr, payload),
    onSuccess: () => {
      toast({ title: "Назначено на маршрут" })
      refetch()
    },
    onError: () => toast({ title: "Ошибка назначения", variant: "destructive" }),
  })

  return {
    dayPlan,
    isLoading,
    isFetching,
    assignToReserve,
    removeFromReserve,
    assignToBusLine,
  }
}
