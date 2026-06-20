import { useGetTaskTimelineQuery } from "@/hooks/api/use-get-timeline";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  History,
  ArrowRight,
  Loader,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Badge } from "@/components/reui/badge";

type TaskTimelineProps = {
  taskId: string;
  workspaceId: string;
};

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
    default:
      return <History className="h-3 w-3 text-muted-foreground" />;
  }
};

const statusStyles: Record<string, string> = {
  BACKLOG: "outline",
  TODO: "default",
  IN_PROGRESS: "primary-light",
  IN_REVIEW: "warning-light",
  DONE: "success-light",
};

const priorityStyles: Record<string, string> = {
  HIGH: "destructive-light",
  MEDIUM: "primary-light",
  LOW: "warning-light",
};

const formatValue = (val: string) => {
  return val.replace("_", " ").toLowerCase();
};

export default function TaskTimeline({ taskId, workspaceId }: TaskTimelineProps) {
  const { data, isLoading } = useGetTaskTimelineQuery({
    workspaceId,
    taskId,
  });

  const logs = data?.logs || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-6">
        No activity recorded yet for this task.
      </p>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, logIdx) => {
          const name = log.user?.name || "Unknown User";
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);
          const relativeTime = formatDistanceToNow(new Date(log.createdAt), {
            addSuffix: true,
          });

          // Extract old and new values if status or priority updates
          const isStatusUpdate = log.actionType === "UPDATE_TASK_STATUS";
          const isPriorityUpdate = log.actionType === "UPDATE_TASK_PRIORITY";

          const oldVal = (log.metadata?.oldStatus || log.metadata?.oldPriority) as string | undefined;
          const newVal = (log.metadata?.newStatus || log.metadata?.newPriority) as string | undefined;

          return (
            <li key={log._id}>
              <div className="relative pb-8">
                {/* Visual vertical timeline connector line */}
                {logIdx !== logs.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border/40"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="relative flex size-8 items-center justify-center rounded-full bg-background border shadow-sm">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={log.user?.profilePicture ?? ""} alt={name} />
                        <AvatarFallback className={`text-[10px] ${avatarColor}`}>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 rounded-full bg-background border p-0.5 shadow-sm">
                        {getActionIcon(log.actionType)}
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground mr-1">
                        {name}
                      </span>
                      {isStatusUpdate && oldVal && newVal ? (
                        <span className="inline-flex items-center gap-1.5 flex-wrap">
                          changed status from{" "}
                          <Badge
                            variant={statusStyles[oldVal] as "outline" | "default"}
                            className="capitalize"
                          >
                            {formatValue(oldVal)}
                          </Badge>
                          <ArrowRight className="size-3 text-muted-foreground" />
                          <Badge
                            variant={statusStyles[newVal] as "outline" | "default"}
                            className="capitalize"
                          >
                            {formatValue(newVal)}
                          </Badge>
                        </span>
                      ) : isPriorityUpdate && oldVal && newVal ? (
                        <span className="inline-flex items-center gap-1.5 flex-wrap">
                          changed priority from{" "}
                          <Badge
                            variant={priorityStyles[oldVal] as "outline" | "default"}
                            className="capitalize"
                          >
                            {formatValue(oldVal)}
                          </Badge>
                          <ArrowRight className="size-3 text-muted-foreground" />
                          <Badge
                            variant={priorityStyles[newVal] as "outline" | "default"}
                            className="capitalize"
                          >
                            {formatValue(newVal)}
                          </Badge>
                        </span>
                      ) : (
                        <span>{log.description}</span>
                      )}
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-muted-foreground pt-0.5">
                      <time dateTime={log.createdAt}>{relativeTime}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
