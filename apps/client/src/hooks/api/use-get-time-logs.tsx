import { useQuery } from "@tanstack/react-query";
import { getTaskTimeLogsQueryFn, getProjectTimeLogsQueryFn } from "@/lib/api";

export const useGetTaskTimeLogsQuery = ({
  workspaceId,
  taskId,
  enabled = true,
}: {
  workspaceId: string;
  taskId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["task-time-logs", workspaceId, taskId],
    queryFn: () => getTaskTimeLogsQueryFn({ workspaceId, taskId }),
    enabled: !!workspaceId && !!taskId && enabled,
  });
};

export const useGetProjectTimeLogsQuery = ({
  workspaceId,
  projectId,
  enabled = true,
}: {
  workspaceId: string;
  projectId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["project-time-logs", workspaceId, projectId],
    queryFn: () => getProjectTimeLogsQueryFn({ workspaceId, projectId }),
    enabled: !!workspaceId && !!projectId && enabled,
  });
};
