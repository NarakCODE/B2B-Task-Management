import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformOptions,
} from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskStatusEnum, TaskTypeEnum } from "@/constant";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useGetProjectSprintsQuery } from "@/hooks/api/use-get-sprints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createTaskMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CreateTaskForm(props: {
  projectId?: string;
  onClose: () => void;
}) {
  const { projectId, onClose } = props;

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: createTaskMutationFn,
  });

  const { data, isLoading } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    skip: !!projectId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = memberData?.members || [];

  const projectOptions = projects?.map((project) => ({
    label: (
      <div className="flex items-center gap-1">
        <span>{project.emoji}</span>
        <span>{project.name}</span>
      </div>
    ),
    value: project._id,
  }));

  const membersOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);
    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const formSchema = z.object({
    title: z.string().trim().min(1, { message: "Title is required" }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, { message: "Project is required" }),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      { message: "Status is required" }
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
      { message: "Priority is required" }
    ),
    assignedTo: z.string().trim().min(1, { message: "AssignedTo is required" }),
    dueDate: z.date({ message: "A due date is required." }),
    taskType: z.enum(
      Object.values(TaskTypeEnum) as [keyof typeof TaskTypeEnum],
      { message: "Task type is required" }
    ),
    storyPoints: z.number().int().min(0).nullable().optional(),
    sprint: z.string().nullable().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: projectId ? projectId : "",
      taskType: "FEATURE",
      storyPoints: null,
      sprint: null,
    },
  });

  const selectedProjectId = form.watch("projectId") || projectId;

  const { data: sprintsData } = useGetProjectSprintsQuery({
    workspaceId,
    projectId: selectedProjectId || "",
    enabled: !!selectedProjectId,
  });

  const sprints = sprintsData?.sprints || [];

  const taskStatusList = Object.values(TaskStatusEnum);
  const taskPriorityList = Object.values(TaskPriorityEnum);

  const statusOptions = transformOptions(taskStatusList);
  const priorityOptions = transformOptions(taskPriorityList);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const sprintValue = values.sprint === "backlog" ? null : values.sprint;
    const payload = {
      workspaceId,
      projectId: values.projectId,
      data: {
        ...values,
        sprint: sprintValue,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["project-analytics", projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["all-tasks", workspaceId],
        });
        toast.success("Task created successfully");
        onClose();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 mb-4 pb-2 border-b">
        <h1 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1">
          Create Task
        </h1>
        <p className="text-muted-foreground text-sm leading-tight">
          Organize and manage tasks, resources, and team collaboration
        </p>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col flex-1 min-h-0"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Task title
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Task description
                    <span className="text-xs font-extralight ml-2">Optional</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!projectId && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading && (
                          <div className="my-2">
                            <Loader className="w-4 h-4 place-self-center flex animate-spin" />
                          </div>
                        )}
                        <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                          {projectOptions?.map((option) => (
                            <SelectItem
                              key={option.value}
                              className="!capitalize cursor-pointer"
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className="!text-muted-foreground !capitalize"
                            placeholder="Select a status"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions?.map((status) => (
                          <SelectItem
                            className="!capitalize"
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions?.map((priority) => (
                          <SelectItem
                            className="!capitalize"
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TaskTypeEnum).map((type) => (
                          <SelectItem
                            className="!capitalize"
                            key={type}
                            value={type}
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storyPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 5, 8"
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? null : parseInt(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                          {membersOptions?.map((option) => (
                            <SelectItem
                              className="cursor-pointer"
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            date > new Date("2100-12-31")
                          }
                          defaultMonth={new Date()}
                          startMonth={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedProjectId && (
              <FormField
                control={form.control}
                name="sprint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sprint" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="backlog">Backlog (No Sprint)</SelectItem>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint._id} value={sprint._id}>
                            {sprint.name} ({sprint.status.toLowerCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Button
            className="shrink-0 mt-4 h-10"
            type="submit"
            disabled={isPending}
          >
            {isPending && <Loader className="animate-spin" />}
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
}
