import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetProjectSprintsQuery } from "@/hooks/api/use-get-sprints";
import { useSprintMutations } from "@/hooks/api/use-sprint-mutations";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { format } from "date-fns";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AlertTriangle, CalendarIcon, Play, CheckCircle2, Plus, Trash2, ListChecks, TimerOff } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/workspace/common/empty-state";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";

export default function SprintManager() {
  const params = useParams();
  const projectId = params.projectId as string;
  const workspaceId = useWorkspaceId();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintDesc, setSprintDesc] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useGetProjectSprintsQuery({
    workspaceId,
    projectId,
  });

  const { createSprint, updateSprint, deleteSprint } = useSprintMutations();

  const { hasPermission } = useAuthContext();
  const canManageSprints = hasPermission(Permissions.EDIT_PROJECT);
  const canDeleteSprints = hasPermission(Permissions.DELETE_PROJECT);

  const sprints = data?.sprints || [];
  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const plannedSprints = sprints.filter((s) => s.status === "PLANNED");
  const completedSprints = sprints.filter((s) => s.status === "COMPLETED");

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName || !startDate || !endDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createSprint.mutate(
      {
        workspaceId,
        projectId,
        data: {
          name: sprintName,
          description: sprintDesc,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Sprint created successfully.");
          setIsCreateOpen(false);
          setSprintName("");
          setSprintDesc("");
          setStartDate(undefined);
          setEndDate(undefined);
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to create sprint.");
        },
      }
    );
  };

  const handleStartSprint = (sprintId: string) => {
    if (activeSprint) {
      toast.error("An active sprint is already running. Complete it first.");
      return;
    }

    updateSprint.mutate(
      {
        workspaceId,
        projectId,
        sprintId,
        data: {
          status: "ACTIVE",
        },
      },
      {
        onSuccess: () => {
          toast.success("Sprint started successfully!");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to start sprint.");
        },
      }
    );
  };

  const handleCompleteSprint = (sprintId: string) => {
    updateSprint.mutate(
      {
        workspaceId,
        projectId,
        sprintId,
        data: {
          status: "COMPLETED",
        },
      },
      {
        onSuccess: () => {
          toast.success("Sprint completed. Incomplete tasks returned to backlog.");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to complete sprint.");
        },
      }
    );
  };

  const handleDeleteSprint = () => {
    if (!deleteTarget) return;
    deleteSprint.mutate(
      { workspaceId, sprintId: deleteTarget },
      {
        onSuccess: () => {
          toast.success("Sprint deleted successfully.");
          setDeleteTarget(null);
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to delete sprint.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold tracking-tight">
            Sprint Iterations
          </h3>
          <p className="text-sm text-muted-foreground">
            Plan and manage your Agile development sprint cycles.
          </p>
        </div>

        {canManageSprints && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Create Sprint
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
              <DialogDescription>
                Set dates for your next development iteration.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSprint}>
              <FieldGroup className="py-2">
                <Field>
                  <FieldLabel>Sprint Name</FieldLabel>
                  <FieldContent>
                    <Input
                      value={sprintName}
                      onChange={(e) => setSprintName(e.target.value)}
                      placeholder="e.g. Sprint 1, Release Alpha"
                      required
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Goal / Description</FieldLabel>
                  <FieldContent>
                    <Textarea
                      value={sprintDesc}
                      onChange={(e) => setSprintDesc(e.target.value)}
                      placeholder="Describe sprint objective"
                    />
                  </FieldContent>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Start Date</FieldLabel>
                    <FieldContent>
                      <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Pick start date"
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>End Date</FieldLabel>
                    <FieldContent>
                      <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Pick end date"
                      />
                    </FieldContent>
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createSprint.isPending}>
                  {createSprint.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      </div>

      {/* Active Sprint Section */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Active Sprint
        </h4>
        {activeSprint ? (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-md flex items-center gap-2">
                    {activeSprint.name}
                    <Badge variant="default">Active</Badge>
                  </CardTitle>
                  <CardDescription>
                    {activeSprint.description}
                  </CardDescription>
                </div>
                <div className="text-right text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  {format(new Date(activeSprint.startDate), "MMM d")} -{" "}
                  {format(new Date(activeSprint.endDate), "MMM d, yyyy")}
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-end gap-2">
              {canDeleteSprints && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTarget(activeSprint._id)}
                >
                  <Trash2 className="size-4 mr-1" /> Delete
                </Button>
              )}
              {canManageSprints && (
                <Button
                  size="sm"
                  onClick={() => handleCompleteSprint(activeSprint._id)}
                  disabled={updateSprint.isPending}
                >
                  <CheckCircle2 className="size-4 mr-1.5" /> Complete Sprint
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <EmptyState
            icon={<TimerOff />}
            title="No active sprint"
            description="Start a planned sprint from below to begin tracking."
          />
        )}
      </div>

      {/* Planned Sprints */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Backlog Iterations ({plannedSprints.length})
        </h4>
        {plannedSprints.length > 0 ? (
          <div className="grid gap-3">
            {plannedSprints.map((sprint) => (
              <Card key={sprint._id}>
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      {sprint.name}
                      <Badge variant="outline">Planned</Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {sprint.description || "No objective defined"}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      {format(new Date(sprint.startDate), "MMM d")} -{" "}
                      {format(new Date(sprint.endDate), "MMM d")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canDeleteSprints && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(sprint._id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                    {canManageSprints && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartSprint(sprint._id)}
                        disabled={updateSprint.isPending}
                      >
                        <Play className="size-3.5 fill-current" /> Start
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ListChecks />}
            title="No backlog iterations"
            description="Create a sprint to start planning your next iteration."
          />
        )}
      </div>

      {/* Historical Completed Sprints */}
      {completedSprints.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Completed Iterations ({completedSprints.length})
          </h4>
          <div className="grid gap-2 opacity-80">
            {completedSprints.map((sprint) => (
              <Card key={sprint._id} className="bg-muted/30" size="sm">
                <CardHeader className="p-3 flex flex-row items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2">
                      {sprint.name}
                      <Badge variant="secondary" className="text-[10px] py-0 px-1">
                        Done
                      </Badge>
                    </CardTitle>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="size-2.5" />
                      {format(new Date(sprint.startDate), "MMM d")} -{" "}
                      {format(new Date(sprint.endDate), "MMM d, yyyy")}
                    </div>
                  </div>
                  {canDeleteSprints && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="size-7 p-0"
                      onClick={() => setDeleteTarget(sprint._id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget && canDeleteSprints} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Sprint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sprint? Associated tasks will
              be moved to the backlog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteSprint}
              disabled={deleteSprint.isPending}
            >
              {deleteSprint.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
