import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { NotificationType } from "@/types/api.type"
import { useGetNotificationsQuery, useNotificationMutations } from "@/hooks/api/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { Bell, Loader, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function NotificationCenter() {
  const navigate = useNavigate()
  const workspaceId = useWorkspaceId()
  const [isOpen, setIsOpen] = useState(false)

  const { data, isLoading } = useGetNotificationsQuery(true)
  const { markAsRead, markAllAsRead } = useNotificationMutations()

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  const handleNotificationClick = (notification: NotificationType) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id)
    }

    setIsOpen(false)

    if (notification.task && notification.project) {
      navigate(
        `/workspace/${workspaceId}/project/${notification.project._id}/task/${notification.task._id}`,
      )
    }
  }

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (unreadCount > 0) {
      markAllAsRead.mutate()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell className="size-4.5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-in zoom-in-50 duration-200">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-[400px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive leading-normal">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader className="size-3 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Mark all read
            </button>
          )}
        </div>
        <Separator />

        {/* List Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center space-y-2.5">
              <div className="bg-muted p-3 rounded-full">
                <Bell className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                You will see updates here when work is assigned or commented on.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-muted/40">
              {notifications.map((notification) => {
                const name = notification.sender?.name || "Someone"
                const initials = getAvatarFallbackText(name)
                const avatarColor = getAvatarColor(name)
                const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative flex gap-3 px-4 py-3 text-left transition-colors cursor-pointer items-start hover:bg-muted/40 ${
                      !notification.isRead ? "bg-muted/20" : ""
                    }`}
                  >
                    {!notification.isRead && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
                    )}
                    <Avatar className="size-8 shrink-0 mt-0.5">
                      <AvatarImage src={notification.sender?.profilePicture ?? ""} alt={name} />
                      <AvatarFallback className={`text-[10px] ${avatarColor}`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {notification.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{relativeTime}</span>
                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
