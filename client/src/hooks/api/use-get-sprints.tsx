import { useQuery } from "@tanstack/react-query";
import { getProjectSprintsQueryFn, getSprintByIdQueryFn } from "@/lib/api";

export const useGetProjectSprintsQuery = ({
  workspaceId,
  projectId,
  enabled = true,
}: {
  workspaceId: string;
  projectId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["project-sprints", workspaceId, projectId],
    queryFn: () => getProjectSprintsQueryFn({ workspaceId, projectId }),
    enabled: !!workspaceId && !!projectId && enabled,
  });
};

export const useGetSprintByIdQuery = ({
  workspaceId,
  projectId,
  sprintId,
  enabled = true,
}: {
  workspaceId: string;
  projectId: string;
  sprintId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["sprint-details", workspaceId, projectId, sprintId],
    queryFn: () => getSprintByIdQueryFn({ workspaceId, projectId, sprintId }),
    enabled: !!workspaceId && !!projectId && !!sprintId && enabled,
  });
};
