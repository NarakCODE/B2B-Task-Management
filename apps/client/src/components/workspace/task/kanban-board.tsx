import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  AlertCircle,
  ArrowRight,
  ArrowDown,
  Bug,
  Sparkles,
  Wrench,
  RefreshCw,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import useWorkspaceId from "@/hooks/use-workspace-id";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import { getAllTasksQueryFn, editTaskMutationFn } from "@/lib/api";
import { TaskType } from "@/types/api.type";
import { TaskStatusEnum, TaskStatusEnumType, TaskPriorityEnum, TaskTypeEnum } from "@/constant";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

import { DataTableFilterToolbar } from "./task-table";
import EditTaskDialog from "./edit-task-dialog";

// Define the Kanban columns matching the backend TaskStatusEnum
const KANBAN_COLUMNS = [
  {
    id: TaskStatusEnum.BACKLOG,
    title: "Backlog",
    color: "bg-slate-100/60 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-300",
    headerColor: "border-slate-400/40 text-slate-600 dark:text-slate-400",
  },
  {
    id: TaskStatusEnum.TODO,
    title: "To Do",
    color: "bg-zinc-100/60 dark:bg-zinc-900/10 border-zinc-200/50 dark:border-zinc-800/30 text-zinc-700 dark:text-zinc-300",
    headerColor: "border-zinc-400/40 text-zinc-600 dark:text-zinc-400",
  },
  {
    id: TaskStatusEnum.IN_PROGRESS,
    title: "In Progress",
    color: "bg-sky-50/50 dark:bg-sky-950/10 border-sky-100 dark:border-sky-900/30 text-sky-700 dark:text-sky-300",
    headerColor: "border-sky-400/40 text-sky-600 dark:text-sky-400",
  },
  {
    id: TaskStatusEnum.IN_REVIEW,
    title: "In Review",
    color: "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300",
    headerColor: "border-amber-400/40 text-amber-600 dark:text-amber-400",
  },
  {
    id: TaskStatusEnum.DONE,
    title: "Done",
    color: "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    headerColor: "border-emerald-400/40 text-emerald-600 dark:text-emerald-400",
  },
];

export default function KanbanBoard() {
  const param = useParams();
  const projectId = param.projectId as string;
  const workspaceId = useWorkspaceId();
  const [filters, setFilters] = useTaskTableFilter();
  const queryClient = useQueryClient();

  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  // Fetch tasks (using page size 100 to show all items on the board)
  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, 100, 1, filters, projectId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: filters.keyword,
        priority: filters.priority,
        status: filters.status,
        projectId: projectId || filters.projectId,
        assignedTo: filters.assigneeId,
        sprint: filters.sprint,
        taskType: filters.taskType,
        pageNumber: 1,
        pageSize: 100,
      }),
    staleTime: 0,
  });

  const tasks: TaskType[] = data?.tasks || [];

  // Mutation to update task status on drop
  const { mutate } = useMutation({
    mutationFn: editTaskMutationFn,
    onMutate: async ({ taskId, data: updateData }) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ["all-tasks"] });
      const previousData = queryClient.getQueryData(["all-tasks", workspaceId, 100, 1, filters, projectId]);

      queryClient.setQueryData(
        ["all-tasks", workspaceId, 100, 1, filters, projectId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((t: TaskType) =>
              t._id === taskId ? { ...t, status: updateData.status } : t
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["all-tasks", workspaceId, 100, 1, filters, projectId],
          context.previousData
        );
      }
      toast.error("Failed to move task. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success("Task status updated");
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a list or column didn't change
    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as TaskStatusEnumType;

    // Trigger status update
    mutate({
      taskId: task._id,
      projectId: task.project?._id || projectId,
      workspaceId,
      data: {
        title: task.title,
        description: task.description || "",
        status: newStatus,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || "",
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        taskType: task.taskType,
        storyPoints: task.storyPoints,
        sprint: task.sprint?._id || null,
      } as any,
    });
  };

  // Helper icons
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case TaskPriorityEnum.HIGH:
        return <AlertCircle className="size-3.5 text-red-500 shrink-0" />;
      case TaskPriorityEnum.MEDIUM:
        return <ArrowRight className="size-3.5 text-amber-500 shrink-0" />;
      default:
        return <ArrowDown className="size-3.5 text-blue-500 shrink-0" />;
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case TaskTypeEnum.BUG:
        return <Bug className="size-3.5 text-red-500 shrink-0" />;
      case TaskTypeEnum.FEATURE:
        return <Sparkles className="size-3.5 text-emerald-500 shrink-0" />;
      case TaskTypeEnum.CHORE:
        return <Wrench className="size-3.5 text-slate-500 shrink-0" />;
      case TaskTypeEnum.REFACTOR:
        return <RefreshCw className="size-3.5 text-indigo-500 shrink-0" />;
      default:
        return <Layers className="size-3.5 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full select-none">
      {/* Filter toolbar */}
      <DataTableFilterToolbar
        isLoading={isLoading}
        projectId={projectId}
        filters={filters}
        setFilters={setFilters}
      />

      <TooltipProvider delayDuration={150}>
        {/* Kanban Board Container */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-270px)] h-full">
            {KANBAN_COLUMNS.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.id);

              return (
                <div
                  key={column.id}
                  className={`flex flex-col w-[300px] shrink-0 border rounded-2xl p-3 h-full max-h-[calc(100vh-280px)] ${column.color}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm tracking-tight text-foreground">
                        {column.title}
                      </span>
                      <Badge variant="secondary" className="px-1.5 py-0 text-xs font-semibold">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Droppable task list */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-3 rounded-lg pr-1 pb-10 transition-colors duration-150 ${
                          snapshot.isDraggingOver ? "bg-muted/50 dark:bg-zinc-900/10" : ""
                        }`}
                      >
                        {columnTasks.map((task, index) => {
                          const assigneeName = task.assignedTo?.name || "Unassigned";
                          const initials = getAvatarFallbackText(assigneeName);
                          const avatarColor = getAvatarColor(assigneeName);
                          const dueDateFormatted = task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : null;

                          return (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                  } as React.CSSProperties}
                                  onClick={() => setActiveTask(task)}
                                  className={`bg-card border p-3.5 hover:border-primary/40 dark:hover:border-primary/25 cursor-grab active:cursor-grabbing shadow-sm transition-all duration-200 select-none ${
                                    snapshot.isDragging ? "shadow-lg rotate-1 scale-[1.02] border-primary/50" : ""
                                  }`}
                                >
                                  {/* Task Top Row (Task Code and Type) */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold text-muted-foreground font-mono tracking-tight bg-muted/60 dark:bg-zinc-800/40 px-1.5 py-0.5 rounded">
                                      {task.taskCode}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {getTaskTypeIcon(task.taskType)}
                                      {getPriorityIcon(task.priority)}
                                    </div>
                                  </div>

                                  {/* Task Title */}
                                  <h4 className="mt-2 text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
                                    {task.title}
                                  </h4>

                                  {/* Task Footer Meta (Due Date, Assignee, Story Points) */}
                                  <div className="mt-4 flex items-center justify-between gap-2 border-t pt-2.5">
                                    {/* Due Date or Empty space */}
                                    {dueDateFormatted ? (
                                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <Calendar className="size-3" />
                                        <span>{dueDateFormatted}</span>
                                      </div>
                                    ) : (
                                      <div />
                                    )}

                                    {/* Right section: Story Points & Avatar */}
                                    <div className="flex items-center gap-2">
                                      {task.storyPoints !== null && task.storyPoints !== undefined && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1 py-0 font-medium">
                                          {task.storyPoints} pts
                                        </Badge>
                                      )}

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={assigneeName} />
                                            <AvatarFallback className={`text-[10px] font-bold ${avatarColor}`}>
                                              {initials}
                                            </AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">{assigneeName}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </TooltipProvider>

      {/* Edit Task Dialog */}
      {activeTask && (
        <EditTaskDialog
          task={activeTask}
          isOpen={!!activeTask}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  );
}
