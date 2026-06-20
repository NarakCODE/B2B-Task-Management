import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createDocumentMutationFn,
  deleteDocumentMutationFn,
  getWorkspaceDocumentsQueryFn,
} from "@/lib/api"
import { DocumentCategoryType } from "@/types/api.type"

export const documentQueryKey = (
  workspaceId: string,
  keyword?: string,
  category?: DocumentCategoryType | "ALL",
) => ["documents", workspaceId, keyword || "", category || "ALL"]

export const useGetWorkspaceDocumentsQuery = ({
  workspaceId,
  keyword,
  category,
}: {
  workspaceId: string
  keyword?: string
  category?: DocumentCategoryType | "ALL"
}) => {
  return useQuery({
    queryKey: documentQueryKey(workspaceId, keyword, category),
    queryFn: () => getWorkspaceDocumentsQueryFn({ workspaceId, keyword, category }),
    enabled: !!workspaceId,
  })
}

export const useDocumentMutations = (workspaceId: string) => {
  const queryClient = useQueryClient()

  const invalidateDocuments = () => {
    queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] })
  }

  const createDocument = useMutation({
    mutationFn: createDocumentMutationFn,
    onSuccess: invalidateDocuments,
  })

  const deleteDocument = useMutation({
    mutationFn: deleteDocumentMutationFn,
    onSuccess: invalidateDocuments,
  })

  return {
    createDocument,
    deleteDocument,
  }
}
