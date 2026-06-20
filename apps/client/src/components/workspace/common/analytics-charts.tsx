import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// We define UniqueIdentifier in types if needed, but since it is imported, we can use it or standard type
interface AnalyticsChartsProps {
  analytics?: {
    totalTasks: number;
    overdueTasks: number;
    completedTasks: number;
    tasksByStatus?: { _id: string; count: number }[];
    tasksByPriority?: { _id: string; count: number }[];
  };
  isLoading: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; bgClass: string; dotClass: string }> = {
  BACKLOG: { label: "Backlog", bgClass: "bg-zinc-400 dark:bg-zinc-500", dotClass: "bg-zinc-400 dark:bg-zinc-500" },
  TODO: { label: "To Do", bgClass: "bg-zinc-300 dark:bg-zinc-600", dotClass: "bg-zinc-300 dark:bg-zinc-600" },
  IN_PROGRESS: { label: "In Progress", bgClass: "bg-violet-500 dark:bg-violet-400", dotClass: "bg-violet-500 dark:bg-violet-400" },
  IN_REVIEW: { label: "In Review", bgClass: "bg-yellow-500 dark:bg-yellow-400", dotClass: "bg-yellow-500 dark:bg-yellow-400" },
  DONE: { label: "Completed", bgClass: "bg-emerald-500 dark:bg-emerald-400", dotClass: "bg-emerald-500 dark:bg-emerald-400" },
};

const PRIORITY_CONFIG: Record<string, { label: string; bgClass: string; dotClass: string }> = {
  HIGH: { label: "High", bgClass: "bg-red-500 dark:bg-red-400", dotClass: "bg-red-500 dark:bg-red-400" },
  MEDIUM: { label: "Medium", bgClass: "bg-blue-500 dark:bg-blue-400", dotClass: "bg-blue-500 dark:bg-blue-400" },
  LOW: { label: "Low", bgClass: "bg-zinc-400 dark:bg-zinc-500", dotClass: "bg-zinc-400 dark:bg-zinc-500" },
};

export default function AnalyticsCharts({ analytics, isLoading }: AnalyticsChartsProps) {
  const totalTasks = analytics?.totalTasks || 0;

  // Process Status Data
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const statusData = useMemo(() => {
    const defaultData = Object.keys(STATUS_CONFIG).map((key) => ({
      key,
      count: 0,
      percentage: 0,
      ...STATUS_CONFIG[key],
    }));

    if (!analytics?.tasksByStatus) return defaultData;

    const dataMap = new Map(analytics.tasksByStatus.map((item) => [item._id, item.count]));

    return defaultData.map((item) => {
      const count = dataMap.get(item.key) || 0;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return { ...item, count, percentage };
    });
  }, [analytics?.tasksByStatus, totalTasks]);

  // Process Priority Data
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const priorityData = useMemo(() => {
    const defaultData = Object.keys(PRIORITY_CONFIG).map((key) => ({
      key,
      count: 0,
      percentage: 0,
      ...PRIORITY_CONFIG[key],
    }));

    if (!analytics?.tasksByPriority) return defaultData;

    const dataMap = new Map(analytics.tasksByPriority.map((item) => [item._id, item.count]));

    return defaultData.map((item) => {
      const count = dataMap.get(item.key) || 0;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return { ...item, count, percentage };
    });
  }, [analytics?.tasksByPriority, totalTasks]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
        <Card className="border border-muted/50 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-muted/50 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      {/* Status Chart Card */}
      <Card className="border border-muted/65 shadow-sm bg-card transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-tight">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stacked Progress Bar */}
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted dark:bg-zinc-800/80">
            {statusData.map(
              (item) =>
                item.percentage > 0 && (
                  <div
                    key={item.key}
                    style={{ width: `${item.percentage}%` }}
                    className={`${item.bgClass} h-full transition-all duration-500 hover:opacity-90`}
                    title={`${item.label}: ${item.count} tasks (${item.percentage}%)`}
                  />
                )
            )}
            {totalTasks === 0 && (
              <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800" title="No tasks available" />
            )}
          </div>

          {/* Details List */}
          <div className="divide-y divide-muted/50">
            {statusData.map((item) => (
              <div key={item.key} className="flex justify-between items-center py-2 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{item.count} {item.count === 1 ? "task" : "tasks"}</span>
                  <span className="font-semibold text-foreground tabular-nums w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Chart Card */}
      <Card className="border border-muted/65 shadow-sm bg-card transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-tight">Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stacked Progress Bar */}
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted dark:bg-zinc-800/80">
            {priorityData.map(
              (item) =>
                item.percentage > 0 && (
                  <div
                    key={item.key}
                    style={{ width: `${item.percentage}%` }}
                    className={`${item.bgClass} h-full transition-all duration-500 hover:opacity-90`}
                    title={`${item.label}: ${item.count} tasks (${item.percentage}%)`}
                  />
                )
            )}
            {totalTasks === 0 && (
              <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800" title="No tasks available" />
            )}
          </div>

          {/* Details List */}
          <div className="divide-y divide-muted/50">
            {priorityData.map((item) => (
              <div key={item.key} className="flex justify-between items-center py-2 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{item.count} {item.count === 1 ? "task" : "tasks"}</span>
                  <span className="font-semibold text-foreground tabular-nums w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
