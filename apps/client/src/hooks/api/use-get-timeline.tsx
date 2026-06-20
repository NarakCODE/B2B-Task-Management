import { useQuery } from "@tanstack/react-query";
import {
  getWorkspaceTimelineQueryFn,
  getProjectTimelineQueryFn,
  getSprintTimelineQueryFn,
  getTaskTimelineQueryFn,
} from "@/lib/api";

export const useGetWorkspaceTimelineQuery = ({
  workspaceId,
  enabled = true,
}: {
  workspaceId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["workspace-timeline", workspaceId],
    queryFn: () => getWorkspaceTimelineQueryFn({ workspaceId }),
    enabled: !!workspaceId && enabled,
  });
};

export const useGetProjectTimelineQuery = ({
  workspaceId,
  projectId,
  enabled = true,
}: {
  workspaceId: string;
  projectId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["project-timeline", workspaceId, projectId],
    queryFn: () => getProjectTimelineQueryFn({ workspaceId, projectId }),
    enabled: !!workspaceId && !!projectId && enabled,
  });
};

export const useGetSprintTimelineQuery = ({
  workspaceId,
  sprintId,
  enabled = true,
}: {
  workspaceId: string;
  sprintId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["sprint-timeline", workspaceId, sprintId],
    queryFn: () => getSprintTimelineQueryFn({ workspaceId, sprintId }),
    enabled: !!workspaceId && !!sprintId && enabled,
  });
};

export const useGetTaskTimelineQuery = ({
  workspaceId,
  taskId,
  enabled = true,
}: {
  workspaceId: string;
  taskId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["task-timeline", workspaceId, taskId],
    queryFn: () => getTaskTimelineQueryFn({ workspaceId, taskId }),
    enabled: !!workspaceId && !!taskId && enabled,
  });
};
