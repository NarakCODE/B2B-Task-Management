"use client"

import {
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  CreditCard,
  Shield,
  Files,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { useAuthContext } from "@/context/auth-provider"
import { Permissions } from "@/constant"

const PlugIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    {...props}
  >
    <path d="M12 2v6" />
    <path d="M16 8v3a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4V8" />
    <path d="M8 2v6" />
    <path d="M12 15v3a4 4 0 0 0 4 4h0" />
  </svg>
)

type ItemType = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export function NavMain() {
  const { hasPermission } = useAuthContext()

  const canManageSettings = hasPermission(Permissions.MANAGE_WORKSPACE_SETTINGS)

  const workspaceId = useWorkspaceId()
  const location = useLocation()

  const pathname = location.pathname

  const items: ItemType[] = [
    {
      title: "Dashboard",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: "Documents",
      url: `/workspace/${workspaceId}/documents`,
      icon: Files,
    },
    {
      title: "Members",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },

    ...(canManageSettings
      ? [
          {
            title: "Integrations",
            url: `/workspace/${workspaceId}/integrations`,
            icon: PlugIcon,
          },
          {
            title: "Roles",
            url: `/workspace/${workspaceId}/roles`,
            icon: Shield,
          },
          {
            title: "Billing",
            url: `/workspace/${workspaceId}/billing`,
            icon: CreditCard,
          },
          {
            title: "Settings",
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ]
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={item.url === pathname} tooltip={item.title} asChild>
              <Link to={item.url} className="!text-[15px]">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
