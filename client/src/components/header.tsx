import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "./ui/separator"
import { Link, useLocation, useNavigate } from "react-router-dom"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { useAuthContext } from "@/context/auth-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"
import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"

const Header = () => {
  const location = useLocation()
  const workspaceId = useWorkspaceId()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const pathname = location.pathname

  const getPageLabel = (pathname: string) => {
    if (pathname.includes("/project/")) return "Project"
    if (pathname.includes("/settings")) return "Settings"
    if (pathname.includes("/tasks")) return "Tasks"
    if (pathname.includes("/members")) return "Members"
    if (pathname.includes("/profile")) return "Profile"
    return null
  }

  const pageHeading = getPageLabel(pathname)

  const name = user?.name || ""
  const initials = getAvatarFallbackText(name)
  const avatarColor = getAvatarColor(name)

  return (
    <header className="flex sticky top-0 z-50 bg-background h-12 shrink-0 items-center border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block text-[15px]">
              {pageHeading ? (
                <BreadcrumbLink asChild>
                  <Link to={`/workspace/${workspaceId}`}>Dashboard</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="line-clamp-1 ">
                  Dashboard
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {pageHeading && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="text-[15px]">
                  <BreadcrumbPage className="line-clamp-1">
                    {pageHeading}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 gap-1.5 pr-2.5 pl-1"
            >
              <Avatar className="border-background size-6 border">
                <AvatarImage src={user?.profilePicture || ""} alt={name} />
                <AvatarFallback className={`${avatarColor} text-[10px]`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium hidden sm:inline">{name}</span>
              <ChevronsUpDownIcon className="size-3.5 opacity-60" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44" align="end" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Management</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/workspace/${workspaceId}/profile`)}>
                <UserIcon aria-hidden="true" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/workspace/${workspaceId}/settings`)}>
                <SettingsIcon aria-hidden="true" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon aria-hidden="true" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
