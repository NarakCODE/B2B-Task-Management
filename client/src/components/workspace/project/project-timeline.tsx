import { useParams } from "react-router-dom";
import { useGetProjectTimelineQuery } from "@/hooks/api/use-get-timeline";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { formatDistanceToNow } from "date-fns";

import {
  Plus,
  MessageSquare,
  Play,
  CheckCircle,
  Calendar,
  AlertCircle,
  TrendingUp,
  History,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/workspace/common/empty-state";

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "CREATE_TASK":
      return <Plus className="h-3 w-3 text-sky-500" />;
    case "UPDATE_TASK_STATUS":
      return <TrendingUp className="h-3 w-3 text-violet-500" />;
    case "UPDATE_TASK_PRIORITY":
      return <AlertCircle className="h-3 w-3 text-amber-500" />;
    case "ADD_COMMENT":
      return <MessageSquare className="h-3 w-3 text-indigo-500" />;
    case "CREATE_SPRINT":
      return <Calendar className="h-3 w-3 text-purple-500" />;
    case "START_SPRINT":
      return <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" />;
    case "COMPLETE_SPRINT":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    default:
      return <MessageSquare className="h-3 w-3 text-muted-foreground" />;
  }
};

export default function ProjectTimeline() {
  const params = useParams();
  const projectId = params.projectId as string;
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useGetProjectTimelineQuery({
    workspaceId,
    projectId,
  });

  const logs = data?.logs || [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<History />}
        title="No activity yet"
        description="Action histories for this project will appear here."
      />
    );
  }

  return (
    <div className="max-w-(--breakpoint-sm) px-2 py-6 md:py-10">
      <div className="relative">
        {logs.map((log) => {
          const userName = log.user?.name || "Someone";
          const relativeTime = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });

          return (
            <div className="group relative" key={log._id}>
              {/* Content */}
              <div className="flex items-start">
                {/* Left column: User name and Date */}
                <div className="mt-2.5 mr-5 flex w-[85px] shrink-0 flex-col gap-1 text-end sm:w-[100px]">
                  <h6 className="font-semibold text-foreground text-xs sm:text-sm truncate">
                    {userName}
                  </h6>
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    {relativeTime}
                  </span>
                </div>

                {/* Right column: Timeline line & details */}
                <div className="relative space-y-1.5 border-l pb-10 pl-6 group-last:pb-4 sm:pl-8 flex-1">
                  {/* Timeline Dot with action icon inside */}
                  <div className="absolute top-3.5 -left-px h-6 w-6 -translate-x-1/2 rounded-full border bg-background flex items-center justify-center shadow-sm">
                    {getActionIcon(log.actionType)}
                  </div>

                  <h3 className="mt-1 font-medium text-sm sm:text-md tracking-[-0.01em] text-foreground leading-relaxed pl-1 pt-0.5">
                    {log.description}
                  </h3>
                  {log.metadata?.content && (
                    <p className="text-muted-foreground text-xs sm:text-sm italic pl-1">
                      "{log.metadata.content}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
