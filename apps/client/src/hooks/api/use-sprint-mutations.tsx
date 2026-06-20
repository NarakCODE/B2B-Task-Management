import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSprintMutationFn,
  updateSprintMutationFn,
  deleteSprintMutationFn,
} from "@/lib/api";

export const useSprintMutations = () => {
  const queryClient = useQueryClient();

  const createSprint = useMutation({
    mutationFn: createSprintMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-sprints", variables.workspaceId, variables.projectId],
      });
    },
  });

  const updateSprint = useMutation({
    mutationFn: updateSprintMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-sprints", variables.workspaceId, variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["sprint-details", variables.workspaceId, variables.projectId, variables.sprintId],
      });
      queryClient.invalidateQueries({
        queryKey: ["alltasks", variables.workspaceId],
      });
    },
  });

  const deleteSprint = useMutation({
    mutationFn: deleteSprintMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-sprints", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["alltasks", variables.workspaceId],
      });
    },
  });

  return {
    createSprint,
    updateSprint,
    deleteSprint,
  };
};
