import useWorkspaceId from "@/hooks/use-workspace-id";
import AnalyticsCard from "./common/analytics-card";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";

const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const analytics = data?.analytics;

  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
      <AnalyticsCard
        isLoading={isPending}
        title="Total Task"
        value={analytics?.totalTasks || 0}
      />
      <AnalyticsCard
        isLoading={isPending}
        title="Overdue Task"
        value={analytics?.overdueTasks || 0}
        trend={analytics && analytics.overdueTasks > 0 ? "down" : "up"}
      />
      <AnalyticsCard
        isLoading={isPending}
        title="Completed Task"
        value={analytics?.completedTasks || 0}
      />
    </dl>
  );
};

export default WorkspaceAnalytics;
