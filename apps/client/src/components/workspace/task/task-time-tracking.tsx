import { useState } from "react"
import { useGetTaskTimeLogsQuery } from "@/hooks/api/use-get-time-logs"
import { useTimeLogMutations } from "@/hooks/api/use-time-log-mutations"
import { useAuthContext } from "@/context/auth-provider"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Trash2, Loader, Calendar, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type TaskTimeTrackingProps = {
  taskId: string
  workspaceId: string
  storyPoints?: number | null
}

export default function TaskTimeTracking({
  taskId,
  workspaceId,
  storyPoints,
}: TaskTimeTrackingProps) {
  const { user } = useAuthContext()
  const currentUserId = user?._id

  const { data, isLoading } = useGetTaskTimeLogsQuery({
    workspaceId,
    taskId,
  })

  const { logTime, deleteTimeLog } = useTimeLogMutations()

  // Log Time Form State
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [description, setDescription] = useState("")
  const [loggedAt, setLoggedAt] = useState<Date>(new Date())

  // AlertDialog state for delete confirmation
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const timeLogs = data?.timeLogs || []
  const totalMinutes = data?.totalMinutes || 0

  // Calculate formatted total time
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const formattedTotal = `${totalHours}h ${totalMins}m`

  // Estimate from Story Points (1 SP = 8 Hours)
  const hasEstimate = storyPoints !== undefined && storyPoints !== null && storyPoints > 0
  const estimatedHours = hasEstimate ? (storyPoints || 0) * 8 : 0
  const estimatedMinutes = estimatedHours * 60

  // Calculate Progress percentage
  const progressPercentage = hasEstimate
    ? Math.min(Math.round((totalMinutes / estimatedMinutes) * 100), 100)
    : 0

  const handleLogTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const durationMinutes = hours * 60 + minutes
    if (durationMinutes <= 0) {
      toast.error("Please enter a valid duration of at least 1 minute")
      return
    }

    logTime.mutate(
      {
        workspaceId,
        taskId,
        data: {
          durationMinutes,
          description: description.trim() || undefined,
          loggedAt: loggedAt.toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Time logged successfully")
          setIsOpen(false)
          // Reset form
          setHours(0)
          setMinutes(0)
          setDescription("")
          setLoggedAt(new Date())
        },
        onError: () => {
          toast.error("Failed to log time")
        },
      },
    )
  }

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return
    deleteTimeLog.mutate(
      {
        workspaceId,
        timeLogId: deleteTargetId,
      },
      {
        onSuccess: () => {
          toast.success("Time log deleted")
        },
        onError: () => {
          toast.error("Failed to delete time log")
        },
        onSettled: () => {
          setDeleteTargetId(null)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-3/4 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Visual Progress Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground block">Time Tracker</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{formattedTotal}</span>
              <span className="text-xs text-muted-foreground">logged</span>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus data-icon="inline-start" className="size-3.5" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Time Spent</DialogTitle>
                <DialogDescription>
                  Record the time you spent working on this task.
                </DialogDescription>
              </DialogHeader>
              <form
                id="log-time-form"
                onSubmit={handleLogTimeSubmit}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      type="number"
                      id="hours"
                      min={0}
                      max={24}
                      value={hours || ""}
                      onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input
                      type="number"
                      id="minutes"
                      min={0}
                      max={59}
                      value={minutes || ""}
                      onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Date Logged</Label>
                  <DatePicker
                    value={loggedAt}
                    onChange={(date) => date && setLoggedAt(date)}
                    placeholder="Select date"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">Work Description (Optional)</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Briefly describe what you worked on..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                  />
                </div>
              </form>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={logTime.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" form="log-time-form" disabled={logTime.isPending}>
                  {logTime.isPending && <Loader className="size-3.5 animate-spin mr-1.5" />}
                  Log Time
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {hasEstimate ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>{progressPercentage}% of estimate</span>
              <span>
                Estimate: {estimatedHours}h ({storyPoints} SP)
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded-lg border border-dashed">
            No story points estimate is set on this task. Set story points to see logging progress.
          </div>
        )}
      </div>

      {/* Time Logs History */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Logged History
        </h3>

        {timeLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">No logged hours yet.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
            {timeLogs.map((log) => {
              const logHours = Math.floor(log.durationMinutes / 60)
              const logMins = log.durationMinutes % 60
              const timeDisplay = `${logHours > 0 ? `${logHours}h ` : ""}${
                logMins > 0 ? `${logMins}m` : ""
              }`

              const userName = log.user?.name || "Unknown"
              const initials = getAvatarFallbackText(userName)
              const avatarColor = getAvatarColor(userName)
              const formattedDate = format(new Date(log.loggedAt), "MMM d, yyyy")

              const isOwnLog = log.user?._id === currentUserId

              return (
                <div
                  key={log._id}
                  className="group flex gap-3 p-2.5 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={log.user?.profilePicture ?? ""} alt={userName} />
                    <AvatarFallback className={`text-xs ${avatarColor}`}>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold">{userName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formattedDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded">
                          {timeDisplay}
                        </span>
                        {isOwnLog && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => setDeleteTargetId(log._id)}
                            disabled={deleteTimeLog.isPending}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {log.description && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                        <MessageSquare className="size-3 text-muted-foreground/60 mt-0.5 shrink-0" />
                        <span className="line-clamp-2 italic">"{log.description}"</span>
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete time log?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The logged time entry will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
