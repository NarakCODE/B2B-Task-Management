import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserNotificationsQueryFn,
  markNotificationAsReadMutationFn,
  markAllNotificationsAsReadMutationFn,
} from "@/lib/api"

export const useGetNotificationsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getUserNotificationsQueryFn,
    enabled,
    refetchInterval: 15000, // Poll every 15 seconds to fetch fresh notifications
  })
}

export const useNotificationMutations = () => {
  const queryClient = useQueryClient()

  const markAsRead = useMutation({
    mutationFn: markNotificationAsReadMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: markAllNotificationsAsReadMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  return {
    markAsRead,
    markAllAsRead,
  }
}
