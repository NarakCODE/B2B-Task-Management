import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCommentMutationFn,
  updateCommentMutationFn,
  deleteCommentMutationFn,
} from "@/lib/api";

export const useCommentMutations = () => {
  const queryClient = useQueryClient();

  const createComment = useMutation({
    mutationFn: createCommentMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-comments", variables.workspaceId, variables.taskId],
      });
    },
  });

  const updateComment = useMutation({
    mutationFn: updateCommentMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-comments", variables.workspaceId],
      });
    },
  });

  const deleteComment = useMutation({
    mutationFn: deleteCommentMutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-comments", variables.workspaceId],
      });
    },
  });

  return {
    createComment,
    updateComment,
    deleteComment,
  };
};
