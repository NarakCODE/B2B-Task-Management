import { useQuery } from "@tanstack/react-query";
import { getTaskByIdQueryFn } from "@/lib/api";

const useGetTaskByIdQuery = ({
  taskId,
  projectId,
  workspaceId,
  enabled = true,
}: {
  taskId: string;
  projectId: string;
  workspaceId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskByIdQueryFn({ taskId, projectId, workspaceId }),
    enabled: !!taskId && !!projectId && !!workspaceId && enabled,
  });
};

export default useGetTaskByIdQuery;
