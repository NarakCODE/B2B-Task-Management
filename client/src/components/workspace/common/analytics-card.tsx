import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

type Trend = "up" | "down" | "neutral";

const trendConfig: Record<Trend, { className: string; icon: typeof ArrowBigUp; label: string }> = {
  up: { className: "text-green-800 dark:text-green-400", icon: ArrowBigUp, label: "up" },
  down: { className: "text-red-800 dark:text-red-400", icon: ArrowBigDown, label: "down" },
  neutral: { className: "text-muted-foreground", icon: ArrowBigUp, label: "neutral" },
};

const AnalyticsCard = ({
  title,
  value,
  isLoading,
  trend,
}: {
  title: string;
  value: number;
  isLoading: boolean;
  trend?: Trend;
}) => {
  const resolvedTrend = trend ?? (value > 0 ? "up" : "neutral");
  const { className: trendColor, icon: TrendIcon, label: trendLabel } = trendConfig[resolvedTrend];

  return (
    <Card className="p-6 py-4 shadow-2xs">
      <CardContent className="p-0">
        <dt className="text-sm font-medium text-muted-foreground">{title}</dt>
        <dd className="mt-2 flex items-baseline space-x-2.5">
          {isLoading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <>
              <span className="tabular-nums text-3xl font-semibold text-foreground">
                {value}
              </span>
              {trend && (
                <span className={cn("text-sm font-medium flex items-center gap-0.5", trendColor)}>
                  <TrendIcon className="size-4" />
                  {trendLabel}
                </span>
              )}
            </>
          )}
        </dd>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
