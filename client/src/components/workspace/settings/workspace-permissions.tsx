import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader, Shield, Lock, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PermissionType } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceRoles from "@/hooks/api/use-get-workspace-roles";
import { updateRolePermissionsMutationFn } from "@/lib/api";

interface PermissionMeta {
  key: PermissionType;
  title: string;
  description: string;
}

const PERMISSION_GROUPS: { groupName: string; permissions: PermissionMeta[] }[] = [
  {
    groupName: "Workspace Management",
    permissions: [
      { key: "EDIT_WORKSPACE", title: "Edit Workspace", description: "Allows editing the name, description, and details of the workspace." },
      { key: "DELETE_WORKSPACE", title: "Delete Workspace", description: "Allows deleting the workspace and all its data permanently." },
      { key: "MANAGE_WORKSPACE_SETTINGS", title: "Manage Settings", description: "Allows configuring integrations, billing, and roles/permissions." },
    ]
  },
  {
    groupName: "Member Management",
    permissions: [
      { key: "ADD_MEMBER", title: "Invite Members", description: "Allows generating invites and adding new members to the workspace." },
      { key: "CHANGE_MEMBER_ROLE", title: "Change Member Roles", description: "Allows changing the role of workspace members." },
      { key: "REMOVE_MEMBER", title: "Remove Members", description: "Allows removing existing members from the workspace." },
    ]
  },
  {
    groupName: "Project Management",
    permissions: [
      { key: "CREATE_PROJECT", title: "Create Projects", description: "Allows creating new projects within the workspace." },
      { key: "EDIT_PROJECT", title: "Edit Projects", description: "Allows editing, archiving, or changing project details." },
      { key: "DELETE_PROJECT", title: "Delete Projects", description: "Allows permanently deleting projects." },
    ]
  },
  {
    groupName: "Task Management",
    permissions: [
      { key: "CREATE_TASK", title: "Create Tasks", description: "Allows creating new tasks, subtasks, or assignments." },
      { key: "EDIT_TASK", title: "Edit Tasks", description: "Allows updating task details, descriptions, or status." },
      { key: "DELETE_TASK", title: "Delete Tasks", description: "Allows permanently deleting tasks." },
    ]
  },
  {
    groupName: "General Access",
    permissions: [
      { key: "VIEW_ONLY", title: "View Only", description: "Allows viewing workspace items without modification capabilities." }
    ]
  }
];

const WorkspacePermissions = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  
  const { data, isLoading: isLoadingRoles, isError } = useGetWorkspaceRoles(workspaceId);
  const roles = data?.roles || [];

  const [localPermissions, setLocalPermissions] = useState<Record<string, PermissionType[]>>({});
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (roles.length > 0) {
      const map: Record<string, PermissionType[]> = {};
      roles.forEach((role) => {
        map[role._id] = role.permissions || [];
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPermissions(map);
      
      // Select first non-OWNER role as default active tab, otherwise OWNER
      const firstTab = roles.find(r => r.name !== "OWNER")?._id || roles[0]?._id;
      if (firstTab && !activeTab) {
        setActiveTab(firstTab);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles]);

  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: updateRolePermissionsMutationFn,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["roles", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["members", workspaceId],
      });
      toast.success(`${response.role.name} permissions updated successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update permissions");
    }
  });

  const handleToggle = (roleId: string, permissionKey: PermissionType, checked: boolean) => {
    const current = localPermissions[roleId] || [];
    let updated: PermissionType[];
    if (checked) {
      updated = [...current, permissionKey];
    } else {
      updated = current.filter((p) => p !== permissionKey);
    }
    setLocalPermissions((prev) => ({
      ...prev,
      [roleId]: updated,
    }));
  };

  const handleSave = (roleId: string) => {
    const role = roles.find((r) => r._id === roleId);
    if (!role) return;

    if (role.name === "OWNER") {
      toast.error("Owner permissions cannot be modified.");
      return;
    }

    mutate({
      workspaceId,
      roleId,
      data: {
        permissions: localPermissions[roleId] || [],
      },
    });
  };

  const handleReset = (roleId: string) => {
    const role = roles.find((r) => r._id === roleId);
    if (!role) return;
    setLocalPermissions((prev) => ({
      ...prev,
      [roleId]: role.permissions || [],
    }));
    toast.info("Permissions reset to database state");
  };

  if (isLoadingRoles) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading roles and permissions...</p>
      </div>
    );
  }

  if (isError || roles.length === 0) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="pt-6 text-center space-y-2">
          <p className="text-sm text-destructive font-medium">Failed to load role permissions configuration.</p>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["roles", workspaceId] })}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1">
          Role-Based Access Control (RBAC)
        </h2>
        <p className="text-sm text-muted-foreground">
          Define global feature access and settings privileges for user roles in this workspace.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1 border rounded-lg">
            {roles.map((role) => (
              <TabsTrigger
                key={role._id}
                value={role._id}
                className="capitalize px-4 py-1.5 font-medium data-[state=active]:bg-background dark:data-[state=active]:bg-zinc-800"
              >
                {role.name.toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {roles.map((role) => {
          const isOwner = role.name === "OWNER";
          const currentRolePermissions = localPermissions[role._id] || [];
          const dbRolePermissions = role.permissions || [];
          
          const isModified = JSON.stringify([...currentRolePermissions].sort()) !== JSON.stringify([...dbRolePermissions].sort());

          return (
            <TabsContent key={role._id} value={role._id} className="space-y-6 outline-none">
              <div className="bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4 border-zinc-200 dark:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base capitalize">{role.name.toLowerCase()} Permissions</h3>
                      {isOwner ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Lock className="w-3.5 h-3.5" /> System Locked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-xs border-primary/20 text-primary bg-primary/5">
                          <Shield className="w-3.5 h-3.5" /> Customizable
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isOwner 
                        ? "Workspace owners possess all administrative privileges. These settings cannot be altered." 
                        : `Customize permissions for users assigned to the ${role.name} role.`}
                    </p>
                  </div>
                  
                  {!isOwner && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isModified || isSaving}
                        onClick={() => handleReset(role._id)}
                        className="gap-1.5 h-9"
                      >
                        <RefreshCw className="w-4 h-4" /> Reset
                      </Button>
                      <Button
                        size="sm"
                        disabled={!isModified || isSaving}
                        onClick={() => handleSave(role._id)}
                        className="gap-1.5 h-9 font-medium shadow-sm"
                      >
                        {isSaving ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.groupName} className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 pl-1">
                        {group.groupName}
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.permissions.map((perm) => {
                          const isEnabled = currentRolePermissions.includes(perm.key);
                          return (
                            <div 
                              key={perm.key} 
                              className="flex items-start justify-between p-3.5 border rounded-lg bg-background/50 hover:bg-background/80 transition-colors shadow-sm"
                            >
                              <div className="space-y-1.5 pr-4">
                                <label className="text-sm font-medium leading-none cursor-pointer" htmlFor={`${role._id}-${perm.key}`}>
                                  {perm.title}
                                </label>
                                <p className="text-xs text-muted-foreground leading-normal">
                                  {perm.description}
                                </p>
                              </div>
                              <Switch
                                id={`${role._id}-${perm.key}`}
                                checked={isEnabled}
                                disabled={isOwner || isSaving}
                                onCheckedChange={(checked) => handleToggle(role._id, perm.key, checked)}
                                className="mt-1"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default WorkspacePermissions;
