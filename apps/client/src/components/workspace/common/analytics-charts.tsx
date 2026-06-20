import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Cell, Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface AnalyticsChartsProps {
  analytics?: {
    totalTasks: number
    overdueTasks: number
    completedTasks: number
    tasksByStatus?: { _id: string; count: number }[]
    tasksByPriority?: { _id: string; count: number }[]
  }
  isLoading: boolean
}

const STATUS_CONFIG: Record<string, { label: string }> = {
  BACKLOG: { label: "Backlog" },
  TODO: { label: "To Do" },
  IN_PROGRESS: { label: "In Progress" },
  IN_REVIEW: { label: "In Review" },
  DONE: { label: "Completed" },
}

const PRIORITY_CONFIG: Record<string, { label: string }> = {
  HIGH: { label: "High" },
  MEDIUM: { label: "Medium" },
  LOW: { label: "Low" },
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#ef4444",
  MEDIUM: "#3b82f6",
  LOW: "#a1a1aa",
}

const statusChartConfig = {
  value: { label: "Tasks" },
  backlog: { label: "Backlog", color: "var(--chart-1)" },
  todo: { label: "To Do", color: "var(--chart-2)" },
  inProgress: { label: "In Progress", color: "var(--chart-3)" },
  inReview: { label: "In Review", color: "var(--chart-4)" },
  done: { label: "Completed", color: "var(--chart-5)" },
} satisfies ChartConfig

const priorityChartConfig = {
  value: { label: "Tasks" },
  high: { label: "High", color: "var(--chart-1)" },
  medium: { label: "Medium", color: "var(--chart-2)" },
  low: { label: "Low", color: "var(--chart-3)" },
} satisfies ChartConfig

const STATUS_COLOR_MAP: Record<string, string> = {
  BACKLOG: "var(--color-backlog)",
  TODO: "var(--color-todo)",
  IN_PROGRESS: "var(--color-inProgress)",
  IN_REVIEW: "var(--color-inReview)",
  DONE: "var(--color-done)",
}

export default function AnalyticsCharts({ analytics, isLoading }: AnalyticsChartsProps) {
  const totalTasks = analytics?.totalTasks || 0

  const statusChartData = useMemo(() => {
    if (!analytics?.tasksByStatus) return []

    return Object.keys(STATUS_CONFIG)
      .map((key) => {
        const dbItem = analytics.tasksByStatus?.find((item) => item._id === key)
        const count = dbItem ? dbItem.count : 0
        return {
          status: key.toLowerCase(),
          label: STATUS_CONFIG[key].label,
          value: count,
          fill: STATUS_COLOR_MAP[key],
        }
      })
      .filter((item) => item.value > 0)
  }, [analytics])

  const statusListData = useMemo(() => {
    return Object.keys(STATUS_CONFIG).map((key) => {
      const dbItem = analytics?.tasksByStatus?.find((item) => item._id === key)
      const count = dbItem ? dbItem.count : 0
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
      return { key, count, percentage, label: STATUS_CONFIG[key].label }
    })
  }, [analytics, totalTasks])

  const priorityChartData = useMemo(() => {
    return Object.keys(PRIORITY_CONFIG).map((key) => {
      const dbItem = analytics?.tasksByPriority?.find((item) => item._id === key)
      const count = dbItem ? dbItem.count : 0
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
      return {
        priority: key.toLowerCase(),
        name: PRIORITY_CONFIG[key].label,
        value: count,
        fill: PRIORITY_COLORS[key],
        percentage,
      }
    })
  }, [analytics, totalTasks])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="h-[250px] flex items-center justify-center">
              <Skeleton className="size-36 rounded-full" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-2.5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="h-[200px] flex items-end gap-4 px-6 justify-center">
              <Skeleton className="h-[40%] w-12" />
              <Skeleton className="h-[75%] w-12" />
              <Skeleton className="h-[20%] w-12" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-2.5 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = totalTasks > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={statusChartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
              <Pie
                data={hasData ? statusChartData : []}
                dataKey="value"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                labelLine={false}
                label={({ payload, ...props }) => {
                  return (
                    <text
                      cx={props.cx}
                      cy={props.cy}
                      x={props.x}
                      y={props.y}
                      textAnchor={props.textAnchor}
                      dominantBaseline={props.dominantBaseline}
                      fill="var(--foreground)"
                      className="text-xs"
                    >
                      {payload.value}
                    </text>
                  )
                }}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardContent className="flex flex-col gap-4">
          <div className="divide-y divide-border/40">
            {statusListData.map((item) => (
              <div
                key={item.key}
                className="flex justify-between items-center py-2 text-xs first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor: `var(--color-${item.key.toLowerCase()})`,
                    }}
                  />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>
                    {item.count} {item.count === 1 ? "task" : "tasks"}
                  </span>
                  <span className="font-semibold text-foreground tabular-nums w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ChartContainer config={priorityChartConfig} className="h-[220px] aspect-auto">
            <BarChart
              data={priorityChartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {priorityChartData.map((entry) => (
                  <Cell key={entry.priority} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="divide-y divide-border/40 font-medium">
            {priorityChartData.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 text-xs first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      item.name === "High"
                        ? "bg-[#ef4444]"
                        : item.name === "Medium"
                          ? "bg-[#3b82f6]"
                          : "bg-[#a1a1aa]"
                    }`}
                  />
                  <span className="font-medium text-foreground">{item.name} Priority</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>
                    {item.value} {item.value === 1 ? "task" : "tasks"}
                  </span>
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
  )
}
