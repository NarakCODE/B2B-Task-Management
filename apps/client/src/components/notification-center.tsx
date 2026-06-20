import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { NotificationType } from "@/types/api.type"
import { useGetNotificationsQuery, useNotificationMutations } from "@/hooks/api/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { Bell, Loader, Check, CheckSquare } from "lucide-react"
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
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full h-8 w-8 hover:bg-muted"
        >
          <Bell className="size-4.5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-in zoom-in-50 duration-200">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <Check className="size-3" />
              Mark all read
            </button>
          )}
        </div>
        <Separator />

        {/* List Content */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-muted/40">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-2">
              <div className="bg-muted p-3 rounded-full">
                <CheckSquare className="size-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground">All caught up!</p>
              <p className="text-[11px] text-muted-foreground">
                You will see updates here when work is assigned or commented on.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
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
                  className={`flex gap-3 p-3.5 text-left transition-colors cursor-pointer relative items-start hover:bg-muted/40 ${
                    !notification.isRead ? "bg-muted/15" : ""
                  }`}
                >
                  <Avatar className="size-8 shrink-0 mt-0.5">
                    <AvatarImage src={notification.sender?.profilePicture ?? ""} alt={name} />
                    <AvatarFallback className={`text-[10px] ${avatarColor}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {notification.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[9px] text-muted-foreground mt-1.5 block">
                      {relativeTime}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <span className="absolute top-1/2 right-3.5 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
