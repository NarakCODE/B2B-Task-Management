import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logTimeMutationFn, deleteTimeLogMutationFn } from "@/lib/api";

export const useTimeLogMutations = () => {
  const queryClient = useQueryClient();

  const logTime = useMutation({
    mutationFn: logTimeMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-time-logs", variables.workspaceId, variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-time-logs", variables.workspaceId],
      });
    },
  });

  const deleteTimeLog = useMutation({
    mutationFn: deleteTimeLogMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-time-logs", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-time-logs", variables.workspaceId],
      });
    },
  });

  return {
    logTime,
    deleteTimeLog,
  };
};
