import { useQuery } from "@tanstack/react-query";
import { getTaskCommentsQueryFn } from "@/lib/api";

export const useGetTaskCommentsQuery = ({
  workspaceId,
  taskId,
  enabled = true,
}: {
  workspaceId: string;
  taskId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["task-comments", workspaceId, taskId],
    queryFn: () => getTaskCommentsQueryFn({ workspaceId, taskId }),
    enabled: !!workspaceId && !!taskId && enabled,
  });
};
