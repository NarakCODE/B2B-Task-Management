import { getWorkspaceRolesQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useGetWorkspaceRoles = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["roles", workspaceId],
    queryFn: () => getWorkspaceRolesQueryFn(workspaceId),
    staleTime: Infinity,
  });
  return query;
};

export default useGetWorkspaceRoles;
