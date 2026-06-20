import * as React from "react";
import { Check, ChevronDown, Loader, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";

type WorkspaceType = {
  _id: string;
  name: string;
};

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { onOpen } = useCreateWorkspaceDialog();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    staleTime: 1,
    refetchOnMount: true,
  });

  const workspaces: WorkspaceType[] = data?.workspaces ?? [];

  // Derived state: no useState or setState required.
  const activeWorkspace = React.useMemo(() => {
    if (workspaces.length === 0) {
      return undefined;
    }

    return (
      workspaces.find((workspace) => workspace._id === workspaceId) ??
      workspaces[0]
    );
  }, [workspaceId, workspaces]);

  const activeWorkspaceId = activeWorkspace?._id;

  // Synchronize the route when there is no workspace ID
  // or the current workspace ID is invalid.
  React.useEffect(() => {
    if (activeWorkspaceId && activeWorkspaceId !== workspaceId) {
      navigate(`/workspace/${activeWorkspaceId}`, {
        replace: true,
      });
    }
  }, [activeWorkspaceId, workspaceId, navigate]);

  const onSelect = (workspace: WorkspaceType) => {
    if (workspace._id === workspaceId) {
      return;
    }

    navigate(`/workspace/${workspace._id}`);
  };

  return (
    <>
      <SidebarGroupLabel className="w-full justify-between pr-0">
        <span>Workspaces</span>

        <button
          type="button"
          onClick={onOpen}
          className="flex size-5 items-center justify-center rounded-full border"
          aria-label="Add workspace"
        >
          <Plus className="size-3.5" />
        </button>
      </SidebarGroupLabel>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="bg-gray-10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeWorkspace ? (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
                      {activeWorkspace.name
                        .split(" ")[0]
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {activeWorkspace.name}
                      </span>
                      <span className="truncate text-xs">Free</span>
                    </div>
                  </>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      No workspace selected
                    </span>
                  </div>
                )}

                <ChevronDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>

              {isPending && (
                <div className="flex justify-center p-3">
                  <Loader className="size-5 animate-spin" />
                </div>
              )}

              {!isPending &&
                workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace._id}
                    onClick={() => onSelect(workspace)}
                    className="cursor-pointer gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      {workspace.name.split(" ")[0]?.charAt(0).toUpperCase()}
                    </div>

                    <span className="truncate">{workspace.name}</span>

                    {workspace._id === workspaceId && (
                      <DropdownMenuShortcut className="opacity-100">
                        <Check className="size-4" />
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer gap-2 p-2"
                onClick={onOpen}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>

                <div className="font-medium text-muted-foreground">
                  Add workspace
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
