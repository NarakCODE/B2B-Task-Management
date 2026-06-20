import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "#a1a1aa", // Zinc 400
  TODO: "#71717a",    // Zinc 500
  IN_PROGRESS: "#8b5cf6", // Violet 500
  IN_REVIEW: "#eab308", // Yellow 500
  DONE: "#10b981",    // Emerald 500
};

const STATUS_CONFIG: Record<string, { label: string; dotClass: string }> = {
  BACKLOG: { label: "Backlog", dotClass: "bg-[#a1a1aa]" },
  TODO: { label: "To Do", dotClass: "bg-[#71717a]" },
  IN_PROGRESS: { label: "In Progress", dotClass: "bg-[#8b5cf6]" },
  IN_REVIEW: { label: "In Review", dotClass: "bg-[#eab308]" },
  DONE: { label: "Completed", dotClass: "bg-[#10b981]" },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#ef4444",   // Red 500
  MEDIUM: "#3b82f6", // Blue 500
  LOW: "#a1a1aa",    // Zinc 400
};

const PRIORITY_CONFIG: Record<string, { label: string; dotClass: string }> = {
  HIGH: { label: "High", dotClass: "bg-[#ef4444]" },
  MEDIUM: { label: "Medium", dotClass: "bg-[#3b82f6]" },
  LOW: { label: "Low", dotClass: "bg-[#a1a1aa]" },
};

// Custom Tooltip Component for beautiful styling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border text-popover-foreground rounded-lg p-2.5 shadow-md text-xs font-medium space-y-1">
        <p className="font-semibold">{data.name}</p>
        <p className="text-muted-foreground flex items-center gap-1.5">
          Tasks: <span className="text-foreground font-bold">{data.value}</span>
          {data.percentage !== undefined && (
            <span className="text-foreground/80">({data.percentage}%)</span>
          )}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ analytics, isLoading }: AnalyticsChartsProps) {
  const totalTasks = analytics?.totalTasks || 0;

  // Process Status Data for Donut Chart
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const statusChartData = useMemo(() => {
    if (!analytics?.tasksByStatus) return [];
    
    return Object.keys(STATUS_CONFIG).map((key) => {
      const dbItem = analytics.tasksByStatus?.find((item) => item._id === key);
      const count = dbItem ? dbItem.count : 0;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return {
        name: STATUS_CONFIG[key].label,
        value: count,
        percentage,
        color: STATUS_COLORS[key],
      };
    }).filter(item => item.value > 0); // Only display non-zero sectors
  }, [analytics?.tasksByStatus, totalTasks]);

  // For Legend/Breakdown list (displays all statuses)
   
  const statusListData = useMemo(() => {
    return Object.keys(STATUS_CONFIG).map((key) => {
      const dbItem = analytics?.tasksByStatus?.find((item) => item._id === key);
      const count = dbItem ? dbItem.count : 0;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return {
        key,
        count,
        percentage,
        ...STATUS_CONFIG[key],
      };
    });
  }, [analytics?.tasksByStatus, totalTasks]);

  // Process Priority Data for Bar Chart
   
  const priorityChartData = useMemo(() => {
    return Object.keys(PRIORITY_CONFIG).map((key) => {
      const dbItem = analytics?.tasksByPriority?.find((item) => item._id === key);
      const count = dbItem ? dbItem.count : 0;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return {
        name: PRIORITY_CONFIG[key].label,
        value: count,
        percentage,
        fill: PRIORITY_COLORS[key],
      };
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
            <div className="h-[200px] flex items-center justify-center">
              <Skeleton className="size-36 rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
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
            <div className="h-[200px] flex items-end gap-4 px-6 justify-center">
              <Skeleton className="h-[40%] w-12" />
              <Skeleton className="h-[75%] w-12" />
              <Skeleton className="h-[20%] w-12" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
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

  // Fallback data for status if no tasks exist
  const emptyStatusData = [{ name: "No tasks", value: 1, color: "#e4e4e7" }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      {/* Status Chart Card */}
      <Card className="border border-muted/65 shadow-sm bg-card transition-all hover:shadow-md">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold tracking-tight">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recharts Pie Chart */}
          <div className="h-[220px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalTasks > 0 ? statusChartData : emptyStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={totalTasks > 0 ? 3 : 0}
                  dataKey="value"
                >
                  {(totalTasks > 0 ? statusChartData : emptyStatusData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {totalTasks > 0 && <Tooltip content={<CustomTooltip />} />}
              </PieChart>
            </ResponsiveContainer>
            
            {/* Donut Center text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {totalTasks}
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                {totalTasks === 1 ? "Task" : "Tasks"}
              </span>
            </div>
          </div>

          {/* Details List */}
          <div className="divide-y divide-muted/40">
            {statusListData.map((item) => (
              <div key={item.key} className="flex justify-between items-center py-2 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
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
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold tracking-tight">Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recharts Bar Chart */}
          <div className="h-[220px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityChartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Details List */}
          <div className="divide-y divide-muted/40 font-medium">
            {priorityChartData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.name === "High" ? "bg-[#ef4444]" : item.name === "Medium" ? "bg-[#3b82f6]" : "bg-[#a1a1aa]"}`} />
                  <span className="font-medium text-foreground">{item.name} Priority</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{item.value} {item.value === 1 ? "task" : "tasks"}</span>
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
